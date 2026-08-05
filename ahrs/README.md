# ahrs 版姿态测试台 — 迁移与使用经验

从 `/test/`（自研 Mahony）复刻到 `/ahrs/`（npm 包 `ahrs@1.3.3`），
UI/功能保持同构，仅把核心融合算法换成 ahrs 包实现。
本文记录迁移经验、ahrs 包的坑与结论，供后续维护参考。

## 目标与结构

- 功能：PC 端四路姿态解算（device 系统解 / fuse 融合 / gyro 纯陀螺 / accel 仅重力）+ 3D 长方体 + 曲线，与 `/test/` 同构。
- 差异点：`ahrs/attitude.js` 的 `Mahony` 类内部用 ahrs 包；`ahrs/pc.js` 用固定增益；其余文件为 `/test/` 逐字拷贝。
- 入口：`/ahrs/`（vite.config.js 已加 rollup input）。

## 迁移步骤（参考）

1. `cp test/* ahrs/`，得到同构骨架。
2. `npm install ahrs@1.3.3`。
3. `ahrs/index.html` 标题/脚本指向 `/ahrs/main.js`。
4. 重写 `ahrs/attitude.js` 的 `Mahony` 类为 ahrs 包包装，其余数学保留。
5. `ahrs/pc.js` 去掉自适应增益（见下）。
6. vite.config.js 加 `ahrs` 入口；新增 `e2e/ahrs.mjs` 冒烟测试。
7. `node ahrs/verify-attitude.mjs` + `node e2e/ahrs.mjs` + `npm run build` 验证。

## ahrs 包踩坑记录（按踩坑顺序）

### 1. 单位约定

- 陀螺：rad/s。
- **accel：g 单位**（9.8 m/s² = 1g）。我们的传感器给 m/s²，必须 `accel / 9.8` 再传入。
- 文档未明说，全靠实测；坐标系（body->world）与符号经 node 验证与自研一致。

### 2. doInitialisation=true 无磁力计时 NaN

`init()` 内部 `eulerAnglesFromImuRad(ax,ay,az, mx,my,mz)`，无磁力计传入时
`mx` 为 undefined，heading 变 NaN。因此：

- 必须 `doInitialisation: false`（从 identity 起步，靠 accel 收敛）。
- 或见第 4 点：用伪造磁力计走 `init()`。

### 3. 无姿态 setter — 致命伤

- ahrs 不暴露姿态 setter，只能 `init(accel, magneto)`。
- 从 identity 起步 + 无磁力计：**yaw 物理上不可观测**。
  静止 10s 漂 31°、运动轨迹追 92° 误差——这是算法本质，不是 bug。
- 结论：无法像自研版 `setOrientation(q)` 那样直接用真值设基准。

### 4. 突破：伪造磁力计精确设初始姿态

用 `init(accel, magneto)` 绕开无 setter 的限制，可**0.000° 精确重建**任意目标姿态 q：

```js
const accel = upInDevice(q);                          // 静止时重力方向(设备系)
const mag = qRotate(qInvert(q), { x: 1, y: 0, z: 0 }); // 世界 +X 转到设备系
ahrs.init(accel.x, accel.y, accel.z, mag.x, mag.y, mag.z);
```

- `upInDevice(q)`、`qRotate` 来自 `lib/attitude.js`。
- 用于包装类的 `setOrientation(q)`、首帧初始化、kp/ki 重建后恢复基准（`_reinitCurrent`）。
- 注意：伪造磁力计只用于初始化，融合阶段仍走 IMU-only 分支（update 不传磁），不会引入磁力修正。

### 5. kp/ki 是构造常量，运行期不可调

- `twoKp`/`twoKi` 是闭包常量，改增益只能重建实例，会丢积分器与姿态。
- 自研版每帧 `adaptiveGains`（静止 Kp0.8/Ki0.2、运动 Kp0.15）对 ahrs 不可行：
  每帧改 → 每帧重建 → 姿态反复重置 → 误差到 90°+。
- **解法：ahrs 版用固定增益 Kp0.5/Ki0.05**。实测固定增益下 ahrs 全程跟踪误差仅 0.69°，
  零偏抑制 err=0.001°，完全够用。

## ahrs 好用吗？结论

**作为"开箱即用的融合引擎"好用；作为"可复刻/可对照的测试台算法"不好用。**

好用的地方：

- 标准 Madgwick/Mahony 实现，固定参数下精度可靠（全程跟踪 0.69°）。
- 零偏抑制强（积分项 Ki，静止 20s 倾角误差 0.001°）。
- API 简单，一行 `update(gx,gy,gz, ax,ay,az, [mx,my,mz], dt)`。

不好用的地方（恰好是测试台最需要的）：

- 坐标系/单位/Euler 顺序文档含糊，全靠实测验证。
- 无姿态 setter、无运行期调参。
- 初始化路径残缺（无磁力计即 NaN）。

一句话：**想快速出一个能用的姿态融合，ahrs 合适；想拿它当测试台研究/演示算法行为，自研版更顺手。**
本次复刻的价值正是用同一 UI 同时暴露自研版与成熟包的真实差异。

## 验证命令

```sh
node ahrs/verify-attitude.mjs   # 数学/融合单测, 应全绿
node e2e/ahrs.mjs               # ahrs 版浏览器冒烟 (PC+手机 sim 联机)
node e2e/e2e.mjs                # /test/ 回归, 应 13/13
npm run build                   # 含 ahrs 入口
```

## 注意

- `/test/` 冻结，不得改动。
- 工作区另有早于本复刻的未提交改动（src/constants.js、src/motion/calibrate.js、
  src/ui/mobile.js 等），与本目录无关，勿动。
