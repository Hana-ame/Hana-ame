import mqtt from 'mqtt';
import { MQTT } from '../constants.js';

let client = null;
let heartbeatTimer = null;

export function isConnected() {
  return !!client && client.connected;
}

export function connect({ timeout = 6000 } = {}) {
  if (client) return Promise.resolve(isConnected());
  return new Promise((resolve) => {
    const opts = {
      clientId: `beatrift-${Math.random().toString(36).slice(2, 10)}`,
      clean: true,
      connectTimeout: 5000,
      reconnectPeriod: 0,
    };
    let done = false;
    const c = mqtt.connect(MQTT.URL, opts);
    client = c;
    const finish = (ok) => {
      if (done) return;
      done = true;
      resolve(ok);
    };
    c.on('connect', () => {
      c.on('error', () => {});
      finish(true);
    });
    c.on('error', () => finish(false));
    setTimeout(() => finish(false), timeout);
  });
}

export function pcAnnounce(roomCode, peerId) {
  const topic = `${MQTT.ROOM_TOPIC}/${roomCode}`;
  const beat = { roomCode, peerId, ts: Date.now() };
  const publish = () => {
    if (!isConnected()) return;
    client.publish(topic, JSON.stringify(beat), { qos: 0, retain: false });
  };
  publish();
  heartbeatTimer = setInterval(publish, 2000);
  return () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  };
}

export function subscribeRooms(handler) {
  if (!isConnected()) return null;
  const topic = `${MQTT.ROOM_TOPIC}/+`;
  client.subscribe(topic, { qos: 0 });
  const onMessage = (t, payload) => {
    const code = t.split('/').pop();
    try {
      handler(code, JSON.parse(payload.toString()));
    } catch {
      /* ignore malformed */
    }
  };
  client.on('message', onMessage);
  return () => {
    client.unsubscribe(topic);
    client.off('message', onMessage);
  };
}

export function close() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
  if (client) {
    try { client.end(true); } catch { /* noop */ }
    client = null;
  }
}
