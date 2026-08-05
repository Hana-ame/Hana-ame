import Peer from 'peerjs';
import { PEER_PREFIX } from '../constants.js';
import { MOTION_CHANNEL, decodeMotion } from './protocol.js';

function waitOpen(peer, timeout = 12000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('peer-open-timeout')), timeout);
    peer.on('open', (id) => { clearTimeout(t); resolve(id); });
    peer.on('error', (err) => {
      clearTimeout(t);
      reject(err);
    });
  });
}

function setup(conn, handlers, initiator) {
  let motion = null;
  const attachMotion = (ch) => {
    if (ch.label !== MOTION_CHANNEL) return;
    motion = ch;
    motion.binaryType = 'arraybuffer';
    motion.onmessage = (ev) => handlers.onMotion?.(decodeMotion(ev.data));
    motion.onopen = () => handlers.onMotionOpen?.();
  };

  if (!initiator) {
    conn.peerConnection.ondatachannel = (e) => attachMotion(e.channel);
  } else {
    conn.once('open', () => {
      try {
        const ch = conn.peerConnection.createDataChannel(MOTION_CHANNEL, {
          ordered: false,
          maxRetransmits: 0,
        });
        ch.binaryType = 'arraybuffer';
        motion = ch;
        motion.onopen = () => handlers.onMotionOpen?.();
      } catch (e) {
        handlers.onError?.(e);
      }
    });
  }

  conn.on('data', (d) => handlers.onControl?.(d));
  conn.on('open', () => handlers.onOpen?.(conn));
  conn.on('close', () => handlers.onClose?.());
  conn.on('error', (e) => handlers.onError?.(e));
}

export async function createHost(roomCode, handlers) {
  const id = `${PEER_PREFIX}-${roomCode}`;
  const peer = new Peer(id, { debug: 0 });
  const hostId = await waitOpen(peer);
  let conn = null;

  peer.on('connection', (c) => {
    conn = c;
    setup(c, handlers, false);
  });

  return {
    id: hostId,
    sendControl: (obj) => { if (conn) conn.send(obj); },
    get hasClient() { return !!conn; },
    close: () => peer.destroy(),
  };
}

export async function joinPeer(targetId, handlers) {
  const peer = new Peer({ debug: 0 });
  const myId = await waitOpen(peer);
  const conn = peer.connect(targetId, { reliable: true });
  setup(conn, handlers, true);

  await new Promise((resolve, reject) => {
    conn.once('open', resolve);
    conn.once('error', reject);
  });

  return {
    myId,
    conn,
    sendControl: (obj) => conn.send(obj),
    close: () => peer.destroy(),
  };
}
