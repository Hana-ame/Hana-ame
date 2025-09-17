// 导入所需的React函数和类型
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Message } from '../@types/Message';

// 定义通知上下文的类型
type NotificationContextType = {
  notifications: Message[]; // 当前的通知列表
  requestPermission: () => Promise<void>; // 请求浏览器通知权限的函数
  clearNotifications: () => void; // 清除所有通知的函数
};

// 创建一个React上下文对象，用于管理通知相关的状态和逻辑
const NotificationContext = createContext<NotificationContextType>(null!);

// 提供者组件，包裹需要使用通知功能的子组件
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // 状态：存储当前所有的通知
  const [notifications, setNotifications] = useState<Message[]>([]);
  
  // 使用ref来追踪已处理的消息ID，避免重复处理相同的消息
  const processedIds = useRef<Set<string>>(new Set());

  // 解码消息payload的回调函数
  const decodePayload = useCallback((payload: string) => {
    try {
      // 尝试解码base64编码的payload并返回
      return decodeURIComponent(escape(atob(payload)));
    } catch {
      // 如果出错，则直接返回原始的base64解码结果
      return atob(payload);
    }
  }, []);

  // 显示浏览器通知的回调函数
  const showBrowserNotification = useCallback((message: Message) => {
    if (Notification.permission === 'granted') { // 只有在获得权限后才显示通知
      new Notification('新消息', {
        body: decodePayload(message.payload), // 通知内容为解码后的消息内容
        // vibrate: [200, 100, 200] // 可选：振动模式，为设备提供振动反馈
      });
    }
  }, [decodePayload]);

  // 检查新消息的异步回调函数
  const checkNewMessages = useCallback(async () => {
    try {
      // 从API获取消息
      const res = await fetch('https://chat.moonchan.xyz/api/message/me');
      const messages: Message[] = await res.json();
      
      // 过滤掉已经处理过的消息，并只关注接收者是'me'的消息
      const newMessages = messages.filter(msg => 
        !processedIds.current.has(msg.id) && 
        msg.receiver === 'me'
      );

      // 处理新的消息
      newMessages.forEach(msg => {
        processedIds.current.add(msg.id); // 标记该消息已处理
        showBrowserNotification(msg); // 显示对应的通知
      });

      // 更新通知状态
      setNotifications(prev => [...newMessages, ...prev]);
    } catch (error) {
      console.error('获取消息失败:', error); // 错误处理
    }
  }, [showBrowserNotification]);

  // 请求通知权限的回调函数
  const requestPermission = useCallback(async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('通知权限已授权'); // 权限请求成功时的提示
    }
  }, []);

  // 清除所有通知的回调函数
  const clearNotifications = useCallback(() => {
    setNotifications([]); // 清空通知列表
    processedIds.current.clear(); // 清空已处理的消息ID集合
  }, []);

  // 使用useEffect实现轮询机制，每30秒检查一次新消息
  useEffect(() => {
    const timer = setInterval(checkNewMessages, 30000); // 设置定时器
    checkNewMessages(); // 立即执行首次检查
    
    // 清理定时器
    return () => clearInterval(timer);
  }, [checkNewMessages]);

  // 返回Provider组件，将notifications、requestPermission和clearNotifications暴露给子组件
  return (
    <NotificationContext.Provider 
      value={{ notifications, requestPermission, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

// 自定义hook，方便子组件使用上下文中的数据和方法
export const useNotifications = () => useContext(NotificationContext);