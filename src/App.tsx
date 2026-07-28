import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  FiTrash2,
  FiActivity,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import type { Message, UserContentItem, StreamChunk, TextContentPart } from "./types.ts";
import { STORAGE_KEYS, DEFAULT_ENDPOINT, DEFAULT_JSON_PAYLOAD, getFinishReasonMessage } from "./constants.ts";
import { estimateTokens, generateId } from "./utils.ts";
import { useDebounce } from "./hooks/useDebounce.ts";
import { MessageItem } from "./components/MessageItem.tsx";
import { ChatInput } from "./components/ChatInput.tsx";
import { ConfigPanel } from "./components/ConfigPanel.tsx";
import { VirtualList } from "./components/VirtualList.tsx";

function App() {
  const [history, setHistory] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.chatHistory);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
    return [];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingStartTime, setStreamingStartTime] = useState<number | null>(null);
  const [currentStreamingTokens, setCurrentStreamingTokens] = useState(0);
  const [endpointUrl, setEndpointUrl] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.endpointUrl) || DEFAULT_ENDPOINT;
  });
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.apiKey) || "";
  });
  const [jsonPayload, setJsonPayload] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.jsonPayload) || DEFAULT_JSON_PAYLOAD;
  });
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Record<number, boolean>>({});
  const [showConfig, setShowConfig] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);
  const historyRef = useRef<Message[]>(history);
  const jsonPayloadRef = useRef(jsonPayload);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    jsonPayloadRef.current = jsonPayload;
  }, [jsonPayload]);

  // debounced localStorage save: only runs after streaming pauses for 500ms
  const debouncedSaveHistory = useDebounce((h: Message[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(h));
    } catch (e) {
      console.error("Failed to save chat history:", e);
      if (e instanceof DOMException && e.name === "QuotaExceededError") {
        alert("存储空间不足，将清除旧对话历史");
        setHistory((prev) => prev.slice(-20));
      }
    }
  }, 500);

  useEffect(() => {
    debouncedSaveHistory.run(history);
  }, [history, debouncedSaveHistory]);

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

  // jsonPayload 的 messages 在流结束/cancel 后自动与 history 同步。
  // 用户编辑 JSON 时，从 messages 中提取并更新 history。

  // --- Message Operations ---
  const deleteMessage = useCallback((index: number) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
    setEditingIndex((prev) => (prev === index ? null : prev));
  }, []);

  const startEditMessage = useCallback((index: number) => {
    const msg = historyRef.current[index];
    if (!msg) return;
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
  }, []);

  const saveEditMessage = useCallback((index: number) => {
    setHistory((prev) => {
      const next = [...prev];
      const msg = next[index];
      if (!msg) return prev;
      if (typeof msg.content === "string") {
        next[index] = { ...msg, content: editContent };
      } else if (Array.isArray(msg.content)) {
        const newContent: UserContentItem[] = msg.content.filter(
          (p) => p.type === "image_url",
        );
        if (editContent.trim()) {
          newContent.unshift({ type: "text", text: editContent });
        }
        next[index] = { ...msg, content: newContent };
      }
      return next;
    });
    setEditingIndex(null);
  }, [editContent]);

  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
  }, []);

  const handleEditContentChange = useCallback((value: string) => {
    setEditContent(value);
  }, []);

  const addSystemMessage = useCallback(() => {
    setHistory((prev) => [
      { role: "system", content: "You are a helpful assistant." },
      ...prev,
    ]);
  }, []);

  // --- JSON Editor ---
  const handleJsonChange = useCallback((value: string) => {
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
  }, []);

  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonPayload);
      setJsonPayload(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  }, [jsonPayload]);

  const syncJsonFromHistory = useCallback(() => {
    try {
      const base = JSON.parse(jsonPayloadRef.current);
      setJsonPayload(JSON.stringify({ ...base, messages: historyRef.current }, null, 2));
      setJsonError(null);
    } catch {
      // base payload might be invalid during editing, skip silently
    }
  }, []);

  // --- Image Upload ---
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [],
  );

  const removeUploadedImage = useCallback(() => {
    setUploadedImage(null);
    setUploadedImageName(null);
  }, []);

  // --- Streaming ---
  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const sendMessage = useCallback(async () => {
    const currentInput = input;
    const currentImage = uploadedImage;
    if (!currentInput.trim() && !currentImage) return;
    if (!endpointUrl) {
      alert("Please enter API Endpoint URL");
      return;
    }
    if (jsonError) {
      alert("Please fix JSON syntax error first");
      return;
    }
    if (isLoading) {
      stopStreaming();
      return;
    }

    const userContentParts: UserContentItem[] = [];
    if (currentInput.trim()) {
      userContentParts.push({ type: "text", text: currentInput.trim() });
    }
    if (currentImage) {
      userContentParts.push({
        type: "image_url",
        image_url: { url: currentImage },
      });
    }

    const userMessage: Message = {
      role: "user",
      content: userContentParts,
      id: generateId(),
    };
    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      id: generateId(),
    };

    const historySnapshot = historyRef.current;
    const newHistory = [...historySnapshot, userMessage, assistantMessage];
    setHistory(newHistory);
    setInput("");
    setUploadedImage(null);
    setUploadedImageName(null);
    setIsLoading(true);
    setStreamingStartTime(Date.now());
    setCurrentStreamingTokens(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const signal = abortController.signal;

    let body: any;
    try {
      const basePayload = JSON.parse(jsonPayload);
      body = { ...basePayload, messages: [...historySnapshot, userMessage] };
    } catch (e) {
      alert("Invalid JSON payload");
      setIsLoading(false);
      setStreamingStartTime(null);
      return;
    }

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
        } catch {
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
          if (!line.startsWith("data: ")) continue;
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
              const finishReason = choice.finish_reason;

              if (contentChunk) accumulatedContent += contentChunk;
              if (reasoningChunk) accumulatedReasoning += reasoningChunk;
              setCurrentStreamingTokens(estimateTokens(accumulatedContent + accumulatedReasoning));

              setHistory((prev) => {
                const h = [...prev];
                const lastIdx = h.length - 1;
                if (lastIdx >= 0 && h[lastIdx].role === "assistant") {
                  if (contentChunk) {
                    h[lastIdx] = {
                      ...h[lastIdx],
                      content: (h[lastIdx].content as string) + contentChunk,
                    };
                  }
                  if (reasoningChunk) {
                    h[lastIdx] = {
                      ...h[lastIdx],
                      reasoning_content: (h[lastIdx].reasoning_content || "") + reasoningChunk,
                    };
                  }
                  if (finishReason) {
                    h[lastIdx] = {
                      ...h[lastIdx],
                      finish_reason: finishReason,
                      finish_message: getFinishReasonMessage(finishReason),
                    };
                  }
                }
                return h;
              });
            }
          } catch (e) {
            console.warn("Parse error:", jsonData, e);
          }
        }
      }

      const endTime = Date.now();
      const processingTime = streamingStartTime
        ? (endTime - streamingStartTime) / 1000
        : 0;
      const completionTokens = finalUsage?.completion_tokens || estimateTokens(accumulatedContent + accumulatedReasoning);
      const promptTokens = finalUsage?.prompt_tokens || estimateTokens(JSON.stringify(body.messages));

      setHistory((prev) => {
        const h = [...prev];
        const lastIdx = h.length - 1;
        if (lastIdx >= 0 && h[lastIdx].role === "assistant") {
          h[lastIdx] = {
            ...h[lastIdx],
            usage: {
              prompt_tokens: promptTokens,
              completion_tokens: completionTokens,
              total_tokens: finalUsage?.total_tokens || (promptTokens + completionTokens),
              processing_time: processingTime,
            },
          };
        }
        return h;
      });
      setCurrentStreamingTokens(completionTokens);
    } catch (error: any) {
      if (error.name === "AbortError") {
        setHistory((prev) => {
          const h = [...prev];
          const lastIdx = h.length - 1;
          if (lastIdx >= 0 && h[lastIdx].role === "assistant" && !h[lastIdx].content && !h[lastIdx].reasoning_content) {
            h.pop();
          } else if (lastIdx >= 0) {
            h[lastIdx] = {
              ...h[lastIdx],
              content: (h[lastIdx].content as string) + "\n[Cancelled]",
            };
          }
          return h;
        });
      } else {
        setHistory((prev) => {
          const h = [...prev];
          const lastIdx = h.length - 1;
          if (lastIdx >= 0) {
            h[lastIdx] = { ...h[lastIdx], content: `Error: ${error.message}` };
          }
          return h;
        });
      }
    } finally {
      setIsLoading(false);
      setStreamingStartTime(null);
      abortControllerRef.current = null;
      setTimeout(syncJsonFromHistory, 0);
    }
  }, [
    input,
    uploadedImage,
    endpointUrl,
    apiKey,
    jsonPayload,
    jsonError,
    isLoading,
    stopStreaming,
    streamingStartTime,
  ]);

  const clearHistory = useCallback(() => {
    stopStreaming();
    setHistory((prev) => prev.filter((m) => m.role === "system"));
    setEditingIndex(null);
  }, [stopStreaming]);

  const toggleThinking = useCallback((index: number) => {
    setExpandedThinking((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const tokenSpeed = useMemo(() => {
    if (!streamingStartTime || currentStreamingTokens === 0) return "0.0";
    const elapsed = (Date.now() - streamingStartTime) / 1000;
    return elapsed > 0 ? (currentStreamingTokens / elapsed).toFixed(1) : "0.0";
  }, [streamingStartTime, currentStreamingTokens]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white font-sans overflow-hidden">
      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-400">AI Chat Pro</h1>
          <div className="flex items-center gap-4">
            {isLoading && streamingStartTime && (
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <FiActivity className="animate-pulse" />
                <span>{tokenSpeed} tokens/s</span>
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
            <button
              onClick={() => setShowConfig((v) => !v)}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              title={showConfig ? "Hide Config Panel" : "Show Config Panel"}
            >
              {showConfig ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>
        </header>

        {history.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-gray-500">
              <p>No messages yet. Start chatting or edit JSON directly.</p>
              <button
                onClick={addSystemMessage}
                className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm"
              >
                + Add System Message
              </button>
            </div>
          </div>
        ) : (
          <VirtualList
            items={history}
            renderItem={(item, index) => {
              const msg = item as Message;
              return (
                <MessageItem
                  msg={msg}
                  index={index}
                  isEditing={editingIndex === index}
                  isExpanded={!!expandedThinking[index]}
                  editContent={editContent}
                  onStartEdit={startEditMessage}
                  onDelete={deleteMessage}
                  onSaveEdit={saveEditMessage}
                  onCancelEdit={cancelEdit}
                  onEditContentChange={handleEditContentChange}
                  onToggleThinking={toggleThinking}
                />
              );
            }}
            estimatedItemHeight={120}
            gap={16}
            isStreaming={isLoading}
            className="flex-1 min-h-0 p-4"
          />
        )}

        <ChatInput
          input={input}
          isLoading={isLoading}
          uploadedImage={uploadedImage}
          uploadedImageName={uploadedImageName}
          jsonError={jsonError}
          onInputChange={setInput}
          onSend={sendMessage}
          onStop={stopStreaming}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeUploadedImage}
        />
      </div>

      {showConfig && (
        <div className="fixed inset-0 z-50 bg-gray-900 overflow-y-auto md:hidden">
          <div className="p-4">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowConfig(false)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <ConfigPanel
              endpointUrl={endpointUrl}
              apiKey={apiKey}
              jsonPayload={jsonPayload}
              jsonError={jsonError}
              messageCount={history.length}
              onEndpointChange={setEndpointUrl}
              onApiKeyChange={setApiKey}
              onJsonChange={handleJsonChange}
              onFormatJson={formatJson}
            />
          </div>
        </div>
      )}
      <div className={`hidden md:block transition-all duration-200 ease-in-out overflow-hidden ${
        showConfig
          ? "md:max-w-[450px] md:w-[450px]"
          : "md:max-w-0 md:w-0"
      }`}>
        <ConfigPanel
          endpointUrl={endpointUrl}
          apiKey={apiKey}
          jsonPayload={jsonPayload}
          jsonError={jsonError}
          messageCount={history.length}
          onEndpointChange={setEndpointUrl}
          onApiKeyChange={setApiKey}
          onJsonChange={handleJsonChange}
          onFormatJson={formatJson}
        />
      </div>
    </div>
  );
}

export default App;
