import React from 'react';
import { useEffect } from 'react';
import { NotificationProvider } from './contexts/NotificationContext';

import { HashRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Blog from './blog/Blog';
import Browser from './browser/RequestForm';
import NumberConverter from './calc/NumberConverter';
import CanvasComponent from './avd/CanvasComponent';
import FileUpload from './upload/FileUpload';
import BiliCover from './bilicover/BiliCover';
import GetProxyURL from './getProxyURL/GetProxyURLV2';
import Sign from './sign/Sign';
import SComponent from './exhentai/Exhentai'; // 导入处理 /s/ 路径的组件
import CardWrapper from './card/CardWrapper'
import Chat from './chat/App';
import FileUploader from './upload/FileUploader';
import Test from './Test'

const App = () => {
  const router = [
    {
      path: "/",
      element: <Blog />,
      title: "首页",
      visible: true,
    },
    {
      path: "/browser",
      element: <Browser />,
      title: "RocketMan(工事中)",
      visible: false,
    },
    {
      path: "/number-converter",
      element: <NumberConverter />,
      title: "数制转换",
      visible: true,
    },
    {
      path: "/avd",
      element: <CanvasComponent />,
      title: "AVD(工事中)",
      visible: false,
    },
    {
      path: "/upload",
      element: <FileUpload />,
      title: "上传文件",
      visible: true,
    },
    {
      path: "/bilicover",
      element: <BiliCover />,
      title: "bilibili封面",
      visible: true,
    },
    {
      path: "/get-proxy-url",
      element: <GetProxyURL />,
      title: "GetProxyURL",
      visible: true,
    },
    {
      path: "/s/*", // 匹配所有以 /s/ 开头的路径
      element: <SComponent />, // 处理这些路径的组件
      title: "S路径处理",
      visible: false,
    },
    // {
    //   path: "/gallerytorrents",
    //   element: <TComponent />, 
    //   title: "实在下不到种子的处理方法",
    //   visible: true,
    // }
    {
      path: "/card", // 匹配所有以 /s/ 开头的路径
      element: <Test />, // 处理这些路径的组件
      title: "card",
      visible: false,
    },
    {
      path: "/chat", // 匹配所有以 /s/ 开头的路径
      element: <Chat />, // 处理这些路径的组件
      title: "Chat (Groq)",
      visible: true,
    },
    {
      path: "/file-uploader",
      element: <FileUploader />,
      title: "上传文件(WSL)",
      visible: true,
    },
  ];

  // 这是啥
  const setupPushSubscription = async (registration) => {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
    });

    // 发送订阅信息到服务器
    await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });
  };

  // 在App.js中添加
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(reg => console.log('SW注册成功:', reg))
        .catch(err => console.error('SW注册失败:', err));
    }
  }, []);


  return (
    <Router>
      <div className="flex flex-col h-screen">
        <nav className="bg-blue-500 overflow-x-auto whitespace-nowrap">
          <ul className="flex h-full">
            {router.map((route) => (
              route.visible && <li key={route.path}>
                <NavLink
                  to={route.path}
                  className={({ isActive }) =>
                    isActive
                      ? 'p-4 bg-white text-blue-500 h-full flex items-center justify-center px-4'
                      : 'p-4 text-white hover:text-gray-200 h-full flex items-center justify-center px-4'
                  }
                >
                  {route.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 h-full p-1 overflow-auto">
          <Routes>
            {router.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;