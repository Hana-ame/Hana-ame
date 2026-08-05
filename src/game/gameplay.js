import { GAME } from '../constants.js';

const TRAVEL_STEPS = Math.round(GAME.NOTE_SPAWN_Z / GAME.NOTE_SPEED * 4 * GAME.BPM / 60);
const HIT_STEPS = 4.5;
const PERFECT_STEPS = 2;
const MISS_STEPS = 6;
const HIT_RADIUS = 1.15;

const COLORS = [0x4de3ff, 0xff2d78, 0xffd166, 0xb06dff, 0x3ddc84, 0xff8a3d, 0x66b3ff, 0xff5c8a, 0x9af0c0];

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function genChart(seed = 20260805) {
  const rng = mulberry32(seed);
  const chart = Array.from({ length: 64 }, () => []);
  let prev = -1;
  for (let s = 0; s < 64; s++) {
    const onBeat = s % 4 === 0;
    const offBeat = s % 4 === 2 && rng() < 0.32;
    if (onBeat || offBeat) {
      let cell = Math.floor(rng() * 9);
      while (cell === prev) cell = Math.floor(rng() * 9);
      chart[s].push(cell);
      prev = cell;
    }
  }
  return chart;
}

function distanceToSegment(p, a, b) {
  const ab = b.clone().sub(a);
  const lenSq = ab.lengthSq();
  if (lenSq < 1e-6) return p.distanceTo(a);
  const t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / lenSq));
  return p.distanceTo(a.clone().addScaledVector(ab, t));
}

export class Game {
  constructor({ scene, music, fx, physics, popup, hud, onEnd }) {
    this.scene = scene;
    this.music = music;
    this.fx = fx;
    this.physics = physics;
    this.popup = popup;
    this.hud = hud;
    this.onEnd = onEnd;

    this.grid = scene.gridPos;
    this.chart = genChart();
    this.notes = [];
    this.spawnCursor = -TRAVEL_STEPS;

    this.swordQuat = { x: 0, y: 0, z: 0, w: 1 };
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
  }

  setSwordQuat(q) {
    this.swordQuat = q;
    this.swordVisible = true;
  }

  update(dt) {
    if (this.ended) return;

    const step = this.music.currentStep;

    while (this.spawnCursor < step) {
      const cells = this.chart[((this.spawnCursor % 64) + 64) % 64];
      for (const cell of cells) this._spawnNote(cell, this.spawnCursor);
      this.spawnCursor += 1;
    }

    for (const n of this.notes) {
      if (n.dead) continue;
      const p = (step - n.targetStep + TRAVEL_STEPS) / TRAVEL_STEPS;
      n.mesh.position.z = GAME.NOTE_SPAWN_Z * (1 - Math.min(p, 1.4));
      n.mesh.rotation.y += dt * 2.4;
      n.mesh.rotation.x += dt * 1.6;
      if (p > 1 + MISS_STEPS / TRAVEL_STEPS) this._miss(n);
    }

    this._updateSword(dt);
  }

  _spawnNote(cell, targetStep) {
    const pos = this.grid[cell];
    const mesh = this.scene.notePool.spawn(pos, COLORS[cell]);
    mesh.position.z = GAME.NOTE_SPAWN_Z;
    this.notes.push({ cell, targetStep, mesh, dead: false });
  }

  _updateSword(dt) {
    const s = this.scene.sword;
    s.group.visible = this.swordVisible;
    if (!this.swordVisible) return;
    s.group.quaternion.set(this.swordQuat.x, this.swordQuat.y, this.swordQuat.z, this.swordQuat.w);

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

  onSwing(omega) {
    if (this.ended || !this.swordVisible) return;
    const step = this.music.currentStep;
    const { pivot, tip } = this.scene.getSword();

    let best = null;
    let bestDist = Infinity;
    for (const n of this.notes) {
      if (n.dead) continue;
      const z = n.mesh.position.z;
      if (z < -2.2 || z > 1.6) continue;
      const off = Math.abs(step - n.targetStep);
      if (off > HIT_STEPS) continue;
      const d = distanceToSegment(n.mesh.position, pivot, tip);
      if (d < bestDist) {
        bestDist = d;
        best = n;
      }
    }

    if (best && bestDist <= HIT_RADIUS) {
      this._hit(best, step);
    } else if (best && bestDist <= HIT_RADIUS + 0.6) {
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
    this.lives -= 1;
    this.misses += 1;

    const pos = n.mesh.position.clone();
    this.scene.notePool.release(n.mesh);
    this.notes.splice(this.notes.indexOf(n), 1);

    this.fx.burst(pos, 0xff5c5c, 10);
    this.fx.addShake(0.8);
    this.popup('MISS', 'miss');

    this.hud.update({ score: this.score, combo: this.combo, lives: this.lives, perfect: this.perfect, good: this.good, misses: this.misses });
    if (this.lives <= 0) this._end();
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
