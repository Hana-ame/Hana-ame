const DEG = Math.PI / 180;

// 世界系: z 向上, 重力 down = (0,0,-1); 设备系 x=右, y=顶, z=屏幕法线(拍面)
// 约定与 W3C DeviceOrientation 一致: R = Rx(beta)·Ry(gamma), alpha=0 (不依赖罗盘)
// 重力在设备系: ĝ = (cosβ·sinγ, -sinβ, -cosβ·cosγ)

function normalize(v) {
  const l = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

export function computeForward(gammaDeg, ax, ay, az) {
  const g = normalize({ x: ax, y: ay, z: az });

  const gam = gammaDeg * DEG;
  const cg = Math.cos(gam);
  const sg = Math.sin(gam);

  let cosB;
  if (Math.abs(cg) > 0.3) cosB = -g.z / cg;
  else if (Math.abs(sg) > 0.3) cosB = g.x / sg;
  else cosB = 0;
  cosB = Math.max(-1, Math.min(1, cosB));
  const sinB = -g.y;
  const beta = Math.atan2(sinB, cosB);

  // 屏幕法线(拍面方向)在世界系: 随 gamma 左右摆动, 随 beta 上下
  const forward = normalize({
    x: sg,
    y: -sinB * cg,
    z: cosB * cg,
  });

  // 手机顶边(长轴)方向在世界系: 只随 beta(重力倾斜)变化, 与 gamma 无关
  const top = { x: 0, y: cosB, z: sinB };

  return {
    forward,
    top,
    beta,
    gamma: gam,
    elevation: Math.asin(Math.max(-1, Math.min(1, forward.z))),
    azimuth: Math.atan2(forward.x, forward.y),
  };
}

// 相对游戏屏平面分解
// refDir: 校准时「正前」对应的 forward(指向屏幕中心), 定义屏幕平面的法线
export function screenRel(dir, refDir) {
  const n = normalize(refDir);
  const up = { x: 0, y: 0, z: 1 };
  const right = normalize(cross(n, up));
  const vert = cross(right, n);

  const dp = dot(dir, n);
  const angleToPlane = Math.asin(Math.max(-1, Math.min(1, dp)));

  const inPlane = { x: dir.x - dp * n.x, y: dir.y - dp * n.y, z: dir.z - dp * n.z };
  return {
    angleToPlane,
    onScreen: { x: dot(inPlane, right), y: dot(inPlane, vert) },
  };
}

function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
function cross(a, b) { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
