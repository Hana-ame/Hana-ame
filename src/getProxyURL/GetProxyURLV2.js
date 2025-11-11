// 25.10.28
// fix 
// 会变成ex.moonchan.xyz

import React, { useEffect, useState } from 'react';
import { getProxyURL } from '@/Tools/Proxy/utils.ts';
import { Main } from '../App';
import Nav from '../Nav';
import { parseRootDomain } from '../Tools/shijima'
import bs58 from 'bs58'; // 引入 bs58 库

const GetProxyURL = () => {
    const [url, setUrl] = useState("");
    const [proxyURL, setProxyURL] = useState("");
    const [proxyReferer, setProxyReferer] = useState(""); // 新的状态来存储 proxy_referer 的值
    const [proxyURLBase58, setProxyURLBase58] = useState(""); // 新增：用于存储Base58编码的URL

    useEffect(() => {
        const httpsRegex = /https:\/\/[^\s/$.?#].[^\s]*/; // 提取URL的正则表达式
        const updateURL = () => {
            const match = url.match(httpsRegex);
            const originalUrl = match ? match[0] : ""; // 获取匹配到的URL字符串

            if (!originalUrl) {
                setProxyURL("");
                setProxyURLBase58("");
                return;
            }

            // --- 原有逻辑 ---
            let newProxyURL = getProxyURL(originalUrl, "proxy.moonchan.xyz");

            // 如果有 proxyReferer，则将其作为参数附加到 proxyURL 上
            if (proxyReferer) {
                const refererParam = encodeURIComponent(proxyReferer);
                newProxyURL += (newProxyURL.includes('?') ? '&' : '?') + `proxy_referer=${refererParam}`;
            }

            setProxyURL(newProxyURL); // 提取并更新代理 URL

            // --- 新增逻辑：生成Base58编码的URL ---
            try {
                // 将URL字符串转换为Buffer/Uint8Array以进行编码.
                const urlBuffer = new TextEncoder().encode(originalUrl); // 使用TextEncoder将字符串转为Uint8Array.
                const encoded = bs58.encode(urlBuffer); // 进行Base58编码
                setProxyURLBase58(`https://proxy.moonchan.xyz/?urlb=${encoded}`);
            } catch (e) {
                console.error("Failed to encode URL to Base58:", e);
                setProxyURLBase58("Base58编码出错");
            }
        };

        updateURL();

    }, [url, proxyReferer]);

    useEffect(() => {
        try {
            const parsedURL = new URL(url);

            if (parseRootDomain(parsedURL.hostname) === 'sinaimg.cn') {
                setProxyReferer("https://weibo.com/");
            }
        } catch (e) {
            console.log(e);
        }
    }, [url]);

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
        const clipboardData = event.clipboardData;
        const data = clipboardData.getData('Text'); // 获取剪贴板中的文本
        setUrl(data);
    };
    
    // 监听全局粘贴事件
    useEffect(() => {
        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, []);


    return (
        <Main><Nav />
            <div className='h-full'
                onDrop={handleDrop} // 绑定 drop 事件
                onDragOver={handleDragOver} // 绑定 dragOver 事件
            >
                <input
                    type="text"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value) }} // 绑定输入框变化事件
                    onMouseEnter={handleMouseEnter} // 绑定鼠标悬停事件
                    placeholder="输入 URL, 或者直接按 Ctrl+V, 或者拖动连接到此页面"
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
                <input
                    type="text"
                    value={proxyReferer}
                    onChange={(e) => { setProxyReferer(e.target.value) }} // 绑定 proxy_referer 变化事件
                    onMouseEnter={handleMouseEnter} // 绑定鼠标悬停事件
                    placeholder="输入 referer URL (可选)"
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
                <input
                    type="text"
                    value={proxyURL}
                    onMouseEnter={handleMouseEnter} // 绑定鼠标悬停事件
                    readOnly
                    placeholder="标准代理URL"
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
                {/* 新增的Input栏目 */}
                <input
                    type="text"
                    value={proxyURLBase58}
                    onMouseEnter={handleMouseEnter} // 绑定鼠标悬停事件
                    readOnly
                    placeholder="proxy.moonchan.xyz/?urlb=[proxy_url_base58_encoded]"
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
            </div>
        </Main>
    );
};

export default GetProxyURL;