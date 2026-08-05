import { showScreen, navigate, $ } from './screens.js';
import {
  normalizeCode, PEER_PREFIX, SENSOR, DIFFICULTY, DEFAULT_DIFFICULTY,
  CALIB_STEPS, CALIB_HOLD_MS,
} from '../constants.js';
import * as discovery from '../net/discovery.js';
import { joinPeer } from '../net/connection.js';
import { P, encodeMotion } from '../net/protocol.js';
import { Sensor } from '../motion/sensor.js';
import { Calib } from '../motion/calibrate.js';
import { computeForward, screenRel } from '../motion/forward.js';

export function initMobile(params) {
  const els = {
    list: $('#mobile-list'),
    code: $('#mobile-code'),
    join: $('#mobile-join'),
    calibState: $('#calib-state'),
    calibDo: $('#calib-do'),
    diffBtns: [...document.querySelectorAll('.diff-btn')],
    calib2Dir: $('#calib2-dir'),
    calib2Step: $('#calib2-step'),
    calib2Fill: $('#calib2-fill'),
    calib2Do: $('#calib2-do'),
    remoteStatus: $('#remote-status'),
    ping: $('#remote-ping'),
  };
  const known = new Map();
  let sess = null;
  let sensor = null;
  let calib = null;
  let streaming = false;
  let calibrating = false;
  let unsubscribe = null;
  let pingTimer = null;
  let rafFill = 0;
  let diff = DEFAULT_DIFFICULTY;
  const sampleBuf = [];

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
    if (!sensor.enabled) {
      sensor.start((f) => onFrame(f), (s) => onSwing(s));
    }
    setDiff(diff);
    sensor.recalibrate();
    startGuidedCalibration();
  }

  function startGuidedCalibration() {
    calib.reset();
    calibrating = true;
    streaming = false;
    els.calib2Do.classList.add('hidden');
    showScreen('screen-calib2');
    nextCalibStep(0);
  }

  function nextCalibStep(i) {
    if (i >= CALIB_STEPS.length) {
      finishCalibration();
      return;
    }
    const step = CALIB_STEPS[i];
    els.calib2Dir.textContent = step.label;
    els.calib2Step.textContent = `步骤 ${i + 1}/${CALIB_STEPS.length}`;
    sampleBuf.length = 0;
    const holdStart = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - holdStart) / CALIB_HOLD_MS);
      els.calib2Fill.style.width = `${(p * 100).toFixed(1)}%`;
      if (p < 1) {
        rafFill = requestAnimationFrame(tick);
        return;
      }
      const n = sampleBuf.length;
      if (n > 0) {
        let g = 0;
        let aX = 0;
        let aY = 0;
        let aZ = 0;
        for (const s of sampleBuf) { g += s.gamma; aX += s.ax; aY += s.ay; aZ += s.az; }
        const fwd = computeForward(g / n, aX / n, aY / n, aZ / n).forward;
        if (!calib.ref) calib.setRef(fwd);
        const rel = screenRel(fwd, calib.ref);
        calib.set(step.r, step.c, rel.onScreen.x, rel.onScreen.y);
      }
      nextCalibStep(i + 1);
    };
    rafFill = requestAnimationFrame(tick);
  }

  function finishCalibration() {
    cancelAnimationFrame(rafFill);
    sensor.calibrate();
    els.calib2Fill.style.width = '100%';
    els.calib2Step.textContent = '校准完成!';
    els.calib2Do.classList.remove('hidden');
    els.calib2Do.textContent = '进入游戏';
    els.calib2Do.onclick = enterRemote;
  }

  function enterRemote() {
    calibrating = false;
    els.calib2Do.onclick = null;
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
    if (calibrating) {
      if (sampleBuf.length < 160) sampleBuf.push({ gamma: f.gamma, ax: f.ax, ay: f.ay, az: f.az });
      return;
    }
    if (!streaming || !sess || !calib.complete) return;
    const fwd = computeForward(f.gamma, f.ax, f.ay, f.az).forward;
    const rel = screenRel(fwd, calib.ref);
    sess.sendMotion(encodeMotion(calib.dir(rel.onScreen.x, rel.onScreen.y), f.omega, 0));
  }
  function onSwing(s) {
    sensor.vibrate(s.omega / (SENSOR.SWING_PEAK * 2));
    if (streaming && sess && calib.complete) {
      const fwd = computeForward(sensor.gamma, sensor.ax, sensor.ay, sensor.az).forward;
      const rel = screenRel(fwd, calib.ref);
      sess.sendMotion(encodeMotion(calib.dir(rel.onScreen.x, rel.onScreen.y), s.omega, 1));
    }
  }

  function recalibrate() {
    cancelAnimationFrame(rafFill);
    calibrating = false;
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
  calib = new Calib();
  showScreen('screen-mobile');
  renderList();
  initDiscovery();

  return () => {
    clearInterval(pingTimer);
    cancelAnimationFrame(rafFill);
    unsubscribe?.();
    sensor?.stop();
    if (sess) { try { sess.close(); } catch { /* noop */ } }
    discovery.close();
  };
}
