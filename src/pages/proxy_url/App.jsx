import React, { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import bs58 from 'bs58';

// 在浏览器环境中为 Buffer 提供 Polyfill
window.Buffer = window.Buffer || Buffer;

export default function App() {
    const [url, setUrl] = useState('');
    const [origin, setOrigin] = useState('');
    const [modifiedUrl, setModifiedUrl] = useState('');
    const [encodedUrl, setEncodedUrl] = useState('');

    const endpoint = 'https://proxy.moonchan.xyz';

    useEffect(() => {
        if (url) {
            try {
                const newUrl = new URL(url);
                const originalHost = newUrl.host;

                if (["wx1.sinaimg.cn", "wx2.sinaimg.cn", "wx3.sinaimg.cn", "wx4.sinaimg.cn"].includes(originalHost)) {
                    setOrigin("https://weibo.com/")
                }

                // 第三个输入框的逻辑
                const endpointUrl = new URL(endpoint);
                newUrl.host = endpointUrl.host;
                newUrl.protocol = endpointUrl.protocol;
                newUrl.port = endpointUrl.port;

                const searchParams = new URLSearchParams(newUrl.search);
                searchParams.set('proxy_host', originalHost);
                if (origin) {
                    searchParams.set('proxy_referer', origin);
                }
                newUrl.search = searchParams.toString();
                setModifiedUrl(newUrl.toString());


                // 第四个输入框的逻辑
                const finalUrl = new URL(endpoint);
                finalUrl.searchParams.set('urlb', bs58.encode(Buffer.from(url)));
                setEncodedUrl(finalUrl.toString());

            } catch (error) {
                setModifiedUrl('Invalid URL');
                setEncodedUrl('Invalid URL');
            }
        } else {
            setModifiedUrl('');
            setEncodedUrl('');
        }
    }, [url, origin]);

    // 当鼠标悬停时选择输入框内所有文本的函数
    const handleInputHover = (event) => {
        event.target.select();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '90vw', margin: 'auto' }}>
            <div>
                <label>URL:</label>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onMouseOver={handleInputHover}
                    placeholder="Enter URL"
                    style={{ width: '100%', padding: '8px' }}
                />
            </div>
            <div>
                <label>Origin:</label>
                <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    onMouseOver={handleInputHover}
                    placeholder="Enter Origin URL"
                    style={{ width: '100%', padding: '8px' }}
                />
            </div>
            <div>
                <label>Modified URL:</label>
                <input
                    type="text"
                    value={modifiedUrl}
                    readOnly
                    onMouseOver={handleInputHover}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#f0f0f0' }}
                />
            </div>
            <div>
                <label>Encoded URL:</label>
                <input
                    type="text"
                    value={encodedUrl}
                    readOnly
                    onMouseOver={handleInputHover}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#f0f0f0' }}
                />
            </div>
        </div>
    );
}