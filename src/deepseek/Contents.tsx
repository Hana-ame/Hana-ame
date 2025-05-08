
export default function Contents() {

    // 图片数据示例
    const sampleImages = Array(20).fill(0).map((_, i) => ({
        id: i + 1,
        url: `https://proxy.moonchan.xyz/300/200?random=${i}&proxy_host=picsum.photos`,
        title: `Image ${i + 1}`,
        author: `Artist ${i + 1}`
    }));

    return (<>
        {/* 右侧内容区 - 四列图片展示 */}
        <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sampleImages.map((image) => (
                    <div key={image.id} className="rounded overflow-hidden shadow hover:shadow-lg transition-shadow">
                        <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                            <h4 className="font-medium">{image.title}</h4>
                            <p className="text-sm text-gray-600">by {image.author}</p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    </>)

}