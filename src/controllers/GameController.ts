// ============================================================
// 文件: src/controllers/GameController.ts
// 用途: 游戏业务逻辑控制器，负责本地模拟和服务器实体渲染。
//       使用 ServerConnection 处理 WebSocket 通信。
// 版本: 4.1.0
//    - 在 onAppInit 中调用 pixiController.setApp(app)，确保绘图指令能正确执行。
// ============================================================

import * as PIXI from "pixi.js";
import { PixiController } from "./PixiController";
import { ServerConnection, ServerEntity } from "./ServerConnection";

export type LogCallback = (message: string) => void;

export class GameController {
  private pixiController: PixiController;
  private logCallback: LogCallback;
  private app: PIXI.Application | null = null;

  // 本地模拟相关
  private ballsContainer: PIXI.Container | null = null;
  private balls: PIXI.Graphics[] = [];
  private ballVelocities: { vx: number; vy: number }[] = [];
  private animationFrame: number | null = null;
  private lastTimestamp: number = 0;

  // 服务器模式相关
  private serverConn: ServerConnection | null = null;
  private serverEntities: Map<number, ServerEntity> = new Map();
  private entityGraphics: Map<number, PIXI.Graphics> = new Map();
  private isServerMode: boolean = false;

  constructor(pixiController: PixiController, logCallback: LogCallback) {
    this.pixiController = pixiController;
    this.logCallback = logCallback;
  }

  public onAppInit(app: PIXI.Application): void {
    this.app = app;
    this.pixiController.setApp(app);  // 关键：将 app 设置到 pixiController
    this.logCallback("PixiJS 应用已初始化");
  }

  // ---------- 绘图操作（通过 sendToPixi 发送消息） ----------
  public drawCircle(): void {
    this.pixiController.sendToPixi({
      type: 'drawCircle',
      x: 400,
      y: 300,
      radius: 50,
      color: 0xff0000
    });
    this.logCallback("画了一个红色圆形");
  }

  public drawRectangle(): void {
    this.pixiController.sendToPixi({
      type: 'drawRectangle',
      x: 300,
      y: 200,
      width: 100,
      height: 80,
      color: 0x00ff00
    });
    this.logCallback("画了一个绿色矩形");
  }

  public clearCanvas(): void {
    this.pixiController.sendToPixi({ type: 'clear' });
    this.stopBalls();
    this.disconnectServer();
    this.logCallback("清除了画布");
  }

  // ---------- 本地模拟方法 ----------
  public startBalls(): void {
    if (!this.app) {
      this.logCallback("错误：PixiJS 应用未初始化");
      return;
    }
    this.disconnectServer();
    this.stopBalls();

    this.ballsContainer = new PIXI.Container();
    this.app.stage.addChild(this.ballsContainer);

    const width = this.app.screen.width;
    const height = this.app.screen.height;

    for (let i = 0; i < 100; i++) {
      const ball = new PIXI.Graphics();
      ball.circle(0, 0, 5);
      ball.fill(0xffaa00);
      ball.position.set(Math.random() * width, Math.random() * height);
      this.ballsContainer.addChild(ball);
      this.balls.push(ball);
      this.ballVelocities.push({
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
      });
    }

    this.logCallback("启动 100 个小球模拟");
    this.animationFrame = requestAnimationFrame(this.updateBalls.bind(this));
  }

  private stopBalls(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.ballsContainer) {
      this.ballsContainer.destroy({ children: true });
      this.ballsContainer = null;
    }
    this.balls = [];
    this.ballVelocities = [];
  }

  private updateBalls(timestamp: number): void {
    if (!this.app || !this.ballsContainer) return;

    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      this.animationFrame = requestAnimationFrame(this.updateBalls.bind(this));
      return;
    }
    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    const width = this.app.screen.width;
    const height = this.app.screen.height;
    const speedFactor = 60;

    for (let i = 0; i < this.balls.length; i++) {
      const ball = this.balls[i];
      const vel = this.ballVelocities[i];

      ball.x += vel.vx * deltaTime * speedFactor;
      ball.y += vel.vy * deltaTime * speedFactor;

      if (ball.x < 0) { ball.x = 0; vel.vx *= -1; }
      else if (ball.x > width) { ball.x = width; vel.vx *= -1; }
      if (ball.y < 0) { ball.y = 0; vel.vy *= -1; }
      else if (ball.y > height) { ball.y = height; vel.vy *= -1; }
    }

    this.animationFrame = requestAnimationFrame(this.updateBalls.bind(this));
  }

  // ---------- 服务器模式方法 ----------
  public connectServer(wsUrl: string): void {
    if (this.serverConn && this.serverConn.isConnected()) {
      this.logCallback("已经连接至服务器");
      return;
    }

    this.stopBalls();
    this.pixiController.sendToPixi({ type: 'clear' });
    this.isServerMode = true;

    // 创建 ServerConnection 实例
    this.serverConn = new ServerConnection(wsUrl, this.logCallback, (entities) => {
      this.updateServerEntities(entities);
    });
    this.serverConn.connect();

    if (this.app) {
      this.app.ticker.add(this.renderServerEntities, this);
    }
  }

  public disconnectServer(): void {
    if (this.serverConn) {
      this.serverConn.disconnect();
      this.serverConn = null;
    }
    if (this.app) {
      this.app.ticker.remove(this.renderServerEntities, this);
    }
    this.clearServerGraphics();
    this.isServerMode = false;
  }

  public createEntity(): void {
    this.serverConn?.createEntity();
  }

  public moveEntity(dx: number, dy: number): void {
    // 暂时控制 ID 为 0 的实体，可根据需要修改
    this.serverConn?.moveEntity(0, dx, dy);
  }

  private updateServerEntities(entities: ServerEntity[]): void {
    const newMap = new Map<number, ServerEntity>();
    for (const e of entities) {
      newMap.set(e.id, e);
    }
    this.serverEntities = newMap;
  }

  private renderServerEntities = (): void => {
    if (!this.app || !this.isServerMode) return;

    for (const [id, g] of this.entityGraphics) {
      if (!this.serverEntities.has(id)) {
        this.app.stage.removeChild(g);
        g.destroy();
        this.entityGraphics.delete(id);
      }
    }

    for (const [id, entity] of this.serverEntities) {
      let g = this.entityGraphics.get(id);
      if (!g) {
        g = new PIXI.Graphics();
        g.circle(0, 0, 6);
        g.fill(0x33ccff);
        this.app.stage.addChild(g);
        this.entityGraphics.set(id, g);
      }
      g.position.set(entity.x, entity.y);
    }
  };

  private clearServerGraphics(): void {
    if (!this.app) return;
    for (const g of this.entityGraphics.values()) {
      this.app.stage.removeChild(g);
      g.destroy();
    }
    this.entityGraphics.clear();
    this.serverEntities.clear();
  }
}