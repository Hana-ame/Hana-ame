// 用来测试CORS的，没啥问题，已经好了。

import React, { useState, useEffect } from 'react';

function DataFetcher() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 使用 fetch 获取远程文件
        fetch('https://upload.moonchan.xyz/api/01LLWEUU2IA2JHY4T4LZBYNZUS2PEVYHTR/Readme.txt')
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应不正常');
                }
                return response.text();
            })
            .then(data => {
                setData(data); // 更新状态
                setLoading(false); // 设置加载状态为 false
            })
            .catch(error => {
                setError(error); // 捕获错误
                setLoading(false); // 设置加载状态为 false
            });
    }, []); // 空依赖数组确保只在组件挂载时运行

    // 根据状态渲染内容
    if (loading) {
        return <div>加载中...</div>;
    }

    if (error) {
        return <div>错误: {error.message}</div>;
    }

    return (
        <div>
            <h1>获取的数据:</h1>
            <pre>{data}</pre> {/* 格式化显示数据 */}
        </div>
    );
}

export default DataFetcher;