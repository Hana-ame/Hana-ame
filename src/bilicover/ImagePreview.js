import React, { useState } from 'react';

const ImagePreview = ({ imageUrl, text }) => {
    const [copyMessage, setCopyMessage] = useState("");
    // 新增状态：用于显示发送到月岛的操作消息
    const [moonchanMessage, setMoonchanMessage] = useState("");

    const copyImageUrl = () => {
        // 注意：这里保留了您原始代码中的 .replace(/^https:/, 'http:') 和 "\n"
        // 复制时将 https 替换为 http，并添加换行符
        navigator.clipboard.writeText(imageUrl.replace(/^https:/, 'http:') + "\n")
            .then(() => {
                setCopyMessage("图片地址已复制: " + imageUrl.replace(/^https:/, 'http:'));
                setTimeout(() => setCopyMessage(""), 3000); // 3秒后清除消息
            })
            .catch(err => {
                console.error("复制失败:", err);
                setCopyMessage("复制失败，请重试");
                setTimeout(() => setCopyMessage(""), 3000); // 3秒后清除消息
            });
    };

    const sendToMoonchan = async () => {
        setMoonchanMessage("发送中..."); // 显示加载状态

        const url = "https://moonchan.xyz/api/v2/?bid=10001";
        const headers = {
            "Content-Type": "application/json" // 指定请求体是 JSON 格式
        };

        // 将 imageUrl 和 text 作为 JSON 数据发送
        const body = JSON.stringify({
            p: imageUrl.replace(/^https:/, 'http:'), // 使用原始的 imageUrl prop
            txt: text // 使用原始的 text prop
        });

        try {
            const response = await fetch(url, {
                method: "POST", // 使用 POST 方法
                credentials: 'include',
                headers: headers,
                body: body
            });

            if (response.ok) {
                // 请求成功
                // 如果API有返回JSON数据，可以解析并使用：
                // const data = await response.json();
                setMoonchanMessage("发送成功！");
                setTimeout(() => setMoonchanMessage(""), 3000);
            } else {
                // 请求失败，获取错误信息
                const errorText = await response.text();
                console.error("发送到月岛失败响应:", response.status, response.statusText, errorText);
                setMoonchanMessage(`发送失败: ${response.status} ${response.statusText} - ${errorText.substring(0, 100)}...`); // 截取部分错误信息展示
                setTimeout(() => setMoonchanMessage(""), 5000); // 错误消息显示时间稍长
            }
        } catch (error) {
            // 网络错误或fetch本身失败
            console.error("发送到月岛时发生错误:", error);
            setMoonchanMessage(`发送失败: ${error.message}`);
            setTimeout(() => setMoonchanMessage(""), 5000);
        }
    };

    return (
        <div className="flex items-center space-x-4">
            <img
                src={imageUrl}
                alt="预览"
                className="w-1/2 h-auto"
                referrerPolicy="no-referrer" // 注意：这里是 referrerpolicy，不是 referrerpolicy
            />
            {/* 调整布局，使按钮和消息垂直排列 */}
            <div className="flex flex-col space-y-4">
                {/* 复制图片地址部分 */}
                <div>
                    <button
                        onClick={copyImageUrl}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        复制图片地址
                    </button>
                    {copyMessage && (
                        <p className="mt-2 text-green-500">{copyMessage}</p>
                    )}
                </div>

                {/* 发送到月岛部分 */}
                <div>
                    <button
                        onClick={sendToMoonchan}
                        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                    >
                        发送到月岛
                    </button>
                    {moonchanMessage && (
                        // 根据消息类型（成功/失败）显示不同颜色
                        <p className={`mt-2 ${moonchanMessage.includes('失败') ? 'text-red-500' : 'text-green-500'}`}>
                            {moonchanMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImagePreview;