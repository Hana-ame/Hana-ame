import { GAME, SWORD } from '../constants.js';

function span(a, b) {
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
    this.ref = null;
  }

  reset() {
    for (const row of this.cells) row.fill(null);
    this.ref = null;
  }

  setRef(forward) {
    this.ref = forward;
  }

  set(r, c, sx, sy) {
    this.cells[r][c] = { sx, sy };
  }

  get complete() {
    for (const row of this.cells) {
      for (const cell of row) if (!cell) return false;
    }
    return !!this.ref;
  }

  _u(sx) {
    const mid = this.cells[1];
    const xL = mid[0].sx;
    const xM = mid[1].sx;
    const xR = mid[2].sx;
    if (sx <= xL) return -1;
    if (sx >= xR) return 1;
    if (sx <= xM) return -1 + (sx - xL) / span(xL, xM);
    return (sx - xM) / span(xM, xR);
  }

  _v(sy) {
    const yD = this.cells[0][1].sy;
    const yM = this.cells[1][1].sy;
    const yU = this.cells[2][1].sy;
    if (sy <= yM && sy <= yD) return -1;
    if (sy >= yM && sy >= yU) return 1;
    if (sy <= yM) return -1 + (sy - yD) / span(yD, yM);
    return (sy - yM) / span(yM, yU);
  }

  dir(sx, sy) {
    const u = Math.max(-1, Math.min(1, this._u(sx)));
    const v = Math.max(-1, Math.min(1, this._v(sy)));
    const x = u * GAME.GRID.dx;
    const y = GAME.GRID.y0 + v * GAME.GRID.dy;
    const dx = x - SWORD.PIVOT.x;
    const dy = y - SWORD.PIVOT.y;
    const dz = -SWORD.PIVOT.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    return { x: dx / len, y: dy / len, z: dz / len };
  }
}
