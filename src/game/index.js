import * as THREE from 'three';
import { GAME, DIFFICULTY } from '../constants.js';
import { createGameScene } from './scene.js';
import { Fx } from './fx.js';
import { ShardPhysics } from './physics.js';
import { Music } from './music.js';
import { Game, loadChart } from './gameplay.js';
import { P } from '../net/protocol.js';
import { showScreen } from '../ui/screens.js';
import { shortestArc, qRotate } from '../../lib/attitude.js';

const INTO = { x: 0, y: -1, z: 0 }; // 屏幕内部方向 (剑尖基准朝此, 水平, 与重力垂直)
const NEUTRAL = { x: 0, y: 0, z: 1 };

let ctx = null;
let lastDir = NEUTRAL;
let calibState = { mapQ: null, refTop: null, flips: { x: 1, y: 1, z: 1 }, top: null };

function setFront() {
  if (!calibState.top) return;
  calibState.ref = calibState.top;
  calibState.mapQ = shortestArc(calibState.ref, INTO);
}

function applyCalib() {
  const top = calibState.top || NEUTRAL;
  const base = calibState.mapQ ? qRotate(calibState.mapQ, top) : NEUTRAL;
  return { x: calibState.flips.x * base.x, y: calibState.flips.y * base.y, z: calibState.flips.z * base.z };
}

function toggleFlip(axis) {
  calibState.flips[axis] *= -1;
}

export function handleMotion(frame) {
  if (!frame) return;
  calibState.top = frame.dir;
  if (!calibState.mapQ) setFront();
  if (!ctx?.game) return;
  const d = applyCalib();
  ctx.game.setSwordDir(d, frame.omega);
  lastDir = d;
  ctx.dirTimerTicks = (ctx.dirTimerTicks || 0) + 1;
  if (frame.hit > 0) ctx.game.onSwing(frame.omega || frame.hit);
}

export function handleControl(msg) {
  if (!msg) return;
  if (msg.t === P.START) startGame({ host: ctx?.host, roomCode: ctx?.roomCode, bpm: msg.bpm });
}

export async function startGame({ host, roomCode, bpm, diff, calibrate = false }) {
  cleanup();
  ctx = { host, roomCode, bpm };
  calibState = { mapQ: null, ref: null, flips: { x: 1, y: 1, z: 1 }, top: null };
  let calibDiff = diff ?? 'normal';

  let chart = null;
  try {
    chart = await loadChart();
  } catch (e) {
    console.warn(e);
  }

  const canvas = document.querySelector('#game-canvas');
  const app = createGameScene(canvas);
  const fx = new Fx(app.scene, app.camera);
  const physics = new ShardPhysics();
  const music = new Music(bpm || GAME.BPM);
  const hud = bindHud();
  const popup = bindPopup();

  let debugCameraOn = false;
  const toggleDebugCamera = (on = !debugCameraOn) => {
    debugCameraOn = on;
    app.debugControls.enabled = on;
    if (on) app.debugControls.update();
    const badge = document.querySelector('#debugcam-badge');
    if (badge) badge.classList.toggle('hidden', !on);
    const btn = document.querySelector('#debugcam-toggle');
    if (btn) btn.classList.toggle('on', on);
  };
  const onKey = (e) => {
    if (e.code !== 'KeyC' || e.metaKey || e.ctrlKey || e.altKey) return;
    toggleDebugCamera();
    e.preventDefault();
  };
  window.addEventListener('keydown', onKey);
  ctx.removeKey = onKey;
  const camBtn = document.querySelector('#debugcam-toggle');
  const onCamClick = () => toggleDebugCamera();
  camBtn?.addEventListener('click', onCamClick);
  ctx.removeCamClick = () => camBtn?.removeEventListener('click', onCamClick);

  const onEnd = (stats) => {
    hud.showEnd(stats);
    host?.sendControl({ t: P.END, ...stats });
  };

  const game = new Game({ scene: app, music, fx, physics, popup, hud, onEnd, diff: calibDiff });
  if (chart) game.setChart(chart);
  ctx.game = game;
  ctx.app = app;
  ctx.fx = fx;
  ctx.physics = physics;
  ctx.music = music;

  game.calibrating = !!calibrate;
  game.setSwordDir(NEUTRAL);

  const dirEl = document.querySelector('#pc-dir');
  const dirTimer = setInterval(() => {
    if (!dirEl) return;
    const g = ctx?.game;
    const d = ctx.dirTimerTicks || 0;
    ctx.dirTimerTicks = 0;
    const s = g ? g.swordDir : lastDir;
    dirEl.textContent = `dir(${s.x.toFixed(2)},${s.y.toFixed(2)},${s.z.toFixed(2)}) · ${d} 帧/s`;
  }, 1000);
  ctx.dirTimer = dirTimer;

  const calibOv = document.querySelector('#calib-overlay');
  const diffBtns = [...document.querySelectorAll('#calib-overlay .diff-btn')];
  const setDiff = (d) => {
    calibDiff = DIFFICULTY[d] ? d : null;
    game.setDifficulty(calibDiff);
    diffBtns.forEach((b) => b.classList.toggle('active', b.dataset.diff === calibDiff));
  };
  diffBtns.forEach((b) => b.addEventListener('click', () => setDiff(b.dataset.diff)));
  setDiff(calibDiff);
  const markFlip = (axis) => {
    const el = calibOv?.querySelector(`[data-flip="${axis}"]`);
    if (el) el.classList.toggle('on', calibState.flips[axis] < 0);
  };
  calibOv?.querySelectorAll('[data-flip]').forEach((b) => {
    b.addEventListener('click', () => {
      toggleFlip(b.dataset.flip);
      markFlip(b.dataset.flip);
    });
  });
  const setFrontBtn = calibOv?.querySelector('#calib-setfront');
  setFrontBtn?.addEventListener('click', () => { setFront(); });

  const beginPlay = () => {
    if (!ctx) return;
    ctx.calibrating = false;
    if (ctx.game) ctx.game.calibrating = false;
    calibOv?.classList.add('hidden');
    document.querySelector('#hud').classList.remove('hidden');
    document.querySelector('#end-overlay').classList.add('hidden');
    music.start({ onStep: () => {} });
    hud.update({ score: 0, combo: 0, lives: GAME.LIVES, perfect: 0, good: 0, misses: 0 });
    host?.sendControl({ t: P.START, bpm: GAME.BPM });
  };
  const startBtn = calibOv?.querySelector('#calib-start');
  startBtn?.addEventListener('click', beginPlay);

  if (calibrate) calibOv?.classList.remove('hidden');

  const clock = new THREE.Clock();
  let raf = 0;
  let camT = new THREE.Vector3(0, -3.6, 1.6);
  const camPosOffset = new THREE.Vector3(0, 0.35, 0.6);
  const followView = (dt) => {
    if (debugCameraOn) return;
    const { pivot, dir } = app.getSword();
    const base = new THREE.Vector3(0, -3.6, 1.6);
    const aim = pivot.clone().addScaledVector(dir, 10);
    const desired = base.clone().lerp(aim, 0.5);
    const s = 1 - Math.exp(-dt * 4.5);
    camT.lerp(desired, s);
    app.camera.position.copy(pivot).add(camPosOffset);
    app.camera.lookAt(camT);
  };
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    physics.update(dt, app.scene);
    fx.update(dt);
    game.update(dt);
    followView(dt);
    if (debugCameraOn) app.debugControls.update();
    app.renderer.render(app.scene, debugCameraOn ? app.debugCamera : app.camera);
  };
  ctx.raf = raf;
  loop();

  ctx.cleanupButtons = () => {
    calibOv?.querySelector('#calib-start')?.removeEventListener('click', beginPlay);
    calibOv?.querySelectorAll('[data-flip]').forEach((b) => b.removeEventListener('click', b._f));
    diffBtns.forEach((b) => b.removeEventListener('click', b._f));
    calibOv?.querySelector('#calib-setfront')?.removeEventListener('click', () => {});
  };

  window.__beatriftDebug = {
    getGame: () => ctx?.game,
    getMusic: () => ctx?.music,
    handleMotion,
    toggleDebugCamera: (on) => toggleDebugCamera(on),
    setFront,
    toggleFlip,
  };
}

