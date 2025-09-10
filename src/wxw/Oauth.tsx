import { useState } from "react";

export default function Oauth({ client_id, redirect_uri }: { client_id: string, redirect_uri: string }) {
    const [host, setHost] = useState("wxw.moe");

    return (
        // 1. 全屏居中容器
        //    - h-screen: 高度占满整个屏幕
        //    - bg-gray-100: 设置一个浅灰色背景，让卡片更突出
        //    - flex: 启用 Flexbox 布局
        //    - items-center: 垂直居中
        //    - justify-center: 水平居中
        <div className="fixed h-screen w-full bg-gray-100 flex justify-center items-center">
            {/* 2. 内容方框 */}
            {/*    - bg-white: 白色背景 */}
            {/*    - p-8: 设置较大的内边距 (padding) */}
            {/*    - rounded-lg: 圆角 */}
            {/*    - shadow-md: 添加一个中等大小的阴影，营造“浮动”效果 */}
            {/*    - flex flex-col: 内部元素使用 Flexbox 并且垂直排列 */}
            {/*    - gap-4: 在垂直排列的元素之间添加 4 个单位的间距 */}
            {/*    - w-full max-w-sm: 宽度占满父容器，但最大宽度为 small，以防在宽屏上过大 */}
            <div className="bg-white p-8 rounded-lg shadow-md flex flex-col gap-4 w-full max-w-sm">
                <input 
                    defaultValue={host} 
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </input>
                <button 
                    onClick={() => {
                        window.location.href = `https://${host}/oauth/authorize?client_id=${encodeURIComponent(client_id)}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=read%20write%20follow%20push`;
                    }}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    登录
                </button>
            </div>
        </div>)
}