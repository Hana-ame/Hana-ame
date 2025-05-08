import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from "react-router";
import User from './user/User.tsx';
import NftTabContent from './user/NFT.tsx';
import Home from './user/Home.tsx';
import PostsTabContent from './user/Posts.tsx';
import DetailsPage from './deepseek/DetailsPage.tsx';
import LayoutWithSidebar from './explore/Sidebar.tsx';
import Contents from './deepseek/Contents.tsx';
import Editor from './explore/Editor.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} >
          <Route path="explore" element={<LayoutWithSidebar />}>
            <Route index element={<Contents />} />
            <Route path="test" element={<Contents />} />
            <Route path=':id' element={<DetailsPage />} />
          </Route>
          <Route path="create" element={<LayoutWithSidebar />}>
            <Route index element={<Editor />} />
          </Route>
          <Route path="lobby" element={<App />} >
          </Route>
          <Route path="user/:id" element={<User />} >
            <Route path='home' element={<Home />}></Route>
            <Route path='posts' element={<PostsTabContent />}></Route>
            <Route path='nft' element={<NftTabContent />}></Route>
          </Route>
        </Route>
      </Routes>

    </BrowserRouter>
  </StrictMode>
)
