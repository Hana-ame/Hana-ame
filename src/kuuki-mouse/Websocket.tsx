// 验证用example
// https能连接ws啊，为啥之前不行。
// 哦，之前是非https拿不到传感器数据。

import React, { useState, useEffect, useRef } from 'react';

interface WebSocketComponentProps {
  url: string;
}

export default function WebSocketComponent({ url }: WebSocketComponentProps) {
  const [logs, setLogs] = useState<string[]>(["系统: WebSocket连接准备就绪"]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'连接中' | '已连接' | '已断开'>('连接中');
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // 添加消息到日志
  const addMessage = (msg: string) => {
    setLogs((prev: string[]) => [...prev, msg]);
  };

  // 初始化WebSocket连接
  const connectWebSocket = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionStatus('连接中');
      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        addMessage(`系统: 成功连接到 ${url}`);
        setConnectionStatus('已连接');
        reconnectAttempts.current = 0;
      };
      
      ws.current.onmessage = (event) => {
        addMessage(`接收: ${event.data}`);
      };
      
      ws.current.onclose = () => {
        addMessage('系统: 连接已关闭');
        setConnectionStatus('已断开');
        
        // 自动重连逻辑
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          addMessage(`系统: 尝试重新连接 (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          setTimeout(() => connectWebSocket(), 2000);
        }
      };
      
      ws.current.onerror = (error) => {
        addMessage('系统: 连接发生错误');
        console.error('WebSocket错误:', error);
      };
    } catch (error) {
      addMessage('系统: 创建连接失败');
      console.error('创建WebSocket失败:', error);
    }
  };

  // 发送消息
  const sendMessage = () => {
    if (inputMessage.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(inputMessage);
      addMessage(`发送: ${inputMessage}`);
      setInputMessage('');
    } else if (!inputMessage.trim()) {
    //   addMessage('系统: 不能发送空消息');
    } else {
      addMessage('系统: 连接未就绪，无法发送消息');
    }
  };

  // 断开连接
  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
      reconnectAttempts.current = maxReconnectAttempts; // 阻止自动重连
    }
  };

  // 组件挂载时建立连接
  useEffect(() => {
    connectWebSocket();
    
    // 组件卸载时清理连接
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">WebSocket连接</h2>
        <div className="flex items-center mb-2">
          <span className="mr-2">状态:</span>
          <span className={`font-semibold ${
            connectionStatus === '已连接' ? 'text-green-600' : 
            connectionStatus === '连接中' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {connectionStatus}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={connectWebSocket}
            disabled={connectionStatus === '已连接'}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-blue-300 hover:bg-blue-600"
          >
            连接
          </button>
          <button
            onClick={disconnectWebSocket}
            disabled={connectionStatus === '已断开'}
            className="px-3 py-1 bg-red-500 text-white rounded disabled:bg-red-300 hover:bg-red-600"
          >
            断开
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex mb-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="输入消息..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={connectionStatus !== '已连接' || !inputMessage.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-r disabled:bg-green-300 hover:bg-green-600"
          >
            发送
          </button>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg bg-white p-3 h-80 overflow-y-auto">
        <h3 className="font-semibold text-gray-700 mb-2">消息日志 (新消息在上方)</h3>
        <div className="text-sm space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-500">暂无消息</p>
          ) : (
            [...logs].reverse().map((log, index) => (
              <div 
                key={`${index}-${log}`} 
                className={`p-2 rounded ${
                  log.startsWith('发送') ? 'bg-blue-100' : 
                  log.startsWith('接收') ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}