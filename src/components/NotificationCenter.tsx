// src/components/NotificationCenter.tsx
import { decodeBase64 } from '../utils/encoding';

import { useState, useEffect, FC } from 'react';
import { Message } from '../@types/Message';

// 定义自定义事件类型
declare global {
  interface WindowEventMap {
    'new-notification': CustomEvent<Message>;
  }
}

const NotificationCenter: FC = () => {
  const [notifications, setNotifications] = useState<Message[]>([]);

  useEffect(() => {
    const handler = (event: CustomEvent<Message>) => {
      setNotifications(prev => [event.detail, ...prev]);
    };
    
    // 监听自定义事件
    window.addEventListener('new-notification', handler);
    return () => {
      window.removeEventListener('new-notification', handler);
    };
  }, []);

  return (
    <div className="notification-center">
      <h3>历史通知 ({notifications.length})</h3>
      {notifications.map(msg => (
        <div key={msg.id} className="notification-item">
          <div>{new Date(parseInt(msg.id)).toLocaleString()}</div>
          <div>{decodeBase64(msg.payload)}</div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;