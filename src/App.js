// src/App.js
import React from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './Home';
import About from './markdown/About';
import NumberConverter from './calc/NumberConverter';
import DataFetcher from './avd/DataFetcher';
import FileUpload from './upload/FileUpload';
import BiliCover from './bilicover/BiliCover';

const App = () => {
  const router = [
    {
      path: "/",
      element: <Home />,
      title: "首页"
    },
    {
      path: "/about",
      element: <About />,
      title: "关于我们"
    },
    {
      path: "/number-converter",
      element: <NumberConverter />,
      title: "数制转换"
    },
    {
      path: "/avd",
      element: <DataFetcher />,
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
      title: "Bilibili封面"
    }
  ];
  
  return (
    <Router>
      <nav className="bg-blue-500 p-4">
        <ul className="flex space-x-4">
          {router.map((route) => (
            <li key={route.path}>
              <Link to={route.path} className="text-white hover:text-gray-200">
                {route.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4">
        <Routes>
          {router.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </div>
    </Router>
  );
};

export default App;