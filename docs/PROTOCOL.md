# BeatRift 通信协议

WebRTC 单一 DataChannel(`reliable:false` → `ordered:false`)同时承载控制消息与体感帧。

## 帧类型区分

- `ArrayBuffer` / `Uint8Array` → **体感帧**(24 字节二进制)
- 其它 → **控制消息**(JSON 对象, 含 `t` 字段)

## 体感帧(motion)

`Float32Array[6]`, little-endian, 共 24 字节:

| 偏移 | 字段     | 说明                                   |
|------|----------|----------------------------------------|
| 0    | dirX     | 光剑方向单位向量 x (世界坐标)           |
| 4    | dirY     | 光剑方向单位向量 y                      |
| 8    | dirZ     | 光剑方向单位向量 z                      |
| 12   | omega    | 本帧角速度 (rad/s)                      |
| 16   | hit      | `0` = 无挥击; `>0` = 本次为挥击峰值, 值=峰值角速度 |
| 20   | 保留      | —                                      |

发送频率 ≈ 60Hz。`hit>0` 的帧与相邻帧顺序可能因无序通道而乱序, 接收方以 `hit>0` 为准触发挥击事件。

方向由手机端在**9 方向引导校准**(正前/正左/正右/正上/正下/四对角)后, 对实时 `DeviceOrientation.gamma/beta`(角度制)做校准点插值得到:
`(gamma, beta) → (u,v) ∈ [-1,1]² → 音符场坐标 (x,y) → 从剑枢指向该点的单位向量`。

## 控制消息

`{ t: <type>, ... }`, JSON。

| type      | 方向         | 负载                                        | 说明                        |
|-----------|--------------|---------------------------------------------|-----------------------------|
| `hello`   | mobile→pc    | `v`, `role`                                 | 连接握手                    |
| `ready`   | mobile→pc    | `diff` (`easy`/`normal`/`hard`)             | 校准完成 + 所选难度          |
| `start`   | pc→mobile    | `bpm`                                       | 游戏开始                    |
| `state`   | pc→mobile    | `score`, `combo`, `lives`                   | 实时状态(≤4 次/秒节流)      |
| `end`     | pc→mobile    | `score`, `maxCombo`, `perfect`, `good`, `misses`, `acc` | 游戏结束统计 |
| `ping`    | 双向         | `ts`                                        | 延迟测量                    |
| `pong`    | 双向         | `ts` (回显)                                 | 延迟测量                    |

## 发现层 (MQTT)

HiveMQ 公共 broker `wss://broker.hivemq.com:8884/mqtt`, 免注册。

| Topic                    | 发布者    | 负载                                            |
|--------------------------|-----------|-------------------------------------------------|
| `beatrift/rooms/{code}`  | PC(2s 心跳) | `{ roomCode, peerId, ts }`                    |
| `beatrift/rooms/+`       | Mobile 订阅 | 发现房间列表                                    |

`peerId` = `beatrift-{房间码}`, 因此扫二维码/手输码可绕过 MQTT 直连。

## 房间码

5 位字符集 `ABCDEFGHJKMNPQRSTUVWXYZ23456789`(去易混淆字符)。二维码内容 = 当前页面 URL + `#/mobile?room={code}`。
