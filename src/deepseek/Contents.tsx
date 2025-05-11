import Animated from "../components/Animated";
import { NavLink } from "react-router";

export default function Contents() {

    // 图片数据示例
    const sampleImages = Array(20).fill(0).map((_, i) => ({
        id: i + 1,
        src: `https://proxy.moonchan.xyz/seed/${i + 1}/300/200?proxy_host=picsum.photos`,
        title: `Image ${i + 1}`,
        author: `Artist ${i + 1}`
    }));

    return (<>
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-4 gap-4">
                {sampleImages.map((img, index) => (
                    <NavLink to={`/explore/${img.id}`}><Animated>
                        <div
                            key={index}
                            className="relative overflow-hidden rounded-lg transition-transform"
                        >
                            <img
                                src={img.src}
                                alt={img.title}
                                className="w-full h-full aspect-square object-cover rounded-lg"
                            />
                            {/* 可选文字覆盖层 */}
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <p className="text-white font-medium">{img.title}</p>
                            </div>
                        </div>
                    </Animated></NavLink>
                ))}
            </div>
        </div>
    </>)

}