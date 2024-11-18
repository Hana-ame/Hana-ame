import React, { useState } from 'react';

const ImagePreview = ({ imageUrl }) => {
    const [copyMessage, setCopyMessage] = useState("");

    const copyImageUrl = () => {
        navigator.clipboard.writeText(imageUrl.replace(/^https:/, 'http:')+"\n")
            .then(() => {
                setCopyMessage("图片地址已复制: " + imageUrl.replace(/^https:/, 'http:')); // 更新状态以显示消息
                setTimeout(() => setCopyMessage(""), 3000); // 3秒后清除消息
            })
            .catch(err => {
                console.error("复制失败:", err);
                setCopyMessage("复制失败，请重试");
                setTimeout(() => setCopyMessage(""), 3000); // 3秒后清除消息
            });
    };

    return (
        <div className="flex items-center space-x-4">
            <img 
                src={imageUrl} 
                alt="预览" 
                className="w-1/2 h-auto" 
                referrerpolicy="no-referrer"
            />
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
        </div>
    );
};

export default ImagePreview;