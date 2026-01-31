/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// App.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  FiSend,
  FiTrash2,
  FiUser,
  FiCpu,
  FiEdit2,
  FiX,
  FiCheck,
  FiPlus,
  FiAlertCircle,
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiDatabase,
  FiHash,
  FiActivity,
  FiCopy,
  FiCheck as FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
} from "react-icons/fi";

// --- Type Definitions ---
interface TextContentPart {
  type: "text";
  text: string;
}

interface ImageContentPart {
  type: "image_url";
  image_url: {
    url: string;
  };
}

type UserContentItem = TextContentPart | ImageContentPart;
type UserMessageContent = UserContentItem[];
type AssistantMessageContent = string;

interface MessageMeta {
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  response_time?: number;
  tokens_per_second?: number;
  characters?: number;
  is_estimated?: boolean;
  finish_reason?: string | null;
  finish_message?: string;
  truncated_warning?: boolean;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: UserMessageContent | AssistantMessageContent | string;
  reasoning_content?: string;
  id?: string;
  meta?: MessageMeta;
}

interface StreamChoiceDelta {
  content?: string;
  reasoning_content?: string;
  role?: "assistant";
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
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

// LocalStorage Keys
const STORAGE_KEYS = {
  endpointUrl: "ai_chat_pro_endpoint_url",
  apiKey: "ai_chat_pro_api_key",
  jsonPayload: "ai_chat_pro_json_payload",
  chatHistory: "ai_chat_pro_chat_history",
};

// 翻译finish_reason为人类可读的提示
const getFinishReasonMessage = (reason: string | null | undefined): string => {
  if (!reason) return "";
  
  switch (reason) {
    case "stop":
      return "正常停止：模型完成了回复";
    case "length":
      return "长度限制：达到了最大token限制，回复可能不完整";
    case "content_filter":
      return "内容过滤：因内容安全策略而停止";
    case "tool_calls":
      return "工具调用：需要调用外部工具";
    case "function_call":
      return "函数调用：需要调用函数";
    default:
      return `停止原因：${reason}`;
  }
};

function App() {
  // --- Core States ---
  const [history, setHistory] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.chatHistory);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
    return [];
  });

  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 流式统计状态
  const [streamingStartTime, setStreamingStartTime] = useState<number | null>(null);
  const [currentStreamingTokens, setCurrentStreamingTokens] = useState<number>(0);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // --- Configuration States ---
  const [endpointUrl, setEndpointUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.endpointUrl) || "https://api.siliconflow.cn/v1/chat/completions";
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.apiKey) || "";
  });

  const [jsonPayload, setJsonPayload] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.jsonPayload);
    if (saved) return saved;
    return JSON.stringify({
      model: "deepseek-ai/DeepSeek-V3",
      messages: [],
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
      stream: true,
    }, null, 2);
  });

  const [jsonError, setJsonError] = useState<string | null>(null);

  // Editing States
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  // Upload States
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);

  // UI States
  const [expandedThinking, setExpandedThinking] = useState<Record<number, boolean>>({});

  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const codeBlockIdCounter = useRef(0);
  
  // 流式处理Refs（去重和累积）
  const processedContentRef = useRef<string>("");
  const processedReasoningRef = useRef<string>("");
  const tokenCountRef = useRef<number>(0);
  const finishReasonRef = useRef<string | null>(null);

  // --- Effects ---

  // Persist to LocalStorage
  useEffect(() => localStorage.setItem(STORAGE_KEYS.endpointUrl, endpointUrl), [endpointUrl]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.apiKey, apiKey), [apiKey]);
  useEffect(() => {
    if (!jsonError) localStorage.setItem(STORAGE_KEYS.jsonPayload, jsonPayload);
  }, [jsonPayload, jsonError]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history:", e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        const recentHistory = history.slice(-20);
        setHistory(recentHistory);
      }
    }
  }, [history]);

  // Sync history to JSON
  useEffect(() => {
    if (jsonError) return;
    try {
      const current = JSON.parse(jsonPayload || "{}");
      const currentMessagesStr = JSON.stringify(current.messages);
      const historyStr = JSON.stringify(history);
      if (currentMessagesStr !== historyStr) {
        current.messages = history;
        setJsonPayload(JSON.stringify(current, null, 2));
      }
    } catch (e) {
      // Ignore parse errors during auto-sync
    }
  }, [history, jsonPayload, jsonError]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading]);

  // --- Helpers ---

  const estimateTokens = (text: string): number => {
    // 改进的估算：中文按1.5字符/token，英文按4字符/token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars / 1.5 + otherChars / 4);
  };

  const calculateCurrentTokensPerSecond = () => {
    if (!streamingStartTime || currentStreamingTokens === 0) return "0.0";
    const elapsedSeconds = (Date.now() - streamingStartTime) / 1000;
    return elapsedSeconds > 0 ? (currentStreamingTokens / elapsedSeconds).toFixed(1) : "0.0";
  };

  const copyCodeToClipboard = async (code: string, codeIndex: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeIndex(codeIndex);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // --- Message Operations ---

  const deleteMessage = (index: number) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    if (editingIndex === index) setEditingIndex(null);
  };

  const startEditMessage = (index: number) => {
    const msg = history[index];
    let contentStr = "";
    if (typeof msg.content === "string") {
      contentStr = msg.content;
    } else if (Array.isArray(msg.content)) {
      contentStr = msg.content
        .filter((p): p is TextContentPart => p.type === "text")
        .map((p) => p.text)
        .join("\n");
    }
    setEditContent(contentStr);
    setEditingIndex(index);
  };

  const saveEditMessage = (index: number) => {
    const newHistory = [...history];
    const msg = newHistory[index];
    if (typeof msg.content === "string") {
      newHistory[index].content = editContent;
    } else if (Array.isArray(msg.content)) {
      const newContent: UserContentItem[] = [];
      for (const part of msg.content) {
        if (part.type === "image_url") newContent.push(part);
      }
      if (editContent.trim()) {
        newContent.unshift({ type: "text", text: editContent });
      }
      newHistory[index].content = newContent;
    }
    setHistory(newHistory);
    setEditingIndex(null);
  };

  const addSystemMessage = () => {
    setHistory([{ role: "system", content: "You are a helpful assistant.", id: `sys_${Date.now()}` }, ...history]);
  };

  const clearHistory = () => {
    stopStreaming();
    setHistory([]);
    setEditingIndex(null);
  };

  const toggleThinking = (index: number) => {
    setExpandedThinking(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // --- JSON Editor ---

  const handleJsonChange = (value: string) => {
    setJsonPayload(value);
    try {
      const parsed = JSON.parse(value);
      if (parsed.messages && Array.isArray(parsed.messages)) {
        const validMessages = parsed.messages.filter((m: any) => m.role && m.content !== undefined);
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
    if (!file) return;
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
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImageName(null);
  };

  // --- Streaming Logic ---

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
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

    const userContentParts: UserContentItem[] = [];
    if (input.trim()) userContentParts.push({ type: "text", text: input.trim() });
    if (uploadedImage) {
      userContentParts.push({ type: "image_url", image_url: { url: uploadedImage } });
    }

    const userMessage: Message = {
      role: "user",
      content: userContentParts,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      meta: {}
    };

    const newHistory = [...history, userMessage, assistantMessage];
    setHistory(newHistory);
    setInput("");
    setUploadedImage(null);
    setUploadedImageName(null);
    setIsLoading(true);
    
    // 重置统计
    setStreamingStartTime(Date.now());
    setCurrentStreamingTokens(0);
    tokenCountRef.current = 0;
    finishReasonRef.current = null;
    processedContentRef.current = "";
    processedReasoningRef.current = "";

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    let body: any;
    try {
      const basePayload = JSON.parse(jsonPayload);
      body = { ...basePayload, messages: [...history, userMessage] };
    } catch (e) {
      alert("Invalid JSON payload");
      setIsLoading(false);
      return;
    }

    const startTime = Date.now();
    let finalUsage: any = null;

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

      const response = await fetch(endpointUrl, {
        method: "POST",
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

      if (!response.body) throw new Error("Response body is null");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let doneReading = false;
      let buffer = "";
      let accumulatedContent = "";
      let accumulatedReasoning = "";

      while (!doneReading) {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        
        const { value, done } = await reader.read();
        doneReading = done;
        buffer += decoder.decode(value, { stream: !doneReading });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonData = line.substring(5).trim();
            if (jsonData === "[DONE]") {
              doneReading = true;
              break;
            }
            if (!jsonData) continue;

            try {
              const parsedChunk = JSON.parse(jsonData) as StreamChunk;
              
              if (parsedChunk.usage) finalUsage = parsedChunk.usage;
              
              if (parsedChunk.choices?.[0]) {
                const choice = parsedChunk.choices[0];
                const delta = choice.delta;
                const contentChunk = delta.content || "";
                const reasoningChunk = delta.reasoning_content || "";
                
                if (choice.finish_reason !== undefined && choice.finish_reason !== null) {
                  finishReasonRef.current = choice.finish_reason;
                }

                // 累积内容（yuanbao方式：累积后统一更新，减少重渲染）
                if (contentChunk) {
                  accumulatedContent += contentChunk;
                  const tokens = estimateTokens(contentChunk);
                  tokenCountRef.current += tokens;
                }
                if (reasoningChunk) {
                  accumulatedReasoning += reasoningChunk;
                  const tokens = estimateTokens(reasoningChunk);
                  tokenCountRef.current += tokens;
                }

                // 定期更新UI（每100ms或关键节点）
                if (contentChunk || reasoningChunk || choice.finish_reason) {
                  setCurrentStreamingTokens(tokenCountRef.current);
                  setHistory(prev => {
                    const h = [...prev];
                    const lastIdx = h.length - 1;
                    if (lastIdx >= 0 && h[lastIdx].role === "assistant") {
                      h[lastIdx].content = accumulatedContent;
                      if (accumulatedReasoning) {
                        h[lastIdx].reasoning_content = accumulatedReasoning;
                      }
                    }
                    return h;
                  });
                }
              }
            } catch (e) {
              console.warn("Parse error:", jsonData, e);
            }
          }
        }
      }

      // 流结束，更新最终统计
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const tokensPerSecond = tokenCountRef.current / (responseTime / 1000);
      
      setHistory(prev => {
        const h = [...prev];
        const lastIdx = h.length - 1;
        if (lastIdx >= 0 && h[lastIdx].role === "assistant") {
          const finishReason = finishReasonRef.current;
          const finishMessage = getFinishReasonMessage(finishReason);
          
          h[lastIdx].meta = {
            usage: {
              prompt_tokens: finalUsage?.prompt_tokens || estimateTokens(JSON.stringify(body.messages)),
              completion_tokens: finalUsage?.completion_tokens || tokenCountRef.current,
              total_tokens: finalUsage?.total_tokens || (finalUsage?.prompt_tokens || estimateTokens(JSON.stringify(body.messages))) + tokenCountRef.current,
            },
            response_time: responseTime,
            tokens_per_second: Math.round(tokensPerSecond * 100) / 100,
            characters: accumulatedContent.length,
            is_estimated: !finalUsage,
            finish_reason: finishReason,
            finish_message: finishMessage,
            truncated_warning: finishReason === "length"
          };
          
          // 如果截断，附加提示
          if (finishReason === "length") {
            h[lastIdx].content = accumulatedContent + "\n\n---\n**⚠️ 回复因达到长度限制而被截断**";
          }
        }
        return h;
      });

    } catch (error: any) {
      if (error.name === "AbortError") {
        setHistory(prev => {
          const h = [...prev];
          const lastIdx = h.length - 1;
          if (lastIdx >= 0 && h[lastIdx].role === "assistant") {
            if (!h[lastIdx].content && !h[lastIdx].reasoning_content) {
              h.pop();
            } else {
              h[lastIdx].content = (h[lastIdx].content as string) + "\n[Cancelled]";
            }
          }
          return h;
        });
      } else {
        setHistory(prev => {
          const h = [...prev];
          const lastIdx = h.length - 1;
          if (lastIdx >= 0) h[lastIdx].content = `Error: ${error.message}`;
          return h;
        });
      }
    } finally {
      setIsLoading(false);
      setStreamingStartTime(null);
      abortControllerRef.current = null;
    }
  }, [input, uploadedImage, history, jsonPayload, endpointUrl, apiKey, jsonError, isLoading, stopStreaming]);

  // --- Markdown Components (deepseek style) ---

  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeBlockId = ++codeBlockIdCounter.current;
      const codeContent = String(children).replace(/\n$/, '');
      
      if (!inline && language) {
        return (
          <div className="relative my-2 group">
            <div className="overflow-x-auto rounded-t-md border border-gray-700">
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                className="rounded-t-md text-sm m-0"
                showLineNumbers={true}
                wrapLines={false}
                customStyle={{ margin: 0, fontSize: '0.875rem', background: '#1a1a1a' }}
              >
                {codeContent}
              </SyntaxHighlighter>
            </div>
            <div className="flex justify-between items-center bg-gray-900 border border-t-0 border-gray-700 rounded-b-md px-3 py-1">
              <span className="text-xs text-gray-500">{language}</span>
              <button
                onClick={() => copyCodeToClipboard(codeContent, codeBlockId)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                {copiedCodeIndex === codeBlockId ? (
                  <>
                    <FiCheckCircle className="text-green-500" size={14} />
                    <span className="text-green-500">已复制</span>
                  </>
                ) : (
                  <>
                    <FiCopy size={14} />
                    <span>复制代码</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      }
      return <code className="px-2 py-1 bg-gray-800 rounded text-sm font-mono" {...props}>{children}</code>;
    },
    table: ({ node, children, ...props }: any) => (
      <div className="overflow-x-auto my-4 border border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-700" {...props}>{children}</table>
      </div>
    ),
    thead: ({ node, children, ...props }: any) => <thead className="bg-gray-800/80" {...props}>{children}</thead>,
    tbody: ({ node, children, ...props }: any) => <tbody className="divide-y divide-gray-700/50" {...props}>{children}</tbody>,
    tr: ({ node, children, ...props }: any) => <tr className="hover:bg-gray-800/30 transition-colors" {...props}>{children}</tr>,
    th: ({ node, children, ...props }: any) => (
      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200 bg-gray-800/60 border-b border-gray-700" {...props}>{children}</th>
    ),
    td: ({ node, children, ...props }: any) => (
      <td className="px-4 py-3 text-sm text-gray-300 border-b border-gray-700/50" {...props}>{children}</td>
    ),
    blockquote: ({ node, children, ...props }: any) => (
      <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-3 italic bg-gray-800/30 rounded-r" {...props}>{children}</blockquote>
    ),
    h1: ({ node, children, ...props }: any) => <h1 className="text-2xl font-bold mt-6 mb-3 pb-2 border-b border-gray-700" {...props}>{children}</h1>,
    h2: ({ node, children, ...props }: any) => <h2 className="text-xl font-bold mt-5 mb-2" {...props}>{children}</h2>,
    h3: ({ node, children, ...props }: any) => <h3 className="text-lg font-bold mt-4 mb-2" {...props}>{children}</h3>,
    a: ({ node, children, href, ...props }: any) => (
      <a href={href} className="text-indigo-400 hover:text-indigo-300 underline hover:underline-offset-2 transition-all" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
    ),
  };

  // --- Render ---

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white font-sans">
      {/* Left Panel: Chat */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-400">AI Chat Pro</h1>
          <div className="flex items-center gap-4">
            {isLoading && streamingStartTime && (
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <FiActivity className="animate-pulse" />
                <span>{calculateCurrentTokensPerSecond()} tokens/s</span>
                <span className="text-gray-500">|</span>
                <span>{currentStreamingTokens} tokens</span>
              </div>
            )}
            <button onClick={clearHistory} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
              <FiTrash2 /> Clear All
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              <p>No messages yet. Start chatting or edit JSON directly.</p>
              <button onClick={addSystemMessage} className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm">
                + Add System Message
              </button>
            </div>
          )}

          {history.map((msg, index) => (
            <div key={msg.id || index} className="group relative">
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-3xl w-full p-4 rounded-lg ${
                  msg.role === "user" ? "bg-indigo-900/50 border border-indigo-700/50" : 
                  msg.role === "system" ? "bg-gray-800 border border-gray-600" : "bg-gray-800 border border-gray-700"
                }`}>
                  {/* Header */}
                  <div className="flex justify-between items-center mb-2 opacity-70 text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      {msg.role === "user" ? <FiUser /> : msg.role === "system" ? <FiSettings /> : <FiCpu />}
                      {msg.role}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditMessage(index)} className="text-gray-400 hover:text-white" title="Edit">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => deleteMessage(index)} className="text-red-400 hover:text-red-300" title="Delete">
                        <FiX size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  {editingIndex === index ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm min-h-[100px] focus:border-indigo-500 focus:outline-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingIndex(null)} className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">Cancel</button>
                        <button onClick={() => saveEditMessage(index)} className="px-2 py-1 text-xs bg-indigo-600 rounded hover:bg-indigo-500 flex items-center gap-1">
                          <FiCheck size={12} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm prose-invert max-none break-words">
                      {/* Thinking Process */}
                      {msg.role === "assistant" && msg.reasoning_content && (
                        <div className="mb-3">
                          <button onClick={() => toggleThinking(index)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-1 transition-colors">
                            {expandedThinking[index] ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                            Thinking Process
                            <span className="text-gray-600 ml-1">({expandedThinking[index] ? "Hide" : "Show"})</span>
                          </button>
                          {expandedThinking[index] && (
                            <div className="p-3 bg-gray-900/80 border border-gray-700 rounded-md text-sm text-gray-400 italic whitespace-pre-wrap font-mono text-xs leading-relaxed overflow-x-auto">
                              {msg.reasoning_content}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main Content */}
                      {msg.role === "assistant" ? (
                        <div className="markdown-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {msg.content as string || "▋"}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">
                          {typeof msg.content === "string" ? msg.content : 
                            (msg.content as UserContentItem[]).map((part, i) => 
                              part.type === "text" ? <p key={i} className="m-0 mb-2">{part.text}</p> :
                              <img key={i} src={part.image_url.url} alt="uploaded" className="max-h-48 rounded-lg my-2" />
                            )}
                        </div>
                      )}

                      {/* Finish Reason Alert */}
                      {msg.role === "assistant" && msg.meta?.finish_message && (
                        <div className={`mt-3 p-2 rounded-md text-sm flex items-start gap-2 ${
                          msg.meta.finish_reason === 'length' ? 'bg-yellow-900/30 border border-yellow-700/50 text-yellow-300' : 
                          msg.meta.finish_reason === 'content_filter' ? 'bg-red-900/30 border border-red-700/50 text-red-300' : 
                          'bg-blue-900/30 border border-blue-700/50 text-blue-300'
                        }`}>
                          {msg.meta.finish_reason === 'length' ? <FiAlertTriangle size={16} className="mt-0.5 flex-shrink-0" /> :
                           msg.meta.finish_reason === 'content_filter' ? <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" /> :
                           <FiInfo size={16} className="mt-0.5 flex-shrink-0" />}
                          <span>{msg.meta.finish_message}</span>
                        </div>
                      )}

                      {/* Token Stats (yuanbao style with deepseek enhancements) */}
                      {msg.role === "assistant" && msg.meta && (
                        <div className="mt-3 pt-2 border-t border-gray-700/50 text-xs text-gray-400">
                          <div className="flex items-center gap-1 mb-1">
                            <FiDatabase size={10} />
                            <span className="font-medium text-[10px] uppercase tracking-wider">STATS</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {msg.meta.tokens_per_second && msg.meta.tokens_per_second > 0 && (
                              <div className="flex items-center gap-1 bg-gray-800/50 px-1.5 py-0.5 rounded text-[10px]">
                                <FiActivity size={10} className="text-gray-500" />
                                <span className="text-gray-500">speed:</span>
                                <span className="font-medium text-green-400">{msg.meta.tokens_per_second.toFixed(1)}/s</span>
                              </div>
                            )}
                            {msg.meta.usage?.prompt_tokens && (
                              <div className="flex items-center gap-1 bg-gray-800/50 px-1.5 py-0.5 rounded text-[10px]">
                                <span className="text-gray-500">in:</span>
                                <span className="font-medium text-blue-400">{msg.meta.usage.prompt_tokens}</span>
                              </div>
                            )}
                            {msg.meta.usage?.completion_tokens && (
                              <div className="flex items-center gap-1 bg-gray-800/50 px-1.5 py-0.5 rounded text-[10px]">
                                <span className="text-gray-500">out:</span>
                                <span className="font-medium text-purple-400">{msg.meta.usage.completion_tokens}</span>
                              </div>
                            )}
                            {msg.meta.usage?.total_tokens && (
                              <div className="flex items-center gap-1 bg-gray-800/50 px-1.5 py-0.5 rounded text-[10px]">
                                <FiHash size={10} className="text-gray-500" />
                                <span className="font-medium text-yellow-400">{msg.meta.usage.total_tokens}</span>
                              </div>
                            )}
                            {msg.meta.response_time && (
                              <div className="flex items-center gap-1 bg-gray-800/50 px-1.5 py-0.5 rounded text-[10px]">
                                <FiClock size={10} className="text-gray-500" />
                                <span className="font-medium text-cyan-400">{msg.meta.response_time}ms</span>
                              </div>
                            )}
                            {msg.meta.is_estimated && (
                              <div className="flex items-center gap-1 bg-gray-800/50 px-1.5 py-0.5 rounded text-[10px] text-gray-500 italic">
                                *estimated
                              </div>
                            )}
                          </div>
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
              <button onClick={removeUploadedImage} className="text-red-400 hover:text-red-300"><FiX size={16} /></button>
            </div>
          )}
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleImageUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 text-gray-300" title="Upload Image">
              <FiPlus />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type message... (Shift+Enter for new line)"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 focus:border-indigo-500 focus:outline-none resize-none min-h-[50px] max-h-[150px]"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              disabled={isLoading}
            />
            {isLoading ? (
              <button onClick={stopStreaming} className="p-3 bg-red-600 rounded-lg hover:bg-red-700 text-white" title="Stop"><FiX /></button>
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
          <h2 className="text-lg font-semibold text-indigo-400 flex items-center gap-2"><FiEdit2 /> Configuration</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Endpoint URL</label>
              <input type="text" value={endpointUrl} onChange={(e) => setEndpointUrl(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm font-mono focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">API Key</label>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm font-mono focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-medium text-gray-400">JSON Payload</label>
              <button onClick={formatJson} className="text-xs text-indigo-400 hover:text-indigo-300">Format JSON</button>
            </div>
            <textarea
              value={jsonPayload}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`w-full h-[300px] bg-gray-900 border ${jsonError ? "border-red-500" : "border-gray-600"} rounded p-3 text-xs font-mono focus:outline-none resize-none`}
              spellCheck={false}
            />
            {jsonError && (
              <div className="mt-2 bg-red-900/50 border border-red-700 text-red-200 text-xs p-2 rounded flex items-start gap-2">
                <FiAlertCircle size={14} className="mt-0.5 shrink-0" />
                <span className="break-all">{jsonError}</span>
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded p-3 text-xs space-y-1 text-gray-400">
            <div className="flex justify-between"><span>Messages:</span><span className="text-white">{history.length}</span></div>
            <div className="flex justify-between">
              <span>Model:</span>
              <span className="text-white truncate max-w-[200px]">
                {(() => { try { return JSON.parse(jsonPayload).model || "Not set"; } catch { return "Invalid JSON"; } })()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;