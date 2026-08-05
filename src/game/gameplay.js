import * as THREE from 'three';
import { GAME } from '../constants.js';
import { SWORD_PIVOT, SWORD_LEN, TRAIL_LEN } from './scene.js';

const UP = new THREE.Vector3(0, 1, 0);

const TRAVEL_STEPS = Math.round(Math.abs(GAME.NOTE_SPAWN_Z) / GAME.NOTE_SPEED * 4 * GAME.BPM / 60);
const HIT_STEPS = 4.5;
const PERFECT_STEPS = 2;
const MISS_STEPS = 6;
const HIT_RADIUS = 1.2;

const COLORS = [0x4de3ff, 0xff2d78, 0xffd166, 0xb06dff, 0x3ddc84, 0xff8a3d, 0x66b3ff, 0xff5c8a, 0x9af0c0];

// 谱面: JSON 数组 { beat, x, y }, beat 为该音符到达判定平面的拍数,
// x/y 为判定平面上(世界系)的连续坐标。可手写, 见 charts/*.json。
export async function loadChart(name = 'default') {
  const res = await fetch(`/charts/${name}.json`);
  if (!res.ok) throw new Error(`谱面加载失败: charts/${name}.json (${res.status})`);
  const raw = await res.json();
  return raw.map((n) => ({
    beat: n.beat,
    step: n.beat * 4,
    pos: new THREE.Vector3(n.x, n.y, GAME.NOTE_PLANE_Z),
    color: n.color ?? pickColor(n.x),
  }));
}

export function pickColor(x) {
  const i = Math.round((x + 2.2) / 4.4 * (COLORS.length - 1));
  return COLORS[Math.max(0, Math.min(COLORS.length - 1, i))];
}

export class Game {
  constructor({ scene, music, fx, physics, popup, hud, onEnd, diff }) {
    this.scene = scene;
    this.music = music;
    this.fx = fx;
    this.physics = physics;
    this.popup = popup;
    this.hud = hud;
    this.onEnd = onEnd;
    this.hitRadius = diff?.hitRadius ?? HIT_RADIUS;
    this.hitSteps = diff?.hitSteps ?? HIT_STEPS;

    this.chart = [];
    this.notes = [];
    this.spawnCursor = 0;

    this.swordDir = { x: 0, y: 1, z: 0 };
    this.swordVisible = false;

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = GAME.LIVES;
    this.perfect = 0;
    this.good = 0;
    this.misses = 0;
    this.ended = false;
    this._swordFlash = 0;
    this._missLater = [];
  }

  setChart(chart) {
    this.chart = [...chart].sort((a, b) => a.step - b.step);
    this.spawnCursor = 0;
    this.notes = [];
  }

  setSwordDir(dir) {
    this.swordDir = dir;
    this.swordVisible = true;
  }

  update(dt) {
    if (this.ended) return;

    const step = this.music.currentStep;

    while (this.spawnCursor < this.chart.length) {
      const n = this.chart[this.spawnCursor];
      if (n.step - TRAVEL_STEPS > step) break;
      this._spawnNote(n, step);
      this.spawnCursor += 1;
    }

    for (const n of this.notes) {
      if (n.dead) continue;
      const p = (step - n.targetStep + TRAVEL_STEPS) / TRAVEL_STEPS;
      n.mesh.position.z = GAME.NOTE_SPAWN_Z * (1 - Math.min(p, 1.4));
      n.mesh.rotation.y += dt * 2.4;
      n.mesh.rotation.x += dt * 1.6;
      if (p > 1 + MISS_STEPS / TRAVEL_STEPS) this._missLater.push(n);
    }
    for (const n of this._missLater) this._miss(n);
    this._missLater.length = 0;

    this._updateSword(dt);
  }

  _spawnNote(chartNote, _step) {
    const mesh = this.scene.notePool.spawn(chartNote.pos.clone(), chartNote.color);
    mesh.position.z = GAME.NOTE_SPAWN_Z;
    this.notes.push({
      targetStep: chartNote.step,
      pos: chartNote.pos.clone(),
      mesh,
      dead: false,
    });
  }

