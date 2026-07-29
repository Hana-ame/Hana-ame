import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  FiTrash2,
  FiActivity,
  FiChevronRight,
  FiChevronLeft,
  FiBookmark,
  FiDownload,
  FiX,
} from "react-icons/fi";
import type { Message, UserContentItem, StreamChunk, TextContentPart } from "./types.ts";
import { STORAGE_KEYS, DEFAULT_ENDPOINT, DEFAULT_JSON_PAYLOAD, getFinishReasonMessage } from "./constants.ts";
import { estimateTokens, generateId } from "./utils.ts";
import { useDebounce } from "./hooks/useDebounce.ts";
import { MessageItem } from "./components/MessageItem.tsx";
import { ChatInput } from "./components/ChatInput.tsx";
import { ConfigPanel } from "./components/ConfigPanel.tsx";
import { VirtualList } from "./components/VirtualList.tsx";
import { saveArchive, loadArchives, deleteArchive } from "./db.ts";
import type { ChatArchive } from "./db.ts";

function getMessages(payload: string): Message[] {
  try { return JSON.parse(payload).messages || []; } catch { return []; }
}
function setMessages(payload: string, msgs: Message[]): string {
  try {
    const obj = JSON.parse(payload);
    obj.messages = msgs;
    return JSON.stringify(obj, null, 2);
  } catch { return payload; }
}

