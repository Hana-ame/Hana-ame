/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// App.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
  FiHash,
  FiActivity,
  FiCopy,
  FiCheck as FiCheckCircle,
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

interface Message {
  role: "user" | "assistant" | "system";
  content: UserMessageContent | AssistantMessageContent | string;
  reasoning_content?: string; // For DeepSeek R1 style thinking process
  id?: string; // Add ID for tracking
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    processing_time?: number; // in seconds
  };
}

interface StreamChoiceDelta {
  content?: string;
  reasoning_content?: string; // DeepSeek R1 style
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
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// LocalStorage Keys
const STORAGE_KEYS = {
  endpointUrl: "ai_chat_pro_endpoint_url",
  apiKey: "ai_chat_pro_api_key",
  jsonPayload: "ai_chat_pro_json_payload",
  chatHistory: "ai_chat_pro_chat_history",
};

function App() {
  // --- Core States ---
  const [history, setHistory] = useState<Message[]>(() => {
    // 从localStorage加载对话历史
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.chatHistory);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
    return [];
  });
  
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Token统计相关状态
  const [streamingStartTime, setStreamingStartTime] = useState<number | null>(null);
  const [currentStreamingTokens, setCurrentStreamingTokens] = useState<number>(0);
  
  // 复制状态
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // --- New Configuration States with LocalStorage ---
  const [endpointUrl, setEndpointUrl] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.endpointUrl) ||
      "https://api.siliconflow.cn/v1/chat/completions"
    );
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.apiKey) || "";
  });

  // JSON Editor State with LocalStorage
  const [jsonPayload, setJsonPayload] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.jsonPayload);
    if (saved) return saved;

    return JSON.stringify(
      {
        model: "deepseek-ai/DeepSeek-V3",
        messages: [],
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
        stream: true,
      },
      null,
      2,
    );
  });

  const [jsonError, setJsonError] = useState<string | null>(null);

  // Editing States
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  // Upload States
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(
    null,
  );

  // Thinking process collapse state
  const [expandedThinking, setExpandedThinking] = useState<
    Record<number, boolean>
  >({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // 用于去重流式响应
  const lastContentRef = useRef<Record<number, string>>({});
  const lastReasoningRef = useRef<Record<number, string>>({});
  
  // 用于跟踪token统计
  const tokenCountRef = useRef<number>(0);
  
  // 用于生成唯一的代码块ID
  const codeBlockIdCounter = useRef(0);

  // Save to LocalStorage when states change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.endpointUrl, endpointUrl);
  }, [endpointUrl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.apiKey, apiKey);
  }, [apiKey]);

  useEffect(() => {
    if (!jsonError) {
      localStorage.setItem(STORAGE_KEYS.jsonPayload, jsonPayload);
    }
  }, [jsonPayload, jsonError]);

  // 保存对话历史到LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save chat history:", e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert("存储空间不足，将清除旧对话历史");
        const recentHistory = history.slice(-20);
        setHistory(recentHistory);
      }
    }
  }, [history]);

  // Sync history to JSON when history changes (if not currently editing JSON manually)
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
      console.log(e);
    }
  }, [history, jsonPayload, jsonError]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading]);

  // 计算token/s
  useEffect(() => {
    if (streamingStartTime && currentStreamingTokens > 0) {
      const interval = setInterval(() => {
        // 定期更新显示的token/s
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [streamingStartTime, currentStreamingTokens]);

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
        if (part.type === "image_url") {
          newContent.push(part);
        }
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
    const newHistory: Message[] = [
      { role: "system", content: "You are a helpful assistant." },
      ...history,
    ];
    setHistory(newHistory);
  };

  // --- JSON Editor Handlers ---
  const handleJsonChange = (value: string) => {
    setJsonPayload(value);
    try {
      const parsed = JSON.parse(value);
      if (parsed.messages && Array.isArray(parsed.messages)) {
        const validMessages = parsed.messages.filter(
          (m: any) => m.role && m.content !== undefined,
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
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
      ];
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

  // 估算token数量 (简单估算)
  const estimateTokens = (text: string): number => {
    // 简单估算：平均一个token大约4个字符
    return Math.ceil(text.length / 4);
  };

  // --- 复制代码功能 ---
  const copyCodeToClipboard = async (code: string, codeIndex: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeIndex(codeIndex);
      setTimeout(() => {
        setCopiedCodeIndex(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
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

    const userContentParts: UserContentItem[] = [];
    if (input.trim()) {
      userContentParts.push({ type: "text", text: input.trim() });
    }
    if (uploadedImage) {
      userContentParts.push({
        type: "image_url",
        image_url: { url: uploadedImage },
      });
    }

    const userMessage: Message = { 
      role: "user", 
      content: userContentParts,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    const assistantMessage: Message = { 
      role: "assistant", 
      content: "",
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    const newHistory = [
      ...history,
      userMessage,
      assistantMessage,
    ];
    setHistory(newHistory as Message[]);
    setInput("");
    setUploadedImage(null);
    setUploadedImageName(null);
    setIsLoading(true);
    
    // 重置token计数和开始时间
    setStreamingStartTime(Date.now());
    setCurrentStreamingTokens(0);
    tokenCountRef.current = 0;

    // 重置去重引用
    const assistantIndex = newHistory.length - 1;
    lastContentRef.current[assistantIndex] = "";
    lastReasoningRef.current[assistantIndex] = "";

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    let body: any;
    try {
      const basePayload = JSON.parse(jsonPayload);
      body = {
        ...basePayload,
        messages: [...history, userMessage],
      };
    } catch (e) {
      alert("Invalid JSON payload");
      setIsLoading(false);
      setStreamingStartTime(null);
      return;
    }

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

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

        setHistory((prev) => {
          const h = [...prev];
          if (h.length > 0) h[h.length - 1].content = errorContent;
          return h;
        });
        setIsLoading(false);
        setStreamingStartTime(null);
        return;
      }

      if (!response.body) throw new Error("Response body is null");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let doneReading = false;
      let buffer = "";
      let finalUsage = null;

      while (!doneReading) {
        if (signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
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

              // 检查是否有usage信息
              if (parsedChunk.usage) {
                finalUsage = parsedChunk.usage;
              }

              if (parsedChunk.choices && parsedChunk.choices[0]?.delta) {
                const delta = parsedChunk.choices[0].delta;
                const contentChunk = delta.content || "";
                const reasoningChunk = delta.reasoning_content || "";

                if (contentChunk || reasoningChunk) {
                  setHistory((prev) => {
                    const h = [...prev];
                    const lastIdx = h.length - 1;
                    if (lastIdx >= 0 && h[lastIdx].role === "assistant") {
                      // 去重检查
                      const currentContent = h[lastIdx].content as string;
                      const currentReasoning = h[lastIdx].reasoning_content || "";
                      
                      const lastContent = lastContentRef.current[lastIdx] || "";
                      const lastReasoning = lastReasoningRef.current[lastIdx] || "";
                      
                      if (contentChunk && contentChunk === lastContent) {
                        return h;
                      }
                      if (reasoningChunk && reasoningChunk === lastReasoning) {
                        return h;
                      }
                      
                      lastContentRef.current[lastIdx] = contentChunk;
                      lastReasoningRef.current[lastIdx] = reasoningChunk;
                      
                      // 更新token计数
                      if (contentChunk) {
                        tokenCountRef.current += estimateTokens(contentChunk);
                        setCurrentStreamingTokens(tokenCountRef.current);
                        h[lastIdx].content = currentContent + contentChunk;
                      }
                      if (reasoningChunk) {
                        tokenCountRef.current += estimateTokens(reasoningChunk);
                        setCurrentStreamingTokens(tokenCountRef.current);
                        h[lastIdx].reasoning_content = currentReasoning + reasoningChunk;
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

      // 流式结束后，如果有usage信息，更新到消息中
      if (finalUsage || streamingStartTime) {
        const endTime = Date.now();
        const processingTime = streamingStartTime ? (endTime - streamingStartTime) / 1000 : 0;
        
        setHistory((prev) => {
          const h = [...prev];
          const lastIdx = h.length - 1;
          if (lastIdx >= 0 && h[lastIdx].role === "assistant") {
            h[lastIdx].usage = {
              prompt_tokens: finalUsage?.prompt_tokens || estimateTokens(JSON.stringify(body.messages)),
              completion_tokens: finalUsage?.completion_tokens || tokenCountRef.current,
              total_tokens: finalUsage?.total_tokens || (finalUsage?.prompt_tokens || estimateTokens(JSON.stringify(body.messages))) + tokenCountRef.current,
              processing_time: processingTime,
            };
          }
          return h;
        });
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        setHistory((prev) => {
          const h = [...prev];
          const lastIdx = h.length - 1;
          if (
            lastIdx >= 0 &&
            h[lastIdx].role === "assistant" &&
            h[lastIdx].content === "" &&
            !h[lastIdx].reasoning_content
          ) {
            h.pop();
          } else if (lastIdx >= 0) {
            h[lastIdx].content =
              (h[lastIdx].content as string) + "\n[Cancelled]";
          }
          return h;
        });
      } else {
        setHistory((prev) => {
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
      setStreamingStartTime(null);
      abortControllerRef.current = null;
      const assistantIndex = history.length;
      delete lastContentRef.current[assistantIndex];
      delete lastReasoningRef.current[assistantIndex];
    }
  }, [
    input,
    uploadedImage,
    history,
    jsonPayload,
    endpointUrl,
    apiKey,
    jsonError,
    isLoading,
    stopStreaming,
    streamingStartTime,
  ]);

  const clearHistory = () => {
    stopStreaming();
    setHistory([]);
    setEditingIndex(null);
  };

  const toggleThinking = (index: number) => {
    setExpandedThinking((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // 计算实时的token/s
  const calculateCurrentTokensPerSecond = () => {
    if (!streamingStartTime || currentStreamingTokens === 0) return 0;
    const elapsedSeconds = (Date.now() - streamingStartTime) / 1000;
    return elapsedSeconds > 0 ? (currentStreamingTokens / elapsedSeconds).toFixed(1) : "0.0";
  };

  // Markdown组件自定义样式
  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      // 为每个代码块生成唯一ID
      const codeBlockId = `code-${++codeBlockIdCounter.current}`;
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
                customStyle={{
                  margin: 0,
                  fontSize: '0.875rem',
                  background: '#1a1a1a',
                }}
              >
                {codeContent}
              </SyntaxHighlighter>
            </div>
            <div className="flex justify-between items-center bg-gray-900 border border-t-0 border-gray-700 rounded-b-md px-3 py-1">
              <span className="text-xs text-gray-500">{language}</span>
              <button
                onClick={() => copyCodeToClipboard(codeContent, codeBlockIdCounter.current)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                title="复制代码"
              >
                {copiedCodeIndex === codeBlockIdCounter.current ? (
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
      
      // 行内代码
      return (
        <code className="px-2 py-1 bg-gray-800 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ node, children, ...props }: any) => {
      return <div className="my-2" {...props}>{children}</div>;
    },
    table: ({ node, children, ...props }: any) => {
      return (
        <div className="overflow-x-auto my-4 border border-gray-700 rounded-lg">
          <table className="min-w-full divide-y divide-gray-700" {...props}>
            {children}
          </table>
        </div>
      );
    },
    thead: ({ node, children, ...props }: any) => {
      return <thead className="bg-gray-800/80" {...props}>{children}</thead>;
    },
    tbody: ({ node, children, ...props }: any) => {
      return <tbody className="divide-y divide-gray-700/50" {...props}>{children}</tbody>;
    },
    tr: ({ node, children, ...props }: any) => {
      return <tr className="hover:bg-gray-800/30 transition-colors" {...props}>{children}</tr>;
    },
    th: ({ node, children, ...props }: any) => {
      return (
        <th 
          className="px-4 py-3 text-left text-sm font-semibold text-gray-200 bg-gray-800/60 border-b border-gray-700" 
          {...props}
        >
          {children}
        </th>
      );
    },
    td: ({ node, children, ...props }: any) => {
      return (
        <td 
          className="px-4 py-3 text-sm text-gray-300 border-b border-gray-700/50" 
          {...props}
        >
          {children}
        </td>
      );
    },
    blockquote: ({ node, children, ...props }: any) => {
      return (
        <blockquote 
          className="border-l-4 border-indigo-500 pl-4 py-2 my-3 italic bg-gray-800/30 rounded-r" 
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    ul: ({ node, children, ...props }: any) => {
      return <ul className="list-disc pl-5 my-3 space-y-1" {...props}>{children}</ul>;
    },
    ol: ({ node, children, ...props }: any) => {
      return <ol className="list-decimal pl-5 my-3 space-y-1" {...props}>{children}</ol>;
    },
    li: ({ node, children, ...props }: any) => {
      return <li className="my-1 pl-1" {...props}>{children}</li>;
    },
    h1: ({ node, children, ...props }: any) => {
      return (
        <h1 
          className="text-2xl font-bold mt-6 mb-3 pb-2 border-b border-gray-700" 
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2: ({ node, children, ...props }: any) => {
      return <h2 className="text-xl font-bold mt-5 mb-2" {...props}>{children}</h2>;
    },
    h3: ({ node, children, ...props }: any) => {
      return <h3 className="text-lg font-bold mt-4 mb-2" {...props}>{children}</h3>;
    },
    h4: ({ node, children, ...props }: any) => {
      return <h4 className="text-base font-bold mt-3 mb-1" {...props}>{children}</h4>;
    },
    h5: ({ node, children, ...props }: any) => {
      return <h5 className="text-sm font-bold mt-2 mb-1" {...props}>{children}</h5>;
    },
    h6: ({ node, children, ...props }: any) => {
      return <h6 className="text-sm font-semibold mt-2 mb-1 text-gray-400" {...props}>{children}</h6>;
    },
    hr: ({ node, ...props }: any) => {
      return <hr className="my-6 border-gray-700" {...props} />;
    },
    a: ({ node, children, href, ...props }: any) => {
      return (
        <a 
          href={href} 
          className="text-indigo-400 hover:text-indigo-300 underline hover:underline-offset-2 transition-all" 
          target="_blank" 
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    strong: ({ node, children, ...props }: any) => {
      return <strong className="font-bold text-gray-100" {...props}>{children}</strong>;
    },
    em: ({ node, children, ...props }: any) => {
      return <em className="italic" {...props}>{children}</em>;
    },
    p: ({ node, children, ...props }: any) => {
      return <p className="my-3 leading-relaxed" {...props}>{children}</p>;
    },
    img: ({ node, src, alt, ...props }: any) => {
      return (
        <img 
          src={src} 
          alt={alt} 
          className="max-w-full h-auto rounded-lg my-3 border border-gray-700 shadow-lg" 
          {...props}
        />
      );
    },
    // 支持删除线
    del: ({ node, children, ...props }: any) => {
      return <del className="line-through text-gray-500" {...props}>{children}</del>;
    },
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white font-sans">
      {/* Left Panel: Chat History */}
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
            <button
              onClick={clearHistory}
              className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <FiTrash2 /> Clear All
            </button>
          </div>
        </header>

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
            <div key={msg.id || index} className="group relative">
              <div
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-3xl w-full p-4 rounded-lg ${
                    msg.role === "user"
                      ? "bg-indigo-900/50 border border-indigo-700/50"
                      : msg.role === "system"
                        ? "bg-gray-800 border border-gray-600"
                        : "bg-gray-800 border border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2 opacity-70 text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      {msg.role === "user" ? (
                        <FiUser />
                      ) : msg.role === "system" ? (
                        <FiSettings />
                      ) : (
                        <FiCpu />
                      )}
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
                    <div className="prose prose-sm prose-invert max-none break-words">
                      {/* Display Thinking Process for Assistant */}
                      {msg.role === "assistant" && msg.reasoning_content && (
                        <div className="mb-3">
                          <button
                            onClick={() => toggleThinking(index)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-1 transition-colors"
                          >
                            {expandedThinking[index] ? (
                              <FiChevronUp size={14} />
                            ) : (
                              <FiChevronDown size={14} />
                            )}
                            Thinking Process
                            <span className="text-gray-600 ml-1">
                              ({expandedThinking[index] ? "Hide" : "Show"})
                            </span>
                          </button>

                          {expandedThinking[index] && (
                            <div className="p-3 bg-gray-900/80 border border-gray-700 rounded-md text-sm text-gray-400 italic whitespace-pre-wrap font-mono text-xs leading-relaxed overflow-x-auto">
                              {msg.reasoning_content}
                            </div>
                          )}
                        </div>
                      )}

                      {msg.role === "assistant" ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                          // className="markdown-content"
                        >
                          {(msg.content as string) || "▋"}
                        </ReactMarkdown>
                      ) : (
                        <div className="whitespace-pre-wrap">
                          {typeof msg.content === "string"
                            ? msg.content
                            : (msg.content as UserContentItem[]).map(
                                (part, i) =>
                                  part.type === "text" ? (
                                    <p key={i} className="m-0 mb-2">
                                      {part.text}
                                    </p>
                                  ) : (
                                    <img
                                      key={i}
                                      src={part.image_url.url}
                                      alt="uploaded"
                                      className="max-h-48 rounded-lg my-2"
                                    />
                                  ),
                              )}
                        </div>
                      )}

                      {/* Token Usage Information */}
                      {msg.role === "assistant" && msg.usage && (
                        <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1">
                              <FiHash size={12} />
                              <span>Tokens: {msg.usage.total_tokens} (Prompt: {msg.usage.prompt_tokens}, Completion: {msg.usage.completion_tokens})</span>
                            </div>
                            {msg.usage.processing_time && msg.usage.completion_tokens > 0 && (
                              <>
                                <div className="flex items-center gap-1">
                                  <FiClock size={12} />
                                  <span>Time: {msg.usage.processing_time.toFixed(2)}s</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FiActivity size={12} />
                                  <span>Speed: {(msg.usage.completion_tokens / msg.usage.processing_time).toFixed(1)} tokens/s</span>
                                </div>
                              </>
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

        <div className="p-4 border-t border-gray-700 bg-gray-800">
          {uploadedImage && (
            <div className="mb-2 p-2 bg-gray-700 rounded flex items-center gap-2 w-fit">
              <img
                src={uploadedImage}
                alt="preview"
                className="h-10 w-10 object-cover rounded"
              />
              <span className="text-xs text-gray-300 truncate max-w-[150px]">
                {uploadedImageName}
              </span>
              <button
                onClick={removeUploadedImage}
                className="text-red-400 hover:text-red-300"
              >
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
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isLoading}
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
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Endpoint URL
              </label>
              <input
                type="text"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                placeholder="https://api.siliconflow.cn/v1/chat/completions"
                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Authorization (Bearer Token)
              </label>
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
              <label className="block text-xs font-medium text-gray-400">
                JSON Payload
              </label>
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
                className={`w-full h-[300px] bg-gray-900 border ${jsonError ? "border-red-500" : "border-gray-600"} rounded p-3 text-xs font-mono focus:outline-none resize-none`}
                spellCheck={false}
              />
            </div>

            {jsonError && (
              <div className="mt-2 bg-red-900/50 border border-red-700 text-red-200 text-xs p-2 rounded flex items-start gap-2">
                <FiAlertCircle size={14} className="mt-0.5 shrink-0" />
                <span className="break-all">{jsonError}</span>
              </div>
            )}
          </div>

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
                    return JSON.parse(jsonPayload).model || "Not set";
                  } catch {
                    return "Invalid JSON";
                  }
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-800">
              <span className="text-gray-500">Auto-save to LocalStorage:</span>
              <span className="text-green-400 text-[10px] uppercase tracking-wider">
                Active
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-800">
              <span className="text-gray-500">Chat History Saved:</span>
              <span className="text-green-400 text-[10px] uppercase tracking-wider">
                Yes
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-2 space-y-1">
            <p>
              * The <code>messages</code> array above will be automatically
              updated with the chat history on the left.
            </p>
            <p>* Supports DeepSeek-R1 reasoning_content display.</p>
            <p>* Enhanced Markdown support with tables, code highlighting.</p>
            <p>* Real-time token statistics and speed calculation.</p>
            <p>* Code blocks with copy functionality.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;