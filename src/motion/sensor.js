import { SENSOR } from '../constants.js';

const JUMP_GUARD = 90;

export class Sensor {
  constructor({ forceSim = false } = {}) {
    this.enabled = false;
    this.gamma = 0;
    this.beta = 0;
    this.ax = 0;
    this.ay = 0;
    this.az = 0;
    this.omega = 0;
    this.calibrated = false;
    this.forceSim = forceSim;

    this._prev = null;
    this._prevTs = 0;
    this._peak = SENSOR.SWING_PEAK;
    this._min = SENSOR.SWING_MIN;
    this._lastSwingTs = 0;
    this._armed = false;
    this._orientHandler = null;
    this._motionHandler = null;
    this._listeners = { frame: [], swing: [] };
    this._simTimer = null;
  }

  static get supported() {
    return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
  }

  async requestPermission() {
    const withTimeout = (p) => Promise.race([p, new Promise((r) => setTimeout(() => r('denied'), 1500))]);
    const needs = [];
    if (window.DeviceMotionEvent && typeof window.DeviceMotionEvent.requestPermission === 'function') {
      needs.push('motion');
    }
    if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      needs.push('orientation');
    }
    for (const kind of needs) {
      try {
        const r = await withTimeout(kind === 'motion'
          ? window.DeviceMotionEvent.requestPermission()
          : window.DeviceOrientationEvent.requestPermission());
        if (r !== 'granted') return false;
      } catch {
        return false;
      }
    }
    return true;
  }

  start(onFrame, onSwing) {
    this._listeners.frame.push(onFrame);
    if (onSwing) this._listeners.swing.push(onSwing);
    if (this._orientHandler) return;

    if (this.forceSim || !window.DeviceOrientationEvent || !window.DeviceMotionEvent) {
      console.warn('[sensor] 使用模拟器 (无陀螺仪/加速度计或 forceSim)');
      this._startSimulator();
      return;
    }
    this._orientHandler = (e) => this._onOrientation(e);
    window.addEventListener('deviceorientation', this._orientHandler);
    this._motionHandler = (e) => this._onMotion(e);
    window.addEventListener('devicemotion', this._motionHandler);
    this.enabled = true;
  }

  _onMotion(e) {
    const g = e.accelerationIncludingGravity;
    if (g && (g.x || g.y || g.z)) {
      this.ax = g.x;
      this.ay = g.y;
      this.az = g.z;
    }
  }

  _onOrientation(e) {
    if (e.gamma == null || e.beta == null) return;
    const now = performance.now();
    const dt = this._prevTs ? (now - this._prevTs) / 1000 : 0;

    if (this._prev) {
      const dg = e.gamma - this._prev.gamma;
      const db = e.beta - this._prev.beta;
      this.gamma = e.gamma;
      this.beta = e.beta;
      if (Math.abs(dg) <= JUMP_GUARD && Math.abs(db) <= JUMP_GUARD && dt > 0 && dt < 0.1) {
        this.omega = Math.hypot(dg, db) * (Math.PI / 180) / dt;
      } else {
        this.omega = 0;
      }
    } else {
      this.gamma = e.gamma;
      this.beta = e.beta;
      this.omega = 0;
    }
    this._prev = { gamma: e.gamma, beta: e.beta };
    this._prevTs = now;

    this._checkSwing();
    this._emit('frame', { gamma: this.gamma, beta: this.beta, ax: this.ax, ay: this.ay, az: this.az, omega: this.omega });
  }

  setSwingThresholds(peak, min) {
    this._peak = peak;
    this._min = min;
  }

  _checkSwing() {
    const now = performance.now();
    if (now - this._lastSwingTs < SENSOR.SWING_COOLDOWN_MS) return;
    if (this._armed) {
      if (this.omega < this._min) this._armed = false;
    } else if (this.omega > this._peak) {
      this._armed = true;
      this._lastSwingTs = now;
      this._emit('swing', { omega: this.omega });
    }
  }

  calibrate() {
    this.calibrated = true;
  }

  recalibrate() {
    this.calibrated = false;
  }

  vibrate(strength = 1) {
    if (navigator.vibrate) {
      navigator.vibrate(Math.round(10 + Math.min(strength, 1) * 60));
    }
  }

  stop() {
    if (this._orientHandler) window.removeEventListener('deviceorientation', this._orientHandler);
    if (this._motionHandler) window.removeEventListener('devicemotion', this._motionHandler);
    this._orientHandler = null;
    this._motionHandler = null;
    this._stopSimulator();
    this.enabled = false;
  }

  _emit(type, data) {
    for (const fn of this._listeners[type]) {
      try { fn(data); } catch (e) { console.error(e); }
    }
  }

  _startSimulator() {
    const DEG = Math.PI / 180;
    let t = 0;
    let lastSwing = 0;
    let boost = 0;
    this._simTimer = setInterval(() => {
      t += 0.016;
      const now = performance.now();
      let gamma = Math.sin(t * 1.2) * 55;
      let beta = Math.sin(t * 0.7) * 45 + 90;
      let omega = 1.0 + Math.abs(Math.cos(t * 1.2)) * 1.0;
      if (now - lastSwing > 1500) {
        boost = 1;
        lastSwing = now;
      }
      gamma += boost * 60;
      boost = Math.max(0, boost - 0.1);
      if (boost > 0.5) omega = SENSOR.SWING_PEAK + 2.5;

      const b = beta * DEG;
      const gm = Math.cos(b) * Math.sin(gamma * DEG);
      const gy = -Math.sin(b);
      const gz = -Math.cos(b) * Math.cos(gamma * DEG);

      this.gamma = gamma;
      this.beta = beta;
      this.ax = gm * 9.8;
      this.ay = gy * 9.8;
      this.az = gz * 9.8;
      this.omega = omega;
      this._checkSwing();
      this._emit('frame', { gamma, beta, ax: this.ax, ay: this.ay, az: this.az, omega });
    }, 16);
  }

  _stopSimulator() {
    if (this._simTimer) clearInterval(this._simTimer);
    this._simTimer = null;
  }
}
