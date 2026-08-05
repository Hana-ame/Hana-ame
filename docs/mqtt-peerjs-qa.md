# MQTT 与 PeerJS 问答整理

> 基于隔壁项目 `~/my-node-app`(beatrift, three.js + cannon + mqtt + peerjs)的分析,
> 以及 PeerJS / MQTT 的通用原理。约 2026-08。

## 1. MQTT 在 PeerJS 里扮演什么角色?

**两套完全独立的东西。** 在 beatrift 里:

| 层 | 用的什么 | 角色 |
|----|----------|------|
| 信令 + P2P 传输 | PeerJS `net/connection.js` | 真正的连接: 走 PeerJS 云端 broker, 然后 WebRTC DataChannel 传惯性/操控数据 |
| 房间发现 | MQTT `net/discovery.js` | **只广播**"哪个房间活着、peerId 是多少", 方便手机自动列出房间 |

MQTT **不参与信令, 也不传任何游戏数据**。

### 具体怎么做

1. **Host(PC)开房**: `pcAnnounce(roomCode, peerId)` 每 2s 向公共 HiveMQ broker 发一条心跳到
   topic `beatrift/rooms/<房间码>`, 内容 `{roomCode, peerId, ts}`(`discovery.js`).
2. **手机端**: 订阅 `beatrift/rooms/+`, 收到就加进房间列表; 超 6s 没心跳则剔除(`mobile.js`).
3. **手机选房间** → 用 peerId 调 `peer.connect("beatrift-<code>", {reliable:false})` 走 PeerJS 直连.
4. MQTT 挂了仍可玩: 页面显示"发现服务不可用 · 请直接输入房间码".

> 为什么用 MQTT 做发现? 因为 PeerJS 云端 broker 没有"列出在线房间"功能
> (`listAllPeers` 需申请)。自建 PeerServer 则有 `GET /peerjs/peers`, 可替代。

## 2. MQTT 稳定吗? 如果只是握手用一下

- **MQTT 协议本身很稳**(有 QoS 0/1/2、retain, 工业级标准)。风险不在协议, 在**你连的 broker**.
- 当前用的公共 HiveMQ(`broker.hivemq.com`)是最大不确定因素: 免费、无 SLA, 可能限流/断连/重启.
- **"只握手用"反而更稳**: WebRTC DataChannel 一旦建立就是 P2P 直连(或经 TURN),
  **完全不依赖 MQTT**。暴露窗口从"整局"缩到"几秒".
- 注意: "只握手"成立的前提是**别拿 MQTT 去转发 SDP/ICE**(信令交给 PeerJS 或自建 PeerServer);
  MQTT 只负责告诉你"对端 id 是多少".
- 想更稳: 自建 broker(EMQX/Mosquitto)或用 retain 消息, 别用公共免费 broker.

## 3. SLA 是什么?

**Service Level Agreement, 服务等级协议。** 服务商书面承诺的可用性指标
(如 99.9% 可用、故障响应时间), 不达标需担责。

公共免费 broker(如 HiveMQ、PeerJS 云端)**没有 SLA**——挂了、限流、重启都不担责, 因此叫"不稳定".

## 4. 手动输房间码和 MQTT 无关?

**对, 完全无关。** 房间码本质是 PeerJS 的 peer id, 不经过 MQTT:

- 开房: `new Peer("beatrift-<房间码>")` 注册到 PeerJS broker(`connection.js`)
- 加入: `peer.connect("beatrift-<房间码>")` 直连(`mobile.js`)

MQTT 只是"帮你自动发现这个码"。MQTT 挂了, 手输码照样连——链路只剩 PeerJS 信令 + WebRTC P2P.

## 5. 为什么光凭这个码就能连上?

因为"码"是 **PeerJS broker 上注册的一个 ID**, 连接靠 broker 路由(集中式查表, **不是全网搜索**):

1. PC 开房: 给 broker(0.peerjs.com)开一条 WebSocket 并登记 `beatrift-XXX → 这条socket`.
2. 手机加入: 连上同一 broker, 发 OFFER "我要连 beatrift-XXX".
3. broker **查表**找到 PC 的 socket, 转发 OFFER(SDP); PC 回 ANSWER, 双方经 broker 交换 ICE 候选 —— 握手.
4. 握手成功: 两端直接 WebRTC **P2P 打洞直连**, 数据走 DataChannel, broker 不再参与.

要连上必须: **id 此刻正好注册着 + 两端能连到同一 broker。**

这类比打电话: 号码不是全网广播找你, 而是"运营商(broker)查号码簿直接接通". PeerJS 是集中式注册表,
不是广播/mDNS 那种局域网全网发现; MQTT 的 `subscribe topic/+` 才是发布/订阅广播.

## 6. peerjs.com 公共 broker 可靠吗?

- **演示/原型够用, 生产别指望。** 官方维护、跑了好几年、日常稳定.
- 但它是免费公共服务, 与公共 HiveMQ 同性质: **无 SLA**, 可能挂/限流/抖动; 不支持发现; 且信令会过他们服务器.
- **PeerJS 官方建议生产自建 PeerServer。** 自建后只剩 STUN/TURN 依赖外部(标准协议服务, 比公共免费 broker 靠谱).
- 切自建只需把 `new Peer(id)` 改成 `new Peer(id, {host: 自己的server, port, secure})`, 其余代码不变.