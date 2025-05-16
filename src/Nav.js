
import React from 'react';

import { NavLink } from 'react-router-dom';
import Blog from './blog/Blog';
import Browser from './browser/RequestForm';
import NumberConverter from './calc/NumberConverter';
import CanvasComponent from './avd/CanvasComponent';
import FileUpload from './upload/FileUpload';
import BiliCover from './bilicover/BiliCover';
import GetProxyURL from './getProxyURL/GetProxyURLV2';
import SComponent from './exhentai/Exhentai'; // 导入处理 /s/ 路径的组件
import Chat from './chat/App.tsx';
import FileUploader from './upload/FileUploader';
import Test from './Test'
import LatexEditor from './latex/Latex';
import MathEditor from './latex/MathJax';
import Pics from './pics/Pics';
import RedirectPage from './redirect/Redirect';
import ThreeCanvas from './threeCanvas/App.jsx';

export const router = [
    {
        path: "/blog",
        element: <Blog />,
        title: "首页",
        visible: false,
    },
    {
        path: "/browser",
        element: <Browser />,
        title: "RocketMan(工事中)",
        visible: false,
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
        visible: false,
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
    },
    // {
    //   path: "/gallerytorrents",
    //   element: <TComponent />, 
    //   title: "实在下不到种子的处理方法",
    //   visible: true,
    // }
    {
        path: "/card", // 匹配所有以 /s/ 开头的路径
        element: <Test />, // 处理这些路径的组件
        title: "card",
        visible: false,
    },
    {
        path: "/chat", // 匹配所有以 /s/ 开头的路径
        element: <Chat />, // 处理这些路径的组件
        title: "Chat (Groq)",
        visible: true,
    },
    {
        path: "/file-uploader",
        element: <FileUploader />,
        title: "上传文件(WSL)",
        visible: true,
    },
    { // 只实现了加上$$ 
        path: "/latex",
        element: <LatexEditor />,
        title: "latex",
        visible: true,
    },
    { // 这个 有点做不出来。草
        path: "/mathjax",
        element: <MathEditor />,
        title: "test",
        visible: false,
    }, {
        path: "/pics",
        element: <Pics />,
        title: "pics",
        visible: true,
    }, {
        path: "/redirect",
        element: <RedirectPage />,
        title: "重定向",
        visible: false,
    }, {
        path: "/3d-test",
        element: <ThreeCanvas />,
        title: "推箱子",
        visible: true,
    },
];


export default function Nav() {
    return (
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
    )
}