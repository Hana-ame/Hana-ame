export const APP_BASE = '/webrtc/';

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

export const GAME = {
  BPM: 128,
  BEATS_PER_BAR: 4,
  NOTE_PLANE_Z: 0,
  NOTE_SPAWN_Z: -46,
  NOTE_SPEED: 13,
  NOTE_LIFETIME: 9999,
  HIT_WINDOW_Z: 2.4,
  MISS_Z: 4.2,
  LIVES: 3,
  GRID: {
    rows: 3,
    cols: 3,
    dx: 2.1,
    dy: 1.7,
    y0: 1.1,
  },
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
