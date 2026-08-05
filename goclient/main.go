// goclient 是 PeerJS 的 Go 实现(PION WebRTC),运行在 NAT 内的 PC 端。
//
// 与浏览器端 peerjs(https://peerjs.com)通过自建 PeerServer 信令互通,
// 建立 WebRTC DataChannel 后双向收发 JSON 文本消息。
//
// 用法:
//   go run ./goclient                      # 作为被叫, 等待网页端连进来
//   go run ./goclient -connect web-peer    # 作为主叫, 主动连接网页端
//
// 可选参数: -server ws://127.0.0.1:9000/peerjs  -id go-peer  -stun stun:stun.l.google.com:19302
package main

import (
	"bufio"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/url"
	"os"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v4"
)

// 与浏览器 peerjs 1.5.4 兼容的协议版本号(服务器不校验, 仅作日志)。
const peerVersion = "1.5.4"

type peerClient struct {
	serverURL string // ws://host:port/peerjs?key=...&id=...&token=...&version=...
	id        string

	ws *websocket.Conn
	wm sync.Mutex

	pc *webrtc.PeerConnection
	dc *webrtc.DataChannel

	remoteID string // 与我们对端的 peer id(用于 ICE 候选的 dst)

	connected  atomic.Bool
	iceServers []webrtc.ICEServer
	quit       chan struct{}
}

func main() {
	server := flag.String("server", "ws://127.0.0.1:9000/peerjs", "PeerServer websocket url")
	key := flag.String("key", "peerjs", "server key")
	id := flag.String("id", "go-peer", "our peer id")
	connect := flag.String("connect", "", "remote peer id to dial (empty = wait for incoming)")
	stun := flag.String("stun", "stun:stun.l.google.com:19302", "comma separated stun/turn urls")
	flag.Parse()

	cfg := webrtc.Configuration{}
	for _, u := range strings.Split(*stun, ",") {
		u = strings.TrimSpace(u)
		if u == "" {
			continue
		}
		cfg.ICEServers = append(cfg.ICEServers, webrtc.ICEServer{URLs: []string{u}})
	}

	p := &peerClient{id: *id, iceServers: cfg.ICEServers, quit: make(chan struct{})}

	u, err := url.Parse(*server)
	if err != nil {
		log.Fatalf("bad server url: %v", err)
	}
	q := u.Query()
	q.Set("key", *key)
	q.Set("id", p.id)
	q.Set("token", randomToken())
	q.Set("version", peerVersion)
	u.RawQuery = q.Encode()
	p.serverURL = u.String()

	if err := p.connectSignaling(); err != nil {
		log.Fatalf("signaling connect failed: %v", err)
	}

	if *connect != "" {
		if err := p.dial(*connect); err != nil {
			log.Fatalf("dial %s failed: %v", *connect, err)
		}
	}

	// 主循环: 从 stdin 读行, 以 JSON 文本发到数据通道。
	go p.heartbeatLoop()
	sc := bufio.NewScanner(os.Stdin)
	fmt.Println("== type a message and press Enter to send (Ctrl-C to quit) ==")
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" {
			continue
		}
		if p.dc == nil || p.dc.ReadyState() != webrtc.DataChannelStateOpen {
			fmt.Println("[!] data channel not open yet")
			continue
		}
		msg := map[string]string{"text": line}
		data, _ := json.Marshal(msg)
		if err := p.dc.Send(data); err != nil {
			fmt.Println("[!] send failed:", err)
		} else {
			fmt.Printf("-> %s\n", line)
		}
	}
}

// ---- 信令层: 连接 PeerServer, 收发 OFFER/ANSWER/CANDIDATE ----

func (p *peerClient) connectSignaling() error {
	// 服务器可能还没就绪, 重试几次再放弃。
	var err error
	for i := 0; i < 10; i++ {
		conn, _, derr := websocket.DefaultDialer.Dial(p.serverURL, nil)
		if derr == nil {
			p.ws = conn
			log.Printf("[go-peer] connected to signaling %s", p.serverURL)
			go p.readLoop()
			return nil
		}
		err = derr
		log.Printf("[go-peer] signaling dial retry %d: %v", i+1, derr)
		time.Sleep(time.Second)
	}
	return err
}

func (p *peerClient) sendSignaling(v any) error {
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}
	p.wm.Lock()
	defer p.wm.Unlock()
	if p.ws == nil {
		return fmt.Errorf("signaling socket closed")
	}
	return p.ws.WriteMessage(websocket.TextMessage, data)
}

