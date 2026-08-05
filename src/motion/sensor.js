import { SENSOR } from '../constants.js';

const JUMP_GUARD = 90;

export class Sensor {
  constructor({ forceSim = false } = {}) {
    this.enabled = false;
    this.gamma = 0;
    this.beta = 0;
    this.omega = 0;
    this.calibrated = false;
    this.forceSim = forceSim;

    this._prev = null;
    this._prevTs = 0;
    this._peak = SENSOR.SWING_PEAK;
    this._min = SENSOR.SWING_MIN;
    this._lastSwingTs = 0;
    this._armed = false;
    this._handler = null;
    this._listeners = { frame: [], swing: [] };
    this._simTimer = null;
  }

  static get supported() {
    return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
  }

  async requestPermission() {
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      const p = DOE.requestPermission();
      try { return (await Promise.race([p, new Promise((r) => setTimeout(() => r('denied'), 1500))])) === 'granted'; }
      catch { return false; }
    }
    return true;
  }

  start(onFrame, onSwing) {
    this._listeners.frame.push(onFrame);
    if (onSwing) this._listeners.swing.push(onSwing);
    if (this._handler) return;

    if (this.forceSim || !window.DeviceOrientationEvent) {
      console.warn('[sensor] 使用模拟器 (无 DeviceOrientationEvent 或 forceSim)');
      this._startSimulator();
      return;
    }
    this._handler = (e) => this._onOrientation(e);
    window.addEventListener('deviceorientation', this._handler);
    this.enabled = true;
  }

  _onOrientation(e) {
    if (e.gamma == null || e.beta == null) return;
    const now = performance.now();
    const dt = this._prevTs ? (now - this._prevTs) / 1000 : 0;

    if (this._prev) {
      const dg = e.gamma - this._prev.gamma;
      const db = e.beta - this._prev.beta;
      if (Math.abs(dg) <= JUMP_GUARD && Math.abs(db) <= JUMP_GUARD) {
        this.gamma = e.gamma;
        this.beta = e.beta;
        if (dt > 0 && dt < 0.1) {
          this.omega = Math.hypot(dg, db) * (Math.PI / 180) / dt;
        }
      } else {
        this.gamma = e.gamma;
        this.beta = e.beta;
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
    this._emit('frame', { gamma: this.gamma, beta: this.beta, omega: this.omega });
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
      let gamma = Math.sin(t * 1.2) * 55;
      let beta = Math.sin(t * 0.7) * 45;
      let omega = 1.0 + Math.abs(Math.cos(t * 1.2)) * 1.0;
      if (now - lastSwing > 1500) {
        boost = 1;
        lastSwing = now;
      }
      gamma += boost * 60;
      boost = Math.max(0, boost - 0.1);
      if (boost > 0.5) omega = SENSOR.SWING_PEAK + 2.5;

      this.gamma = gamma;
      this.beta = beta;
      this.omega = omega;
      this._checkSwing();
      this._emit('frame', { gamma, beta, omega });
    }, 16);
  }

  _stopSimulator() {
    if (this._simTimer) clearInterval(this._simTimer);
    this._simTimer = null;
  }
}
