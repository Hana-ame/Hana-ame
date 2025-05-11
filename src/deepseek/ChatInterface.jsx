import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom'; // prefetchDNS is less critical for this component
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
// import 'highlight.js/styles/github.css';

// Optional: Add an icon for the send button (e.g., from heroicons)
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M3.105 3.105a.5.5 0 01.815-.093L19.48 15.09a.5.5 0 01-.542.815L4.094 4.075a.5.5 0 01-.99-.039V3.105zM15.25 15.565a.5.5 0 01-.815.093L4.52 4.91a.5.5 0 01.542-.815l10.894 10.894a.5.5 0 01.039.99z" />
    </svg>
);

const LoadingDots = () => (
    <div className="flex space-x-1 items-center">
        <span className="sr-only">Loading...</span>
        <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
    </div>
);


export default function ChatInterface() {
    const [messages, setMessages] = useState([
        // Example initial message for context (optional)
        // { role: 'assistant', content: 'Hello! How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef(new AbortController());
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null); // For focusing input after send

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Scroll whenever messages array changes

    // Focus input on initial load (optional)
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleStreamChunk = (chunk) => {
        // 移除SSE协议前缀并解析数据
        const jsonStr = chunk.replace(/^data:\s*/, '').trim();
        if (jsonStr === '[DONE]') return;

        try {
            const data = JSON.parse(jsonStr);
            const deltaContent = data.choices[0]?.delta?.content || '';

            // 强制同步更新消息列表
            flushSync(() => {
                setMessages(prev => {
                    const lastIndex = prev.length - 1;
                    const lastMsg = prev[lastIndex];

                    return [
                        ...prev.slice(0, lastIndex),
                        {
                            ...lastMsg,
                            content: lastMsg.content + deltaContent,
                        }
                    ];
                });
            });

            // 立即触发DOM更新后执行滚动
            scrollToBottom();
        } catch (e) {
            console.error('数据解析失败:', e);
            handleStopStreaming();
        }
    };


    const handleStreamResponse = async (prompt, currentMessages) => {
        // Reset abort controller for the new request
        abortControllerRef.current = new AbortController();

        // Add a placeholder for the assistant's message with streaming indicator
        // Use flushSync to ensure this state update is applied synchronously
        // before the fetch call, making the UI feel more responsive.
        flushSync(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '',
            }]);
        });

        try {
            console.log(currentMessages)
            const response = await fetch('https://moonchan.xyz/groq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'deepseek-r1-distill-llama-70b', // Or your preferred model
                    messages: currentMessages.filter(item => item.role !== "system"),
                    // messages: [...currentMessages, { role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_completion_tokens: 1024,
                    top_p: 0.95,
                    stream: true,
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // 处理可能的分隔符，如换行
                const lines = buffer.split('\n');
                buffer = lines.pop(); // 剩余部分保留到下次处理

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    // console.log(line);
                    // 更新UI或处理数据
                    handleStreamChunk(line);
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: 'Request cancelled.',
                    isError: true
                }]);
            } else {
                console.error('Request failed:', error);
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: `Error: ${error.message}`,
                    isError: true
                }]);
            }
        } finally {
            // Update the last assistant message to turn off streaming indicator
            setIsLoading(false);
            inputRef.current?.focus(); // Re-focus input
        }
    };

    const sendMessage = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        setIsLoading(true);
        const newUserMessage = { role: 'user', content: trimmedInput };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setInput('');

        // Pass the most current messages state to the stream handler
        await handleStreamResponse(trimmedInput, updatedMessages);
    };

    const handleStopStreaming = () => {
        if (isLoading) {
            abortControllerRef.current.abort();
            setIsLoading(false);
            // Update the last assistant message to turn off streaming indicator
            inputRef.current?.focus();
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-3xl mx-auto bg-gray-50 shadow-xl">
            {/* Header */}
            <header className="flex-shrink-0 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <h1 className="text-xl font-semibold">AI Chat</h1>
            </header>

            {/* Message Area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-white">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xl px-4 py-3 rounded-2xl shadow-md break-words ${msg.role === 'user'
                                ? 'bg-blue-500 text-white rounded-br-none'
                                : msg.isError
                                    ? 'bg-red-100 text-red-700 border border-red-300 rounded-bl-none'
                                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                }`}
                        >
                            {/* For system/error messages, you might want a prefix */}
                            {msg.role === 'system' && msg.isError && <strong className="font-semibold">System: _</strong>}
                            {msg.role === 'assistant' ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                    // components={{
                                    //     code: CodeBlock, // 自定义代码块组件
                                    //     img: ResponsiveImage // 自定义图片组件
                                    // }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                            {msg.role === 'assistant' && (
                                <span className="inline-block ml-1 w-1 h-4 bg-gray-600 animate-pulse_custom align-text-bottom"></span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} className="h-px" /> {/* Invisible element for scrolling */}
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 bg-gray-100 border-t border-gray-300 p-4 shadow-top">
                {isLoading && (
                    <button
                        onClick={handleStopStreaming}
                        className="mb-2 w-full flex items-center justify-center px-4 py-2 border border-red-500 text-red-500 rounded-md
                                   hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                        </svg>
                        Stop Generating
                    </button>
                )}
                <div className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        disabled={isLoading}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder="Type your message... (Shift+Enter for new line)"
                        aria-label="Chat input"
                        className="flex-grow px-4 py-3 border border-gray-300 rounded-xl 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                   disabled:bg-gray-200 disabled:cursor-not-allowed transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        aria-label={isLoading ? "Sending message" : "Send message"}
                        className={`p-3 bg-blue-500 text-white rounded-xl
                                   hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed
                                   transition-colors duration-200 flex-shrink-0
                                   focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100`}
                    >
                        {isLoading ? ( // Show loading dots if not yet streaming
                            <LoadingDots />
                        ) : (
                            <SendIcon />
                        )}
                    </button>
                </div>
            </div>
            {/* Custom animation for the cursor */}
            <style jsx global>{`
                @keyframes pulse_custom {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .animate-pulse_custom {
                    animation: pulse_custom 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .shadow-top {
                    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
                }
            `}</style>
        </div>
    );
}