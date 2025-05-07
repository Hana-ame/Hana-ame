import { useState } from "react";

interface Post {
    id: number;
    user: string;
    avatar: string;
    time: string;
    content: string;
    likes: number;
    comments: number;
    hasImage?: boolean;
}

export default function PostsTabContent() {
    // 模拟数据
    const [posts] = useState<Post[]>([
        {
            id: 1,
            user: "觉醒者群主",
            avatar: "/avatar1.jpg",
            time: "3小时前",
            content: "关于一中公庄公道20年，平等地站在景区下车去...",
            likes: 49,
            comments: 122,
            hasImage: true
        },
        {
            id: 2,
            user: "stage1st客栈",
            avatar: "/avatar2.jpg",
            time: "5小时前",
            content: "不许万境大壮，大壮士多得多好看啊 //code-Luna我懂了...",
            likes: 42,
            comments: 290
        }
    ]);

    return (
        <div className="space-y-6">
            {posts.map(post => (
                <div key={post.id} className="p-4 rounded-lg bg-white  shadow-sm">
                    {/* 用户信息行 */}
                    <div className="flex items-center gap-3 mb-3">
                        <img
                            src={post.avatar}
                            className="w-10 h-10 rounded-full border "
                            alt="用户头像"
                        />
                        <div>
                            <h3 className="font-medium ">{post.user}</h3>
                            <span className="text-sm text-gray-500 ">{post.time}</span>
                        </div>
                    </div>

                    {/* 内容区域 */}
                    <p className="text-gray-800  mb-4 leading-relaxed text-left">
                        {post.content}
                    </p>

                    {/* 互动操作栏 */}
                    <div className="flex items-center gap-6 text-gray-500 ">
                        <button className="flex items-center gap-1 hover:text-blue-500">
                            <span>▲</span> {post.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-500">
                            <span>💬</span> {post.comments}
                        </button>
                        {post.hasImage && (
                            <button className="hover:text-blue-500">查看图片</button>
                        )}
                    </div>
                </div>
            ))}
        </div>

    )
}
