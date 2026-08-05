// PC 端: 光剑调试
// 概念: "屏幕即前方" —— 手机像握光剑一样, 顶边(+Y)指向哪里, 剑就指向哪里。
// 校准: 让手机顶边对准 PC 屏幕中心, 点「设为基准」-> 光剑立刻对准金色圆环(指向屏幕内部),
//       即把"校准时的手机顶边方向"重映射为"指向屏幕"。之后剑实时跟随手机顶边, 相对基准运动。
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { $, showScreen, navigate } from '../src/ui/screens.js';
import { genRoomCode } from '../src/constants.js';
import { P, createHost, pcAnnounce, discoveryReady, discoveryClose } from '../test/net.js';
import QRCode from 'qrcode';
import {
  DEG, quatFromDeviceEuler, qRotate, qNormalize, qMul, qInvert, eulerFromQuat,
  shortestArc, Mahony,
} from '../lib/attitude.js';

const fmt = (v, d = 1) => (v == null || !Number.isFinite(v) ? '--' : `${v.toFixed(d)}`);
const fmt3 = (v) => (v == null ? '--' : v.toFixed(3));

export function initPc() {
  const els = {
    status: $('#pc-status'),
    code: $('#pc-roomcode'),
    qr: $('#pc-qr'),
    device: $('#pc-device'),
    ping: $('#pc-ping'),
    hz: $('#pc-hz'),
    frames: $('#pc-frames'),
    newcode: $('#pc-newcode'),
    setref: $('#pc-setref'),
    resetref: $('#pc-resetref'),
    delta: $('#ref-delta'), yaw: $('#ref-yaw'), pitch: $('#ref-pitch'), roll: $('#ref-roll'),
    fx: $('#s-fx'), fy: $('#s-fy'), fz: $('#s-fz'), fsrc: $('#s-fsrc'),
    srcRadios: [...document.querySelectorAll('input[name="src"]')],
  };
  els.attRows = new Map();
  document.querySelectorAll('.att tbody tr[data-src]').forEach((tr) => els.attRows.set(tr.dataset.src, tr));

  let roomCode = genRoomCode();
  let host = null;
  let stopAnnounce = null;
  let frames = 0;
  let recvWindow = [];
  let inited = false;
  let lastRecv = 0;

  const mah = new Mahony({ kp: 0.5, ki: 0.05 });
  let lastQ = null;      // 系统解 (deviceorientation)
  let refQ = null;       // 基准四元数
  let refTop = null;     // 校准时手机顶边(前端)在世界系方向
  let mapQ = null;       // 基准重映射旋转: refTop -> INTO
  let srcNow = 'fuse';

  function setRow(key, a, b, g) {
    const tr = els.attRows.get(key);
    if (!tr) return;
    tr.querySelector('.a').textContent = a;
    tr.querySelector('.b').textContent = b;
    tr.querySelector('.g').textContent = g;
  }

  function currentQ() {
    return srcNow === 'device' ? lastQ : mah.q;
  }

  // 手机顶边(前端, 设备 +Y)在世界系方向 —— "屏幕即前方"
  function phoneTop(q) {
    return qRotate(q, { x: 0, y: 1, z: 0 });
  }

  // 剑方向: 手机顶边方向, 经基准重映射(校准姿态 -> 指向屏幕 INTO)
  function swordDir(q) {
    const top = phoneTop(q);
    if (mapQ) return qRotate(mapQ, top);
    return top;
  }

  function onSensor(snap) {
    frames++;
    const now = performance.now();
    recvWindow.push(now);
    while (recvWindow.length && now - recvWindow[0] > 1000) recvWindow.shift();

    const o = snap.o;
    const aig = snap.aig;
    const gyr = snap.gyr;
    if (o && o.a != null && o.b != null && o.g != null) {
      lastQ = quatFromDeviceEuler(o.a, o.b, o.g);
      if (!inited) { mah.setOrientation(lastQ); inited = true; }
      const e = eulerFromQuat(lastQ);
      setRow('device', fmt(e.alpha), fmt(e.beta), fmt(e.gamma));
    }
    if (aig && gyr && inited) {
      const dt = Math.max(0.001, Math.min(0.1, (now - lastRecv) / 1000));
      lastRecv = now;
      const gyrRad = { x: (gyr.x ?? 0) * DEG, y: (gyr.y ?? 0) * DEG, z: (gyr.z ?? 0) * DEG };
      mah.update(dt, gyrRad, aig);
      const e = eulerFromQuat(mah.q);
      setRow('fuse', fmt(e.alpha), fmt(e.beta), fmt(e.gamma));
    }
    if (snap.ts) els.frames.textContent = frames;
    els.hz.textContent = `${recvWindow.length} Hz`;

    updateScene();
  }

  // ---- 场景 ----
  const renderer = new THREE.WebGLRenderer({ canvas: $('#pc3d'), antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0b18);
  scene.up.set(0, 0, 1);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 50);
  camera.up.set(0, 0, 1);
  camera.position.set(2.6, -1.6, 1.7);
  camera.lookAt(0, 0.5, -0.4);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.5, -0.4);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(1, -1.5, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x88aaff, 0.35);
  fill.position.set(-1.5, 1, 0.5);
  scene.add(fill);

  const grid = new THREE.GridHelper(4.4, 22, 0x4a4a72, 0x262642);
  grid.rotation.x = Math.PI / 2;
  scene.add(grid);

  // 重力箭头
  scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(-0.95, 0.95, 0.55), 0.55, 0x8899aa, 0.14, 0.08));

  // ---- 剑 ----
  const PIVOT = new THREE.Vector3(0, 0.5, 1.4);
  const swordGroup = new THREE.Group();
  swordGroup.position.copy(PIVOT);
  scene.add(swordGroup);

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 0.45, 12),
    new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.7, metalness: 0.6 }),
  );
  swordGroup.add(handle);

  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 2.2, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x4de3ff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  blade.position.y = 1.1;
  swordGroup.add(blade);

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 2.2),
    new THREE.MeshBasicMaterial({ color: 0x9ff6ff, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
  );
  glow.position.y = 1.1;
  swordGroup.add(glow);

  // 剑模型默认朝 +Y (向上), 旋转对齐到剑方向 (手机顶边经基准重映射)
  const UP = new THREE.Vector3(0, 1, 0);
  function setSwordDir(dir) {
    const d = new THREE.Vector3(dir.x, dir.y, dir.z);
    if (d.lengthSq() < 1e-9) return;
    swordGroup.quaternion.setFromUnitVectors(UP, d.normalize());
  }

  // ---- PC 屏幕 (金色圆环): 在剑尖正面, 面向玩家 ----
  const RING_POS = new THREE.Vector3(0, 0.5, -1.6);   // 屏幕中心 (玩家前方较远处)
  const INTO = new THREE.Vector3(0, 0, -1).normalize(); // 屏幕内部方向 (剑尖应指向它)
  const targetGroup = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1.15, 40),
    new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
  );
  targetGroup.add(ring);
  const ringEdge = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.15, 0, 0), new THREE.Vector3(1.15, 0, 0), new THREE.Vector3(1.15, 1.7, 0), new THREE.Vector3(-1.15, 1.7, 0),
    ]),
    new THREE.LineBasicMaterial({ color: 0xffd166 }),
  );
  targetGroup.add(ringEdge);
  // 屏幕法线指示 (金色短箭头, 指向"屏幕内部")
  const targetNormal = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 0.7, 0xffd166, 0.15, 0.08);
  targetGroup.add(targetNormal);
  targetGroup.position.copy(RING_POS);
  targetGroup.rotation.x = -Math.PI / 2;
  scene.add(targetGroup);

  // 剑柄到圆环的瞄准线 (虚线, 显示"屏幕内部"方向)
  const aimGeo = new THREE.BufferGeometry().setFromPoints([PIVOT, RING_POS]);
  const aimLine = new THREE.Line(
    aimGeo,
    new THREE.LineDashedMaterial({ color: 0xffd166, transparent: true, opacity: 0.5, dashSize: 0.12, gapSize: 0.1 }),
  );
  aimLine.computeLineDistances();
  scene.add(aimLine);

  function updateScene() {
    const q = currentQ();
    if (!q) return;
    window.__swordQ = q;
    const top = phoneTop(q);
    els.fx.textContent = fmt3(top.x);
    els.fy.textContent = fmt3(top.y);
    els.fz.textContent = fmt3(top.z);
    els.fsrc.textContent = srcNow === 'device' ? '系统解' : 'Mahony';

    const dir = swordDir(q);
    setSwordDir(dir);
    window.__swordDir = [dir.x, dir.y, dir.z];
    window.__swordTop = [top.x, top.y, top.z];

    if (refQ && refTop) {
      const rel = qNormalize(qMul(qInvert(refQ), q));
      const e = eulerFromQuat(rel);
      els.yaw.textContent = fmt(e.alpha);
      els.pitch.textContent = fmt(e.beta);
      els.roll.textContent = fmt(e.gamma);
      const dot = Math.max(-1, Math.min(1, top.x * refTop.x + top.y * refTop.y + top.z * refTop.z));
      els.delta.textContent = fmt(Math.acos(dot) / DEG);
    }
  }

  function onResize() {
    const w = renderer.domElement.clientWidth;
    const h = renderer.domElement.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    controls.update();
    renderer.render(scene, camera);
  };

  // ---- 通信 ----
  function handlers() {
    return {
      onData(d) {
        if (d && typeof d === 'object') {
          if (d.t === P.SENSOR) onSensor(d);
          else if (d.t === P.PING) host?.send({ t: P.PONG, ts: d.ts });
          else if (d.t === P.PONG) {
            const dt = Date.now() - d.ts;
            els.ping.textContent = `${Math.max(0, dt)} ms`;
          }
        }
      },
      onOpen() {
        els.device.textContent = '手机已连接';
        els.device.classList.remove('muted');
        els.device.classList.add('ok');
        els.status.textContent = '已连接';
        els.status.classList.add('ok');
      },
      onClose() {
        els.device.textContent = '手机已断开, 等待重连…';
        els.device.classList.add('muted');
        els.status.textContent = '等待手机';
        els.status.classList.remove('ok');
      },
      onError(e) { console.error('[sword] conn error', e); },
    };
  }

  function refreshQr() {
    els.code.textContent = roomCode;
    const joinUrl = `${window.location.origin}/test/#/mobile?room=${roomCode}`;
    QRCode.toCanvas(els.qr, joinUrl, { width: 256, margin: 1 }).catch((e) => console.error('qr', e));
  }

  async function makeHost(attempt = 0) {
    if (host) { try { host.close(); } catch { /* noop */ } }
    els.status.textContent = attempt > 0 ? `重连信令 (${attempt}/2)…` : '生成房间中…';
    try {
      host = await createHost(roomCode, handlers());
      await discoveryReady();
      stopAnnounce?.();
      stopAnnounce = pcAnnounce(roomCode, host.id);
      els.status.textContent = '房间已广播, 等待手机…';
    } catch (e) {
      if (e?.type === 'unavailable-id') {
        roomCode = genRoomCode();
        refreshQr();
        await makeHost(0);
        return;
      }
      if (attempt < 2) {
        setTimeout(() => makeHost(attempt + 1), 800);
        return;
      }
      console.error(e);
      els.status.textContent = '信令不可用, 点「换一个」重试';
    }
  }

  // ---- 绑定 ----
  els.srcRadios.forEach((r) => {
    r.addEventListener('change', () => {
      srcNow = r.value;
      updateScene();
    });
  });
  els.setref.addEventListener('click', () => {
    const q = currentQ();
    if (!q) { alert('还没收到手机数据'); return; }
    refQ = q;
    refTop = phoneTop(q);
    mapQ = shortestArc(refTop, { x: INTO.x, y: INTO.y, z: INTO.z });
    els.setref.textContent = '基准已设(剑指向圆环)';
    els.setref.classList.add('ok');
    updateScene();
  });
  els.resetref.addEventListener('click', () => {
    refQ = null;
    refTop = null;
    mapQ = null;
    els.setref.textContent = '设为基准(手机顶边朝屏幕)';
    els.setref.classList.remove('ok');
    els.delta.textContent = els.yaw.textContent = els.pitch.textContent = els.roll.textContent = '--';
    updateScene();
  });
  els.newcode.addEventListener('click', () => {
    roomCode = genRoomCode();
    refreshQr();
    makeHost();
  });
  $('#pc-back').addEventListener('click', () => navigate('/'));

  showScreen('screen-pc');
  onResize();
  refreshQr();
  makeHost();
  loop();

  return () => {
    cancelAnimationFrame(raf);
    stopAnnounce?.();
    discoveryClose();
    if (host) { try { host.close(); } catch { /* noop */ } }
    window.removeEventListener('resize', onResize);
    renderer.dispose();
    controls.dispose();
  };
}
