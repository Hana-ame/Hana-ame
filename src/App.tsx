import React, { lazy, Suspense } from 'react';
import { Routes, Route, Link, HashRouter } from 'react-router-dom';

// import HomePage from './pages/HomePage.tsx';
// import AboutPage from './pages/AboutPage.tsx';
// 1. 使用 lazy 动态导入页面组件
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

function App() {
  return (
    <HashRouter>
      <nav>
        <ul>
          <li>
            <Link to="/">首页</Link>
          </li>
          <li>
            <Link to="/about">关于</Link>
          </li>
        </ul>
      </nav>

      <hr />

      {/* 2. 使用 Suspense 包裹 Routes，并提供 fallback UI */}
      <Suspense fallback={<div>正在加载页面，请稍候...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;