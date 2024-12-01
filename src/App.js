import React from 'react';
import { HashRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Blog from './blog/Blog';
import Browser from './browser/RequestForm';
import NumberConverter from './calc/NumberConverter';
import CanvasComponent from './avd/CanvasComponent';
import FileUpload from './upload/FileUpload';
import BiliCover from './bilicover/BiliCover';
import GetProxyURL from './getProxyURL/GetProxyURL';
import Sign from './sign/Sign';
import SComponent from './exhentai/Exhentai'; // 导入处理 /s/ 路径的组件

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
      visible: true,
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
      visible: true,
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
    }
  ];

  return (
    <Router>
      <div className="flex flex-col">
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

        <div className="flex-1 p-1">
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