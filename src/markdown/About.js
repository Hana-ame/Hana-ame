// src/About.js
import React, {useState, useEffect}from 'react';
import Markdown from 'https://esm.sh/react-markdown@9'
import remarkGfm from 'remark-gfm'

const About = () => {
    const [markdown, setMarkdown] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 使用 fetch 获取远程文件
        fetch('https://raw.githubusercontent.com/mxstbr/markdown-test-file/refs/heads/master/TEST.md')
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应不正常');
                }
                return response.text();
            })
            .then(data => {
                setMarkdown(data); // 更新状态
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
        <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
    );

};

export default About;