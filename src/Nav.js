import React, { lazy } from 'react';


import { NavLink } from 'react-router-dom';
const Blog = lazy(() => import('./blog/Blog'));
const Browser = lazy(() => import('./browser/RequestForm'));
const NumberConverter = lazy(() => import('./calc/NumberConverter'));
const CanvasComponent = lazy(() => import('./avd/CanvasComponent'));
const FileUpload = lazy(() => import('./upload/FileUpload'));
const BiliCover = lazy(() => import('./bilicover/BiliCover'));
const GetProxyURL = lazy(() => import('./getProxyURL/GetProxyURLV2'));
const SComponent = lazy(() => import('./exhentai/Exhentai'));
const Chat = lazy(() => import('./chat/App.tsx'));
const FileUploader = lazy(() => import('./upload/FileUploader'));
const Test = lazy(() => import('./Test'));
const LatexEditor = lazy(() => import('./latex/Latex'));
const MathEditor = lazy(() => import('./latex/MathJax'));
const Pics = lazy(() => import('./pics/Pics'));
const RedirectPage = lazy(() => import('./redirect/Redirect'));
const ThreeCanvas = lazy(() => import('./threeCanvas/App.jsx'));
const Boxes = lazy(() => import('./three/boxes/App.tsx'));
const Bill = lazy(() => import('./bill/App.jsx'));
const Wxw = lazy(() => import('./oauth/Wxw.tsx'));


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
    }, {
        path: "/3d-boxes",
        element: <Boxes />,
        title: "推箱子",
        visible: true,
    }, {
        path: "/bill",
        element: <Bill />,
        title: "",
        visible: false,
    }, {
        path: "/wxw",
        element: <Wxw />,
        title: "",
        visible: false,
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