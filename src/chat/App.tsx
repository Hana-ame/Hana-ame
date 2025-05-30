// App.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiSend, FiTrash2, FiUser, FiCpu, FiSettings, FiChevronDown, FiStopCircle, FiUpload, FiXCircle } from 'react-icons/fi';

// --- Enhanced Type Definitions for Multimodal Content ---
interface TextContentPart {
    type: 'text';
    text: string;
}

interface ImageContentPart {
    type: 'image_url';
    image_url: {
        url: string; // e.g., data:image/jpeg;base64,...
    };
}

type UserContentItem = TextContentPart | ImageContentPart;
type UserMessageContent = UserContentItem[]; // User messages can have multiple parts (text and/or image)
type AssistantMessageContent = string;      // Assistant messages are streamed text

interface Message {
    role: 'user' | 'assistant';
    content: UserMessageContent | AssistantMessageContent;
}

// Streamed chunk structure (example, adjust based on actual API)
interface StreamChoiceDelta {
    content?: string;
    role?: 'assistant'; // Usually only in the first chunk
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


interface EndpointConfig {
    id: string;
    name: string;
    url: string;
    models: { id: string; name: string }[];
    defaultModelId: string;
}

// --- Configuration for Endpoints and Models ---
const ENDPOINTS_CONFIG: EndpointConfig[] = [
    {
        id: 'moonchan/groq',
        name: 'Groq',
        url: 'https://moonchan.xyz/groq',
        models: [
            { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B' },
            { id: 'gemma2-9b-it', name: 'Gemma 2 Instruct' },
            { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
            { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
            { id: 'llama-guard-3-8b', name: 'Llama Guard 3' },
            { id: 'llama3-70b-8192', name: 'Llama 3 70B' },
            { id: 'llama3-8b-8192', name: 'Llama 3 8B' },
            { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B 128E' },
            { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B 16E' },
            { id: 'meta-llama/llama-guard-4-12b', name: 'Llama Guard 4 12B' },
            { id: 'mistral-saba-24b', name: 'Mistral Saba 24B' },
            { id: 'qwen-qwq-32b', name: 'QwQ 32B' },
            { id: 'whisper-large-v3', name: 'Whisper' },
            { id: 'whisper-large-v3-turbo', name: 'Whisper Large V3 Turbo' }
        ],
        defaultModelId: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    },
    {
        id: 'moonchan/chutes',
        name: 'Chutes',
        url: 'https://moonchan.xyz/groq?service=chutes',
        models: [
            { id: 'deepseek-ai/DeepSeek-V3-0324', name: 'DeepSeek-V3-0324' },
            { id: 'deepseek-ai/DeepSeek-Prover-V2-671B', name: 'DeepSeek-Prover-V2-671B' },
            { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek-R1' },
            { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3' },
            { id: 'tngtech/DeepSeek-R1T-Chimera', name: 'DeepSeek-R1T-Chimera' },
            { id: 'Qwen/Qwen3-235B-A22B', name: 'Qwen3-235B-A22B' },
            { id: 'Qwen/Qwen3-30B-A3B', name: 'Qwen3-30B-A3B' },
            { id: 'Qwen/Qwen3-32B', name: 'Qwen3-32B' },
            { id: 'Qwen/Qwen3-14B', name: 'Qwen3-14B' },
            { id: 'Qwen/Qwen3-8B', name: 'Qwen3-8B' },
            { id: 'Qwen/Qwen2.5-VL-32B-Instruct', name: 'Qwen2.5-VL-32B-Instruct' }, // Vision-Language model
            { id: 'chutesai/Llama-4-Maverick-17B-128E-Instruct-FP8', name: 'Llama-4-Maverick-17B-128E-Instruct-FP8' },
        ],
        defaultModelId: 'deepseek-ai/DeepSeek-V3-0324',
    },
];

function App() {
    const [history, setHistory] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [selectedEndpointId, setSelectedEndpointId] = useState<string>(ENDPOINTS_CONFIG[0].id);
    const [selectedModelId, setSelectedModelId] = useState<string>(ENDPOINTS_CONFIG[0].defaultModelId);

    const [temperature, setTemperature] = useState<number>(0.7);
    const [maxTokens, setMaxTokens] = useState<number>(65536);
    const [topP, setTopP] = useState<number>(1);
    const [stop, setStop] = useState<string>('');

    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const currentEndpoint = ENDPOINTS_CONFIG.find(ep => ep.id === selectedEndpointId) || ENDPOINTS_CONFIG[0];
    const availableModels = currentEndpoint.models;

    useEffect(() => {
        const currentEpConfig = ENDPOINTS_CONFIG.find(ep => ep.id === selectedEndpointId);
        if (currentEpConfig && !currentEpConfig.models.find(m => m.id === selectedModelId)) {
            setSelectedModelId(currentEpConfig.defaultModelId);
        }
    }, [selectedEndpointId, selectedModelId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);

    useEffect(() => {
        if (history.length > 0) {
            const lastMessage = history[history.length - 1];
            if (lastMessage.role === 'assistant' && typeof lastMessage.content === 'string' && isLoading) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [history, isLoading]);


    const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEndpointId = e.target.value;
        setSelectedEndpointId(newEndpointId);
        const newEndpointConfig = ENDPOINTS_CONFIG.find(ep => ep.id === newEndpointId);
        if (newEndpointConfig) {
            setSelectedModelId(newEndpointConfig.defaultModelId);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) { // Max 20MB (common limit for vision APIs)
                alert("Image size should not exceed 20MB.");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                alert("Invalid file type. Please upload PNG, JPEG, GIF, or WebP.");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                setUploadedImageName(file.name);
            };
            reader.readAsDataURL(file); // Reads as base64 data URL
        }
        if (fileInputRef.current) { // Reset to allow re-uploading the same file
            fileInputRef.current.value = "";
        }
    };

    const removeUploadedImage = () => {
        setUploadedImage(null);
        setUploadedImageName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const stopStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            console.log("Streaming stopped by user.");
        }
    }, []);

    const sendMessage = useCallback(async () => {
        if (!input.trim() && !uploadedImage) return;
        if (isLoading && abortControllerRef.current) {
            stopStreaming();
        }

        const userContentParts: UserMessageContent = [];
        if (input.trim()) {
            userContentParts.push({ type: 'text', text: input.trim() });
        }
        if (uploadedImage) {
            userContentParts.push({ type: 'image_url', image_url: { url: uploadedImage } });
        }

        if (userContentParts.length === 0) return;

        const userMessage: Message = { role: 'user', content: userContentParts };
        const currentHistory = history; // Capture history before adding assistant placeholder

        setHistory(prevHistory => [
            ...prevHistory,
            userMessage,
            { role: 'assistant', content: '' as AssistantMessageContent }
        ]);
        setInput('');
        setUploadedImage(null);
        setUploadedImageName(null);
        setIsLoading(true);

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const messagesForAPI = [...currentHistory, userMessage];
        
        const body = {
            model: selectedModelId,
            messages: messagesForAPI,
            temperature,
            ...(currentEndpoint.id.includes('groq') ? {} : { max_completion_tokens: maxTokens }),
            top_p: topP,
            stop: stop ? stop.split(',').map(s => s.trim()).filter(Boolean) : null,
            stream: true,
        };

        try {
            const response = await fetch(currentEndpoint.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal,
            });

            if (!response.ok) {
                let errorContent = `API Error: ${response.status} ${response.statusText}`;
                try {
                    const errorDataText = await response.text();
                    const errorData = JSON.parse(errorDataText);
                    errorContent += ` - ${errorData.error?.message || errorData.message || JSON.stringify(errorData)}`;
                } catch (e) {
                    errorContent += ` (Failed to parse error details: ${e instanceof Error ? e.message : String(e)})`;
                }
                setHistory(prev => {
                    const newHistory = [...prev];
                    if (newHistory.length > 0 && newHistory[newHistory.length - 1].role === 'assistant') {
                        newHistory[newHistory.length - 1].content = errorContent;
                    }
                    return newHistory;
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
                    throw new DOMException("Aborted by user", "AbortError");
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
                            if (parsedChunk.choices && parsedChunk.choices[0]?.delta?.content) {
                                contentChunk = parsedChunk.choices[0].delta.content;
                            }
                            if (contentChunk) {
                                setHistory(prev => {
                                    const newHistory = [...prev];
                                    const lastMsgIndex = newHistory.length - 1;
                                    if (lastMsgIndex >= 0 && newHistory[lastMsgIndex].role === 'assistant') {
                                        // Ensure content is treated as string for assistant
                                        newHistory[lastMsgIndex].content = (newHistory[lastMsgIndex].content as AssistantMessageContent) + contentChunk;
                                    }
                                    return newHistory;
                                });
                            }
                        } catch (e) {
                            console.warn('Failed to parse stream chunk JSON:', jsonData, e);
                        }
                    }
                }
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                console.log('Fetch aborted.');
                setHistory(prev => {
                    const newHistory = [...prev];
                    const lastMsgIndex = newHistory.length - 1;
                    if (lastMsgIndex >= 0 && newHistory[lastMsgIndex].role === 'assistant') {
                        if (newHistory[lastMsgIndex].content === '') {
                            return newHistory.slice(0, -1);
                        }
                        newHistory[lastMsgIndex].content += '\n[Streaming cancelled by user]';
                    }
                    return newHistory;
                });
            } else {
                console.error('Error sending message or processing stream:', error);
                const errorMessageText = `Error: ${error instanceof Error ? error.message : String(error)}`;
                setHistory(prev => {
                    const newHistory = [...prev];
                    const lastMsgIndex = newHistory.length - 1;
                    if (lastMsgIndex >= 0 && newHistory[lastMsgIndex].role === 'assistant') {
                        newHistory[lastMsgIndex].content = (newHistory[lastMsgIndex].content || "") + `\n[Error: ${errorMessageText}]`;
                    } else {
                        return [...newHistory, { role: 'assistant', content: `[Error: ${errorMessageText}]` as AssistantMessageContent }];
                    }
                    return newHistory;
                });
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [
        input, uploadedImage, isLoading, selectedModelId, history, temperature, maxTokens, topP, stop, currentEndpoint,
        setInput, setIsLoading, setHistory, stopStreaming, setUploadedImage, setUploadedImageName
    ]);

    const clearHistory = () => {
        stopStreaming();
        setHistory([]);
        setUploadedImage(null);
        setUploadedImageName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const ParameterInput: React.FC<{
        label: string; type: string; value: string | number;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        step?: string; min?: string; max?: string; showValue?: boolean;
    }> = ({ label, type, value, onChange, step, min, max, showValue = false }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1 flex justify-between">
                {label} {showValue && type === "range" && <span>({value})</span>}
            </label>
            <input
                type={type} value={value} onChange={onChange} step={step} min={min} max={max}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>
    );


    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-800 text-white font-sans">
            {/* Left Panel: Chat History & Input */}
            <div className="flex-1 flex flex-col p-4 md:p-6 bg-gray-800">
                <header className="mb-4">
                    <h1 className="text-2xl font-semibold text-indigo-400">AI Chat Interface (Streaming)</h1>
                </header>

                {/* Chat Messages */}
                <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {history.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xl p-3 rounded-xl shadow-md ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                    }`}
                            >
                                <div className="flex items-center mb-1">
                                    {msg.role === 'user' ? (
                                        <FiUser className="mr-2 text-indigo-300" />
                                    ) : (
                                        <FiCpu className="mr-2 text-green-400" />
                                    )}
                                    <span className="text-xs font-semibold">
                                        {msg.role === 'user' ? 'You' : 'Assistant'}
                                    </span>
                                </div>
                                <div className="prose prose-sm prose-invert max-w-none break-words">
                                    {msg.role === 'assistant' ? (
                                        <ReactMarkdown>{(msg.content as AssistantMessageContent) || "▋"}</ReactMarkdown>
                                    ) : (
                                        (msg.content as UserMessageContent).map((part, partIndex) => {
                                            if (part.type === 'text') {
                                                return <p key={partIndex} className="whitespace-pre-wrap my-0.5">{part.text}</p>;
                                            }
                                            if (part.type === 'image_url') {
                                                return (
                                                    <img
                                                        key={partIndex}
                                                        src={part.image_url.url}
                                                        alt="Uploaded content"
                                                        className="max-w-full sm:max-w-xs max-h-64 my-2 rounded-md object-contain bg-gray-600" // Added bg for transparent images
                                                    />
                                                );
                                            }
                                            return null;
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                    {uploadedImage && (
                        <div className="mb-3 p-2 bg-gray-750 rounded-lg flex items-center space-x-3 shadow">
                            <img
                                src={uploadedImage}
                                alt={uploadedImageName || "Preview"}
                                className="h-16 w-16 object-cover rounded-md border border-gray-600"
                            />
                            <span className="text-sm text-gray-300 truncate flex-grow max-w-[calc(100%-100px)]">
                                {uploadedImageName || 'Uploaded Image'}
                            </span>
                            <button
                                onClick={removeUploadedImage}
                                className="text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-gray-600 transition-colors"
                                title="Remove image"
                            >
                                <FiXCircle size={22} />
                            </button>
                        </div>
                    )}
                    <div className="flex items-end space-x-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none h-[58px] flex items-center justify-center transition-colors duration-150 shrink-0"
                            title="Upload Image (PNG, JPG, GIF, WebP)"
                            disabled={isLoading && !abortControllerRef.current}
                        >
                            <FiUpload size={20} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/png, image/jpeg, image/gif, image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <textarea
                            rows={3}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message or upload an image..."
                            className="flex-grow p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none custom-scrollbar min-h-[58px] max-h-[150px]"
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            disabled={isLoading && !abortControllerRef.current}
                        />
                        {isLoading && abortControllerRef.current ? (
                            <button
                                onClick={stopStreaming}
                                className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors duration-150 flex items-center justify-center h-[58px] shrink-0"
                                title="Stop Generating"
                            >
                                <FiStopCircle size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={sendMessage}
                                disabled={(!input.trim() && !uploadedImage) || (isLoading && !abortControllerRef.current)}
                                className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center h-[58px] shrink-0"
                            >
                                <FiSend size={20} />
                            </button>
                        )}
                    </div>
                    {isLoading && <p className="text-xs text-gray-400 mt-1 text-center">Assistant is typing...</p>}
                </div>
            </div>

            {/* Right Panel: Settings */}
            <div className="w-full md:w-80 lg:w-96 bg-gray-850 p-4 md:p-6 border-l border-gray-700 overflow-y-auto custom-scrollbar flex-shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-indigo-400 flex items-center">
                        <FiSettings className="mr-2" /> Settings
                    </h2>
                    <button
                        onClick={clearHistory}
                        className="text-sm text-red-400 hover:text-red-300 flex items-center"
                        title="Clear Chat History"
                        disabled={isLoading && !abortControllerRef.current}
                    >
                        <FiTrash2 className="mr-1" /> Clear Chat
                    </button>
                </div>

                <div className="mb-6">
                    <label htmlFor="endpoint-select" className="block text-sm font-medium text-gray-300 mb-1">API Endpoint</label>
                    <div className="relative">
                        <select
                            id="endpoint-select" value={selectedEndpointId} onChange={handleEndpointChange}
                            className="w-full p-2.5 border border-gray-600 rounded bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-8"
                        >
                            {ENDPOINTS_CONFIG.map(ep => (<option key={ep.id} value={ep.id}>{ep.name}</option>))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="model-select" className="block text-sm font-medium text-gray-300 mb-1">Model</label>
                    <div className="relative">
                        <select
                            id="model-select" value={selectedModelId} onChange={(e) => setSelectedModelId(e.target.value)}
                            className="w-full p-2.5 border border-gray-600 rounded bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-8"
                        >
                            {availableModels.map(model => (<option key={model.id} value={model.id}>{model.name}</option>))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <ParameterInput label="Temperature" type="range" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} step="0.01" min="0" max="2" showValue={true} />
                <ParameterInput label="Max Tokens (ignored by Groq in stream)" type="number" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))} min="1" />
                <ParameterInput label="Top P" type="range" value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))} step="0.01" min="0" max="1" showValue={true} />
                <ParameterInput label="Stop Sequence(s) (comma-sep)" type="text" value={stop} onChange={(e) => setStop(e.target.value)} />
                
                <div className="mt-6">
                    <button
                        onClick={clearHistory}
                        className="w-full bg-red-600 text-white p-2.5 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors duration-150 flex items-center justify-center"
                         disabled={isLoading && !abortControllerRef.current}
                    >
                        <FiTrash2 className="mr-2" /> Clear History
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;