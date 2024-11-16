import React, { useState, useEffect } from 'react';
import { fetchWithProxy } from '@/Tools/utils'
import BV from './BV';

const B23 = ({ id }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchWithProxy(
                    `https://apiv2.magecorn.com/bilicover/get?type=b23&id=${id}&client=2.6.0`, 
                    {
                        method: 'GET',
                        mode: 'no-cors',
                    }
                );
                if (!response.ok) {
                    throw new Error('Network response was not ok'+response.statusText.toString());
                }
                const jsonData = await response.json();

                // 如果 jsonData 不存在或不包含 result 属性，抛出错误
                if (!jsonData || !jsonData.result) {
                    throw new Error("结果中未找到 'result' 属性");
                }
                const urlString = jsonData.result;

                // 创建 URL 对象
                const url = new URL(urlString);

                // 获取 pathname
                const pathname = url.pathname; // 结果是 '/video/BV12s1mYcEJW'

                // 提取 'video/' 之后的部分
                const videoId = pathname.split('/video/')[1]; // 结果是 'BV12s1mYcEJW'

                setData(videoId);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <BV id={data} />
    );
};

export default B23;