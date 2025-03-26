import React, { useEffect, useState } from 'react';
import { getProxyURL } from '@/Tools/Proxy/utils.ts';

const GetProxyURL = () => {
    const [url, setUrl] = useState("");
    const [proxyURL, setProxyURL] = useState("");
    const [proxyReferer, setProxyReferer] = useState(""); // 新的状态来存储 proxy_referer 的值


    useEffect(() => {
        const httpsRegex = /https:\/\/[^\s/$.?#].[^\s]*/; // 提取URL的正则表达式
        const updateURL = () => {
            const match = url.match(httpsRegex);
            let newProxyURL = getProxyURL(match ? match : "");

            // 如果有 proxyReferer，则将其作为参数附加到 proxyURL 上
            if (proxyReferer) {
                const refererParam = encodeURIComponent(proxyReferer);
                newProxyURL += (newProxyURL.includes('?') ? '&' : '?') + `proxy_referer=${refererParam}`;
            }

            setProxyURL(newProxyURL); // 提取并更新代理 URL
        };

        updateURL();

        return;
    }, [url, proxyReferer])

    const handleDrop = (event) => {
        event.preventDefault(); // 阻止默认行为
        const data = event.dataTransfer.getData('text'); // 获取拖拽的数据
        setUrl(data);
    };

    const handleDragOver = (event) => {
        event.preventDefault(); // 阻止默认行为，以允许 drop 事件
    };
    
    const handleMouseEnter = (event) => {
        // 在鼠标悬停时全选内容
        event.target.select();
    };

    const handlePaste = (event) => {
        event.preventDefault(); // 阻止默认粘贴行为 !important, 不加会paste两份..为啥去掉了.
        // const clipboardData = event.clipboardData || window.clipboardData; // 这是啥。
        const clipboardData = event.clipboardData;
        const data = clipboardData.getData('Text'); // 获取剪贴板中的文本
        setUrl(data);
    };

    // useEffect(() => {
    //     // 添加粘贴事件监听器
    //     window.addEventListener('paste', handlePaste);
    //     return () => {
    //         // 清理事件监听器
    //         window.removeEventListener('paste', handlePaste);
    //     };
    // }, []);

    return (
        <div className='h-full'
            onDrop={handleDrop} // 绑定 drop 事件
            onDragOver={handleDragOver} // 绑定 dragOver 事件
            // onPaste={handlePaste}
        >
            <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value) }} // 绑定输入框变化事件
                onMouseEnter={handleMouseEnter} // 绑定鼠标悬停事件
                placeholder="输入 URL, 或者直接按 Ctrl+V, 或者拖动连接到此页面"
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                // onPaste={handlePaste}
                // onPaste={()=>{}}
                // readOnly
            />
            <input
                type="text"
                value={proxyReferer}
                onChange={(e) => { setProxyReferer(e.target.value) }} // 绑定 proxy_referer 变化事件
                onMouseEnter={handleMouseEnter} // 绑定鼠标悬停事件
                placeholder="输入 referer URL"
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
                type="text"
                value={proxyURL}
                onMouseEnter={handleMouseEnter} // 绑定鼠标悬停事件
                readOnly
                placeholder="GPT是我爹"
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
        </div>
    );
};

export default GetProxyURL;