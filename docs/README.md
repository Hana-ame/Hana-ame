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
4. Mobile 校准(静止 3s 捕获参考四元数, iOS 需手势授权)→ 发送 `READY`。
5. PC「开始游戏」→ 发送 `START` → 双方进入游戏。

> 若 MQTT 不可用: 列表为空, 仍可手输房间码(PeerJS 直连不依赖 MQTT)。

### 体感输入

- `DeviceOrientation` → 四元数(自研 `motion/quat.js`, 无 three 依赖), 相对校准参考做相对朝向。
- 挥舞检测: 四元数差分角速度, 峰值 + 迟滞 + 冷却(~60Hz 采样)。
- 击中事件以 `hit>0` 标志随 motion 帧发送, 携带峰值角速度。
- 震动: 本地 `navigator.vibrate`(强度 ∝ 挥动角速度)。
- 桌面调试: `#/mobile?sim=1` 启用内置模拟器(挥舞横扫音符场)。

### 游戏玩法(PC)

- **程序化音乐**: WebAudio 合成(kick/snare/hat/bass/arp), 4 小节 64 步循环, 128 BPM。lookahead 调度器产出精确 beat/step 时钟。
- **音符**: 按图表(64 步循环)生成, 从 `z=-46` 以 13 单位/s 飞向玩家, 落在 3×3 网格(`GAME.GRID`)。
- **光剑**: 位置固定于玩家前方, 朝向 = 手机四元数; 拖尾记录剑尖轨迹。
- **判定**: 挥击瞬间取最新朝向, 用「音符到剑段距离 ≤ 1.2」+ 节拍窗口(`|step-target|≤4.5`)选最近音符。PERFECT/GOOD/擦边分级。
- **物理**: cannon-es 世界, 命中后按挥击方向弹射碎片, 重力 + 地板/天花板/前后墙反弹。
- **反馈**: 粒子爆发、屏震、判定弹字、光剑增亮; 漏击扣命、断连击、结束面板统计。
- **计分**: `base × (1 + combo×0.02|0.01)`, PERFECT=100 / GOOD=60; 命中率按 PERFECT=1、GOOD=0.6、MISS=0 计。

## 目录

```
src/
  constants.js       全局常量(房间码/网格/节拍/灵敏度)
  main.js            hash 路由 + 身份选择
  ui/                screens(路由) / pc.js / mobile.js
  net/               discovery(MQTT) / connection(PeerJS) / protocol(帧格式) / joinUrl
  motion/            quat(四元数数学) / sensor(陀螺仪+挥舞+校准+模拟器)
  game/              index(编排) / scene(three) / gameplay(判定) / music / fx / physics
docs/
  README.md          本文件
  PROTOCOL.md        通信协议
  PLAYTEST.md        联调指南
e2e/e2e.mjs          端到端自动化测试(headless Chromium)
```

## 开发

```bash
npm install
npm run dev        # http://localhost:5173/webrtc/
npm run build      # 产物在 dist/ (base=/webrtc/)
```

浏览器实测需要 HTTPS + 移动端(陀螺仪)。本地可用:

- **PC 端**: 开两个窗口, 一个 `#/pc`, 一个 `#/mobile?sim=1`(桌面模拟器)自测全链路。
- **真机**: 手机与 PC 同网络, 手机访问同一 URL 选 Mobile。iOS 首次需点「开始校准」触发权限。

## 端到端测试

```bash
npm run test:e2e   # 需要: 已运行的 dev server + 本地 playwright chromium
```

流程: PC 建房间 → Mobile 手输码连接 → 校准(模拟器) → 开始游戏 → 断言 MQTT/连接/运动流/命中计分/延迟。

## 部署 (GitHub Pages)

- `vite.config.js` 的 `base=/webrtc/` 已按目标子路径配置。
- GitHub Actions(`.github/workflows/deploy.yml`)构建后通过 `actions/deploy-pages` 发布。
- **子路径要求**: 要部署到 `https://hana-ame.github.io/webrtc/`, 仓库名必须是 `Hana-ame/webrtc`(项目 Pages 的路径 = 仓库名)。若在当前仓库(`Hana-ame/Hana-ame`, 即 org 根站)部署, 则会出现在根路径下, 需相应调整 `base`。
- Pages 设置: Settings → Pages → Source = **GitHub Actions**。

## 技术栈

Vite · 原生 JS(ESM) · three.js · cannon-es · PeerJS · mqtt.js · qrcode · GitHub Actions
