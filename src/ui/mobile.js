import { showScreen, navigate, $ } from './screens.js';
import { normalizeCode } from '../constants.js';
import { PEER_PREFIX } from '../constants.js';
import * as discovery from '../net/discovery.js';
import { joinPeer } from '../net/connection.js';
import { P } from '../net/protocol.js';

export function initMobile(params) {
  const els = {
    list: $('#mobile-list'),
    code: $('#mobile-code'),
    join: $('#mobile-join'),
  };
  const known = new Map();
  let sess = null;
  let unsubscribe = null;

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
      onOpen() {
        sess.sendControl({ t: P.HELLO, v: 1, role: 'mobile' });
        showScreen('screen-remote');
        $('#remote-status').textContent = '已连接 · 挥舞手机开始';
        pingLoop();
      },
      onControl(msg) {
        if (msg?.t === P.PING) sess.sendControl({ t: P.PONG, ts: msg.ts });
        if (msg?.t === P.PONG) {
          const dt = Date.now() - msg.ts;
          $('#remote-ping').textContent = `${dt} ms`;
        }
      },
      onMotionOpen() { console.info('[mobile] motion channel open'); },
      onClose() {
        $('#remote-status').textContent = '连接已断开';
      },
      onError(e) { console.error('[mobile] conn error', e); },
    };
  }

  let pingTimer = null;
  function pingLoop() {
    clearInterval(pingTimer);
    pingTimer = setInterval(() => {
      if (sess) sess.sendControl({ t: P.PING, ts: Date.now() });
    }, 1000);
  }

  async function doJoin(code) {
    code = normalizeCode(code);
    if (code.length < 1) return;
    showScreen('screen-calibrate');
    $('#calib-state').textContent = '正在连接…';
    try {
      sess = await joinPeer(`${PEER_PREFIX}-${code}`, handlers());
    } catch (e) {
      console.error(e);
      $('#calib-state').textContent = `连接失败: ${e?.message || e?.type || '未知'}`;
      setTimeout(() => showScreen('screen-mobile'), 1200);
    }
  }

  $('#mobile-join').addEventListener('click', () => doJoin(els.code.value));
  els.code.addEventListener('keydown', (e) => { if (e.key === 'Enter') doJoin(els.code.value); });
  $('#mobile-back').addEventListener('click', () => navigate('/'));

  showScreen('screen-mobile');
  renderList();
  initDiscovery();

  return () => {
    clearInterval(pingTimer);
    unsubscribe?.();
    if (sess) { try { sess.close(); } catch { /* noop */ } }
    discovery.close();
  };
}