func (p *peerClient) heartbeatLoop() {
	t := time.NewTicker(5 * time.Second)
	defer t.Stop()
	for {
		select {
		case <-p.quit:
			return
		case <-t.C:
			p.sendSignaling(map[string]string{"type": "HEARTBEAT"})
		}
	}
}

func (p *peerClient) readLoop() {
	for {
		_, data, err := p.ws.ReadMessage()
		if err != nil {
			log.Printf("[go-peer] signaling closed: %v", err)
			return
		}

		var m struct {
			Type    string          `json:"type"`
			Src     string          `json:"src"`
			Payload json.RawMessage `json:"payload"`
		}
		if err := json.Unmarshal(data, &m); err != nil {
			log.Printf("[go-peer] bad signaling msg: %v", err)
			continue
		}

		switch m.Type {
		case "OPEN":
			log.Printf("[go-peer] registered on signaling as %q", p.id)
		case "OFFER":
			if err := p.handleOffer(m.Src, m.Payload); err != nil {
				log.Printf("[go-peer] handleOffer failed: %v", err)
			}
		case "ANSWER":
			if err := p.handleAnswer(m.Src, m.Payload); err != nil {
				log.Printf("[go-peer] handleAnswer failed: %v", err)
			}
		case "CANDIDATE":
			if err := p.handleCandidate(m.Payload); err != nil {
				log.Printf("[go-peer] handleCandidate failed: %v", err)
			}
		case "LEAVE":
			log.Printf("[go-peer] remote %s left", m.Src)
		case "ERROR", "ID-TAKEN":
			log.Printf("[go-peer] server error: %s", string(data))
		default:
			log.Printf("[go-peer] unhandled message: %s", string(data))
		}
	}
}

// ---- WebRTC: 被叫处理 OFFER, 返回 ANSWER; 主叫发起 OFFER ----

type offerPayload struct {
	SDP struct {
		Type string `json:"type"`
		SDP  string `json:"sdp"`
	} `json:"sdp"`
	Type         string `json:"type"` // "data" | "media"
	ConnectionID string `json:"connectionId"`
	Label        string `json:"label"`
	Reliable     bool   `json:"reliable"`
	Serialization string `json:"serialization"`
}

type answerPayload struct {
	SDP struct {
		Type string `json:"type"`
		SDP  string `json:"sdp"`
	} `json:"sdp"`
	Type         string `json:"type"`
	ConnectionID string `json:"connectionId"`
}

type candidatePayload struct {
	Candidate    webrtc.ICECandidateInit `json:"candidate"`
	Type         string                   `json:"type"`
	ConnectionID string                   `json:"connectionId"`
}

func (p *peerClient) handleOffer(src string, raw json.RawMessage) error {
	if p.pc != nil {
		// 上一轮连接已结束, 关闭旧 PeerConnection 以便接收新连接。
		log.Printf("[go-peer] closing previous peer connection to accept new offer")
		p.pc.Close()
		p.pc = nil
		p.dc = nil
	}

	var off offerPayload
	if err := json.Unmarshal(raw, &off); err != nil {
		return err
	}
	if off.Type != "data" {
		return fmt.Errorf("unsupported connection type %q", off.Type)
	}
	log.Printf("[go-peer] OFFER from %s (connectionId=%s, serialization=%s)",
		src, off.ConnectionID, off.Serialization)

	p.remoteID = src

	pc, err := p.newPeerConnection(off.ConnectionID)
	if err != nil {
		return err
	}
	p.pc = pc

	if err := pc.SetRemoteDescription(webrtc.SessionDescription{
		Type: webrtc.SDPTypeOffer, SDP: off.SDP.SDP,
	}); err != nil {
		return fmt.Errorf("setRemoteDescription: %w", err)
	}

	answer, err := pc.CreateAnswer(nil)
	if err != nil {
		return fmt.Errorf("createAnswer: %w", err)
	}
	if err := pc.SetLocalDescription(answer); err != nil {
		return fmt.Errorf("setLocalDescription: %w", err)
	}

	payload := answerPayload{
		Type:         "data",
		ConnectionID: off.ConnectionID,
	}
	payload.SDP.Type = "answer"
	payload.SDP.SDP = answer.SDP

	return p.sendSignaling(map[string]any{
		"type":    "ANSWER",
		"dst":     src,
		"payload": payload,
	})
}

