// gemini 2.5pro 0506

// App.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiSend, FiTrash2, FiUser, FiCpu, FiSettings, FiChevronDown } from 'react-icons/fi'; // Example icons

// --- Type Definitions ---
interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatCompletionChoice {
    message: Message;
    // Add other potential fields like finish_reason, index if needed
}

interface ChatCompletionResponse {
    choices: ChatCompletionChoice[];
    // Add other potential fields like id, created, model, usage if needed
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
            { id: 'compound-beta', name: 'Compound Beta' },
            { id: 'compound-beta-mini', name: 'Compound Beta Mini' },
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
        url: 'https://moonchan.xyz/groq?service=chutes', // Replace with actual URL
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
            { id: 'Qwen/Qwen2.5-VL-32B-Instruct', name: 'Qwen2.5-VL-32B-Instruct' },
            { id: 'chutesai/Llama-4-Maverick-17B-128E-Instruct-FP8', name: 'Llama-4-Maverick-17B-128E-Instruct-FP8' },
        ],
        defaultModelId: 'gpt-3.5-turbo',
    },
    // Add more endpoints here
];

function App() {
    const [history, setHistory] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // API and Model Selection
    const [selectedEndpointId, setSelectedEndpointId] = useState<string>(ENDPOINTS_CONFIG[0].id);
    const [selectedModelId, setSelectedModelId] = useState<string>(ENDPOINTS_CONFIG[0].defaultModelId);

    // Parameters
    const [temperature, setTemperature] = useState<number>(0.7); // Common default
    const [maxTokens, setMaxTokens] = useState<number>(1024);
    const [topP, setTopP] = useState<number>(1);
    const [stop, setStop] = useState<string>('');

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const currentEndpoint = ENDPOINTS_CONFIG.find(ep => ep.id === selectedEndpointId) || ENDPOINTS_CONFIG[0];
    const availableModels = currentEndpoint.models;

    useEffect(() => {
        // When endpoint changes, update model to its default if current model isn't available
        const currentEpConfig = ENDPOINTS_CONFIG.find(ep => ep.id === selectedEndpointId);
        if (currentEpConfig) {
            if (!currentEpConfig.models.find(m => m.id === selectedModelId)) {
                setSelectedModelId(currentEpConfig.defaultModelId);
            }
        }
    }, [selectedEndpointId, selectedModelId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);

    const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEndpointId = e.target.value;
        setSelectedEndpointId(newEndpointId);
        const newEndpointConfig = ENDPOINTS_CONFIG.find(ep => ep.id === newEndpointId);
        if (newEndpointConfig) {
            setSelectedModelId(newEndpointConfig.defaultModelId); // Set to default model of new endpoint
        }
    };

    const sendMessage = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
        };

        setHistory(prevHistory => [...prevHistory, userMessage]);
        setInput('');
        setIsLoading(true);

        const body = {
            model: selectedModelId,
            messages: [...history, userMessage], // send current history + new user message
            temperature,
            max_completion_tokens: maxTokens,
            top_p: topP,
            stop: stop || null,
            stream: false, // Keep as false for simple handling
        };

        try {
            const response = await fetch(currentEndpoint.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any other necessary headers, e.g., Authorization
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.message || JSON.stringify(errorData)}`);
            }

            const data = (await response.json()) as ChatCompletionResponse;
            if (data.choices && data.choices.length > 0) {
                setHistory(prevHistory => [...prevHistory, data.choices[0].message]);
            } else {
                throw new Error('No choices returned from API');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : String(error)}`,
            };
            setHistory(prevHistory => [...prevHistory, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, selectedModelId, history, temperature, maxTokens, topP, stop, currentEndpoint.url]);


    const clearHistory = () => {
        setHistory([]);
    };

    const ParameterInput: React.FC<{
        label: string;
        type: string;
        value: string | number;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        step?: string;
        min?: string;
        max?: string;
        showValue?: boolean;
    }> = ({ label, type, value, onChange, step, min, max, showValue = false }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1 flex justify-between">
                {label} {showValue && type === "range" && <span>({value})</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                step={step}
                min={min}
                max={max}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-800 text-white font-sans">
            {/* Left Panel: Chat History & Input */}
            <div className="flex-1 flex flex-col p-4 md:p-6 bg-gray-800">
                <header className="mb-4">
                    <h1 className="text-2xl font-semibold text-indigo-400">AI Chat Interface</h1>
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
                                <div className="prose prose-sm prose-invert max-w-none">
                                    {msg.role === 'assistant' ? (
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-start space-x-3">
                        <textarea
                            rows={3}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-grow p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none custom-scrollbar"
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center h-[58px]" // Match textarea height approx.
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <FiSend size={20} />
                            )}
                        </button>
                    </div>
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
                    >
                        <FiTrash2 className="mr-1" /> Clear Chat
                    </button>
                </div>

                {/* Endpoint Selection */}
                <div className="mb-6">
                    <label htmlFor="endpoint-select" className="block text-sm font-medium text-gray-300 mb-1">API Endpoint</label>
                    <div className="relative">
                        <select
                            id="endpoint-select"
                            value={selectedEndpointId}
                            onChange={handleEndpointChange}
                            className="w-full p-2.5 border border-gray-600 rounded bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-8"
                        >
                            {ENDPOINTS_CONFIG.map(ep => (
                                <option key={ep.id} value={ep.id}>{ep.name}</option>
                            ))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Model Selection */}
                <div className="mb-6">
                    <label htmlFor="model-select" className="block text-sm font-medium text-gray-300 mb-1">Model</label>
                    <div className="relative">
                        <select
                            id="model-select"
                            value={selectedModelId}
                            onChange={(e) => setSelectedModelId(e.target.value)}
                            className="w-full p-2.5 border border-gray-600 rounded bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-8"
                        >
                            {availableModels.map(model => (
                                <option key={model.id} value={model.id}>{model.name}</option>
                            ))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <ParameterInput
                    label="Temperature"
                    type="range"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    step="0.01" min="0" max="2"
                    showValue={true}
                />
                <ParameterInput
                    label="Max Tokens"
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                    min="1"
                />
                <ParameterInput
                    label="Top P"
                    type="range"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    step="0.01" min="0" max="1"
                    showValue={true}
                />
                <ParameterInput
                    label="Stop Sequence(s)"
                    type="text"
                    value={stop}
                    onChange={(e) => setStop(e.target.value)}
                />
                <div className="mt-6">
                    <button
                        onClick={clearHistory}
                        className="w-full bg-red-600 text-white p-2.5 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors duration-150 flex items-center justify-center"
                    >
                        <FiTrash2 className="mr-2" /> Clear History
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;