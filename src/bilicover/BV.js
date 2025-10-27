import React, { useState, useEffect } from 'react';
import { fetchWithProxy } from '@/Tools/Proxy/utils'
import ProxyFetch from '@/Tools/Proxy/ProxyFetch.ts'
import ImagePreview from './ImagePreview';

const BV = ({ id, text }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await (new ProxyFetch("ex.moonchan.xyz")).fetch(
                    `https://apiv2.magecorn.com/bilicover/get?type=bv&id=${id}&client=2.6.0`, 
                    {
                        method: 'GET',
                    }
                );
                if (!response.ok) {
                    throw new Error('Network response was not ok'+response.statusText.toString());
                }
                const jsonData = await response.json();

                // 如果 jsonData 不存在或不包含 url 属性，抛出错误
                if (!jsonData || !jsonData.url) {
                    throw new Error("结果中未找到 'url' 属性");
                }

                setData(jsonData.url);
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
        <ImagePreview imageUrl={data} text={text} />
    );
};

export default BV;