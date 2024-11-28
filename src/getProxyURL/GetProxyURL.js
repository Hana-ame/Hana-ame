import React, { useEffect, useState } from 'react';
import { getProxyURL } from '@/Tools/Proxy/utils.ts';

const GetProxyURL = () => {
    const [url, setUrl] = useState("");
    const [proxyURL, setProxyURL] = useState("");
    const httpsRegex = /https:\/\/[^\s/$.?#].[^\s]*/; // 提取URL的正则表达式

    // 统一处理函数
    const updateURL = (inputUrl) => {
        setUrl(inputUrl); // 更新输入框的 URL
        const match = inputUrl.match(httpsRegex);
        setProxyURL(getProxyURL(match ? match : "")); // 提取并更新代理 URL
    };

    const handleChange = (e) => {
        const value = e.target.value; // 获取输入的 URL
        updateURL(value); // 调用统一处理函数
    };

    const handlePaste = (event) => {
        event.preventDefault(); // 阻止默认粘贴行为
        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedData = clipboardData.getData('Text'); // 获取剪贴板中的文本
        updateURL(pastedData); // 调用统一处理函数
    };

    const handleDrop = (event) => {
        event.preventDefault(); // 阻止默认行为
        const data = event.dataTransfer.getData('text'); // 获取拖拽的数据
        updateURL(data); // 调用统一处理函数
    };

    const handleDragOver = (event) => {
        event.preventDefault(); // 阻止默认行为，以允许 drop 事件
    };

    useEffect(() => {
        // 添加粘贴事件监听器
        window.addEventListener('paste', handlePaste);
        return () => {
            // 清理事件监听器
            window.removeEventListener('paste', handlePaste);
        };
    }, []);

    return (
        <div className='h-screen'
            onDrop={handleDrop} // 绑定 drop 事件
            onDragOver={handleDragOver} // 绑定 dragOver 事件
        >
            <input
                type="text"
                value={url}
                onChange={handleChange} // 绑定输入框变化事件
                placeholder="输入 URL, 或者直接按 Ctrl+V, 或者拖动连接到此页面"
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
                type="text"
                value={proxyURL}
                readOnly
                placeholder="GPT是我爹"
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
        </div>
    );
};

export default GetProxyURL;