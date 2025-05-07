import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from "react-router";
import User from './user/User.tsx';
import NftTabContent from './user/NFT.tsx';
import Home from './user/Home.tsx';
import PostsTabContent from './user/Posts.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} > 
        </Route>
        <Route path="/explor" element={<App />} > 
        </Route>
        <Route path="/lobby" element={<App />} > 
        </Route>
        <Route path="/user/:id" element={<User />} >
          <Route path='home' element={<Home />}></Route>
          <Route path='posts' element={<PostsTabContent />}></Route>
          <Route path='nft' element={<NftTabContent />}></Route>
        </Route>
      </Routes>

    </BrowserRouter>
  </StrictMode>,
)
