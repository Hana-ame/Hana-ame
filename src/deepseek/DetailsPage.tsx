// pages/DetailsPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getCookie } from '../utils/getCookie';
// import { artworks } from '../data/artworks'; // 假设数据源在此

const DetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [owner, setOwner] = useState<string>();
    const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
    console.log(id);
    const navigate = useNavigate();
    const art = { id: 1, title: 'Title', author: '123', likes: '0' };

    useEffect(() => {
        fetch(`https://chat.moonchan.xyz/dapp/post/${id}/owner`).then(r => r.json()).then(r => setOwner(r.owner))
    })

    const handlePurchase = () => {
        setIsPurchasing(true)
        fetch(`https://chat.moonchan.xyz/dapp/post/${id}/owner`, {
            method: "POST",
            credentials: 'include',
            body: JSON.stringify({ username: getCookie("username") }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(r => r.json()).then(r => {
            setOwner(r.owner)
            setIsPurchasing(false)
        })
    }
    // if (!art) return <div>艺术品{id}不存在</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* 返回按钮 */}
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-gray-600 hover:text-gray-800"
            >
                ← 返回列表
            </button>

            {/* 内容区域 */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* 图片展示 */}
                <div className="bg-gray-100 rounded-xl overflow-hidden">
                    <img
                        src={`https://proxy.moonchan.xyz/seed/${id}/300/200?proxy_host=picsum.photos`}
                        alt={art.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* 文字信息 */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold">{art.title}</h1>
                    <p className="text-lg text-gray-700"><span>作者：</span>@{art.author}</p>
                    {owner && <p className="text-lg text-gray-700"><span>所有人：</span>@{owner}</p>}
                    <div className="flex items-center space-x-2">
                        <span className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            ❤️ {art.likes}
                        </span>
                        <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            收藏 ⭐
                        </button>
                        <button
                            className={`mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg 
                                        hover:bg-blue-700 transition-colors
                                        ${isPurchasing ? 'opacity-75 cursor-not-allowed' : ''}`}
                            onClick={handlePurchase}
                            disabled={isPurchasing}
                        >
                            {isPurchasing ? '购买中...' : '立即购买'}
                        </button>
                    </div>

                    <p className="text-gray-600 mt-4">
                        {/* 此处可扩展更多描述性内容 */}
                        这是一幅充满艺术感的作品，展现了作者独特的创作风格...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DetailsPage;