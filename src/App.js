// src/App.js
import React from 'react';
import { HashRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Blog from './blog/Blog';
import Browser from './browser/Browser';
import NumberConverter from './calc/NumberConverter';
import CanvasComponent from './avd/CanvasComponent';
import FileUpload from './upload/FileUpload';
import BiliCover from './bilicover/BiliCover';
import Sign from './sign/Sign';

const App = () => {
  const router = [
    {
      path: "/",
      element: <Blog />,
      title: "首页"
    },
    {
      path: "/browser",
      element: <Browser />,
      title: "关于我们"
    },
    {
      path: "/number-converter",
      element: <NumberConverter />,
      title: "数制转换"
    },
    {
      path: "/avd",
      element: <CanvasComponent />,
      title: "AVD"
    },
    {
      path: "/upload",
      element: <FileUpload />,
      title: "上传文件"
    },
    {
      path: "/bilicover",
      element: <BiliCover />,
      title: "bilibili封面"
    },
    {
      path: "/sign",
      element: <Sign />,
      title: "sign"
    }
  ];

  return (
    <Router>
      <div className="flex flex-col"> {/* 使用 h-screen 确保占满整个视口高度 */}
        <nav className="bg-blue-500 overflow-x-auto whitespace-nowrap">
          <ul className="flex h-full">
            {router.map((route) => (
              <li key={route.path}>
                <NavLink
                  to={route.path}
                  className={({ isActive }) =>
                    isActive
                      ? 'p-4 bg-white text-blue-500 h-full flex items-center justify-center px-4' // 高亮样式
                      : 'p-4 text-white hover:text-gray-200 h-full flex items-center justify-center px-4'
                  }
                >
                  {route.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 p-1"> {/* 使用 flex-1 使内容区域占据剩余空间 */}
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