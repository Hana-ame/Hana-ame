export const P = {
  HELLO: 'hello',
  READY: 'ready',
  START: 'start',
  STATE: 'state',
  END: 'end',
  PING: 'ping',
  PONG: 'pong',
  RECALIB: 'recalib',
  VIBRATE: 'vibrate',
};

export const MOTION_CHANNEL = 'beatrift-motion';
export const MOTION_FLOATS = 6;

export function makeControl(t, payload = {}) {
  return JSON.stringify({ t, ...payload });
}

export function parseControl(raw) {
  try {
    return JSON.parse(typeof raw === 'string' ? raw : String(raw));
  } catch {
    return null;
  }
}

export function encodeMotion(q, omega, hit) {
  const buf = new ArrayBuffer(MOTION_FLOATS * 4);
  const f = new Float32Array(buf);
  f[0] = q.x;
  f[1] = q.y;
  f[2] = q.z;
  f[3] = q.w;
  f[4] = omega;
  f[5] = hit ? omega : 0;
  return buf;
}

export function decodeMotion(buf) {
  const f = new Float32Array(buf);
  if (f.length < MOTION_FLOATS) return null;
  return {
    q: { x: f[0], y: f[1], z: f[2], w: f[3] },
    omega: f[4],
    hit: f[5],
  };
}
