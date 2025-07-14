import React, { Suspense } from 'react';
import { useEffect } from 'react';

import { HashRouter as Router, Route, Routes, NavLink } from 'react-router-dom';

import { router } from './Nav';
import Index from './Nav'
// import Index from './three/my-canvas/App.tsx'
// import Index from './three/example-showPicture/App.tsx'

import {
  HomeIcon,
  RocketLaunchIcon,
  ArrowsRightLeftIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  LinkIcon,
  CommandLineIcon,
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

const App = () => {

  // 在App.js中添加
  useEffect(() => {
    if ('serviceWorker' in window.navigator) {
      window.navigator.serviceWorker
        .register('/sw.js')
        .then(reg => console.log('SW注册成功:', reg))
        .catch(err => console.error('SW注册失败:', err));
    }
  }, []);


  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Router>
        <Routes>
          <Route key="index" index element={<Index />}></Route>
          <Route key="nav" path="/nav" element={<NavigationPage />}></Route>
          {router.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Router>
    </Suspense>
  );
};

export function Main({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 h-full p-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

const NavCard = ({ to, title, icon: Icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `p-6 rounded-xl transition-all duration-200
      bg-white shadow-md hover:shadow-lg
      border-2 hover:border-blue-200
      flex flex-col items-center justify-center
      ${isActive ? 'bg-blue-50 border-blue-500' : 'border-gray-100'}`
    }
  >
    <Icon className="h-12 w-12 text-blue-600 mb-4" />
    <span className="text-gray-700 font-medium text-lg">{title}</span>
  </NavLink>
);

const NavigationPage = () => {
  const visibleRoutes = router.filter(item => item.visible);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center">
        工具导航中心
      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleRoutes.map((route) => {
          let IconComponent;
          switch (route.path) {
            case '/blog':
              IconComponent = HomeIcon;
              break;
            case '/number-converter':
              IconComponent = ArrowsRightLeftIcon;
              break;
            case '/upload':
              IconComponent = CloudArrowUpIcon;
              break;
            case '/bilicover':
              IconComponent = PhotoIcon;
              break;
            case '/get-proxy-url':
              IconComponent = LinkIcon;
              break;
            case '/chat':
              IconComponent = ChatBubbleLeftRightIcon;
              break;
            case '/file-uploader':
              IconComponent = CommandLineIcon;
              break;
            case '/latex':
              IconComponent = PuzzlePieceIcon;
              break;
            case '/3d-test':
              IconComponent = CubeIcon;
              break;
            default:
              IconComponent = RocketLaunchIcon;
          }

          return (
            <NavCard
              key={route.path}
              to={route.path}
              title={route.title}
              icon={IconComponent}
            />
          );
        })}
      </div>
    </div>
  );
};


export default App;