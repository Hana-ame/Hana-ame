// ============================================================
// 文件: src/components/Toolbar.tsx
// 用途: 工具栏组件，包含服务器控制和本地模拟按钮。
//       使用 Tailwind CSS 进行样式美化。
// 版本: 4.1.0
//    - 移除画圆、画矩形按钮，精简界面。
// ============================================================

import React, { useState } from 'react';
import { GameController } from '../controllers/GameController';

interface ToolbarProps {
  gameController: GameController | null;
  onClearLogs: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ gameController, onClearLogs }) => {
  const [wsUrl, setWsUrl] = useState<string>("ws://localhost:8000/ws");

  const handleConnect = () => gameController?.connectServer(wsUrl);
  const handleDisconnect = () => gameController?.disconnectServer();
  const handleCreate = () => gameController?.createEntity();
  const handleMoveUp = () => gameController?.moveEntity(0, -1);
  const handleMoveDown = () => gameController?.moveEntity(0, 1);
  const handleMoveLeft = () => gameController?.moveEntity(-1, 0);
  const handleMoveRight = () => gameController?.moveEntity(1, 0);
  const handleStartBalls = () => gameController?.startBalls();
  const handleClearCanvas = () => gameController?.clearCanvas();

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
      <div className="flex flex-wrap gap-2 items-center">
        {/* 保留清除按钮和本地模拟 */}
        <button
          onClick={handleClearCanvas}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded shadow"
        >
          清除
        </button>

        <button
          onClick={handleStartBalls}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded shadow"
        >
          本地小球
        </button>

        {/* 服务器控制区域 */}
        <div className="flex items-center gap-2 ml-4 border-l-2 border-gray-600 pl-4">
          <input
            type="text"
            value={wsUrl}
            onChange={(e) => setWsUrl(e.target.value)}
            placeholder="WebSocket URL"
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleConnect}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded shadow"
          >
            连接
          </button>
          <button
            onClick={handleDisconnect}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded shadow"
          >
            断开
          </button>
          <button
            onClick={handleCreate}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded shadow"
          >
            创建实体
          </button>
          <span className="text-white">移动(ID=0):</span>
          <button onClick={handleMoveUp} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">↑</button>
          <button onClick={handleMoveDown} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">↓</button>
          <button onClick={handleMoveLeft} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">←</button>
          <button onClick={handleMoveRight} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">→</button>
        </div>

        <button
          onClick={onClearLogs}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded shadow ml-auto"
        >
          清除日志
        </button>
      </div>
    </div>
  );
};