  _updateSword(dt) {
    const s = this.scene.sword;
    s.group.visible = this.swordVisible;
    if (!this.swordVisible) return;
    s.group.quaternion.setFromUnitVectors(UP, new THREE.Vector3(this.swordDir.x, this.swordDir.y, this.swordDir.z));

    const { tip } = this.scene.getSword();
    const trail = this.scene.trail;
    trail.pts.push(tip.clone());
    if (trail.pts.length > TRAIL_LEN) trail.pts.shift();
    const posAttr = trail.line.geometry.attributes.position;
    for (let i = 0; i < TRAIL_LEN; i++) {
      const pt = trail.pts[i] || trail.pts[trail.pts.length - 1] || tip;
      posAttr.setXYZ(i, pt.x, pt.y, pt.z);
    }
    posAttr.needsUpdate = true;

    if (this._swordFlash > 0) {
      this._swordFlash -= dt;
      s.tipLight.intensity = 1.2 + this._swordFlash * 6;
    } else {
      s.tipLight.intensity = 1.2;
    }
  }

  _swordPose() {
    const dir = new THREE.Vector3(this.swordDir.x, this.swordDir.y, this.swordDir.z);
    const tip = SWORD_PIVOT.clone().addScaledVector(dir, SWORD_LEN);
    return { pivot: SWORD_PIVOT, dir, tip };
  }

  onSwing(omega) {
    if (this.ended || !this.swordVisible) return;
    const step = this.music.currentStep;
    const { tip } = this._swordPose();

    let best = null;
    let bestDist = Infinity;
    for (const n of this.notes) {
      if (n.dead) continue;
      const z = n.mesh.position.z;
      if (z < -2.2 || z > 1.6) continue;
      const off = Math.abs(step - n.targetStep);
      if (off > this.hitSteps) continue;
      // 屏幕平面距离: 剑尖投影到判定平面(z=0) 与音符的平面距离
      const d = Math.hypot(tip.x - n.pos.x, tip.y - n.pos.y);
      if (d < bestDist) {
        bestDist = d;
        best = n;
      }
    }

    if (best && bestDist <= this.hitRadius) {
      this._hit(best, step);
    } else if (best && bestDist <= this.hitRadius + 0.8) {
      // 擦边: 仍算命中但基础分
      this._hit(best, step, true);
    }
  }

  _hit(n, step, edge = false) {
    n.dead = true;
    const off = Math.abs(step - n.targetStep);
    const grade = off <= PERFECT_STEPS && !edge ? 'perfect' : 'good';

    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    const mult = 1 + this.combo * (grade === 'perfect' ? 0.02 : 0.01);
    const base = grade === 'perfect' ? 100 : 60;
    const gain = Math.round(base * mult);
    this.score += gain;
    if (grade === 'perfect') this.perfect += 1;
    else this.good += 1;

    const pos = n.mesh.position.clone();
    const { dir } = this.scene.getSword();
    this.scene.notePool.release(n.mesh);
    this.notes.splice(this.notes.indexOf(n), 1);

    this.physics.spawn(pos, dir);
    this.fx.burst(pos, grade === 'perfect' ? 0xffd166 : 0x4de3ff, grade === 'perfect' ? 34 : 22, dir);
    this.fx.addShake(grade === 'perfect' ? 0.3 : 0.18);
    this._swordFlash = 0.35;

    this.popup(grade === 'perfect' ? 'PERFECT' : 'GOOD', grade);
    this.hud.update({ score: this.score, combo: this.combo, lives: this.lives, perfect: this.perfect, good: this.good, misses: this.misses });
  }

  _miss(n) {
    n.dead = true;
    this.combo = 0;
    this.misses += 1;
    if (!GAME.INVINCIBLE) this.lives -= 1;

    const pos = n.mesh.position.clone();
    this.scene.notePool.release(n.mesh);
    this.notes.splice(this.notes.indexOf(n), 1);

    this.fx.burst(pos, 0xff5c5c, 10);
    this.fx.addShake(0.8);
    this.popup('MISS', 'miss');

    this.hud.update({ score: this.score, combo: this.combo, lives: this.lives, perfect: this.perfect, good: this.good, misses: this.misses });
    if (!GAME.INVINCIBLE && this.lives <= 0) this._end();
  }

  finish() {
    if (!this.ended) this._end();
  }

  _end() {
    this.ended = true;
    this.music.stop();
    const total = this.perfect + this.good + this.misses;
    const acc = total ? Math.round((this.perfect + this.good * 0.6) / total * 100) : 0;
    this.onEnd?.({
      score: this.score,
      maxCombo: this.maxCombo,
      perfect: this.perfect,
      good: this.good,
      misses: this.misses,
      acc,
    });
  }
}
