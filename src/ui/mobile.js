import { showScreen, navigate, $ } from './screens.js';
import { normalizeCode, PEER_PREFIX, SENSOR } from '../constants.js';
import * as discovery from '../net/discovery.js';
import { joinPeer } from '../net/connection.js';
import { P, encodeMotion } from '../net/protocol.js';
import { Sensor } from '../motion/sensor.js';

export function initMobile(params) {
  const els = {
    list: $('#mobile-list'),
    code: $('#mobile-code'),
    join: $('#mobile-join'),
    remoteStatus: $('#remote-status'),
    ping: $('#remote-ping'),
  };
  const known = new Map();
  let sess = null;
  let sensor = null;
  let streaming = false;
  let unsubscribe = null;
  let pingTimer = null;

  if (params?.get('room')) els.code.value = normalizeCode(params.get('room'));

  function renderList() {
    if (known.size === 0) {
      els.list.innerHTML = '<div class="mobile-empty">未发现房间 · 尝试输入房间码</div>';
      return;
    }
    els.list.innerHTML = '';
    for (const [code, dev] of known) {
      const row = document.createElement('div');
      row.className = 'device-item';
      row.innerHTML = `<span>房间 <b>${code}</b></span><span class="dot on"></span>`;
      row.addEventListener('click', () => doJoin(code));
      els.list.appendChild(row);
    }
  }

  function cleanupStale() {
    const now = Date.now();
    for (const [code, dev] of known) {
      if (now - dev.ts > 6000) known.delete(code);
    }
    renderList();
  }

  async function initDiscovery() {
    const ok = await discovery.connect();
    if (!ok) {
      els.list.innerHTML = '<div class="mobile-empty">发现服务不可用 · 请直接输入房间码</div>';
      return;
    }
    unsubscribe = discovery.subscribeRooms((code, dev) => {
      if (!dev?.peerId) return;
      known.set(code, { ...dev, ts: Date.now() });
      renderList();
    });
    setInterval(cleanupStale, 2000);
  }

  function handlers() {
    return {
      onOpen() {},
      onControl(msg) {
        if (msg?.t === P.PING) sess?.sendControl({ t: P.PONG, ts: msg.ts });
        if (msg?.t === P.PONG) {
          const dt = Date.now() - msg.ts;
          els.ping.textContent = `${dt} ms`;
        }
      },
      onMotionOpen() {
        if (streaming) startStream();
      },
      onClose() {
        els.remoteStatus.textContent = '连接已断开';
      },
      onError(e) { console.error('[mobile] conn error', e); },
    };
  }

  function pingLoop() {
    clearInterval(pingTimer);
    pingTimer = setInterval(() => {
      if (sess) sess.sendControl({ t: P.PING, ts: Date.now() });
    }, 1000);
  }

  // 手机只负责把"手机顶边在世界系的方向"(全 3D, 原始值)持续发给 PC。
  // 校准(反转/设正面/难度)全部在 PC 端进行。
  function onFrame(f) {
    if (!streaming || !sess || !sensor.top) return;
    sess.sendMotion(encodeMotion(sensor.top, f.omega, 0));
  }
  function onSwing(s) {
    sensor.vibrate(s.omega / (SENSOR.SWING_PEAK * 2));
    if (streaming && sess && sensor.top) sess.sendMotion(encodeMotion(sensor.top, s.omega, 1));
  }

  function startStream() {
    streaming = true;
  }

  async function enterRemote() {
    const granted = await sensor.requestPermission();
    if (!granted) {
      els.remoteStatus.textContent = '传感器权限被拒绝';
      return;
    }
    if (!sensor.enabled) {
      sensor.start((f) => onFrame(f), (s) => onSwing(s));
    }
    sess.sendControl({ t: P.READY });
    showScreen('screen-remote');
    els.remoteStatus.textContent = '已连接 · 请在 PC 上校准光剑';
    startStream();
  }

  async function doJoin(code, attempt = 0) {
    code = normalizeCode(code);
    if (!code) return;
    showScreen('screen-remote');
    els.remoteStatus.textContent = attempt > 0 ? `重连中 (${attempt}/2)…` : '正在连接…';
    try {
      sess = await joinPeer(`${PEER_PREFIX}-${code}`, handlers());
      sess.sendControl({ t: P.HELLO, v: 1, role: 'mobile' });
      pingLoop();
      enterRemote();
    } catch (e) {
      console.error(e);
      if (attempt < 2) {
        setTimeout(() => doJoin(code, attempt + 1), 700);
        return;
      }
      els.remoteStatus.textContent = `连接失败: ${e?.message || e?.type || '未知'}`;
      setTimeout(() => { showScreen('screen-mobile'); renderList(); }, 1200);
    }
  }

  $('#mobile-join').addEventListener('click', () => doJoin(els.code.value));
  els.code.addEventListener('keydown', (e) => { if (e.key === 'Enter') doJoin(els.code.value); });
  $('#mobile-back').addEventListener('click', () => navigate('/'));
  $('#remote-vibrate').addEventListener('click', () => sensor?.vibrate(1));

  const forceSim = params?.get('sim') === '1';
  sensor = new Sensor({ forceSim });
  showScreen('screen-mobile');
  renderList();
  initDiscovery();

  return () => {
    clearInterval(pingTimer);
    unsubscribe?.();
    sensor?.stop();
    if (sess) { try { sess.close(); } catch { /* noop */ } }
    discovery.close();
  };
}
