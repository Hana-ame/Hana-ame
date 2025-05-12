import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";
import User from './user/User.tsx';
import NftTabContent from './user/NFT.tsx';
import Home from './user/Home.tsx';
import PostsTabContent from './user/Posts.tsx';
import DetailsPage from './deepseek/DetailsPage.tsx';
import Sidebar from './components/Sidebar.tsx';
import Contents from './deepseek/Contents.tsx';
import Editor from './explore/Editor.tsx';
import StepAnimation from './deepseek/StepAnimation.jsx';
import App from './App.tsx';
import FortuneTellerAnimation from './deepseek/FortuneTellerAnimation.jsx';
import ChatInterface from './deepseek/ChatInterface.jsx';
import AdminLayout from './user/AdminLayout.tsx';
import Login from './user/Login.jsx';
import ProfileSetting from './user/ProfileSetting.jsx';
import SignUp from './user/Signup.jsx'
import Test from './deepseek/Test.jsx';
import UploadPicture from './create/UploadPicture.jsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} >
          {/* 聊天。不知道有什么用 */}
          <Route index element={<ChatInterface />} />
          <Route path="test" element={<Sidebar></Sidebar>}>
            <Route index element={<Test />}></Route>
          </Route>
          <Route path="test2" element={<FortuneTellerAnimation />} />
          {/* 游览 */}
          <Route path="explore" element={<Sidebar />}>
            <Route index element={<Contents />} />
            <Route path="pic2pic" element={<Contents />} />
            <Route path="tag/:tag" element={<Contents />} />
            <Route path='item/:id' element={<DetailsPage />} />
          </Route>
          <Route path='editor' element={<Sidebar />}>
            <Route index element={<Editor />} />
          </Route>
          {/* 创作 */}
          <Route path="create" element={<Sidebar />}>
            <Route path='upload' element={<UploadPicture />} />
            <Route path="pic2pic" element={<Contents />} />
          </Route>
          {/* 占卜 */}
          <Route path="fortune" element={<StepAnimation />} >
          </Route>
          <Route path="profile" element={<AdminLayout />}>
            <Route index element={<ProfileSetting />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<SignUp />} />

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
