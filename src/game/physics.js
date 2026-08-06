import * as CANNON from 'cannon-es';
import * as THREE from 'three';

const SHARD_COUNT = 2;
const SHARD_FADE = 2.2;

// 音符碎裂: 碎块是音符本身(八面体)的碎片, 不设地面/墙壁, 不受任何反弹碰撞,
// 受重力直接下落、翻滚、淡出, 到时间后从场景删除。
export class ShardPhysics {
  constructor() {
    this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, -14) });
    this.world.allowSleep = true;
    this._shards = [];
    this._scene = null;
  }

  splitNote(pos, color, cutDir, scene) {
    if (!scene) scene = this._scene;
    const d = new THREE.Vector3(cutDir.x, cutDir.y, cutDir.z).normalize();
    // 垂直于剑刃的切向, 两块各朝一侧飞开
    let perp = new THREE.Vector3(d.z, 0, -d.x);
    if (perp.lengthSq() < 1e-4) perp.set(1, 0, 0);
    perp.normalize();

    for (let i = 0; i < SHARD_COUNT; i++) {
      const sgn = i === 0 ? 1 : -1;
      const s = 0.45 + Math.random() * 0.25;

      const geo = new THREE.OctahedronGeometry(s, 0);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        metalness: 0.4,
        roughness: 0.3,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      // 非均匀缩放 -> 像被劈开的音符碎片, 而不是方块
      mesh.scale.set(
        0.6 + Math.random() * 0.9,
        0.6 + Math.random() * 0.9,
        0.5 + Math.random() * 0.8,
      );
      mesh.frustumCulled = false;
      scene.add(mesh);

      const body = new CANNON.Body({
        mass: 0.5 + Math.random() * 0.4,
        shape: new CANNON.Box(new CANNON.Vec3(s, s, s)),
        position: new CANNON.Vec3(
          pos.x + perp.x * sgn * 0.25,
          pos.y + perp.y * sgn * 0.25,
          pos.z + perp.z * sgn * 0.25,
        ),
      });
      body.linearDamping = 0.12;
      body.angularDamping = 0.12;
      // 主要向下落, 两块沿切向各自飞开, 少量沿剑刃方向散开
      body.velocity.set(
        d.x * (1 + Math.random() * 2) + perp.x * sgn * (2.5 + Math.random() * 2),
        d.y * (1 + Math.random() * 2) + perp.y * sgn * (2.5 + Math.random() * 2),
        -(2 + Math.random() * 3),
      );
      body.angularVelocity.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
      );
      this.world.addBody(body);

      this._shards.push({ body, mesh, life: SHARD_FADE * (0.6 + Math.random() * 0.7) });
    }
  }

  update(dt, scene) {
    if (scene) this._scene = scene;
    this.world.step(1 / 60, dt, 2);
    const dead = [];
    for (let i = 0; i < this._shards.length; i++) {
      const s = this._shards[i];
      s.life -= dt;
      s.mesh.position.copy(s.body.position);
      s.mesh.quaternion.copy(s.body.quaternion);
      const alpha = Math.min(1, s.life / 0.5);
      s.mesh.material.opacity = alpha;
      if (s.life <= 0) {
        scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        this.world.removeBody(s.body);
        dead.push(i);
      }
    }
    for (let i = dead.length - 1; i >= 0; i--) this._shards.splice(dead[i], 1);
  }

  dispose(scene) {
    for (const s of this._shards) {
      scene.remove(s.mesh);
      this.world.removeBody(s.body);
    }
    this._shards = [];
  }
}
