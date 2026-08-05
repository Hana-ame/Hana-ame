import { quat } from './quat.js';
import { SENSOR } from '../constants.js';

const DEG = Math.PI / 180;

function bodyDelta(omegaRad, dt) {
  const mag = Math.sqrt(omegaRad.x * omegaRad.x + omegaRad.y * omegaRad.y + omegaRad.z * omegaRad.z);
  if (mag < 1e-6 || dt <= 0) return quat.identity();
  return quat.fromAxisAngle(
    { x: omegaRad.x / mag, y: omegaRad.y / mag, z: omegaRad.z / mag },
    mag * dt,
  );
}

function deviceOrientationToQuaternion(alpha, beta, gamma, out) {
  const e = { x: beta * DEG, y: alpha * DEG, z: -gamma * DEG };
  return quat.fromEulerYXZ(e, out);
}

export class Sensor {
  constructor({ forceSim = false } = {}) {
    this.enabled = false;
    this.quaternion = quat.identity();
    this.omega = 0;
    this.calibrated = false;
    this.forceSim = forceSim;

    this._q = quat.identity();
    this._raw = quat.identity();
    this._calibRef = null;
    this._gyroMode = false;
    this._prev = null;
    this._prevTs = 0;
    this._peak = SENSOR.SWING_PEAK;
    this._min = SENSOR.SWING_MIN;
    this._listeners = { frame: [], swing: [] };
    this._armed = false;
    this._lastSwingTs = 0;
    this._handler = null;
    this._simTimer = null;
  }

  static get supported() {
    return typeof window !== 'undefined' && (
      'DeviceOrientationEvent' in window || typeof DeviceMotionEvent !== 'undefined'
    );
  }

  async requestPermission() {
    const withTimeout = (p) => Promise.race([
      p,
      new Promise((r) => setTimeout(() => r('denied'), 1500)),
    ]);
    const DME = window.DeviceMotionEvent;
    const DOE = window.DeviceOrientationEvent;
    if (DME && typeof DME.requestPermission === 'function') {
      try { return (await withTimeout(DME.requestPermission())) === 'granted'; }
      catch { return false; }
    }
    if (DOE && typeof DOE.requestPermission === 'function') {
      try { return (await withTimeout(DOE.requestPermission())) === 'granted'; }
      catch { return false; }
    }
    return true;
  }

  start(onFrame, onSwing) {
    this._listeners.frame.push(onFrame);
    if (onSwing) this._listeners.swing.push(onSwing);
    if (this._handler) return;

    if (this.forceSim || !window.DeviceMotionEvent) {
      if (this.forceSim || !window.DeviceOrientationEvent) {
        console.warn('[sensor] 使用模拟器 (无陀螺仪或 forceSim)');
        this._startSimulator();
        return;
      }
      console.warn('[sensor] 无 DeviceMotion, 回退 DeviceOrientation');
      this._gyroMode = false;
      this._handler = (e) => this._onDeviceOrientation(e);
      window.addEventListener('deviceorientation', this._handler);
    } else {
      this._gyroMode = true;
      this._handler = (e) => this._onDeviceMotion(e);
      window.addEventListener('devicemotion', this._handler);
    }
    this.enabled = true;
  }

  _onDeviceMotion(e) {
    const now = performance.now();
    const dt = this._prevTs ? Math.min((now - this._prevTs) / 1000, 0.1) : 0;
    this._prevTs = now;

    if (dt > 0) {
      const rr = e.rotationRate;
      if (rr && (rr.alpha || rr.beta || rr.gamma)) {
        const w = { x: rr.beta * DEG, y: rr.gamma * DEG, z: rr.alpha * DEG };
        const dq = bodyDelta(w, dt);
        this._q = quat.normalize(quat.multiply(this._q, dq));
      }
    }

    this._finalize(now, dt);
  }

  _finalize(now, dt) {
    this.quaternion = this._q;
    if (this._prev && dt > 0) {
      const dq = quat.delta(this._prev, this._q);
      this.omega = quat.angleAndAxis(dq).angle / dt;
    } else {
      this.omega = 0;
    }
    this._prev = quat.clone(this._q);
    this._checkSwing();
    this._emit('frame', { q: this.quaternion, omega: this.omega });
  }

