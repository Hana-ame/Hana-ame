import * as THREE from 'three';

const GRAVITY = new THREE.Vector3(0, -9, 0);
const LIFETIME = 1.1;

export class Fx {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.shake = 0;
    this.shakeDecay = 2.5;

    this._bursts = [];

    const geo = new THREE.BufferGeometry();
    const count = 400;
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    this._points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.14,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this._points.frustumCulled = false;
    this._points.visible = false;
    scene.add(this._points);

    this._free = [];
    for (let i = 0; i < 6; i++) this._free.push(this._alloc());
  }

  _alloc() {
    return {
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      acc: new THREE.Vector3(),
      color: new THREE.Color(),
      life: 0,
      maxLife: 1,
      index: -1,
    };
  }

  burst(pos, color, count = 26, dir = null) {
    for (let i = 0; i < count; i++) {
      const p = this._free.pop() || this._alloc();
      p.pos.copy(pos);
      if (dir) {
        p.vel.copy(dir).multiplyScalar(6 + Math.random() * 5);
        p.vel.x += (Math.random() - 0.5) * 6;
        p.vel.y += (Math.random() - 0.5) * 6;
        p.vel.z += (Math.random() - 0.5) * 6;
      } else {
        p.vel.set(
          (Math.random() - 0.5) * 9,
          (Math.random() - 0.5) * 9,
          (Math.random() - 0.5) * 9,
        );
      }
      p.acc.copy(GRAVITY);
      p.color.copy(color);
      p.color.offsetHSL((Math.random() - 0.5) * 0.08, 0, (Math.random() - 0.5) * 0.15);
      p.life = 0;
      p.maxLife = LIFETIME * (0.7 + Math.random() * 0.6);
      p.index = this._bursts.length;
      this._bursts.push(p);
    }
    this._sync();
  }

  addShake(amount) {
    // TODO(视角): 暂关镜头晃动, 待光剑方向稳定后再启用
    // this.shake = Math.min(1.6, this.shake + amount);
  }

  update(dt) {
    this.shake = Math.max(0, this.shake - this.shakeDecay * dt);
    if (this.shake > 0.01) {
      const k = this.shake;
      this.camera.position.x += (Math.random() - 0.5) * 0.5 * k;
      this.camera.position.y += (Math.random() - 0.5) * 0.5 * k;
      this.camera.position.z += (Math.random() - 0.5) * 0.3 * k;
      this.camera.lookAt(0, 0.6, -8);
    }

    if (this._bursts.length === 0) {
      this._points.visible = false;
      return;
    }
    this._points.visible = true;

    const posAttr = this._points.geometry.attributes.position;
    const colAttr = this._points.geometry.attributes.color;
    let n = 0;
    const dead = [];
    for (let i = 0; i < this._bursts.length; i++) {
      const p = this._bursts[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this._free.push(p);
        dead.push(i);
        continue;
      }
      p.vel.addScaledVector(p.acc, dt);
      p.pos.addScaledVector(p.vel, dt);
      const fade = 1 - p.life / p.maxLife;
      posAttr.setXYZ(n, p.pos.x, p.pos.y, p.pos.z);
      colAttr.setXYZ(n, p.color.r * fade, p.color.g * fade, p.color.b * fade);
      n++;
    }
    for (let i = dead.length - 1; i >= 0; i--) {
      this._bursts.splice(dead[i], 1);
    }
    this._points.geometry.setDrawRange(0, n);
    this._points.geometry.attributes.position.needsUpdate = true;
    this._points.geometry.attributes.color.needsUpdate = true;
  }

  _sync() {
    this._points.geometry.setDrawRange(0, this._bursts.length);
  }
}
