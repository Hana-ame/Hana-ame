import { DEG, quatFromDeviceEuler, qRotate, normalize3 } from '../../lib/attitude.js';

// 世界系: z 向上, 重力 down = (0,0,-1); 设备系 x=右, y=顶, z=屏幕法线(拍面)
// 姿态由 W3C quaternion (设备系->地球系) 描述, 屏幕法线 = qRotate(q, {0,0,1})。
// 与 test/attitude.js (lib/attitude.js) 的 quatFromDeviceEuler 保持一致。

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

// 手机屏幕法线(拍面方向)在世界系的方向: 由 beta(与地平面夹角) 与 gamma(与屏幕夹角)
// 经 W3C 四元数解算, 等价于旧公式 (sinγ, -sinβ·cosγ, cosβ·cosγ), 但四元数形式统一。
export function computeForward(betaDeg, gammaDeg) {
  const q = quatFromDeviceEuler(0, betaDeg, gammaDeg);
  const forward = normalize3(qRotate(q, { x: 0, y: 0, z: 1 }));

  // 手机顶边(长轴)方向在世界系: 只随 beta(重力倾斜)变化, 与 gamma 无关
  const top = qRotate(q, { x: 0, y: 1, z: 0 });

  return {
    forward,
    top,
    beta: betaDeg * DEG,
    gamma: gammaDeg * DEG,
    elevation: Math.asin(Math.max(-1, Math.min(1, forward.z))),
    azimuth: Math.atan2(forward.x, forward.y),
  };
}

// 相对游戏屏平面分解
// refDir: 校准时「正前」对应的 forward(指向屏幕中心), 定义屏幕平面的法线
export function screenRel(dir, refDir) {
  const n = normalize3(refDir);
  const up = { x: 0, y: 0, z: 1 };
  const right = normalize3(cross(n, up));
  const vert = cross(right, n);

  const dp = dot(dir, n);
  const angleToPlane = Math.asin(Math.max(-1, Math.min(1, dp)));

  const inPlane = { x: dir.x - dp * n.x, y: dir.y - dp * n.y, z: dir.z - dp * n.z };
  return {
    angleToPlane,
    onScreen: { x: dot(inPlane, right), y: dot(inPlane, vert) },
  };
}
