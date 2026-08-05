// 光剑校准: 单点基准 + 连续映射
// 玩家手持手机, 像握光剑一样用手机前端对准 PC 屏幕中心, 保持约 2 秒。
// 记录手机前方(屏幕法线)方向为基准 ref, 之后:
//   实时 forward 相对 ref 的偏移 screenRel -> 屏幕平面连续坐标 (u,v),
//   放大 GAIN 倍填满摆动范围 (替代旧 3x3 表的自适应增益),
//   光剑方向保持在屏幕平面内 (dir.z=0): 中性位竖直向上,
//     u 控制左右倾斜, v 控制上下摆动。
// 剑尖始终平行屏幕(相机可见剑刃全长), 判定用 tip.x/tip.y, 与 z 无关。
// 全程连续, 无网格量化; 提示: 光剑前方 = 手机前端。
//
// 方向符号: screenRel 的 onScreen.x 定义为 right 轴分量, right=cross(n,up)。
// 手机向右摆(gamma>0)时 forward 相对 ref 的投影落在 -right 方向,
// 故 onScreen.x>0 实际对应屏幕左。这里在 dir() 中对 u 取反,
// 使"手机前端指向屏幕右" -> dir.x>0 -> 剑尖向右。
// v 方向: 手机前端上抬(beta 减小) -> onScreen.y>0 -> 剑尖向上, 符号一致无需取反。

const MAX_U = 50 * Math.PI / 180;  // u=±1 -> 左右倾斜 ±50°
const MAX_V = 70 * Math.PI / 180;  // v=-1(前倾)→直下, v=1(后仰)→竖直
const GAIN = 2.5;                  // screenRel 原始投影较小(≈sinθ), 放大到填满摆动范围

export class Calib {
  constructor() {
    this.ref = null;        // 基准四元数
    this.refForward = null; // 基准 forward (屏幕法线, 指向屏幕中心)
  }

  reset() {
    this.ref = null;
    this.refForward = null;
  }

  setRef(q, forward) {
    this.ref = q;
    this.refForward = forward;
  }

  get complete() {
    return !!this.refForward;
  }

  // 屏幕平面连续坐标 (u,v) -> 光剑方向 (保持在屏幕平面内, 中性位竖直向上)
  dir(u, v) {
    const cu = Math.max(-1, Math.min(1, -u * GAIN));
    const cv = Math.max(-1, Math.min(1, v * GAIN));
    const bx = Math.sin(cu * MAX_U);
    const by = Math.cos((1 - cv) * MAX_V);
    const len = Math.sqrt(bx * bx + by * by) || 1;
    return { x: bx / len, y: by / len, z: 0 };
  }
}
