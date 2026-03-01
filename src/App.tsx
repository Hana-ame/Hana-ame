// ============================================================
// 文件: src/App.tsx
// 用途: 主应用，集成 PixiCanvas 和 Toolbar，显示事件日志。
// 版本: 4.1.0
//    - 为 PixiController 设置空消息处理器，消除控制台警告。
// ============================================================

import React, { useState, useRef, useCallback } from "react";
import * as PIXI from "pixi.js";
import { PixiCanvas } from "./components/PixiCanvas";
import { PixiController } from "./controllers/PixiController";
import { GameController } from "./controllers/GameController";
import { Toolbar } from "./components/Toolbar";
import { plugins } from "./plugins";
import "./App.css";

function App() {
  const [eventLogs, setEventLogs] = useState<string[]>([]);
  const gameControllerRef = useRef<GameController | null>(null);
  const pixiControllerRef = useRef<PixiController | null>(null);

  // 初始化控制器
  if (!pixiControllerRef.current) {
    const pixiController = new PixiController();
    plugins.forEach((plugin) => pixiController.registerPlugin(plugin));
    // 设置空消息处理器，避免控制台警告
    pixiController.onMessageFromParent(() => {});
    pixiControllerRef.current = pixiController;
  }

  if (!gameControllerRef.current && pixiControllerRef.current) {
    const gameController = new GameController(pixiControllerRef.current, (logEntry) => {
      setEventLogs((prev) => [logEntry, ...prev.slice(0, 49)]);
    });
    gameControllerRef.current = gameController;
  }

  const handleAppInit = useCallback((app: PIXI.Application) => {
    gameControllerRef.current?.onAppInit(app);
  }, []);

  const clearLogs = () => setEventLogs([]);

  return (
    <div className="App min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">ECS 游戏服务器客户端</h1>
      <Toolbar gameController={gameControllerRef.current} onClearLogs={clearLogs} />
      <div className="flex gap-6">
        <div className="flex-1">
          <PixiCanvas
            controller={pixiControllerRef.current!}
            width={800}
            height={600}
            backgroundColor={0x1099bb}
            onAppInit={handleAppInit}
          />
        </div>
        <div className="w-80 bg-gray-800 rounded-lg p-4 overflow-auto max-h-[600px]">
          <h3 className="text-xl font-semibold mb-3">事件日志</h3>
          <ul className="space-y-1 text-sm">
            {eventLogs.map((log, index) => (
              <li key={index} className="bg-gray-700 p-2 rounded">
                {log}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;