import { NavLink, Outlet, useParams } from "react-router";
import { useState } from 'react';

export default function ProfilePage() {
    const { id } = useParams(); // 获取路由参数[1](@ref)
    const { bannerURL, avatorURL } = { bannerURL: "https://proxy.moonchan.xyz/bfs/sycp/sanlian/image/b5dc75478ed74673a4c8116950e64b8e.jpeg?proxy_host=i0.hdslb.com", avatorURL: "https://proxy.moonchan.xyz/bfs/sycp/sanlian/image/b5dc75478ed74673a4c8116950e64b8e.jpeg?proxy_host=i0.hdslb.com" };
    // const [activeTab, setActiveTab] = useState('home');
    const [followers] = useState(1200);
    const [following] = useState(856);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Banner区域 */}
            <div className="relative h-48 rounded-t-xl"
                style={{
                    backgroundImage: bannerURL && `url(${bannerURL})`,
                }}>
                <img
                    src={avatorURL}
                    className="absolute -bottom-16 left-8 w-32 h-32 rounded-full border-4 border-white shadow-lg"
                    alt="User Avatar"
                />
            </div>

            {/* 信息展示区 */}
            <div className="mt-20 bg-white rounded-b-xl shadow-sm px-8 pt-6 pb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">@{id}</h1>
                        <div className="flex space-x-6 mt-4">
                            <div>
                                <span className="block text-2xl font-bold text-gray-900">{followers}</span>
                                <span className="text-sm text-gray-500">Followers</span>
                            </div>
                            <div>
                                <span className="block text-2xl font-bold text-gray-900">{following}</span>
                                <span className="text-sm text-gray-500">Following</span>
                            </div>
                        </div>
                    </div>
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                        Follow
                    </button>
                </div>

                {/* 导航标签 */}
                <nav className="mt-8 border-b border-gray-200">
                    <div className="flex space-x-8">
                        {[
                            { path: "home", label: "主页" },
                            { path: "posts", label: "动态" },
                            { path: "nft", label: "NFT" }
                        ].map((tab) => (
                            <NavLink
                                key={tab.path}
                                to={tab.path}
                                end  // 精确匹配[1,5](@ref)
                                className={({ isActive }) =>
                                    `pb-4 px-1 transition-colors duration-200 ${isActive
                                        ? "text-blue-500 font-medium border-b-2 border-blue-500"
                                        : "text-gray-500 hover:text-blue-500"
                                    }`
                                }
                            >
                                {tab.label}
                            </NavLink>
                        ))}
                    </div>
                </nav>


                {/* 动态内容区 */}
                <Outlet></Outlet>
            </div>
        </div>
    );
}