function App() {
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
  const [showArchives, setShowArchives] = useState(false);
  const [archives, setArchives] = useState<ChatArchive[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const history = useMemo(() => getMessages(jsonPayload), [jsonPayload]);

  const debouncedSaveJson = useDebounce((j: string) => {
    localStorage.setItem(STORAGE_KEYS.jsonPayload, j);
  }, 500);

  useEffect(() => {
    if (!jsonError) debouncedSaveJson.run(jsonPayload);
  }, [jsonPayload, jsonError, debouncedSaveJson]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.endpointUrl, endpointUrl);
  }, [endpointUrl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.apiKey, apiKey);
  }, [apiKey]);

  const deleteMessage = useCallback((index: number) => {
    setJsonPayload((prev) => {
      const msgs = getMessages(prev);
      msgs.splice(index, 1);
      return setMessages(prev, msgs);
    });
    setEditingIndex((prev) => (prev === index ? null : prev));
  }, []);

  const deleteFromIndex = useCallback((index: number) => {
    if (!window.confirm("Delete all messages after this one?")) return;
    setJsonPayload((prev) => {
      const msgs = getMessages(prev);
      msgs.splice(index + 1);
      return setMessages(prev, msgs);
    });
    setEditingIndex((prev) => (prev !== null && prev >= index ? null : prev));
  }, []);

  const startEditMessage = useCallback((index: number) => {
    const msgs = getMessages(jsonPayload);
    const msg = msgs[index];
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
  }, [jsonPayload]);

  const saveEditMessage = useCallback((index: number) => {
    setJsonPayload((prev) => {
      const msgs = getMessages(prev);
      const msg = msgs[index];
      if (!msg) return prev;
      if (typeof msg.content === "string") {
        msgs[index] = { ...msg, content: editContent };
      } else if (Array.isArray(msg.content)) {
        const newContent: UserContentItem[] = msg.content.filter(
          (p) => p.type === "image_url",
        );
        if (editContent.trim()) {
          newContent.unshift({ type: "text", text: editContent });
        }
        msgs[index] = { ...msg, content: newContent };
      }
      return setMessages(prev, msgs);
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
    setJsonPayload((prev) => {
      const msgs = getMessages(prev);
      msgs.unshift({ role: "system", content: "You are a helpful assistant." });
      return setMessages(prev, msgs);
    });
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
        setJsonPayload(setMessages(value, validMessages));
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

    const currentHistory = getMessages(jsonPayload);
    const newHistory = [...currentHistory, userMessage, assistantMessage];
    setJsonPayload(setMessages(jsonPayload, newHistory));

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
      body = { ...basePayload, messages: [...currentHistory, userMessage] };
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
        setJsonPayload((prev) => {
          const msgs = getMessages(prev);
          if (msgs.length > 0) msgs[msgs.length - 1].content = errorContent;
          return setMessages(prev, msgs);
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

              setJsonPayload((prev) => {
                const msgs = getMessages(prev);
                const lastIdx = msgs.length - 1;
                if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
                  if (contentChunk) {
                    msgs[lastIdx] = {
                      ...msgs[lastIdx],
                      content: (msgs[lastIdx].content as string) + contentChunk,
                    };
                  }
                  if (reasoningChunk) {
                    msgs[lastIdx] = {
                      ...msgs[lastIdx],
                      reasoning_content: (msgs[lastIdx].reasoning_content || "") + reasoningChunk,
                    };
                  }
                  if (finishReason) {
                    msgs[lastIdx] = {
                      ...msgs[lastIdx],
                      finish_reason: finishReason,
                      finish_message: getFinishReasonMessage(finishReason),
                    };
                  }
                }
                return setMessages(prev, msgs);
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

      setJsonPayload((prev) => {
        const msgs = getMessages(prev);
        const lastIdx = msgs.length - 1;
        if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
          msgs[lastIdx] = {
            ...msgs[lastIdx],
            usage: {
              prompt_tokens: promptTokens,
              completion_tokens: completionTokens,
              total_tokens: finalUsage?.total_tokens || (promptTokens + completionTokens),
              processing_time: processingTime,
            },
          };
        }
        return setMessages(prev, msgs);
      });
      setCurrentStreamingTokens(completionTokens);
    } catch (error: any) {
      if (error.name === "AbortError") {
        setJsonPayload((prev) => {
          const msgs = getMessages(prev);
          const lastIdx = msgs.length - 1;
          if (lastIdx >= 0 && msgs[lastIdx].role === "assistant" && !msgs[lastIdx].content && !msgs[lastIdx].reasoning_content) {
            msgs.pop();
          } else if (lastIdx >= 0) {
            msgs[lastIdx] = {
              ...msgs[lastIdx],
              content: (msgs[lastIdx].content as string) + "\n[Cancelled]",
            };
          }
          return setMessages(prev, msgs);
        });
      } else {
        setJsonPayload((prev) => {
          const msgs = getMessages(prev);
          const lastIdx = msgs.length - 1;
          if (lastIdx >= 0) {
            msgs[lastIdx] = { ...msgs[lastIdx], content: `Error: ${error.message}` };
          }
          return setMessages(prev, msgs);
        });
      }
    } finally {
      setIsLoading(false);
      setStreamingStartTime(null);
      abortControllerRef.current = null;
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
    setJsonPayload((prev) => {
      const msgs = getMessages(prev).filter((m) => m.role === "system");
      return setMessages(prev, msgs);
    });
    setEditingIndex(null);
  }, [stopStreaming]);

  const toggleThinking = useCallback((index: number) => {
    setExpandedThinking((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const handleSaveArchive = useCallback(async () => {
    try {
      const parsed = JSON.parse(jsonPayload);
      const name = parsed.model || "Unnamed";
      await saveArchive(jsonPayload, name);
    } catch {
      // ignore
    }
  }, [jsonPayload]);

  const handleOpenArchives = useCallback(async () => {
    const list = await loadArchives();
    setArchives(list);
    setShowArchives(true);
  }, []);

  const handleLoadArchive = useCallback((archive: ChatArchive) => {
    setJsonPayload(archive.jsonPayload);
    setShowArchives(false);
  }, []);

  const handleDeleteArchive = useCallback(async (id: number) => {
    await deleteArchive(id);
    setArchives((prev) => prev.filter((a) => a.id !== id));
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
              onClick={handleSaveArchive}
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              title="Save archive"
            >
              <FiBookmark /> Save
            </button>
            <button
              onClick={handleOpenArchives}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              title="Open archives"
            >
              <FiDownload /> Archives
            </button>
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
                  onDeleteFrom={deleteFromIndex}
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

      {showArchives && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-indigo-400 flex items-center gap-2">
                <FiBookmark /> Chat Archives
              </h2>
              <button
                onClick={() => setShowArchives(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {archives.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved archives yet.</p>
              ) : (
                archives.map((a) => (
                  <div
                    key={a.id}
                    className="bg-gray-900 rounded p-3 flex items-center justify-between hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => handleLoadArchive(a)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{a.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {a.messageCount} messages &middot; {new Date(a.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); a.id !== undefined && handleDeleteArchive(a.id); }}
                      className="text-red-400 hover:text-red-300 p-1 shrink-0"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;