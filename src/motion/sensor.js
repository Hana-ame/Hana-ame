import { quat } from './quat.js';
import { SENSOR } from '../constants.js';

const DEG = Math.PI / 180;

function deviceOrientationToQuaternion(alpha, beta, gamma, out) {
  const e = {
    x: beta * DEG,
    y: alpha * DEG,
    z: -gamma * DEG,
  };
  return quat.fromEulerYXZ(e, out);
}

export class Sensor {
  constructor() {
    this.enabled = false;
    this.quaternion = quat.identity();
    this.omega = 0;
    this.calibrated = false;
    this.calibRef = null;

    this._raw = quat.identity();
    this._prev = null;
    this._prevTs = 0;
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
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      try {
        return (await DOE.requestPermission()) === 'granted';
      } catch {
        return false;
      }
    }
    return true;
  }

  start(onFrame, onSwing) {
    this._listeners.frame.push(onFrame);
    if (onSwing) this._listeners.swing.push(onSwing);
    if (this._handler) return;

    if (!window.DeviceOrientationEvent) {
      console.warn('[sensor] DeviceOrientation not supported, using simulator');
      this._startSimulator();
      return;
    }

    this._handler = (e) => this._onDeviceOrientation(e);
    window.addEventListener('deviceorientation', this._handler);
    this.enabled = true;
  }

  _onDeviceOrientation(e) {
    if (e.alpha == null || e.beta == null || e.gamma == null) return;
    deviceOrientationToQuaternion(e.alpha, e.beta, e.gamma, this._raw);

    const now = performance.now();
    const dt = this._prev ? (now - this._prevTs) / 1000 : 0;

    if (this._prev && dt > 0 && dt < 0.1) {
      const dq = quat.delta(this._prev, this._raw);
      const { angle } = quat.angleAndAxis(dq);
      this.omega = angle / dt;
    } else {
      this.omega = 0;
    }
    this._prev = quat.clone(this._raw);
    this._prevTs = now;

    if (this.calibrated) {
      this.quaternion = quat.normalize(quat.multiply(quat.invert(this.calibRef), this._raw));
    } else {
      this.quaternion = quat.clone(this._raw);
    }

    this._checkSwing();
    this._emit('frame', { q: this.quaternion, omega: this.omega });
  }

  _checkSwing() {
    const now = performance.now();
    if (now - this._lastSwingTs < SENSOR.SWING_COOLDOWN_MS) return;

    if (this._armed) {
      if (this.omega < SENSOR.SWING_MIN) {
        this._armed = false;
      }
    } else if (this.omega > SENSOR.SWING_PEAK) {
      this._armed = true;
      this._lastSwingTs = now;
      this._emit('swing', { omega: this.omega });
    }
  }

  calibrate() {
    this.calibRef = quat.clone(this._raw);
    this.calibrated = true;
    this.quaternion = quat.identity();
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

  // ----- 桌面模拟器: 无陀螺仪环境用于开发调试 -----
  _startSimulator() {
    let t = 0;
    let swingAxis = { x: 0, y: 1, z: 0 };
    let lastSwing = 0;
    this._simTimer = setInterval(() => {
      t += 0.016;
      const now = performance.now();

      let q = quat.multiply(
        quat.fromAxisAngle({ x: 0, y: 1, z: 0 }, Math.sin(t * 0.9) * 0.8),
        quat.fromAxisAngle({ x: 1, y: 0, z: 0 }, Math.sin(t * 0.5) * 0.3),
      );

      let omega = Math.abs(Math.cos(t * 0.9)) * 0.9 + 0.1;

      if (now - lastSwing > 1500) {
        swingAxis = { x: 0, y: 1, z: 0 };
        const k = 2 + Math.random();
        q = quat.multiply(quat.fromAxisAngle({ x: 0, y: 1, z: 0 }, k), q);
        omega = SENSOR.SWING_PEAK + 2.5;
        lastSwing = now;
      }

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
