// ============================================================
// 文件: src/controllers/ServerConnection.ts
// 用途: 管理WebSocket连接，处理与ECS服务器的通信。
//       提供连接、断开、发送创建和移动指令的方法，并通过回调接收更新。
// 版本: 4.0.1
//    - 移除每帧打印坐标的 console.log，避免卡顿。
// ============================================================

export type LogCallback = (message: string) => void;

export interface ServerEntity {
  id: number;
  x: number;
  y: number;
}

export type UpdateCallback = (entities: ServerEntity[]) => void;

export class ServerConnection {
  private ws: WebSocket | null = null;
  private logCallback: LogCallback;
  private updateCallback: UpdateCallback;
  private wsUrl: string;

  constructor(wsUrl: string, logCallback: LogCallback, updateCallback: UpdateCallback) {
    this.wsUrl = wsUrl;
    this.logCallback = logCallback;
    this.updateCallback = updateCallback;
  }

  public connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.logCallback("已经连接至服务器");
      return;
    }

    this.ws = new WebSocket(this.wsUrl);
    this.ws.onopen = () => {
      this.logCallback(`WebSocket 已连接: ${this.wsUrl}`);
    };
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "update" && Array.isArray(data.data)) {
          // 不再打印每帧坐标
          this.updateCallback(data.data);
        }
      } catch (e) {
        this.logCallback(`收到无法解析的消息: ${event.data}`);
      }
    };
    this.ws.onerror = (error) => {
      this.logCallback(`WebSocket 错误: ${error}`);
    };
    this.ws.onclose = () => {
      this.logCallback("WebSocket 连接已关闭");
      this.ws = null;
    };
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public createEntity(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.logCallback("未连接到服务器");
      return;
    }
    const msg = JSON.stringify({ type: "create" });
    this.ws.send(msg);
    this.logCallback("发送创建实体指令");
  }

  public moveEntity(id: number, dx: number, dy: number): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.logCallback("未连接到服务器");
      return;
    }
    const msg = JSON.stringify({ type: "move", id, dx, dy });
    this.ws.send(msg);
    this.logCallback(`发送移动指令: id=${id}, dx=${dx}, dy=${dy}`);
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}