import { SENSOR } from '../constants.js';
import { Mahony, quatFromAccel, quatFromDeviceEuler, qNormalize, qRotate, DEG } from '../../lib/attitude.js';

const JUMP_GUARD = 90;

export class Sensor {
  constructor({ forceSim = false } = {}) {
    this.enabled = false;
    this.q = null;               // 当前姿态四元数 (设备系->世界系)
    this.forward = null;         // 屏幕法线方向 (世界系)
    this.top = null;             // 手机长轴方向 (世界系)
    this.omega = 0;              // 角速度 (rad/s)
    this.calibrated = false;
    this.forceSim = forceSim;

    this._mahony = new Mahony({ kp: 0.5, ki: 0.05 });
    this._prevTs = 0;
    this._prevAccel = null;
    this._peak = SENSOR.SWING_PEAK;
    this._min = SENSOR.SWING_MIN;
    this._lastSwingTs = 0;
    this._armed = false;
    this._motionHandler = null;
    this._listeners = { frame: [], swing: [] };
    this._simTimer = null;
  }

  static get supported() {
    return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
  }

  async requestPermission() {
    const withTimeout = (p) => Promise.race([p, new Promise((r) => setTimeout(() => r('denied'), 1500))]);
    if (window.DeviceMotionEvent && typeof window.DeviceMotionEvent.requestPermission === 'function') {
      try {
        return (await withTimeout(window.DeviceMotionEvent.requestPermission())) === 'granted';
      } catch {
        return false;
      }
    }
    return true;
  }

  start(onFrame, onSwing) {
    this._listeners.frame.push(onFrame);
    if (onSwing) this._listeners.swing.push(onSwing);
    if (this._motionHandler) return;

    if (this.forceSim || !window.DeviceMotionEvent || !window.DeviceOrientationEvent) {
      console.warn('[sensor] 使用模拟器 (无陀螺仪/加速度计或 forceSim)');
      this._startSimulator();
      return;
    }
    this._motionHandler = (e) => this._onMotion(e);
    window.addEventListener('devicemotion', this._motionHandler);
    this.enabled = true;
  }

  _onMotion(e) {
    const accel = e.accelerationIncludingGravity;
    const gyro = e.rotationRate;
    if (!accel || !gyro) return;
    const now = performance.now();
    const dt = this._prevTs ? (now - this._prevTs) / 1000 : 0.016;

    // 陀螺仪 rotationRate 单位 deg/s -> rad/s
    const g = {
      x: (gyro.alpha ?? 0) * DEG,
      y: (gyro.beta ?? 0) * DEG,
      z: (gyro.gamma ?? 0) * DEG,
    };

    // 角速度跳变 >90°/s 视为噪声/翻转, 抑制; 否则用于挥舞检测
    const dg = Math.hypot(g.x, g.y, g.z);
    this.omega = (dt > 0 && dt < 0.1 && dg <= JUMP_GUARD * DEG) ? dg : 0;

    if (!this.q) {
      // 首帧: 用重力初始化姿态 (静止时加速度计指向"上")
      this._mahony.setOrientation(quatFromAccel(accel, 0));
    } else {
      this._mahony.update(dt, g, accel);
    }
    this.q = qNormalize(this._mahony.q);
    this.forward = qRotate(this.q, { x: 0, y: 0, z: 1 });
    this.top = qRotate(this.q, { x: 0, y: 1, z: 0 });

    this._prevTs = now;
    this._prevAccel = accel;
    this._checkSwing();
    this._emit('frame', {
      q: this.q,
      forward: this.forward,
      top: this.top,
      omega: this.omega,
    });
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
    if (this._motionHandler) window.removeEventListener('devicemotion', this._motionHandler);
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
    let t = 0;
    let lastSwing = 0;
    let boost = 0;
    // 校准期间(calibrated=false)保持中性姿态(beta=90,gamma=0), 模拟玩家稳定持握对准屏幕中心。
    // 由 sensor.calibrate() 在采样完成后置 true 恢复挥舞, 故这里不自行计时翻转。
    this._simTimer = setInterval(() => {
      t += 0.016;
      const now = performance.now();
      let gamma, beta, omega;
      if (!this.calibrated) {
        gamma = 0;
        beta = 90;
        omega = 0.3;
      } else {
        gamma = Math.sin(t * 1.2) * 55;
        beta = Math.sin(t * 0.7) * 45 + 90;
        omega = 1.0 + Math.abs(Math.cos(t * 1.2)) * 1.0;
        if (now - lastSwing > 1500) {
          boost = 1;
          lastSwing = now;
        }
        gamma += boost * 60;
        boost = Math.max(0, boost - 0.1);
        if (boost > 0.5) omega = SENSOR.SWING_PEAK + 2.5;
      }

      this.q = qNormalize(quatFromDeviceEuler(0, beta, gamma));
      this.forward = qRotate(this.q, { x: 0, y: 0, z: 1 });
      this.top = qRotate(this.q, { x: 0, y: 1, z: 0 });
      this.omega = omega;
      this._checkSwing();
      this._emit('frame', { q: this.q, forward: this.forward, top: this.top, omega });
    }, 16);
  }

  _stopSimulator() {
    if (this._simTimer) clearInterval(this._simTimer);
    this._simTimer = null;
  }
}
