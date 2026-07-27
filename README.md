# ECS Game Sandbox

一个基于实体组件系统（ECS）架构的实时游戏模拟沙盒。后端用 Python + FastAPI + NumPy 做 ECS 引擎，前端用 React + PixiJS v8 做可视化，通过 WebSocket 通信。

---

## 技术栈

| 层 | 技术 |
|------|------|
| 前端 | React 19 + PixiJS v8 + Vite + TailwindCSS |
| 后端 | Python 3.8+ / FastAPI / Uvicorn / NumPy |
| 通信 | WebSocket |

---

## 快速开始

### 前端

```bash
npm install
npm run dev
```

Vite 开发服务器默认 `http://localhost:5173`。

### 后端

```bash
pip install fastapi uvicorn numpy websockets
python -m server.main
```

默认监听 `0.0.0.0:8000`。

### 运行测试

```bash
python server/test_ecs.py     # 单元测试
python server/test_server.py  # 集成测试
```

---

## 前端架构

消息驱动的插件体系：

```
Toolbar → GameController → PixiController → Plugin → PIXI 渲染
```

### 核心文件

| 文件 | 说明 |
|------|------|
| `src/App.tsx` | 主入口，挂载 PixiCanvas + Toolbar |
| `src/components/PixiCanvas.tsx` | PixiJS 画布生命周期管理 |
| `src/components/Toolbar.tsx` | 工具栏 UI |
| `src/controllers/PixiController.ts` | 消息中枢，管理插件注册与消息分发 |
| `src/controllers/GameController.ts` | 业务逻辑层，连接 UI 与 Pixi |
| `src/controllers/ServerConnection.ts` | WebSocket 客户端 |

### 插件列表

| 插件 | 消息 | 功能 |
|------|------|------|
| `circle.plugin.ts` | `drawCircle` | 画圆 |
| `rectangle.plugin.ts` | `drawRectangle` | 画矩形 |
| `clear.plugin.ts` | `clear` | 清空画布 |
| `fireworks.plugin.ts` | `startFireworks`, `stopFireworks`, `clear` | 鼠标跟随烟花 |
| `bounce.plugin.ts` | `startDVD`, `clear` | DVD 图标弹跳+撞墙变色 |
| `balls.plugin.ts` | `startBalls`, `stopBalls`, `clear`, `mouseMove` | 100 球弹性碰撞 |
| `physics/` | — | 新版物理引擎（dvd + balls） |
| `api-demo/` | — | PixiJS API 教学演示 |

### 开发：添加新功能

1. 在 `src/plugins/` 创建插件文件，实现 `PixiPlugin` 接口
2. 在 `src/plugins/index.ts` 注册
3. 在 `GameController.ts` 添加触发方法
4. 在 `Toolbar.tsx` 添加按钮

---

## 后端架构

```
server/
├── main.py          FastAPI 应用 + WebSocket 服务端
├── ecs.py           ECS 核心（EntityManager / ComponentManager / World）
├── components.py    组件类型（POSITION, VELOCITY, INPUT, HEALTH）
├── systems.py       系统逻辑（movement_system, input_system）
├── config.py        配置（TICK_RATE=60, MAX_ENTITIES=10000）
├── test_ecs.py      单元测试
└── test_server.py   集成测试
```

- 60Hz tick 更新实体位置
- WebSocket 广播 `{"type":"update", "data":[...]}`
- 客户端可发 `create` / `move` 指令

---

## WebSocket API

| 方向 | 类型 | 说明 |
|------|------|------|
| 客户端→ | `create` | 创建新实体 |
| 客户端→ | `move` | `{"id":0, "dx":1, "dy":0}` 控制移动方向 |
| →服务端 | `create_response` | 返回新实体 ID |
| →服务端 | `move_response` | 确认移动指令 |
| →服务端 | `error` | 错误信息 |
| →服务端 | `update` | 广播所有实体位置 |

---

## 部署

- 前端: `npm run build` 构建后用任意静态服务器托管
- 后端: `python -m server.main` 运行在 VPS

GitHub 分支: `ecs-sandbox`
