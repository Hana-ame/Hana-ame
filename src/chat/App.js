// 250210, deepseek, qwen

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // 引入 react-markdown

function App() {
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState('');
    const [temperature, setTemperature] = useState(1);
    const [maxTokens, setMaxTokens] = useState(1024);
    const [topP, setTopP] = useState(1);
    const [stop, setStop] = useState('');

    // 创建一个引用，指向历史记录容器的底部
    const messagesEndRef = useRef(null);

    // 当 history 更新时，滚动到底部
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]); // 监听 history 的变化

    const sendMessage = async () => {
        const message = {
            role: 'user',
            content: input,
        };

        const body = {
            model: 'deepseek-r1-distill-llama-70b',
            messages: [...history, message],
            temperature,
            max_completion_tokens: maxTokens,
            top_p: topP,
            stop: stop || null,
            stream: false,
        };

        try {
            const response = await fetch('https://moonchan.xyz/groq', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            setHistory([...history, message, data.choices[0].message]);
            setInput('');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return (
        <div className="flex h-full bg-gray-100">
            {/* 左侧历史记录 */}
            <div className="w-3/4 bg-white p-4 overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">历史记录</h2>
                {history.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-4 p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-50' : 'bg-green-50'
                            }`}
                    >
                        {/* 消息角色标签 */}
                        <div className="text-sm font-semibold mb-1">
                            {msg.role === 'user' ? '👤 你' : '🤖 助手'}
                        </div>
                        {/* 消息内容 */}
                        <div className="text-gray-800">
                            {msg.role === 'assistant' ? (
                                <ReactMarkdown>{msg.content}</ReactMarkdown> // 使用 ReactMarkdown 渲染
                            ) : (
                                msg.content // 用户消息直接显示
                            )}
                        </div>
                    </div>
                ))}
                {/* 用于滚动到底部的空 div */}
                <div ref={messagesEndRef} />

            </div>



            {/* 右侧参数设置和输入 */}
            <div className="w-1/4 p-4">
                <h2 className="text-lg font-bold mb-4">参数设置</h2>
                <div className="mb-4">
                    <label className="block mb-2">Temperature:</label>
                    <input
                        type="number"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Max Tokens:</label>
                    <input
                        type="number"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Top P:</label>
                    <input
                        type="number"
                        value={topP}
                        onChange={(e) => setTopP(parseFloat(e.target.value))}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Stop:</label>
                    <input
                        type="text"
                        value={stop}
                        onChange={(e) => setStop(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">输入消息:</label>
                    <textarea
                        type="text"
                        rows={7}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full p-2 border rounded"
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault(); // Prevent form submission or line break in textarea
                                sendMessage();
                            }
                        }}
                    ></textarea>
                </div>
                <div className="flex justify-between mt-4">
                    <button
                        onClick={sendMessage}
                        className="bg-blue-500 text-white p-2 rounded w-full mr-2"
                    >
                        发送
                    </button>
                    <button
                        onClick={clearHistory}
                        className="bg-red-500 text-white p-2 rounded w-full"
                    >
                        清理
                    </button>
                </div>

            </div>
        </div>
    );
}

export default App;