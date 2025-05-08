import { useState } from 'react';
import { SunIcon, UserIcon } from '@heroicons/react/24/outline';
import { NavLink } from 'react-router';

// 使用接口定义对象类型
interface Artwork {
    id: number;
    title: string;
    author: string;
    likes: string;
}


export default function NijiJourneyLayout() {
    const [activeTab, setActiveTab] = useState('Explore');
    //   const [darkMode, setDarkMode] = useState(false);

    // 模拟插画数据   
    // 声明为 Artwork 数组类型
    const artworks: Artwork[] = [
        { id: 1, title: 'Smoking Man', author: 'PixivUser123', likes: '2.1k' },
        { id: 2, title: 'Schoolgirl', author: 'AnimeArt2024', likes: '1.8k' },
        { id: 3, title: 'Spirit Girl', author: 'DigitalMystic', likes: '3.4k' },
        { id: 4, title: 'White-haired Warrior', author: 'ConceptArtPro', likes: '4.2k' },
        { id: 5, title: 'Cat Paradise', author: 'NekoMaster', likes: '5.6k' },
    ];

    return (
        <div className={`min-h-screen  bg-white`}>
            <div className="flex">
                {/* 左侧导航栏 */}
                <aside className="w-64 h-screen bg-black text-white p-4 fixed">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-4">niji・journey</h1>
                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm">
                            Subscribe to start creating...
                        </button>
                    </div>

                    <nav className="space-y-4">
                        {[
                            { icon: <SunIcon />, name: 'Explore' },
                            { icon: <SunIcon />, name: 'Create' },
                            { icon: <SunIcon />, name: 'Edit' },
                            { icon: <UserIcon />, name: 'Organize' },
                            { icon: <UserIcon />, name: 'Chat' },
                        ].map((item) => (
                            <button
                                key={item.name}
                                onClick={() => setActiveTab(item.name)}
                                className={`w-full flex items-center space-x-3 p-2 rounded-lg 
                  ${activeTab === item.name ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                            >
                                <span className="w-5 h-5">{item.icon}</span>
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="border-t border-gray-700 mt-8 pt-4">
                        <div className="space-y-2">
                            <button className="flex items-center space-x-3 p-2 hover:bg-gray-800 w-full rounded-lg">
                                <SunIcon className="w-5 h-5" />
                                <span>Dark Mode</span>
                            </button>
                            <button className="flex items-center space-x-3 p-2 hover:bg-gray-800 w-full rounded-lg">
                                <UserIcon className="w-5 h-5" />
                                <span>My Account</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* 主内容区 */}
                <main className="ml-64 flex-1 p-8">
                    {/* 顶部导航 */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                placeholder="Search artworks..."
                                className="px-4 py-2 bg-gray-100 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 bg-gray-100 rounded-lg">General</button>
                                <button className="px-3 py-1 bg-gray-100 rounded-lg">Daily Theme</button>
                                <button className="px-3 py-1 bg-gray-100 rounded-lg">Tasks</button>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <UserIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* 插画网格 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {artworks.map((art) => (
                            <Item key={art.id} art={art} />
                            // <div key={art.id} className="group relative cursor-pointer"> 
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

const Item = ({ art }: { art: Artwork }) => (   
    <div key={art.id} className="group relative cursor-pointer">
        <NavLink to={art.id.toString()}>
        <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
            <img
                src={`https://picsum.photos/400?random=${art.id}`}
                alt={art.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
        </div>
        </NavLink>
        <div className="mt-2">
            <h3 className="font-medium">{art.title}</h3>
            <div className="flex justify-between text-sm text-gray-600">
                <span>@{art.author}</span>
                <div className="flex items-center space-x-2">
                    <span>❤️ {art.likes}</span>
                    <button className="p-1 hover:bg-gray-100 rounded">⭐</button>
                </div>
            </div>
        </div>
    </div>
)