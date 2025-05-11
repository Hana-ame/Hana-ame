import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import User from './user/User.tsx';
import NftTabContent from './user/NFT.tsx';
import Home from './user/Home.tsx';
import PostsTabContent from './user/Posts.tsx';
import DetailsPage from './deepseek/DetailsPage.tsx';
import LayoutWithSidebar from './explore/Sidebar.tsx';
import Contents from './deepseek/Contents.tsx';
import Editor from './explore/Editor.tsx';
import StepAnimation from './deepseek/StepAnimation.jsx';
import App from './App.tsx';
import FortuneTellerAnimation from './deepseek/FortuneTellerAnimation.jsx';
import ChatInterface  from './deepseek/ChatInterface.jsx';
import AnimatedImg from './components/AnimatedImg.tsx';
import AdminLayout from './deepseek/AdminLayout.tsx';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} >
          <Route index element={<ChatInterface />} />
          <Route path="test" element={<AnimatedImg />} /> 
          <Route path="test2" element={<FortuneTellerAnimation />} />
          <Route path="explore" element={<LayoutWithSidebar />}>
            <Route index element={<Contents />} />
            {/* test for debug */}
            <Route path="test" element={<Contents />} />
            <Route path="tag/:tag" element={<Contents />} />
            <Route path=':id' element={<DetailsPage />} />
          </Route>
          <Route path='editor' element={<LayoutWithSidebar />}>
            <Route index element={<Editor />} />
          </Route>
          <Route path="create" element={<Outlet />}>
            {/* 上传处？ */}
          </Route>
          <Route path="fortune" element={<StepAnimation />} >
          </Route>
          <Route path="profile" element={<AdminLayout />} />

          <Route path="user/:id" element={<User />} >
            <Route path='home' element={<Home />} />
            <Route path='posts' element={<PostsTabContent />} />
            <Route path='nft' element={<NftTabContent />} />
          </Route>
        </Route>
      </Routes>

    </BrowserRouter>
  </StrictMode>
)
