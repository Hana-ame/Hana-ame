// pages/DetailsPage.tsx
import { useParams, useNavigate } from 'react-router';
// import { artworks } from '../data/artworks'; // 假设数据源在此

const DetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    console.log(id);
    const navigate = useNavigate();
    const art = { id: 1, title: 'Smoking Man', author: 'PixivUser123', likes: '2.1k' };


    if (!art) return <div>艺术品{id}不存在</div>;

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
                        src={`https://picsum.photos/800?random=${art.id}`}
                        alt={art.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* 文字信息 */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold">{art.title}</h1>
                    <p className="text-lg text-gray-700"><span>作者：</span>@{art.author}</p>
                    <div className="flex items-center space-x-2">
                        <span className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            ❤️ {art.likes}
                            </span>
                        <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            收藏 ⭐
                        </button>
                        <button
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        // onClick={handlePurchase}
                        // disabled={isPurchasing}
                        >
                            {/* {isPurchasing ? '购买中...' : '立即购买'} */}
                            购买
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