// App.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiSend, FiTrash2, FiUser, FiCpu, FiEdit2, FiX, FiCheck, FiPlus, FiAlertCircle, FiSettings } from 'react-icons/fi';

// --- Type Definitions ---
interface TextContentPart {
    type: 'text';
    text: string;
}

interface ImageContentPart {
    type: 'image_url';
    image_url: {
        url: string;
    };
}

type UserContentItem = TextContentPart | ImageContentPart;
type UserMessageContent = UserContentItem[];
type AssistantMessageContent = string;

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: UserMessageContent | AssistantMessageContent | string;
}

interface StreamChoiceDelta {
    content?: string;
    role?: 'assistant';
}

interface StreamChoice {
    delta: StreamChoiceDelta;
    finish_reason?: string | null;
    index: number;
}

interface StreamChunk {
    id?: string;
    object?: string;
    created?: number;
    model?: string;
    choices: StreamChoice[];
}

function App() {
    // --- Core States ---
    const [history, setHistory] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // --- New Configuration States ---
    const [endpointUrl, setEndpointUrl] = useState<string>('https://api.siliconflow.cn/v1/chat/completions');
    const [apiKey, setApiKey] = useState<string>('');
    
    // JSON Editor State
    const [jsonPayload, setJsonPayload] = useState<string>('');
    const [jsonError, setJsonError] = useState<string | null>(null);
    
    // Editing States
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editContent, setEditContent] = useState<string>('');

    // Upload States (保留图片上传功能)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Initialize default JSON payload
    useEffect(() => {
        const defaultPayload = {
            model: "deepseek-ai/DeepSeek-V3",
            messages: [],
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1,
            stream: true,
            // 可以添加其他OpenAI兼容参数
        };
        setJsonPayload(JSON.stringify(defaultPayload, null, 2));
    }, []);

    // Sync history to JSON when history changes (if not currently editing JSON manually)
    useEffect(() => {
        if (jsonError) return; // Don't overwrite if there's a syntax error being fixed
        
        try {
            const current = JSON.parse(jsonPayload || '{}');
            // Only update if messages actually differ to avoid cursor jumping
            const currentMessagesStr = JSON.stringify(current.messages);
            const historyStr = JSON.stringify(history);
            
            if (currentMessagesStr !== historyStr) {
                current.messages = history;
                setJsonPayload(JSON.stringify(current, null, 2));
            }
        } catch (e) {
            // Ignore parse errors during auto-sync
        }
    }, [history]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);

    // --- Message Operations ---
    const deleteMessage = (index: number) => {
        const newHistory = history.filter((_, i) => i !== index);
        setHistory(newHistory);
        if (editingIndex === index) {
            setEditingIndex(null);
        }
    };

    const startEditMessage = (index: number) => {
        const msg = history[index];
        let contentStr = '';
        
        if (typeof msg.content === 'string') {
            contentStr = msg.content;
        } else if (Array.isArray(msg.content)) {
            // For multimodal, extract text parts for editing
            contentStr = msg.content
                .filter((p): p is TextContentPart => p.type === 'text')
                .map(p => p.text)
                .join('\n');
        }
        
        setEditContent(contentStr);
        setEditingIndex(index);
    };

    const saveEditMessage = (index: number) => {
        const newHistory = [...history];
        const msg = newHistory[index];
        
        if (typeof msg.content === 'string') {
            newHistory[index].content = editContent;
        } else if (Array.isArray(msg.content)) {
            // Preserve image parts, update text parts
            const newContent: UserContentItem[] = [];
            let textAdded = false;
            
            for (const part of msg.content) {
                if (part.type === 'image_url') {
                    newContent.push(part);
                }
            }
            
            if (editContent.trim()) {
                newContent.unshift({ type: 'text', text: editContent });
            }
            
            newHistory[index].content = newContent;
        }
        
        setHistory(newHistory);
        setEditingIndex(null);
    };

    const addSystemMessage = () => {
        const newHistory: Message[] = [
            { role: 'system', content: 'You are a helpful assistant.' },
            ...history
        ];
        setHistory(newHistory);
    };

    // --- JSON Editor Handlers ---
    const handleJsonChange = (value: string) => {
        setJsonPayload(value);
        try {
            const parsed = JSON.parse(value);
            if (parsed.messages && Array.isArray(parsed.messages)) {
                // Validate message structure
                const validMessages = parsed.messages.filter((m: any) => 
                    m.role && (m.content !== undefined)
                );
                setHistory(validMessages);
            }
            setJsonError(null);
        } catch (e: any) {
            setJsonError(e.message);
        }
    };

    const formatJson = () => {
        try {
            const parsed = JSON.parse(jsonPayload);
            setJsonPayload(JSON.stringify(parsed, null, 2));
            setJsonError(null);
        } catch (e: any) {
            setJsonError(e.message);
        }
    };

    // --- Image Upload ---
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) {
                alert("Image size should not exceed 20MB.");
                return;
            }
            const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                alert("Invalid file type. Please upload PNG, JPEG, GIF, or WebP.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                setUploadedImageName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeUploadedImage = () => {
        setUploadedImage(null);
        setUploadedImageName(null);
    };

    // --- Streaming Logic ---
    const stopStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    const sendMessage = useCallback(async () => {
        if (!input.trim() && !uploadedImage) return;
        if (!endpointUrl) {
            alert("Please enter API Endpoint URL");
            return;
        }
        if (jsonError) {
            alert("Please fix JSON syntax error first");
            return;
        }

        if (isLoading && abortControllerRef.current) {
            stopStreaming();
            return;
        }

        // Construct user message
        const userContentParts: UserMessageContent = [];
        if (input.trim()) {
            userContentParts.push({ type: 'text', text: input.trim() });
        }
        if (uploadedImage) {
            userContentParts.push({ type: 'image_url', image_url: { url: uploadedImage } });
        }

        const userMessage: Message = { role: 'user', content: userContentParts };
        
        // Update history immediately
        const newHistory = [...history, userMessage, { role: 'assistant', content: '' }];
        setHistory(newHistory as Message[]);
        setInput('');
        setUploadedImage(null);
        setUploadedImageName(null);
        setIsLoading(true);

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Prepare request body from JSON editor, but inject current history
        let body: any;
        try {
            const basePayload = JSON.parse(jsonPayload);
            body = {
                ...basePayload,
                messages: [...history, userMessage], // Use current history + new message
            };
        } catch (e) {
            alert("Invalid JSON payload");
            setIsLoading(false);
            return;
        }

        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const response = await fetch(endpointUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
                signal,
            });

            if (!response.ok) {
                let errorContent = `API Error: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorContent += ` - ${errorData.error?.message || errorData.message || JSON.stringify(errorData)}`;
                } catch (e) {
                    const text = await response.text();
                    errorContent += ` - ${text}`;
                }
                
                setHistory(prev => {
                    const h = [...prev];
                    if (h.length > 0) h[h.length - 1].content = errorContent;
                    return h;
                });
                setIsLoading(false);
                return;
            }

            if (!response.body) throw new Error('Response body is null');
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let doneReading = false;

            while (!doneReading) {
                if (signal.aborted) {
                    throw new DOMException("Aborted", "AbortError");
                }
                const { value, done } = await reader.read();
                doneReading = done;
                const chunk = decoder.decode(value, { stream: !doneReading });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonData = line.substring(5).trim();
                        if (jsonData === '[DONE]') {
                            doneReading = true;
                            break;
                        }
                        if (!jsonData) continue;

                        try {
                            const parsedChunk = JSON.parse(jsonData) as StreamChunk;
                            let contentChunk = "";
                            
                            // Handle different stream formats (OpenAI compatible)
                            if (parsedChunk.choices && parsedChunk.choices[0]?.delta?.content) {
                                contentChunk = parsedChunk.choices[0].delta.content;
                            }
                            
                            if (contentChunk) {
                                setHistory(prev => {
                                    const h = [...prev];
                                    const lastIdx = h.length - 1;
                                    if (lastIdx >= 0 && h[lastIdx].role === 'assistant') {
                                        h[lastIdx].content = (h[lastIdx].content as string) + contentChunk;
                                    }
                                    return h;
                                });
                            }
                        } catch (e) {
                            console.warn('Parse error:', jsonData);
                        }
                    }
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                setHistory(prev => {
                    const h = [...prev];
                    const lastIdx = h.length - 1;
                    if (lastIdx >= 0 && h[lastIdx].role === 'assistant' && h[lastIdx].content === '') {
                        h.pop(); // Remove empty assistant message if cancelled immediately
                    } else if (lastIdx >= 0) {
                        h[lastIdx].content += '\n[Cancelled]';
                    }
                    return h;
                });
            } else {
                setHistory(prev => {
                    const h = [...prev];
                    const lastIdx = h.length - 1;
                    if (lastIdx >= 0) {
                        h[lastIdx].content = `Error: ${error.message}`;
                    }
                    return h;
                });
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [input, uploadedImage, history, jsonPayload, endpointUrl, apiKey, jsonError, isLoading, stopStreaming]);

    const clearHistory = () => {
        stopStreaming();
        setHistory([]);
        setEditingIndex(null);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white font-sans">
            {/* Left Panel: Chat History */}
            <div className="flex-1 flex flex-col h-full min-w-0">
                {/* Header */}
                <header className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
                    <h1 className="-xl font-bold text-indigo-400">AI Chat Pro</h1>
                    <button
                        onClick={clearHistory}
                        className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                        <FiTrash2 /> Clear All
                    </button>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {history.length === 0 && (
                        <div className="text-center text-gray-500 mt-10">
                            <p>No messages yet. Start chatting or edit JSON directly.</p>
                            <button 
                                onClick={addSystemMessage}
                                className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm"
                            >
                                + Add System Message
                            </button>
                        </div>
                    )}
                    
                    {history.map((msg, index) => (
                        <div key={index} className="group relative">
                            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-3xl w-full p-4 rounded-lg ${
                                    msg.role === 'user' ? 'bg-indigo-900/50 border border-indigo-700/50' : 
                                    msg.role === 'system' ? 'bg-gray-800 border border-gray-600' : 
                                    'bg-gray-800 border border-gray-700'
                                }`}>
                                    {/* Message Header */}
                                    <div className="flex justify-between items-center mb-2 opacity-70 text-xs uppercase tracking-wider">
                                        <span className="flex items-center gap-1">
                                            {msg.role === 'user' ? <FiUser /> : msg.role === 'system' ? <FiSettings /> : <FiCpu />}
                                            {msg.role}
                                        </span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => startEditMessage(index)}
                                                className="text-gray-400 hover:text-white"
                                                title="Edit"
                                            >
                                                <FiEdit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => deleteMessage(index)}
                                                className="text-red-400 hover:text-red-300"
                                                title="Delete"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Message Content */}
                                    {editingIndex === index ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm min-h-[100px] focus:border-indigo-500 focus:outline-none"
                                                autoFocus
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => setEditingIndex(null)}
                                                    className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={() => saveEditMessage(index)}
                                                    className="px-2 py-1 text-xs bg-indigo-600 rounded hover:bg-indigo-500 flex items-center gap-1"
                                                >
                                                    <FiCheck size={12} /> Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm prose-invert max-w-none break-words">
                                            {msg.role === 'assistant' ? (
                                                <ReactMarkdown>{(msg.content as string) || "▋"}</ReactMarkdown>
                                            ) : (
                                                <div className="whitespace-pre-wrap">
                                                    {typeof msg.content === 'string' ? (
                                                        msg.content
                                                    ) : (
                                                        (msg.content as UserContentItem[]).map((part, i) => (
                                                            part.type === 'text' ? (
                                                                <p key={i} className="m-0 mb-2">{part.text}</p>
                                                            ) : (
                                                                <img 
                                                                    key={i} 
                                                                    src={part.image_url.url} 
                                                                    alt="uploaded" 
                                                                    className="max-h-48 rounded-lg my-2"
                                                                />
                                                            )
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-700 bg-gray-800">
                    {uploadedImage && (
                        <div className="mb-2 p-2 bg-gray-700 rounded flex items-center gap-2 w-fit">
                            <img src={uploadedImage} alt="preview" className="h-10 w-10 object-cover rounded" />
                            <span className="text-xs text-gray-300 truncate max-w-[150px]">{uploadedImageName}</span>
                            <button onClick={removeUploadedImage} className="text-red-400 hover:text-red-300">
                                <FiX size={16} />
                            </button>
                        </div>
                    )}
                    
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/png, image/jpeg, image/gif, image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 text-gray-300"
                            title="Upload Image"
                        >
                            <FiPlus />
                        </button>
                        
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type message... (Shift+Enter for new line)"
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 focus:border-indigo-500 focus:outline-none resize-none min-h-[50px] max-h-[150px]"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            disabledisLoading}
                        />
                        
                        {isLoading ? (
                            <button
                                onClick={stopStreaming}
                                className="p-3 bg-red-600 rounded-lg hover:bg-red-700 text-white"
                                title="Stop"
                            >
                                <FiX />
                            </button>
                        ) : (
                            <button
                                onClick={sendMessage}
                                disabled={(!input.trim() && !uploadedImage) || !!jsonError}
                                className="p-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiSend />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel: Configuration */}
            <div className="w-full md:w-[450px] bg-gray-800 border-l border-gray-700 flex flex-col h-full">
                <div className="p-4 border-b border-gray-700 bg-gray-850">
                    <h2 className="text-lg font-semibold text-indigo-400 flex items-center gap-2">
                        <FiEdit2 /> Request Configuration
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Endpoint & Auth */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Endpoint URL</label>
                            <input
                                type="text"
                                value={endpointUrl}
                                onChange={(e) => setEndpointUrl(e.target.value)}
                                placeholder="https://api.siliconflow.cn/v1/chat/completions"
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm font-mono focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Authorization (Bearer Token)</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm font-mono focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-medium text-gray-400">JSON Payload</label>
                            <button 
                                onClick={formatJson}
                                className="text-xs text-indigo-400 hover:text-indigo-300"
                            >
                                Format JSON
                            </button>
                        </div>
                        
                        <div className="relative">
                            <textarea
                                value={jsonPayload}
                                onChange={(e) => handleJsonChange(e.target.value)}
                                className={`w-full h-[400px] bg-gray-900 border ${jsonError ? 'border-red-500' : 'border-gray-600'} rounded p-3 text-xs font-mono focus:outline-none resize-none`}
                                spellCheck={false}
                            />
                            {jsonError && (
                                <div className="absolute bottom-2 left-2 right-2 bg-red-900/90 text-red-200 text-xs p-2 rounded flex items-center gap-1">
                                    <FiAlertCircle size={12} />
                                    {jsonError}
                                </div>
                            )}
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                            * The <code>messages</code> array above will be automatically updated with the chat history on the left.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gray-900 rounded p-3 text-xs space-y-1 text-gray-400">
                        <div className="flex justify-between">
                            <span>Messages in context:</span>
                            <span className="text-white">{history.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Current model:</span>
                            <span className="text-white truncate max-w-[200px]">
                                {(() => {
                                    try {
                                        return JSON.parse(jsonPayload).model || 'Not set';
                                    } catch {
                                        return 'Invalid JSON';
                                    }
                                })()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
