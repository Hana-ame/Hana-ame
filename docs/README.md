# BeatRift — 手机体感节奏击打游戏

双设备 WebRTC 体感节奏游戏。PC 负责显示与判定(three.js 渲染), 手机通过陀螺仪作为体感控制器, 同网络下低延迟互联。纯前端、无自建后端。

## 架构

```
┌─────────────┐   MQTT 发现(广播/列表)   ┌─────────────┐
│  PC (主机)   │◄────────────────────────►│  Mobile     │
│  - 生成房间码  │  PeerJS 信令(公共云)      │  - 发现房间   │
│  - three.js 渲染│  RTCPeerConnection      │  - 扫码/输码  │
│  - 判定/计分   │◄════ DataChannel ══════►│  - 陀螺仪输入  │
│  - WebAudio   │  控制(有序可靠)          │  - 挥舞检测    │
│               │  motion(单通道二进制)     │  - 震动反馈    │
└─────────────┘                           └─────────────┘
```

### 连接流程

1. **PC**: 进入页面 → 选「我是 PC 显示器」→ 生成 5 位房间码 + 二维码 + MQTT 广播心跳(`beatrift/rooms/{code}`, 2s 间隔)。
2. **Mobile**: 选「我是手机控制器」→ MQTT 订阅 `beatrift/rooms/+` 列出附近房间 → 点击连接, 或扫码 / 手输房间码直连。
3. 两者通过 **PeerJS**(公共信令云)建立 `RTCPeerConnection` + 单一 DataChannel:
   - 控制消息: JSON 对象(`{t:'ping',...}` 等)
   - 体感帧: 24 字节二进制(`Float32Array[6]`), 通过 `d instanceof Uint8Array` 区分
   - 通道以 `reliable:false` 创建 → `ordered:false`(无序低延迟)
 4. Mobile 校准(单点基准: 手机前端瞄准 PC 屏幕中心、静止 2s, iOS 需手势授权)→ 发送 `READY`。
5. PC「开始游戏」→ 发送 `START` → 双方进入游戏。

> 若 MQTT 不可用: 列表为空, 仍可手输房间码(PeerJS 直连不依赖 MQTT)。

### 体感输入

- **方向解算**: `devicemotion` 的加速度计(含重力)+陀螺仪 → **Mahony 互补滤波**(`lib/attitude.js`) → 姿态四元数 → **拍面方向(屏幕法线)** `forward`(世界系 z 向上, 不依赖罗盘 alpha)。四元数融合避开 deviceorientation 在竖立/平放位的万向锁读数不稳。
- **单点基准校准**: 手机前端瞄准 PC 屏幕中心、静止保持约 2 秒, 采样平均姿态四元数记为基准 `ref`。
- **连续映射**: 游玩时实时 forward 相对 `ref` 的偏移 `screenRel` → 屏幕平面连续坐标 `(u,v)` → 放大 `GAIN=2.5` 填满摆动范围 → 光剑方向。
- **光剑可见性**: 方向强制保持在屏幕平面内(`dir.z=0`), 中性位竖直向上; u 控左右倾斜(±50°)、v 控上下摆动, 剑刃始终平行屏幕、相机必见全长。
- 挥舞检测: 读数差分角速度峰值 + 迟滞 + 冷却(~60Hz 采样); 角速度跳变 >90° 丢弃防欧拉翻转。
- 击中事件以 `hit>0` 标志随 motion 帧发送, 携带峰值角速度。
- 震动: 本地 `navigator.vibrate`(强度 ∝ 挥动角速度)。
- 桌面调试: `#/mobile?sim=1` 启用内置模拟器(自动完成校准并挥舞)。

### 游戏玩法(PC)

