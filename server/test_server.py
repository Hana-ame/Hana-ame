"""
测试ECS游戏服务器的WebSocket接口。
用法: python test_server.py [port]
如果不指定端口，将使用随机端口。
"""

import subprocess
import sys
import asyncio
import json
import urllib.request
import socket
import os
import random

# 尝试导入websockets
try:
    import websockets
except ImportError:
    print("错误: 需要安装websockets库: pip install websockets")
    sys.exit(1)

# 随机端口范围
PORT_RANGE = (8100, 9000)

def find_free_port():
    """找一个空闲端口"""
    while True:
        port = random.randint(*PORT_RANGE)
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port

def find_project_root():
    """找到包含server文件夹的项目根目录"""
    # 假设当前脚本在 server/ 下或项目根目录下
    script_dir = os.path.dirname(os.path.abspath(__file__))
    if os.path.basename(script_dir) == "server":
        return os.path.dirname(script_dir)
    # 如果当前已经在根目录，检查server子目录是否存在
    if os.path.isdir(os.path.join(script_dir, "server")):
        return script_dir
    # 否则向上查找
    current = script_dir
    while True:
        parent = os.path.dirname(current)
        if parent == current:
            raise Exception("找不到项目根目录（包含server文件夹）")
        if os.path.isdir(os.path.join(parent, "server")):
            return parent
        current = parent

async def test_server(port):
    """测试服务器功能"""
    # 连接WebSocket
    uri = f"ws://localhost:{port}/ws"
    print(f"连接 {uri}")
    async with websockets.connect(uri) as ws:
        # 测试创建实体
        create_msg = json.dumps({"type": "create"})
        await ws.send(create_msg)
        response = await asyncio.wait_for(ws.recv(), timeout=5)
        data = json.loads(response)
        if data.get("type") != "create_response" or "id" not in data:
            raise Exception(f"创建实体响应异常: {data}")
        eid = data["id"]
        print(f"创建实体成功，ID={eid}")

        # 测试移动实体
        move_msg = json.dumps({"type": "move", "id": eid, "dx": 1.0, "dy": 1.0})
        await ws.send(move_msg)
        response = await asyncio.wait_for(ws.recv(), timeout=5)
        data = json.loads(response)
        if data.get("type") != "move_response" or data.get("id") != eid:
            raise Exception(f"移动实体响应异常: {data}")
        print(f"移动实体成功，ID={eid}, dx=1.0, dy=1.0")

        # 等待一帧让系统处理输入
        await asyncio.sleep(0.1)

        # 通过HTTP获取实体列表，检查实体位置
        http_url = f"http://localhost:{port}/entities"
        try:
            with urllib.request.urlopen(http_url, timeout=5) as resp:
                entities = json.loads(resp.read().decode())
                found = False
                for ent in entities:
                    if ent["id"] == eid:
                        found = True
                        print(f"实体 {eid} 位置: ({ent['x']:.2f}, {ent['y']:.2f})")
                        break
                if not found:
                    raise Exception(f"实体 {eid} 未在/entities中找到")
        except Exception as e:
            raise Exception(f"HTTP请求失败: {e}")

        print("所有测试通过！")

async def main():
    # 确定端口
    port = None
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("无效的端口号，使用随机端口")
    if port is None:
        port = find_free_port()
        print(f"使用随机端口: {port}")

    # 定位项目根目录
    try:
        project_root = find_project_root()
    except Exception as e:
        print(e)
        sys.exit(1)
    print(f"项目根目录: {project_root}")

    # 以模块方式启动服务器（必须从根目录运行）
    # 命令: python -m server.main <port>
    proc = subprocess.Popen(
        [sys.executable, "-m", "server.main", str(port)],
        cwd=project_root
    )
    print(f"服务器进程启动，PID={proc.pid}")

    try:
        # 等待服务器启动
        for attempt in range(10):
            await asyncio.sleep(1)
            try:
                # 尝试连接WebSocket
                async with websockets.connect(f"ws://localhost:{port}/ws", timeout=2):
                    break
            except (ConnectionRefusedError, OSError, asyncio.TimeoutError):
                if attempt == 9:
                    raise Exception("服务器启动超时")
                print("等待服务器启动...")
        # 运行测试
        await test_server(port)
        print("测试成功完成")
    except Exception as e:
        print(f"测试失败: {e}")
        proc.terminate()
        proc.wait()
        sys.exit(1)
    finally:
        # 关闭服务器
        print("关闭服务器进程")
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    asyncio.run(main())