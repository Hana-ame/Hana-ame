import React, { useEffect, useState } from 'react';
import { getProxyURL } from '@/Tools/Proxy/utils.ts'

const BiliCover = () => {
    const [url, setUrl] = useState("");
    const [proxyURL, setProxyURL] = useState("");


    const handleChange = (e) => {
        const value = e.target.value; // 获取输入的 URL
        setUrl(value); // 更新输入框的 URL
        const httpsRegex = /https:\/\/[^\s/$.?#].[^\s]*/;

        const match = url.match(httpsRegex);

        setProxyURL(getProxyURL(match ? match[0] : "")); // 提取 ID
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedData = clipboardData.getData('Text'); // 获取文本

        setUrl(pastedData); // 更新输入框的 URL
        const httpsRegex = /https:\/\/[^\s/$.?#].[^\s]*/;

        const match = url.match(httpsRegex);

        setProxyURL(getProxyURL(match ? match[0] : "")); // 提取 ID
    };

    const handleMouseEnter = (event) => {
        // 在鼠标悬停时全选内容
        event.target.select();
    };

    const handleDrop = (event) => {
        event.preventDefault(); // 阻止默认行为
        const data = event.dataTransfer.getData('text'); // 获取拖拽的数据
        setUrl(data); // 将拖拽的内容设置到输入框中
        const httpsRegex = /https:\/\/[^\s/$.?#].[^\s]*/;

        const match = url.match(httpsRegex);
        
        setProxyURL(getProxyURL(match ? match[0] : "")); // 提取 ID
    };

    const handleDragOver = (event) => {
        event.preventDefault(); // 阻止默认行为，以允许 drop 事件
    };


    useEffect(() => {
        // 添加粘贴事件监听器
        window.addEventListener('paste', handlePaste);

        // 清理事件监听器
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    });

    return (
        <div className='h-screen'
            onDrop={handleDrop} // 绑定 drop 事件
            onDragOver={handleDragOver} // 绑定 dragOver 事件
        >
            <input
                type="text"
                value={url}
                onChange={handleChange}
                onMouseEnter={handleMouseEnter} // 绑定鼠标悬停事件

                placeholder="输入 URL, 或者直接按 Ctrl+V, 或者拖动连接到此页面"
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
                type="text"
                value={proxyURL}
                onMouseEnter={handleMouseEnter} // 绑定鼠标悬停事件
                readOnly
                placeholder=""
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
        </div>
    );
};

export default BiliCover;