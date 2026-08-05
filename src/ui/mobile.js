import { showScreen, navigate, $ } from './screens.js';
import { normalizeCode, PEER_PREFIX, SENSOR, DIFFICULTY, DEFAULT_DIFFICULTY } from '../constants.js';
import * as discovery from '../net/discovery.js';
import { joinPeer } from '../net/connection.js';
import { P, encodeMotion } from '../net/protocol.js';
import { Sensor } from '../motion/sensor.js';

export function initMobile(params) {
  const els = {
    list: $('#mobile-list'),
    code: $('#mobile-code'),
    join: $('#mobile-join'),
    calibState: $('#calib-state'),
    calibDo: $('#calib-do'),
    diffBtns: [...document.querySelectorAll('.diff-btn')],
    remoteStatus: $('#remote-status'),
    ping: $('#remote-ping'),
  };
  const known = new Map();
  let sess = null;
  let sensor = null;
  let streaming = false;
  let unsubscribe = null;
  let pingTimer = null;
  let calibTimer = null;
  let diff = DEFAULT_DIFFICULTY;

  function setDiff(d) {
    diff = DIFFICULTY[d] ? d : DEFAULT_DIFFICULTY;
    els.diffBtns.forEach((b) => b.classList.toggle('active', b.dataset.diff === diff));
    if (sensor) {
      const c = DIFFICULTY[diff];
      sensor.setSwingThresholds(c.swingPeak, c.swingMin);
    }
  }
  els.diffBtns.forEach((b) => b.addEventListener('click', () => setDiff(b.dataset.diff)));
  setDiff(DEFAULT_DIFFICULTY);

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

  // ---- 校准 ----
  function goCalibrate() {
    showScreen('screen-calibrate');
    els.calibState.classList.remove('ready');
    els.calibState.textContent = '请授权陀螺仪, 并保持手机静止';
    els.calibDo.classList.remove('hidden');
    els.calibDo.textContent = '开始校准';
    els.calibDo.onclick = runCalibration;
  }

  async function runCalibration() {
    els.calibDo.disabled = true;
    const granted = await sensor.requestPermission();
    if (!granted) {
      els.calibState.textContent = '陀螺仪权限被拒绝';
      els.calibDo.disabled = false;
      return;
    }
    if (!sensor.calibrated) {
      sensor.start((f) => onFrame(f), (s) => onSwing(s));
    }
    setDiff(diff);
    els.calibState.textContent = '请保持手机静止… 2';
    sensor.recalibrate();
    let n = 2;
    calibTimer = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(calibTimer);
        sensor.calibrate();
        els.calibState.textContent = '校准完成! 准备挥舞';
        els.calibState.classList.add('ready');
        els.calibDo.disabled = false;
        els.calibDo.textContent = '进入游戏';
        els.calibDo.onclick = enterRemote;
      } else {
        els.calibState.textContent = `请保持手机静止… ${n}`;
      }
    }, 1000);
  }

  function enterRemote() {
    els.calibDo.onclick = null;
    sess.sendControl({ t: P.READY, diff });
    showScreen('screen-remote');
    els.remoteStatus.textContent = '已连接 · 挥舞手机!';
    startStream();
  }

  // ---- 传感器流 ----
  function startStream() {
    streaming = true;
  }
  function onFrame(f) {
    if (!streaming || !sess) return;
    sess.sendMotion(encodeMotion(f.q, f.omega, 0));
  }
  function onSwing(s) {
    sensor.vibrate(s.omega / (SENSOR.SWING_PEAK * 2));
    if (streaming && sess) sess.sendMotion(encodeMotion(sensor.quaternion, s.omega, 1));
  }

  function recalibrate() {
    streaming = false;
    sensor.recalibrate();
    goCalibrate();
  }

  async function doJoin(code, attempt = 0) {
    code = normalizeCode(code);
    if (!code) return;
    showScreen('screen-calibrate');
    els.calibState.textContent = attempt > 0 ? `重连中 (${attempt}/2)…` : '正在连接…';
    els.calibDo.classList.add('hidden');
    try {
      sess = await joinPeer(`${PEER_PREFIX}-${code}`, handlers());
      sess.sendControl({ t: P.HELLO, v: 1, role: 'mobile' });
      pingLoop();
      goCalibrate();
    } catch (e) {
      console.error(e);
      if (attempt < 2) {
        setTimeout(() => doJoin(code, attempt + 1), 700);
        return;
      }
      els.calibState.textContent = `连接失败: ${e?.message || e?.type || '未知'}`;
      setTimeout(() => { showScreen('screen-mobile'); renderList(); }, 1200);
    }
  }

  $('#mobile-join').addEventListener('click', () => doJoin(els.code.value));
  els.code.addEventListener('keydown', (e) => { if (e.key === 'Enter') doJoin(els.code.value); });
  $('#mobile-back').addEventListener('click', () => navigate('/'));
  $('#remote-recalib').addEventListener('click', recalibrate);
  $('#remote-vibrate').addEventListener('click', () => sensor?.vibrate(1));

  const forceSim = params?.get('sim') === '1';
  sensor = new Sensor({ forceSim });
  showScreen('screen-mobile');
  renderList();
  initDiscovery();

  return () => {
    clearInterval(pingTimer);
    if (calibTimer) clearInterval(calibTimer);
    unsubscribe?.();
    sensor?.stop();
    if (sess) { try { sess.close(); } catch { /* noop */ } }
    discovery.close();
  };
}
