# PeerJS: Go(PION WebRTC) PC 端 ↔ 网页端 互通

在 NAT 内运行一个 **Go 语言写的 PC 客户端**, 与浏览器里的 **PeerJS** 通过自建信令
服务器(PeerServer)交换 SDP/ICE, 拨号打洞后建立 **WebRTC DataChannel**, 双向收发
**JSON 文本消息** —— 全程无需公网 IP, 两端都藏在 NAT 后面也能连通。

## 架构

```
+---------------------+   WebSocket 信令    +------------------+
|  PeerServer (Go)    |<------------------->|  浏览器网页        |
|  server/main.go     |                     |  web/index.html   |
|   - ws /peerjs       |   OFFER/ANSWER/    |  peerjs@1.5.4     |
|   - REST /peerjs/id  |   CANDIDATE 转发    |  id: web-peer     |
|   - 托管静态网页     |                     +------------------+
+---------------------+
        | ^                                        ^
        | | WebSocket 信令                         | WebRTC DataChannel (P2P, JSON)
        v |                                        |
+---------------------+
|  Go PC 客户端        |
|  goclient/main.go   |  pion/webrtc v4
|  id: go-peer        |
+---------------------+
```

> WebRTC 打洞依赖 STUN(默认 `stun:stun.l.google.com:19302`)获取公网出口地址。
> 若两端都在**对称 NAT** 之后, STUN 打洞会失败, 需再配一个 **TURN 中继服务器**
> (见下方"真实 NAT 部署")。

## 目录

| 路径 | 说明 |
|------|------|
| `server/main.go` | 自建 PeerServer(信令 + REST + 静态页) |
| `goclient/main.go` | Go PC 客户端(PION WebRTC, PeerJS 协议) |
| `web/index.html` | 浏览器端页面(peerjs) |
| `web/peerjs.min.js` | 本地 peerjs 1.5.4(已内置, 无需外网) |
| `bin/peer-server` | 已编译的服务器二进制 |
| `bin/go-peer` | 已编译的 Go 客户端二进制 |

## 快速开始

```bash
# 1. 启动信令服务器(默认 :8000, 托管 web/ 页面 + peerjs 信令)
./bin/peer-server -addr :8000 -path / -key peerjs -web ./web

# 2. 启动 Go PC 客户端(作为被叫, 等网页端连进来)
./bin/go-peer -id go-peer -server ws://127.0.0.1:8000/peerjs

# 3. 浏览器打开: http://127.0.0.1:8000/
#    - 页面显示我的ID: web-peer
#    - "对端ID"填 go-peer → 点"连接"
#    - DataChannel 建立后, 双方输入文字即可互发
```

网页端也可以在**另一台机器/手机**上打开; Go 端输入文字回车即可发送,
收到的消息实时打印在终端。

### 主叫模式

默认 Go 端是"被叫"(等别人连)。若想由 Go 端主动发起连接:

```bash
./bin/go-peer -id go-peer -server ws://127.0.0.1:8000/peerjs -connect web-peer
```

可选参数(均可用 flag 覆盖):
`-id` 本端ID, `-server` 信令 ws 地址, `-connect` 主动连接的对端ID,
`-stun` 逗号分隔的 STUN/TURN 地址(默认 `stun:stun.l.google.com:19302`)。

### 重新编译(改了源码后)

```bash
# 本机走 goproxy.cn 拉依赖(proxy.golang.org 在国内可能被墙)
export GOPROXY="https://goproxy.cn,direct"
go build -o bin/peer-server ./server
go build -o bin/go-peer ./goclient
```

## 协议要点(实现时核对过 peerjs 1.5.4 / peerjs-server 1.x 源码)

- **连接**: 客户端 WebSocket 到 `ws://host:port/<path>peerjs?key=…&id=…&token=…&version=…`,
  服务器立即回 `{"type":"OPEN"}`。
- **信令转发**: 客户端发 `{type, dst, payload}`, 服务器把 `src` 覆盖为本端ID后转发给 `dst`;
  `payload` 是 SDP / ICE 候选对象。
- **数据通道**: 双方用 `serialization:"json"`, DataChannel 上直接传 **UTF-8 JSON 文本**,
  无需额外封帧; `{"__peerData":{"type":"close"}}` 为关闭握手。
- **心跳**: 客户端每 5s 发 `{"type":"HEARTBEAT"}`, 服务器 90s 无心跳判为失联。

## 真实 NAT 部署

1. **PeerServer 放到一台公网服务器**(或有公网 IP 的机器), 如 `vps.example.com:8000`。
2. 网页端: 页面里服务器填该公网地址。
3. Go 端:
   ```bash
   ./bin/go-peer -id go-peer -server ws://vps.example.com:8000/peerjs
   ```
4. 若双方都在对称 NAT 后打洞失败, 请在 `-stun` 里追加一个 **TURN** 服务器, 例如:
   ```bash
   ./bin/go-peer -stun "stun:stun.l.google.com:19302,turn:your-turn:3478" ...
   ```
   TURN 需要在 PeerServer 同一台/另一台机器自建(可用 `coturn`), 两端配置相同的
   username/credential; 浏览器端 peerjs 配置也需带上同样的 TURN 服务器。

## 已知约束

- 本实现的 Go 端一次维护一个对端连接; 上一轮连接结束后自动复位, 可再次被连。
  如需同时服务多个网页端, 需要把 `p.pc/p.dc` 改成按 `connectionId` 索引的映射。
- 网页端保证为 `secure:false`(HTTP)时才能用 `ws://`。