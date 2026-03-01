import asyncio
import threading
import time
import json
import sys
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse
import uvicorn
import numpy as np

from .config import TICK_RATE, MAX_ENTITIES
from .ecs import World
from .components import ComponentType
from .systems import movement_system, input_system

app = FastAPI()

# 全局世界对象
world = World(MAX_ENTITIES)
world_lock = threading.Lock()  # 保护world的线程锁

# 初始化一些示例实体
def init_world():
    with world_lock:
        for i in range(10):
            eid = world.entity_manager.create_entity()
            # 使用元组赋值，符合结构化数组
            world.component_manager.add_component(eid, ComponentType.POSITION, (float(np.random.rand()*100), float(np.random.rand()*100)))
            world.component_manager.add_component(eid, ComponentType.VELOCITY, (float(np.random.rand()*10-5), float(np.random.rand()*10-5)))

# 添加系统
world.add_system(movement_system)
world.add_system(input_system)

# WebSocket连接管理
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# 后台任务，定期更新世界并广播状态
def world_update_loop(main_loop):
    dt = 1.0 / TICK_RATE
    while True:
        start = time.time()
        with world_lock:
            world.update(dt)
            # 收集所有实体的状态，例如位置
            entities_data = []
            for eid in range(MAX_ENTITIES):
                if world.entity_manager.is_alive(eid):
                    pos = world.component_manager.get_component(eid, ComponentType.POSITION)
                    if pos is not None:
                        entities_data.append({
                            "id": eid,
                            "x": float(pos['x']),
                            "y": float(pos['y'])
                        })
        # 广播
        message = {"type": "update", "data": entities_data}
        # 由于是在线程中，需要将消息发送到主事件循环
        asyncio.run_coroutine_threadsafe(manager.broadcast(json.dumps(message)), main_loop)
        elapsed = time.time() - start
        sleep_time = max(0, dt - elapsed)
        time.sleep(sleep_time)

@app.on_event("startup")
async def startup_event():
    init_world()
    loop = asyncio.get_running_loop()
    thread = threading.Thread(target=world_update_loop, args=(loop,), daemon=True)
    thread.start()

@app.get("/")
async def get():
    return HTMLResponse("<h1>ECS Game Server</h1><p>WebSocket endpoint at /ws</p>")

@app.get("/entities")
async def get_entities():
    """返回所有实体的位置信息，用于测试"""
    with world_lock:
        entities = []
        for eid in range(MAX_ENTITIES):
            if world.entity_manager.is_alive(eid):
                pos = world.component_manager.get_component(eid, ComponentType.POSITION)
                if pos:
                    entities.append({
                        "id": eid,
                        "x": float(pos['x']),
                        "y": float(pos['y'])
                    })
    return JSONResponse(content=entities)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # 尝试解析JSON消息
            try:
                msg = json.loads(data)
                msg_type = msg.get("type")
                if msg_type == "create":
                    # 创建新实体
                    with world_lock:
                        eid = world.entity_manager.create_entity()
                        # 随机位置和速度
                        world.component_manager.add_component(eid, ComponentType.POSITION, (float(np.random.rand()*100), float(np.random.rand()*100)))
                        world.component_manager.add_component(eid, ComponentType.VELOCITY, (float(np.random.rand()*10-5), float(np.random.rand()*10-5)))
                    await websocket.send_text(json.dumps({"type": "create_response", "id": eid}))
                elif msg_type == "move":
                    # 移动实体：设置输入组件
                    eid = msg.get("id")
                    dx = msg.get("dx", 0)
                    dy = msg.get("dy", 0)
                    with world_lock:
                        if world.entity_manager.is_alive(eid):
                            # 如果实体已有INPUT组件，则更新；否则添加
                            if world.component_manager.has_component(eid, ComponentType.INPUT):
                                inp = world.component_manager.get_component(eid, ComponentType.INPUT)
                                inp['dx'] = float(dx)
                                inp['dy'] = float(dy)
                            else:
                                world.component_manager.add_component(eid, ComponentType.INPUT, (float(dx), float(dy)))
                            await websocket.send_text(json.dumps({"type": "move_response", "id": eid, "dx": dx, "dy": dy}))
                        else:
                            await websocket.send_text(json.dumps({"type": "error", "message": "Entity not found"}))
                else:
                    # 简单回显
                    await websocket.send_text(f"Echo: {data}")
            except json.JSONDecodeError:
                await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    uvicorn.run(app, host="0.0.0.0", port=port)