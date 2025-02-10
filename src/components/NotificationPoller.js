// src/components/NotificationPoller.js

import { useEffect, useState } from 'react';
import { fetchNewMessages, getLatestId } from '../services/messageService';
import { decodeBase64 } from '../utils/encoding';

export default function NotificationPoller() {
  const [lastId, setLastId] = useState(() => {
    return (localStorage.getItem('lastMessageId') || '0');
  });

  const checkNotifications = async () => {
    const messages = await fetchNewMessages(lastId);
    if (messages.length > 0) {
      messages.forEach(showNotification);
      const newLastId = getLatestId(messages);
      setLastId(newLastId); 
      localStorage.setItem('lastMessageId', newLastId.toString());
    }
  };

  const showNotification = (message) => {
    if (Notification.permission === 'granted') {
      new Notification(`新消息 ${new Date((parseInt(message.id) / 65536)).toLocaleString()}`, {
        body: decodeBase64(message.payload),
        icon: '/notification-icon.png'
      });
    }
  };

  useEffect(() => {
    // 初始化权限请求
    Notification.requestPermission();
    
    // 启动轮询
    const interval = setInterval(checkNotifications, 30000);
    checkNotifications(); // 立即执行首次检查

    return () => clearInterval(interval);
  }, []);

  return null; // 不需要渲染内容
}