func (p *peerClient) dial(remote string) error {
	p.remoteID = remote
	connID := "dc_" + randomToken()
	pc, err := p.newPeerConnection(connID)
	if err != nil {
		return err
	}
	p.pc = pc

	ordered := false
	dc, err := pc.CreateDataChannel(connID, &webrtc.DataChannelInit{Ordered: &ordered})
	if err != nil {
		return fmt.Errorf("createDataChannel: %w", err)
	}
	p.setupDataChannel(dc)

	offer, err := pc.CreateOffer(nil)
	if err != nil {
		return fmt.Errorf("createOffer: %w", err)
	}
	if err := pc.SetLocalDescription(offer); err != nil {
		return fmt.Errorf("setLocalDescription: %w", err)
	}

	payload := offerPayload{
		Type:          "data",
		ConnectionID:  connID,
		Label:         connID,
		Reliable:      false,
		Serialization: "json",
	}
	payload.SDP.Type = "offer"
	payload.SDP.SDP = offer.SDP

	log.Printf("[go-peer] OFFER -> %s (connectionId=%s)", remote, connID)
	return p.sendSignaling(map[string]any{
		"type":    "OFFER",
		"dst":     remote,
		"payload": payload,
	})
}

func (p *peerClient) handleAnswer(src string, raw json.RawMessage) error {
	var ans answerPayload
	if err := json.Unmarshal(raw, &ans); err != nil {
		return err
	}
	if p.pc == nil {
		return fmt.Errorf("ANSWER without a peer connection")
	}
	log.Printf("[go-peer] ANSWER from %s", src)
	return p.pc.SetRemoteDescription(webrtc.SessionDescription{
		Type: webrtc.SDPTypeAnswer, SDP: ans.SDP.SDP,
	})
}

func (p *peerClient) handleCandidate(raw json.RawMessage) error {
	var cp candidatePayload
	if err := json.Unmarshal(raw, &cp); err != nil {
		return err
	}
	if p.pc == nil {
		return fmt.Errorf("CANDIDATE before peer connection")
	}
	return p.pc.AddICECandidate(cp.Candidate)
}

// ---- WebRTC: PeerConnection / DataChannel 装配 ----

func (p *peerClient) newPeerConnection(connID string) (*webrtc.PeerConnection, error) {
	cfg := webrtc.Configuration{ICEServers: p.iceServers}
	pc, err := webrtc.NewPeerConnection(cfg)
	if err != nil {
		return nil, err
	}

	pc.OnICECandidate(func(c *webrtc.ICECandidate) {
		if c == nil {
			return
		}
		payload := candidatePayload{
			Candidate:    c.ToJSON(),
			Type:         "data",
			ConnectionID: connID,
		}
		// 把候选发给远端(通过服务器转发)。远端 id 由 pc 回调携带太麻烦,
		// 这里直接发给创建连接的对端即可——需要记住对端 id。
		if err := p.sendSignaling(map[string]any{
			"type":    "CANDIDATE",
			"dst":     p.remoteID,
			"payload": payload,
		}); err != nil {
			log.Printf("[go-peer] send candidate failed: %v", err)
		}
	})

	pc.OnConnectionStateChange(func(s webrtc.PeerConnectionState) {
		log.Printf("[go-peer] peerconnection state: %s", s)
		switch s {
		case webrtc.PeerConnectionStateConnected:
			p.connected.Store(true)
		case webrtc.PeerConnectionStateFailed:
			pc.Close()
			p.connected.Store(false)
		case webrtc.PeerConnectionStateClosed:
			p.connected.Store(false)
			if p.pc == pc {
				p.pc = nil
				p.dc = nil
			}
		}
	})

	// 被叫方: 数据通道由主叫创建, 通过这个回调接收。
	pc.OnDataChannel(func(dc *webrtc.DataChannel) {
		log.Printf("[go-peer] remote opened data channel %q", dc.Label())
		p.setupDataChannel(dc)
	})

	return pc, nil
}

func (p *peerClient) setupDataChannel(dc *webrtc.DataChannel) {
	p.dc = dc
	dc.OnOpen(func() {
		log.Printf("[go-peer] data channel OPEN, ready to chat!")
	})
	dc.OnMessage(func(msg webrtc.DataChannelMessage) {
		text := string(msg.Data)
		var parsed map[string]any
		if err := json.Unmarshal(msg.Data, &parsed); err == nil {
			if pd, ok := parsed["__peerData"].(map[string]any); ok && pd["type"] == "close" {
				return
			}
			if v, ok := parsed["text"].(string); ok {
				text = v
			}
		}
		fmt.Printf("<- %s\n", text)
	})
	dc.OnClose(func() {
		log.Printf("[go-peer] data channel closed")
		p.dc = nil
	})
}

var _ = peerVersion

func randomToken() string {
	b := make([]byte, 8)
	rand.Read(b)
	return hex.EncodeToString(b)
}
