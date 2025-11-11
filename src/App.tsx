import React, { lazy, Suspense } from 'react';
import { Routes, Route, Link, HashRouter } from 'react-router-dom';

// import HomePage from './pages/HomePage.tsx';
// import AboutPage from './pages/AboutPage.tsx';
// 1. 使用 lazy 动态导入页面组件
const ProxyUrl = lazy(() => import('./pages/proxy_url/App.jsx'))

function App() {
  return (
    <HashRouter>

      {/* 2. 使用 Suspense 包裹 Routes，并提供 fallback UI */}
      <Suspense fallback={<div>正在加载页面，请稍候...</div>}>
        <Routes>
          <Route path="/" element={<ProxyUrl />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;