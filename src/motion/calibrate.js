// 光剑校准: 单点基准 + 连续映射
// 玩家目视 PC 屏幕, 手机竖直举在身前, 屏幕正对眼睛, 保持约 2 秒。
// 记录手机前方(屏幕法线)方向为基准 ref, 之后:
//   实时 forward 相对 ref 的偏移 screenRel -> 屏幕平面连续坐标 (u,v),
//   放大 GAIN 倍填满判定平面 (替代旧 3x3 表的自适应增益),
//   光剑方向 = 从剑柄指向判定平面上 (u*dx, y0+v*dy, 0) 的目标点。
// 全程连续, 无网格量化; 提示: 光剑前方 = 手机最长轴。
import { SWORD } from '../constants.js';

const PLANE = {
  halfW: 2.2,   // u=±1 -> x=±2.2 (判定平面半宽)
  midY: 1.6,    // v=0   -> y=1.6 (判定平面中心高度)
  halfH: 1.2,   // v=±1 -> y=±1.2
  gain: 3.0,    // screenRel 原始投影较小(≈sinθ), 放大到 ±1 填满判定平面
};

export class Calib {
  constructor() {
    this.ref = null;
  }

  reset() {
    this.ref = null;
  }

  setRef(forward) {
    this.ref = forward;
  }

  get complete() {
    return !!this.ref;
  }

  // 屏幕平面连续坐标 (u,v) -> 光剑方向 (从剑柄指向判定平面目标点)
  dir(u, v) {
    const cu = Math.max(-1, Math.min(1, u * PLANE.gain));
    const cv = Math.max(-1, Math.min(1, v * PLANE.gain));
    const x = cu * PLANE.halfW;
    const y = PLANE.midY + cv * PLANE.halfH;
    const dx = x - SWORD.PIVOT.x;
    const dy = y - SWORD.PIVOT.y;
    const dz = -SWORD.PIVOT.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    return { x: dx / len, y: dy / len, z: dz / len };
  }
}
