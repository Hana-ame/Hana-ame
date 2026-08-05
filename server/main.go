// PeerServer 是 PeerJS 协议的信令服务器(PeerJS 官方 peerjs-server 的 Go 实现)。
//
// 职责:
//   - WebSocket 信令: 客户端以 ws://host:port/<path>peerjs?key=...&id=...&token=... 接入,
//     服务器负责把 OFFER/ANSWER/CANDIDATE 消息在 peer 之间转发。
//   - REST API: GET /<path><key>/id 分配随机 ID; GET /<path><key>/peers 列出在线 peer。
//   - 静态文件: 托管 web/ 目录(浏览器页面 + 本地 peerjs.min.js)。
//
// 用法: go run ./server -addr :8000 -path / -key peerjs -web ./web
package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	msgOPEN      = "OPEN"
	msgOFFER     = "OFFER"
	msgANSWER    = "ANSWER"
	msgCANDIDATE = "CANDIDATE"
	msgLEAVE     = "LEAVE"
	msgEXPIRE    = "EXPIRE"
	msgHEARTBEAT = "HEARTBEAT"
	msgIDTAKEN   = "ID-TAKEN"
	msgERROR     = "ERROR"

	// 与官方 peerjs-server 默认一致的超时参数。
	expireTimeout = 5 * time.Second
	aliveTimeout  = 90 * time.Second
)

// relayMessage 是服务器在 peer 之间转发的信令消息。
// payload 原样透传(RawMessage), 不改动内容。
type relayMessage struct {
	Type    string          `json:"type"`
	Src     string          `json:"src"`
	Dst     string          `json:"dst,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

// clientMessage 是客户端发给服务器的消息(src 会被服务器覆盖为连接所注册的 id)。
type clientMessage struct {
	Type    string          `json:"type"`
	Src     string          `json:"src,omitempty"`
	Dst     string          `json:"dst,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

type client struct {
	id       string
	token    string
	conn     *websocket.Conn
	lastPing time.Time

	sendMu sync.Mutex
}

func (c *client) sendRaw(data []byte) {
	c.sendMu.Lock()
	defer c.sendMu.Unlock()
	if c.conn != nil {
		if err := c.conn.WriteMessage(websocket.TextMessage, data); err != nil {
			log.Printf("[server] write to %s failed: %v", c.id, err)
		}
	}
}

func (c *client) sendJSON(v any) {
	data, err := json.Marshal(v)
	if err != nil {
		log.Printf("[server] marshal to %s failed: %v", c.id, err)
		return
	}
	c.sendRaw(data)
}

// server 维护所有在线 peer 与离线消息队列。
type server struct {
	key  string
	mu   sync.RWMutex
	hub  map[string]*client // id -> client
	msgs map[string][]relayMessage // id -> 离线期间的待投递消息
}

func newServer(key string) *server {
	return &server{
		key:  key,
		hub:  make(map[string]*client),
		msgs: make(map[string][]relayMessage),
	}
}

// ---- 客户端注册 / 注销 ----

func (s *server) register(id, token string, conn *websocket.Conn) (*client, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if old, ok := s.hub[id]; ok {
		if token != old.token {
			return nil, false
		}
		// 同一 peer 重新连接(相同 token): 复用记录, 换 socket。
		old.conn = conn
		old.lastPing = time.Now()
		return old, true
	}

	c := &client{id: id, token: token, conn: conn, lastPing: time.Now()}
	s.hub[id] = c

	// 投递离线期间缓存的信令消息(如 peer 尚未连上时收到的 OFFER)。
	if pending, ok := s.msgs[id]; ok {
		delete(s.msgs, id)
		for _, m := range pending {
			c.sendJSON(m)
		}
	}
	return c, true
}

func (s *server) remove(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if c, ok := s.hub[id]; ok && c.conn != nil {
		c.conn.Close()
	}
	delete(s.hub, id)
}

// ---- 消息转发 ----

func (s *server) forward(m clientMessage) {
	if m.Type == msgHEARTBEAT {
		return
	}

	if m.Type == msgLEAVE {
		if m.Dst == "" {
			// 无目标的 LEAVE 表示本 peer 下线。
			s.remove(m.Src)
		}
	}

	if m.Dst == "" {
		return
	}

	s.mu.Lock()
	dst, ok := s.hub[m.Dst]
	if ok {
		s.mu.Unlock()
		dst.sendJSON(relayMessage{Type: m.Type, Src: m.Src, Dst: m.Dst, Payload: m.Payload})
		return
	}

	// 目标离线: 缓存重要消息, 等对方连上后再投递(LEAVE/EXPIRE 除外)。
	if m.Type != msgLEAVE && m.Type != msgEXPIRE {
		s.msgs[m.Dst] = append(s.msgs[m.Dst],
			relayMessage{Type: m.Type, Src: m.Src, Dst: m.Dst, Payload: m.Payload})
	}
	s.mu.Unlock()
}

// ---- 每个 WebSocket 连接的读写循环 ----

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// 演示环境放开跨域; 生产可按需收紧。
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (s *server) handleWS(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	id := q.Get("id")
	token := q.Get("token")
	key := q.Get("key")

	if id == "" || token == "" || key == "" {
		s.wsError(w, "No id, token, or key supplied to websocket server")
		return
	}
	if key != s.key {
		s.wsError(w, "Invalid key provided")
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[server] upgrade failed: %v", err)
		return
	}

	c, ok := s.register(id, token, conn)
	if !ok {
		conn.WriteMessage(websocket.TextMessage,
			mustJSON(relayMessage{Type: msgIDTAKEN, Payload: json.RawMessage(`{"msg":"ID is taken"}`)}))
		conn.Close()
		return
	}

	conn.SetPingHandler(func(appData string) error {
		c.sendMu.Lock()
		defer c.sendMu.Unlock()
		return conn.WriteMessage(websocket.PongMessage, nil)
	})

	// 注册成功。
	c.sendJSON(relayMessage{Type: msgOPEN})

	for {
		_, data, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var m clientMessage
		if err := json.Unmarshal(data, &m); err != nil {
			log.Printf("[server] bad message from %s: %v", id, err)
			continue
		}

		if m.Type == msgHEARTBEAT {
			c.lastPing = time.Now()
			continue
		}

		m.Src = c.id
		s.forward(m)
	}

	s.remove(id)
	log.Printf("[server] peer %s disconnected", id)
}

func (s *server) wsError(w http.ResponseWriter, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusForbidden)
	w.Write(mustJSON(relayMessage{Type: msgERROR, Payload: json.RawMessage(`{"msg":"` + msg + `"}`)}))
}

