import * as CANNON from 'cannon-es';
import * as THREE from 'three';

const SHARD_COUNT = 9;
const SHARD_FADE = 3.0;

export class ShardPhysics {
  constructor() {
    this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, -14) });
    this.world.allowSleep = true;

    const mat = new CANNON.Material({ friction: 0.3, restitution: 0.45 });
    const ground = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      position: new CANNON.Vec3(0, 0, -2.6),
    });
    const ceil = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      position: new CANNON.Vec3(0, 0, 6.2),
      quaternion: new CANNON.Quaternion().setFromEuler(Math.PI, 0, 0),
    });
    const back = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      position: new CANNON.Vec3(0, -7, 0),
      quaternion: new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0),
    });
    const front = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      position: new CANNON.Vec3(0, 5, 0),
      quaternion: new CANNON.Quaternion().setFromEuler(Math.PI / 2, 0, 0),
    });
    for (const b of [ground, ceil, back, front]) {
      b.material = mat;
      this.world.addBody(b);
    }

    this._shards = [];
    this._geoCache = new Map();
  }

  spawn(pos, impulse) {
    const bodies = [];
    for (let i = 0; i < SHARD_COUNT; i++) {
      const s = 0.12 + Math.random() * 0.18;
      const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(s, s, s)),
        position: new CANNON.Vec3(
          pos.x + (Math.random() - 0.5) * 0.4,
          pos.y + (Math.random() - 0.5) * 0.4,
          pos.z + (Math.random() - 0.5) * 0.4,
        ),
      });
      body.linearDamping = 0.05;
      body.angularDamping = 0.2;
      const v = new CANNON.Vec3(
        impulse.x * (4 + Math.random() * 5) + (Math.random() - 0.5) * 3,
        impulse.y * (4 + Math.random() * 5) + (Math.random() - 0.5) * 3,
        impulse.z * (4 + Math.random() * 5) + 2 + Math.random() * 4,
      );
      body.velocity.set(v.x, v.y, v.z);
      body.angularVelocity.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
      );
      this.world.addBody(body);
      const mesh = this._mesh(s);
      this._shards.push({ body, mesh, life: SHARD_FADE });
      bodies.push({ body, mesh });
    }
    return bodies;
  }

  _mesh(s) {
    let geo = this._geoCache.get(s.toFixed(2));
    if (!geo) {
      geo = new THREE.BoxGeometry(s * 2, s * 2, s * 2);
      this._geoCache.set(s.toFixed(2), geo);
    }
    const mat = new THREE.MeshStandardMaterial({
      color: 0x4de3ff,
      emissive: 0x1a5f73,
      metalness: 0.6,
      roughness: 0.2,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    return mesh;
  }

  update(dt, scene) {
    this.world.step(1 / 60, dt, 3);
    const dead = [];
    for (let i = 0; i < this._shards.length; i++) {
      const s = this._shards[i];
      s.life -= dt;
      s.mesh.position.copy(s.body.position);
      s.mesh.quaternion.copy(s.body.quaternion);
      const alpha = Math.min(1, s.life / 0.8);
      s.mesh.material.opacity = alpha;
      if (s.life <= 0 || s.body.position.z < -3.5) {
        scene.remove(s.mesh);
        s.mesh.material.dispose();
        this.world.removeBody(s.body);
        dead.push(i);
      }
    }
    for (let i = dead.length - 1; i >= 0; i--) this._shards.splice(dead[i], 1);
  }

  dispose(scene) {
    for (const s of this._shards) scene.remove(s.mesh);
    this._shards = [];
  }
}
