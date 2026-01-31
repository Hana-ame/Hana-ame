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
}

interface Message {
  role: "user" | "assistant" | "system";
  content: UserMessageContent | AssistantMessageContent | string;
  reasoning_content?: string; // For DeepSeek R1 style thinking process
  meta?: MessageMeta;
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
  chatHistory: "ai_chat_pro_history", // 新增：保存对话历史
};

function App() {
  // --- Core States ---
  const [history, setHistory] = useState<Message[]>(() => {
    // 从 localStorage 加载历史记录
    const savedHistory = localStorage.getItem(STORAGE_KEYS.chatHistory);
    if (savedHistory) {
      try {
        return JSON.parse(savedHistory);
      } catch (e) {
        console.error("Failed to parse saved history:", e);
        return [];
      }
    }
    return [];
  });

  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
  
  // 修复重复打字问题：使用 ref 记录已处理的内容
  const processedContentRef = useRef<string>("");
  const processedReasoningRef = useRef<string>("");
  const usageDataRef = useRef<MessageMeta>({});

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

  // 保存对话历史到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history:", e);
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
      // Ignore parse errors during auto-sync
    }
  }, [history, jsonPayload, jsonError]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

    const userMessage: Message = { role: "user", content: userContentParts };

    const newHistory = [
      ...history,
      userMessage,
      { 
        role: "assistant", 
        content: "", 
        reasoning_content: "",
        meta: {
          response_time: 0,
          tokens_per_second: 0,
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          }
        }
      },
    ];
    setHistory(newHistory as Message[]);
    setInput("");
    setUploadedImage(null);
    setUploadedImageName(null);
    setIsLoading(true);

    // 重置已处理内容的引用
    processedContentRef.current = "";
    processedReasoningRef.current = "";
    usageDataRef.current = {};

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
      return;
    }

    const startTime = Date.now();

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
        return;
      }

      if (!response.body) throw new Error("Response body is null");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let doneReading = false;
      let buffer = "";

      while (!doneReading) {
        if (signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
        const { value, done } = await reader.read();
        doneReading = done;

        // Append to buffer and process line by line
        buffer += decoder.decode(value, { stream: !doneReading });
        const lines = buffer.split("\n");

        // Keep the last partial line in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonData = line.substring(5).trim();
            if (jsonData === "[DONE]") {
              doneReading = true;
              
              // 计算响应时间
              const endTime = Date.now();
              const responseTime = endTime - startTime;
              
              // 更新最后一条消息的元数据
              setHistory((prev) => {
                const h = [...prev];
                const lastIdx = h.length - 1;
                if (lastIdx >= 0 && h[lastIdx].role === "assistant") {
                  const completionTokens = processedContentRef.current.length / 4; // 估算：每个token约4个字符
                  const tokensPerSecond = completionTokens / (responseTime / 1000);
                  
                  h[lastIdx].meta = {
                    response_time: responseTime,
                    tokens_per_second: Math.round(tokensPerSecond * 100) / 100,
                    usage: {
                      prompt_tokens: 0, // 通常需要从API获取
                      completion_tokens: Math.round(completionTokens),
                      total_tokens: Math.round(completionTokens)
                    }
                  };
                }
                return h;
              });
              
              break;
            }
            if (!jsonData) continue;

            try {
              const parsedChunk = JSON.parse(jsonData) as StreamChunk;

              if (parsedChunk.choices && parsedChunk.choices[0]?.delta) {
                const delta = parsedChunk.choices[0].delta;
                const contentChunk = delta.content || "";
                const reasoningChunk = delta.reasoning_content || "";

                if (contentChunk || reasoningChunk) {
                  // 修复重复打字问题：使用 ref 累积内容
                  if (contentChunk) {
                    processedContentRef.current += contentChunk;
                  }
                  if (reasoningChunk) {
                    processedReasoningRef.current += reasoningChunk;
                  }

                  setHistory((prev) => {
                    const h = [...prev];
                    const lastIdx = h.length - 1;
                    if (lastIdx >= 0 && h[lastIdx].role === "assistant") {
                      // 使用累积的内容更新，而不是追加
                      h[lastIdx].content = processedContentRef.current;
                      h[lastIdx].reasoning_content = processedReasoningRef.current;
                    }
                    return h;
                  });
                }
              }
              
              // 保存usage数据
              if (parsedChunk.usage) {
                usageDataRef.current.usage = parsedChunk.usage;
              }
            } catch (e) {
              console.warn("Parse error:", jsonData, e);
            }
          }
        }
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
      abortControllerRef.current = null;
      processedContentRef.current = "";
      processedReasoningRef.current = "";
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
  ]);

  const clearHistory = () => {
    stopStreaming();
    setHistory([]);
    setEditingIndex(null);
    // 同时清除本地存储的历史记录
    localStorage.removeItem(STORAGE_KEYS.chatHistory);
  };

  const toggleThinking = (index: number) => {
    setExpandedThinking((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white font-sans">
      {/* Left Panel: Chat History */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-400">AI Chat Pro</h1>
          <button
            onClick={clearHistory}
            className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <FiTrash2 /> Clear All
          </button>
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
            <div key={index} className="group relative">
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
                        <div className="markdown-content">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              pre({ children, ...props }) {
                                const childArray = React.Children.toArray(children);
                                const codeElement = childArray.find(
                                  (child) => React.isValidElement(child) && child.type === 'code'
                                ) as React.ReactElement<{ className?: string; children?: React.ReactNode }> | undefined;
                                
                                if (codeElement) {
                                  const { className, children: codeChildren } = codeElement.props;
                                  const language = className?.replace(/language-/, '') || 'text';
                                  
                                  return (
                                    <div className="overflow-x-auto my-4">
                                      <SyntaxHighlighter
                                        language={language}
                                        style={vscDarkPlus}
                                        PreTag="div"
                                        className="rounded-lg border border-gray-700"
                                        showLineNumbers={language !== 'text'}
                                        customStyle={{
                                          margin: 0,
                                          fontSize: '0.875rem',
                                          lineHeight: '1.5',
                                        }}
                                      >
                                        {String(codeChildren).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    </div>
                                  );
                                }
                                
                                return (
                                  <div className="overflow-x-auto my-4">
                                    <pre className="bg-gray-900/80 p-4 rounded-lg border border-gray-700 text-sm font-mono overflow-auto whitespace-pre-wrap">
                                      {children}
                                    </pre>
                                  </div>
                                );
                              },
                              code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                
                                if (!match) {
                                  return (
                                    <code className="bg-gray-800/80 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                                
                                return (
                                  <div className="overflow-x-auto my-2">
                                    <SyntaxHighlighter
                                      language={match[1]}
                                      style={vscDarkPlus}
                                      PreTag="div"
                                      className="rounded-lg border border-gray-700"
                                      customStyle={{
                                        margin: 0,
                                        fontSize: '0.875rem',
                                        lineHeight: '1.5',
                                      }}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  </div>
                                );
                              },
                              table({ children }) {
                                return (
                                  <div className="overflow-x-auto my-4">
                                    <table className="min-w-full divide-y divide-gray-700 border border-gray-700 rounded-lg overflow-hidden">
                                      {children}
                                    </table>
                                  </div>
                                );
                              },
                              th({ children }) {
                                return (
                                  <th className="px-4 py-3 bg-gray-800/80 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">
                                    {children}
                                  </th>
                                );
                              },
                              td({ children }) {
                                return (
                                  <td className="px-4 py-3 border-b border-gray-700/50 text-sm">
                                    {children}
                                  </td>
                                );
                              },
                              a({ href, children }) {
                                return (
                                  <a 
                                    href={href} 
                                    className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    {children}
                                  </a>
                                );
                              },
                              blockquote({ children }) {
                                return (
                                  <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 italic text-gray-300">
                                    {children}
                                  </blockquote>
                                );
                              },
                              ul({ children }) {
                                return (
                                  <ul className="list-disc pl-5 my-3 space-y-1">
                                    {children}
                                  </ul>
                                );
                              },
                              ol({ children }) {
                                return (
                                  <ol className="list-decimal pl-5 my-3 space-y-1">
                                    {children}
                                  </ol>
                                );
                              },
                              h1({ children }) {
                                return <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>;
                              },
                              h2({ children }) {
                                return <h2 className="text-xl font-bold mt-5 mb-2">{children}</h2>;
                              },
                              h3({ children }) {
                                return <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>;
                              },
                              hr() {
                                return <hr className="my-6 border-gray-700" />;
                              },
                            }}
                            // className="space-y-3"
                          >
                            {(msg.content as string) || "▋"}
                          </ReactMarkdown>
                          
                          {/* Token usage and performance info */}
                          {msg.meta && (
                            <div className="mt-4 pt-3 border-t border-gray-700/50 text-xs text-gray-400">
                              <div className="flex items-center gap-2 mb-1">
                                <FiClock size={12} />
                                <span className="font-medium">Response Info</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {msg.meta.usage?.total_tokens && (
                                  <div className="flex flex-col">
                                    <span className="text-gray-500">Tokens</span>
                                    <span className="font-medium">
                                      {msg.meta.usage.total_tokens}
                                    </span>
                                  </div>
                                )}
                                {msg.meta.usage?.prompt_tokens && (
                                  <div className="flex flex-col">
                                    <span className="text-gray-500">Prompt</span>
                                    <span className="font-medium">
                                      {msg.meta.usage.prompt_tokens}
                                    </span>
                                  </div>
                                )}
                                {msg.meta.usage?.completion_tokens && (
                                  <div className="flex flex-col">
                                    <span className="text-gray-500">Completion</span>
                                    <span className="font-medium">
                                      {msg.meta.usage.completion_tokens}
                                    </span>
                                  </div>
                                )}
                                {msg.meta.response_time && (
                                  <div className="flex flex-col">
                                    <span className="text-gray-500">Time</span>
                                    <span className="font-medium">
                                      {msg.meta.response_time}ms
                                    </span>
                                  </div>
                                )}
                                {msg.meta.tokens_per_second && (
                                  <div className="flex flex-col">
                                    <span className="text-gray-500">Speed</span>
                                    <span className="font-medium">
                                      {msg.meta.tokens_per_second} tokens/s
                                    </span>
                                  </div>
                                )}
                                {(msg.content as string) && (
                                  <div className="flex flex-col">
                                    <span className="text-gray-500">Characters</span>
                                    <span className="font-medium">
                                      {(msg.content as string).length}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
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

            {/* Moved error message below textarea to avoid blocking */}
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
          </div>

          <div className="text-xs text-gray-500 mt-2 space-y-1">
            <p>
              * The <code>messages</code> array above will be automatically
              updated with the chat history on the left.
            </p>
            <p>* Supports DeepSeek-R1 reasoning_content display.</p>
            <p>* Enhanced Markdown with syntax highlighting and tables.</p>
          </div>
        </div>
      </div>

      {/* 添加全局样式来处理代码块溢出 */}
      <style>{`
        .markdown-content pre {
          overflow-x: auto;
          white-space: pre;
        }
        
        .markdown-content code {
          white-space: pre;
        }
        
        .markdown-content table {
          display: block;
          overflow-x: auto;
          white-space: nowrap;
        }
        
        /* 修复heading标签的返回类型错误 */
        h1, h2, h3, h4, h5, h6 {
          display: block;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

export default App;