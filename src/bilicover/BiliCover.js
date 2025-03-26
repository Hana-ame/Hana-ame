import React, { useEffect, useState } from 'react';
import B23 from "./B23";
import BV from "./BV";
import Live from './Live';

const BiliCover = () => {
    const [url, setUrl] = useState("");
    const [b23id, setB23id] = useState("");
    const [bvid, setBvid] = useState("");
    const [liveid, setLiveid] = useState("");

    const extractIds = (url) => {
        const b23Regex = /https?:\/\/(?:www\.)?b23\.tv\/(\w+)/;
        const bvidRegex = /https?:\/\/(?:www\.)?bilibili\.com\/video\/(\w+)/;
        const liveRegex = /https?:\/\/live\.bilibili\.com\/(\w+)/;

        const b23Match = url.match(b23Regex);
        const bvidMatch = url.match(bvidRegex);
        const liveMatch = url.match(liveRegex);

        setB23id(b23Match ? b23Match[1] : "");
        setBvid(bvidMatch ? bvidMatch[1] : "");
        setLiveid(liveMatch ? liveMatch[1] : "");
    };

    const handleChange = (e) => {
        const newUrl = e.target.value; // 获取输入的 URL
        setUrl(newUrl); // 更新输入框的 URL
        extractIds(newUrl); // 提取 ID
    };

    const handlePaste = (event) => {
        // 阻止默认事件
        event.preventDefault();
        // 获取剪贴板内容
        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedData = clipboardData.getData('Text'); // 获取文本

        setUrl(pastedData); // 更新输入框的 URL
        extractIds(pastedData); // 提取 ID
    };

    const handleMouseEnter = (event) => {
        // 在鼠标悬停时全选内容
        event.target.select();
    };

    const handleDrop = (event) => {
        event.preventDefault(); // 阻止默认行为
        const data = event.dataTransfer.getData('text'); // 获取拖拽的数据
        setUrl(data); // 将拖拽的内容设置到输入框中
        extractIds(data); // 提取 ID
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
        <div className='h-full'
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
            {b23id && <B23 id={b23id} />}
            {bvid && <BV id={bvid} />}
            {liveid && <Live id={liveid} />}
            <div>后端支持(无断):<a className="text-blue-500 hover:text-green-500 underline" href="https://bilicover.magecorn.com/help">https://bilicover.magecorn.com/help</a></div>
        </div>
    );
};

export default BiliCover;