export function cleanup() {
  if (!ctx) return;
  cancelAnimationFrame(ctx.raf);
  window.removeEventListener('keydown', ctx.removeKey);
  ctx.removeCamClick?.();
  if (ctx.dirTimer) clearInterval(ctx.dirTimer);
  ctx.game?.notes?.forEach?.((n) => ctx.app?.notePool?.release?.(n.mesh));
  ctx.physics?.dispose?.(ctx.app?.scene);
  ctx.app?.dispose?.();
  ctx.music?.stop?.();
  ctx.cleanupButtons?.();
  document.querySelector('#hud')?.classList.add('hidden');
  document.querySelector('#calib-overlay')?.classList.add('hidden');
  document.querySelector('#debugcam-badge')?.classList.add('hidden');
  ctx = null;
}

function bindHud() {
  const els = {
    score: document.querySelector('#score'),
    combo: document.querySelector('#combo'),
    lives: document.querySelector('#lives'),
    acc: document.querySelector('#hud-acc'),
  };
  let lastSend = 0;
  return {
    update({ score, combo, lives, perfect, good, misses }) {
      els.score.textContent = score;
      els.combo.textContent = combo > 0 ? `${combo} COMBO` : '0';
      els.combo.classList.remove('pop');
      if (combo > 0) void els.combo.offsetWidth, els.combo.classList.add('pop');
      els.lives.textContent = GAME.INVINCIBLE ? '∞' : '♥'.repeat(Math.max(0, lives)) + '♡'.repeat(Math.max(0, GAME.LIVES - lives));
      const total = perfect + good + misses;
      els.acc.textContent = total ? `命中率 ${Math.round((perfect + good * 0.6) / total * 100)}%` : '命中率 --';

      const now = performance.now();
      if (now - lastSend > 250) {
        lastSend = now;
        ctx?.host?.sendControl({ t: P.STATE, score, combo, lives });
      }
    },
    showEnd(stats) {
      document.querySelector('#end-title').textContent = '游戏结束';
      document.querySelector('#end-score').textContent = stats.score;
      document.querySelector('#end-stats').textContent =
        `最高连击 ${stats.maxCombo} · PERFECT ${stats.perfect} · GOOD ${stats.good} · MISS ${stats.misses} · 命中率 ${stats.acc}%`;
      document.querySelector('#end-overlay').classList.remove('hidden');
    },
  };
}

function bindPopup() {
  const el = document.querySelector('#hud-pop');
  let timer = 0;
  return (text, cls) => {
    el.textContent = text;
    el.className = `hud-pop ${cls}`;
    el.classList.remove('hidden', 'fade');
    void el.offsetWidth;
    el.classList.add('pop');
    clearTimeout(timer);
    timer = setTimeout(() => {
      el.classList.remove('pop');
      el.classList.add('fade');
    }, 260);
  };
}