- **程序化音乐**: WebAudio 合成(kick/snare/hat/bass/arp), 4 小节 64 步循环, 128 BPM。lookahead 调度器产出精确 beat/step 时钟。
- **音符**: 由**手写 JSON 谱面**(`public/charts/default.json`, 数组 `{beat,x,y}`)加载, 从 `z=-46` 以 13 单位/s 飞向玩家, 落在判定平面(z=0)上连续坐标。
- **光剑**: 位置固定于玩家前方(`SWORD.PIVOT (0,0.7,1.6)`, 长 2.6), 朝向 = 手机映射方向(屏幕平面内); 拖尾记录剑尖轨迹。
- **判定**: 挥击瞬间取最新朝向, 用「剑尖投影到判定平面 与 音符的平面距离 ≤ hitRadius」+ 节拍窗口(`|step-target|≤hitSteps`)选最近音符。PERFECT/GOOD/擦边分级。
- **难度**: easy/normal/hard 对应 判定半径 2.2/1.7/1.3、节拍窗口 6/4.5/3 步、挥击灵敏度。
- **物理**: cannon-es 世界, 命中后按挥击方向弹射碎片, 重力 + 地板/天花板/前后墙反弹。
- **反馈**: 粒子爆发、屏震、判定弹字、光剑增亮; 漏击扣命、断连击、结束面板统计。
- **计分**: `base × (1 + combo×0.02|0.01)`, PERFECT=100 / GOOD=60; 命中率按 PERFECT=1、GOOD=0.6、MISS=0 计。

## 目录

```
src/
  constants.js       全局常量(房间码/难度/光剑/节拍/音符)
  main.js            hash 路由 + 身份选择
  ui/                screens(路由) / pc.js / mobile.js
  net/               discovery(MQTT) / connection(PeerJS) / protocol(帧格式) / joinUrl
  motion/            calibrate(单点校准+连续映射) / forward(屏幕法线) / sensor(Mahony 姿态+挥舞+模拟器)
  game/              index(编排) / scene(three) / gameplay(判定) / music / fx / physics
public/
  charts/default.json  手写谱面({beat,x,y} 数组)
docs/
  README.md          本文件
  PROTOCOL.md        通信协议
  PLAYTEST.md        联调指南
  IMU-CALIBRATION-CHECK.md  真机姿态自检(/test/ 测试台)
e2e/e2e.mjs          端到端自动化测试(headless Chromium)
ahrs/                独立姿态测试台(npm ahrs 包对照版, 含 README)
```

## 开发

```bash
npm install
npm run dev        # http://localhost:5173/
npm run build      # 产物在 dist/ (多入口: main/test/ahrs)
```

浏览器实测需要 HTTPS + 移动端(陀螺仪)。本地可用:

- **PC 端**: 开两个窗口, 一个 `#/pc`, 一个 `#/mobile?sim=1`(桌面模拟器)自测全链路。
- **真机**: 手机与 PC 同网络, 手机访问同一 URL 选 Mobile。iOS 首次需点「开始校准」触发权限。

## 端到端测试

```bash
npm run test:e2e   # 需要: 已运行的 dev server + 本地 playwright chromium
```

流程: PC 建房间 → Mobile 手输码连接 → 校准(模拟器) → 开始游戏 → 断言 MQTT/连接/运动流/命中计分/延迟。

## 部署

### 方式 A: 5173 dev server(当前)

手机同网络直接访问映射域名:

```bash
npm run dev
# 监听 *:5173 (0.0.0.0), 已放行 Host: wsl-5173.moonchan.xyz
# 手机/浏览器访问: https://wsl-5173.moonchan.xyz/
```

HTTPS 由映射域名终结, 满足移动端陀螺仪的安全上下文要求。

### 方式 B: GitHub Pages

- vite 已移除 `base` 前缀, 以**根路径**部署(多入口 main/test/ahrs 由 Vite 多页构建处理)。
- GitHub Actions(`.github/workflows/deploy.yml`)构建后通过 `actions/deploy-pages` 发布。
- Pages 设置: Settings → Pages → Source = **GitHub Actions**。

## 技术栈

Vite · 原生 JS(ESM) · three.js · cannon-es · PeerJS · mqtt.js · qrcode · ahrs(测试台) · GitHub Actions
