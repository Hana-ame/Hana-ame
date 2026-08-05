import * as THREE from 'three';
import { GAME } from '../constants.js';

const SWORD_PIVOT = new THREE.Vector3(0, 0.7, 1.6);
const SWORD_LEN = 2.6;
const TRAIL_LEN = 14;

export function gridPositions() {
  const out = [];
  for (let r = 0; r < GAME.GRID.rows; r++) {
    for (let c = 0; c < GAME.GRID.cols; c++) {
      out.push(new THREE.Vector3(
        (c - 1) * GAME.GRID.dx,
        GAME.GRID.y0 + (r - 1) * GAME.GRID.dy,
        0,
      ));
    }
  }
  return out;
}

export function createGameScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a16);
  scene.fog = new THREE.Fog(0x0a0a16, 18, 55);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0.5, 7);
  camera.lookAt(0, 0.8, -6);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(3, 6, 4);
  scene.add(key);

  addStars(scene);
  addGridMarkers(scene);

  const sword = createSword();
  scene.add(sword.group);

  const trail = createTrail();
  scene.add(trail.line);

  const notePool = createNotePool(scene);

  window.addEventListener('resize', onResize);
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  return {
    scene,
    camera,
    renderer,
    sword,
    trail,
    notePool,
    gridPos: gridPositions(),
    getSword() {
      const dir = new THREE.Vector3(0, 1, 0).applyQuaternion(sword.group.quaternion);
      const tip = SWORD_PIVOT.clone().addScaledVector(dir, SWORD_LEN);
      return { pivot: SWORD_PIVOT, dir, tip };
    },
    resize: onResize,
    dispose() {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    },
  };
}

function addStars(scene) {
  const geo = new THREE.BufferGeometry();
  const n = 400;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 120;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 60;
    arr[i * 3 + 2] = -5 - Math.random() * 80;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0x8899ff, size: 0.08, transparent: true, opacity: 0.7,
  })));
}

function addGridMarkers(scene) {
  const pos = gridPositions();
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x2a2a44, transparent: true, opacity: 0.5,
  });
  const ringGeo = new THREE.RingGeometry(0.55, 0.72, 32);
  for (const p of pos) {
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(p);
    ring.position.z = 0.02;
    scene.add(ring);
  }
}

function createSword() {
  const group = new THREE.Group();
  group.position.copy(SWORD_PIVOT);

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.11, 0.5, 12),
    new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.7, metalness: 0.6 }),
  );
  handle.position.y = -0.1;
  group.add(handle);

  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, SWORD_LEN, 0.09),
    new THREE.MeshBasicMaterial({
      color: 0x4de3ff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  blade.position.y = SWORD_LEN / 2;
  group.add(blade);

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, SWORD_LEN),
    new THREE.MeshBasicMaterial({
      color: 0x9ff6ff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  glow.position.y = SWORD_LEN / 2;
  group.add(glow);

  const tipLight = new THREE.PointLight(0x4de3ff, 1.2, 6);
  tipLight.position.y = SWORD_LEN;
  group.add(tipLight);

  group.visible = false;
  return { group, blade, tipLight };
}

function createTrail() {
  const positions = new Float32Array(TRAIL_LEN * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const line = new THREE.Line(
    geo,
    new THREE.LineBasicMaterial({
      color: 0x7df0ff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  line.frustumCulled = false;
  return { line, pts: [] };
}

function createNotePool(scene) {
  const geo = new THREE.OctahedronGeometry(0.62, 0);
  const free = [];
  const active = [];

  function spawn(pos, color) {
    let mesh = free.pop();
    if (!mesh) {
      mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.9,
          roughness: 0.3,
          metalness: 0.2,
          transparent: true,
          opacity: 1,
        }),
      );
      mesh.scale.set(1, 1.4, 0.55);
      mesh.frustumCulled = false;
    } else {
      mesh.material.color.set(color);
      mesh.material.emissive.set(color);
      mesh.material.opacity = 1;
    }
    mesh.position.copy(pos);
    scene.add(mesh);
    active.push(mesh);
    return mesh;
  }

  function release(mesh) {
    scene.remove(mesh);
    const i = active.indexOf(mesh);
    if (i >= 0) active.splice(i, 1);
    free.push(mesh);
  }

  return { spawn, release, active };
}

export { SWORD_PIVOT, SWORD_LEN, TRAIL_LEN };