  _onDeviceOrientation(e) {
    if (e.alpha == null || e.beta == null || e.gamma == null) return;
    deviceOrientationToQuaternion(e.alpha, e.beta, e.gamma, this._raw);

    const now = performance.now();
    const dt = this._prev ? (now - this._prevTs) / 1000 : 0;
    if (this._prev && dt > 0 && dt < 0.1) {
      const dq = quat.delta(this._prev, this._raw);
      this.omega = quat.angleAndAxis(dq).angle / dt;
    } else {
      this.omega = 0;
    }
    this._prev = quat.clone(this._raw);
    this._prevTs = now;

    if (this.calibrated && this._calibRef) {
      this.quaternion = quat.normalize(quat.multiply(quat.invert(this._calibRef), this._raw));
    } else {
      this.quaternion = quat.clone(this._raw);
    }

    this._checkSwing();
    this._emit('frame', { q: this.quaternion, omega: this.omega });
  }

  setSwingThresholds(peak, min) {
    this._peak = peak;
    this._min = min;
  }

  _checkSwing() {
    const now = performance.now();
    if (now - this._lastSwingTs < SENSOR.SWING_COOLDOWN_MS) return;
    if (this._armed) {
      if (this.omega < this._min) {
        this._armed = false;
      }
    } else if (this.omega > this._peak) {
      this._armed = true;
      this._lastSwingTs = now;
      this._emit('swing', { omega: this.omega });
    }
  }

  calibrate() {
    this.calibrated = true;
    if (this._gyroMode) {
      this._q = quat.identity();
      this._prev = quat.identity();
      this.quaternion = quat.identity();
    } else {
      this._calibRef = quat.clone(this._raw);
      this.quaternion = quat.identity();
    }
  }

  recalibrate() {
    this.calibrated = false;
    this.calibrate();
  }

  vibrate(strength = 1) {
    if (navigator.vibrate) {
      const ms = Math.round(10 + Math.min(strength, 1) * 60);
      navigator.vibrate(ms);
    }
  }

  stop() {
    if (this._handler) window.removeEventListener('devicemotion', this._handler);
    if (this._handler) window.removeEventListener('deviceorientation', this._handler);
    this._handler = null;
    this._stopSimulator();
    this.enabled = false;
  }

  _emit(type, data) {
    for (const fn of this._listeners[type]) {
      try { fn(data); } catch (e) { console.error(e); }
    }
  }

  _startSimulator() {
    let t = 0;
    let lastSwing = 0;
    let boost = 0;
    this._simTimer = setInterval(() => {
      t += 0.016;
      const now = performance.now();

      const zen = 0.9 + Math.sin(t * 0.45) * 0.45;
      let az = Math.sin(t * 1.4) * 0.9;
      let omega = 1.0 + Math.abs(Math.cos(t * 1.4)) * 1.2;

      if (now - lastSwing > 1500) {
        boost = 1;
        lastSwing = now;
      }
      az += boost * 2.6;
      boost = Math.max(0, boost - 0.1);

      const x = Math.sin(zen) * Math.cos(az);
      const y = Math.cos(zen);
      const z = -Math.sin(zen) * Math.sin(az);
      const d = Math.sqrt(x * x + y * y + z * z);
      const dir = { x: x / d, y: y / d, z: z / d };

      let q = quat.fromToDir({ x: 0, y: 1, z: 0 }, dir);
      q = quat.multiply(q, quat.fromAxisAngle({ x: 0, y: 1, z: 0 }, Math.sin(t * 0.8) * 0.3));

      if (boost > 0.5) omega = SENSOR.SWING_PEAK + 2.5;

      this._q = q;
      this.quaternion = q;
      this.omega = omega;
      this._checkSwing();
      this._emit('frame', { q: this.quaternion, omega: this.omega });
    }, 16);
  }

  _stopSimulator() {
    if (this._simTimer) clearInterval(this._simTimer);
    this._simTimer = null;
  }
}
