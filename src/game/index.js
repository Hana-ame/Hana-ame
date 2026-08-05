import * as THREE from 'three';
import { GAME } from '../constants.js';
import { createGameScene } from './scene.js';
import { Fx } from './fx.js';
import { ShardPhysics } from './physics.js';
import { Music } from './music.js';
import { Game, loadChart } from './gameplay.js';
import { P } from '../net/protocol.js';

let ctx = null;

export function handleMotion(frame) {
  if (!ctx?.game || !frame) return;
  ctx.game.setSwordDir(frame.dir);
  if (frame.hit > 0) ctx.game.onSwing(frame.omega || frame.hit);
}

export function handleControl(msg) {
  if (!msg) return;
  if (msg.t === P.START) startGame({ host: ctx?.host, roomCode: ctx?.roomCode, bpm: msg.bpm });
}

export async function startGame({ host, roomCode, bpm, diff }) {
  cleanup();
  ctx = { host, roomCode, bpm };

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

  const onEnd = (stats) => {
    hud.showEnd(stats);
    host?.sendControl({ t: P.END, ...stats });
  };

  const game = new Game({ scene: app, music, fx, physics, popup, hud, onEnd, diff });
  if (chart) game.setChart(chart);
  ctx.game = game;
  ctx.app = app;
  ctx.fx = fx;
  ctx.physics = physics;
  ctx.music = music;

  document.querySelector('#hud').classList.remove('hidden');
  document.querySelector('#end-overlay').classList.add('hidden');

  music.start({ onStep: () => {} });
  hud.update({ score: 0, combo: 0, lives: GAME.LIVES, perfect: 0, good: 0, misses: 0 });

  const clock = new THREE.Clock();
  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    physics.update(dt, app.scene);
    fx.update(dt);
    game.update(dt);
    app.renderer.render(app.scene, app.camera);
  };
  ctx.raf = raf;
  loop();

  const replay = document.querySelector('#end-replay');
  const exit = document.querySelector('#end-exit');
  const hudExit = document.querySelector('#hud-exit');
  replay.onclick = () => startGame({ host, roomCode, bpm, diff });
  exit.onclick = () => {
    cleanup();
    window.location.hash = '/pc';
  };
  hudExit.onclick = () => {
    const g = ctx?.game;
    if (g) g.finish();
  };

  ctx.cleanupButtons = () => {
    replay.onclick = null;
    exit.onclick = null;
    hudExit.onclick = null;
  };

  window.__beatriftDebug = {
    getGame: () => ctx?.game,
    getMusic: () => ctx?.music,
    handleMotion,
  };
}

export function cleanup() {
  if (!ctx) return;
  cancelAnimationFrame(ctx.raf);
  ctx.game?.notes?.forEach?.((n) => ctx.app?.notePool?.release?.(n.mesh));
  ctx.physics?.dispose?.(ctx.app?.scene);
  ctx.app?.dispose?.();
  ctx.music?.stop?.();
  ctx.cleanupButtons?.();
  document.querySelector('#hud')?.classList.add('hidden');
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
