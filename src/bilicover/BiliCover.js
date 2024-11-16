import React, { useState } from 'react';
import JSONDisplay from "./JSONDisplay"
import B23 from "./B23"
import BV from "./BV"
import Live from './Live';

const BiliCover = () => {
    const [url, setUrl] = useState("https://b23.tv/X8hj6OY");
    const [b23id, setB23id] = useState("");
    const [bvid, setBvid] = useState("");
    const [liveid, setLiveid] = useState("");

    const handleChange = (e) => {
        const newUrl = e.target.value; // 获取输入的 URL
        setUrl(newUrl); // 更新输入框的 URL

        {
            // 使用正则表达式提取形如 b23.tv/sss 的连接
            const regex = /https?:\/\/(?:www\.)?b23\.tv\/(\w+)/; // 正则表达式
            const match = newUrl.match(regex); // 匹配

            if (match) {
                setB23id(match[1]); // 提取并更新状态
            }
        }

        {
            // 使用正则表达式提取形如 b23.tv/sss 的连接
            const regex = /https?:\/\/(?:www\.)?bilibili\.com\/video\/(\w+)/; // 正则表达式
            const match = newUrl.match(regex); // 匹配

            if (match) {
                setBvid(match[1]); // 提取并更新状态
            }
        }       
        
        {
            // 使用正则表达式提取形如 https://live.bilibili.com/958617?live_from=79004 的连接
            const regex = /https?:\/\/live\.bilibili\.com\/(\w+)/; // 正则表达式
            const match = newUrl.match(regex); // 匹配

            if (match) {
                setLiveid(match[1]); // 提取并更新状态
            }
        }

    };


    return (
        <div>
            <input
                type="text"
                value={url}
                onChange={handleChange}
                placeholder="输入 URL"
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            {b23id !== "" && <B23 id={b23id} />}
            {bvid !== "" && <BV id={bvid} />}
            {liveid !== "" && <Live id={liveid} />}
        </div>
    );
};

export default BiliCover;