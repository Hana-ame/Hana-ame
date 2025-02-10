// src/components/NotificationButton.js
import { useState } from 'react';

export default function NotificationButton() {
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const showNotification = () => {
    if (permission === 'granted') {
      new Notification('测试通知', {
        body: '您有一条新消息！',
        icon: '/logo192.png'
      });
    }
  };

  return (
    <div>
      <button 
        onClick={requestPermission}
        style={{ marginRight: 10 }}
      >
        授权通知权限（当前状态：{permission}）
      </button>
      
      <button 
        onClick={showNotification}
        disabled={permission !== 'granted'}
      >
        发送测试通知
      </button>
    </div>
  );
}