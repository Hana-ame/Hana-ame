export const MQTT = {
  URL: 'wss://broker.hivemq.com:8884/mqtt',
  ROOM_TOPIC: 'beatrift/rooms',
};

export const PEER_PREFIX = 'beatrift';

export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LEN = 5;

export const SENSOR = {
  HZ: 60,
  SWING_PEAK: 3.2,
  SWING_MIN: 1.2,
  SWING_COOLDOWN_MS: 160,
};

export const SWORD = {
  PIVOT: { x: 0, y: 0.5, z: 1.4 },
  LEN: 2.6,
};

export const DIFFICULTY = {
  easy: { hitRadius: 2.2, hitSteps: 6.0, swingPeak: 2.0, swingMin: 0.7 },
  normal: { hitRadius: 1.7, hitSteps: 4.5, swingPeak: 3.2, swingMin: 1.2 },
  hard: { hitRadius: 1.3, hitSteps: 3.0, swingPeak: 4.2, swingMin: 1.6 },
};
export const DEFAULT_DIFFICULTY = 'easy';

export const GAME = {
  BPM: 128,
  BEATS_PER_BAR: 4,
  NOTE_PLANE_Y: -2.7,
  NOTE_SPAWN_Y: -46,
  NOTE_SPEED: 13,
  NOTE_LIFETIME: 9999,
  HIT_WINDOW_Y: 2.4,
  MISS_Y: 4.2,
  LIVES: 3,
  INVINCIBLE: true,
};

export function genRoomCode() {
  let s = '';
  const arr = new Uint32Array(1);
  for (let i = 0; i < ROOM_CODE_LEN; i++) {
    crypto.getRandomValues(arr);
    s += ROOM_CODE_ALPHABET[arr[0] % ROOM_CODE_ALPHABET.length];
  }
  return s;
}

export function normalizeCode(s) {
  return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, ROOM_CODE_LEN);
}
