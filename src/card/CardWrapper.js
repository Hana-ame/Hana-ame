import React from 'react';
import { useState } from 'react';
import Card from './Card';

const CardWrapper = () => {
    const [url, setUrl] = useState("");

    return (
        <main>
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)} // 绑定 proxy_referer 变化事件
                placeholder="输入 URL"
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />

            <Card url={url} />
        </main>
    );
};

export default CardWrapper;