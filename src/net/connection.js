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

function setup(session, conn, handlers, initiator) {
  const attachMotion = (ch) => {
    if (ch.label !== MOTION_CHANNEL) return;
    session.motion = ch;
    ch.binaryType = 'arraybuffer';
    ch.onmessage = (ev) => handlers.onMotion?.(decodeMotion(ev.data));
    ch.onopen = () => handlers.onMotionOpen?.();
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
        attachMotion(ch);
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
  const session = {
    motion: null,
    conn: null,
    sendControl: (obj) => { if (session.conn) session.conn.send(obj); },
    sendMotion: (buf) => {
      const ch = session.motion;
      if (ch && ch.readyState === 'open') ch.send(buf);
    },
    get hasClient() { return !!session.conn; },
    close: () => peer.destroy(),
  };

  peer.on('connection', (c) => {
    session.conn = c;
    session.motion = null;
    setup(session, c, handlers, false);
  });

  return { id: hostId, ...session };
}

export async function joinPeer(targetId, handlers) {
  const peer = new Peer({ debug: 0 });
  const myId = await waitOpen(peer);
  const conn = peer.connect(targetId, { reliable: true });
  const session = {
    motion: null,
    conn,
    sendControl: (obj) => conn.send(obj),
    sendMotion: (buf) => {
      const ch = session.motion;
      if (ch && ch.readyState === 'open') ch.send(buf);
    },
    close: () => peer.destroy(),
  };
  setup(session, conn, handlers, true);

  await new Promise((resolve, reject) => {
    conn.once('open', resolve);
    conn.once('error', reject);
  });

  return { myId, ...session };
}
