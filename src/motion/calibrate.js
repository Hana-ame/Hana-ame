import { GAME, SWORD } from '../constants.js';

function safeSpan(a, b) {
  const d = b - a;
  return Math.abs(d) < 1e-6 ? 0 : d;
}

export class Calib {
  constructor() {
    this.cells = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
  }

  reset() {
    for (const row of this.cells) row.fill(null);
  }

  set(r, c, gamma, beta) {
    this.cells[r][c] = { gamma, beta };
  }

  get complete() {
    for (const row of this.cells) {
      for (const cell of row) if (!cell) return false;
    }
    return true;
  }

  _u(gamma) {
    const mid = this.cells[1];
    const gL = mid[0].gamma;
    const gM = mid[1].gamma;
    const gR = mid[2].gamma;
    if (gamma <= gL) return -1;
    if (gamma >= gR) return 1;
    if (gamma <= gM) return -1 + (gamma - gL) / safeSpan(gL, gM);
    return (gamma - gM) / safeSpan(gM, gR);
  }

  _v(beta) {
    const bD = this.cells[0][1].beta;
    const bM = this.cells[1][1].beta;
    const bU = this.cells[2][1].beta;
    if (beta <= bD) return -1;
    if (beta >= bU) return 1;
    if (beta <= bM) return -1 + (beta - bD) / safeSpan(bD, bM);
    return (beta - bM) / safeSpan(bM, bU);
  }

  dir(gamma, beta) {
    const u = Math.max(-1, Math.min(1, this._u(gamma)));
    const v = Math.max(-1, Math.min(1, this._v(beta)));
    const x = u * GAME.GRID.dx;
    const y = GAME.GRID.y0 + v * GAME.GRID.dy;
    const dx = x - SWORD.PIVOT.x;
    const dy = y - SWORD.PIVOT.y;
    const dz = -SWORD.PIVOT.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    return { x: dx / len, y: dy / len, z: dz / len };
  }
}