// ---- 心跳清理: 长时间无心跳的 peer 视为失联 ----

func (s *server) reapLoop() {
	t := time.NewTicker(10 * time.Second)
	defer t.Stop()
	for range t.C {
		s.mu.Lock()
		for id, c := range s.hub {
			if time.Since(c.lastPing) > aliveTimeout {
				log.Printf("[server] peer %s idle too long, dropping", id)
				if c.conn != nil {
					c.conn.Close()
				}
				delete(s.hub, id)
			}
		}
		s.mu.Unlock()
	}
}

// ---- HTTP 入口 ----

func randomID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func mustJSON(v any) []byte {
	data, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}
	return data
}

func main() {
	addr := flag.String("addr", ":8000", "listen address")
	path := flag.String("path", "/", "mount path for the peerjs endpoints, e.g. /myapp/")
	key := flag.String("key", "peerjs", "server API key")
	web := flag.String("web", "./web", "directory of static files (index.html, peerjs.min.js)")
	flag.Parse()

	mp := *path
	if !strings.HasPrefix(mp, "/") {
		mp = "/" + mp
	}
	if !strings.HasSuffix(mp, "/") {
		mp += "/"
	}
	wsPath := mp + "peerjs"

	srv := newServer(*key)
	go srv.reapLoop()

	mux := http.NewServeMux()

	// REST: 分配随机 id / 列出在线 peer。
	mux.HandleFunc(mp+"peerjs/id", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write([]byte(randomID()))
	})
	mux.HandleFunc(mp+"peerjs/peers", func(w http.ResponseWriter, r *http.Request) {
		srv.mu.RLock()
		ids := make([]string, 0, len(srv.hub))
		for id := range srv.hub {
			ids = append(ids, id)
		}
		srv.mu.RUnlock()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ids)
	})

	// WebSocket 信令。
	mux.HandleFunc(wsPath, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet || r.Header.Get("Upgrade") == "" {
			http.Error(w, "websocket upgrade required", http.StatusBadRequest)
			return
		}
		srv.handleWS(w, r)
	})

	// 静态页面。
	mux.Handle("/", http.FileServer(http.Dir(*web)))

	log.Printf("[server] PeerServer listening on %s  (ws: %s, web: %s)",
		*addr, wsPath, *web)
	if err := http.ListenAndServe(*addr, mux); err != nil {
		log.Fatal(err)
	}
}
