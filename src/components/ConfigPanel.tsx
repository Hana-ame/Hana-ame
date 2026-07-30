import React, { memo } from "react";
import {
  FiEdit2,
  FiAlertCircle,
} from "react-icons/fi";

interface ConfigPanelProps {
  endpointUrl: string;
  apiKey: string;
  jsonPayload: string;
  jsonError: string | null;
  messageCount: number;
  autoMode: boolean;
  autoDelay: number;
  onEndpointChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  onJsonChange: (value: string) => void;
  onFormatJson: () => void;
  onAutoModeChange: (value: boolean) => void;
  onAutoDelayChange: (value: number) => void;
}

const ConfigPanel = memo(function ConfigPanel({
  endpointUrl,
  apiKey,
  jsonPayload,
  jsonError,
  messageCount,
  autoMode,
  autoDelay,
  onEndpointChange,
  onApiKeyChange,
  onJsonChange,
  onFormatJson,
  onAutoModeChange,
  onAutoDelayChange,
}: ConfigPanelProps) {
  const modelName = React.useMemo(() => {
    try {
      return JSON.parse(jsonPayload).model || "Not set";
    } catch {
      return "Invalid JSON";
    }
  }, [jsonPayload]);

  return (
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
              onChange={(e) => onEndpointChange(e.target.value)}
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
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoMode}
                onChange={(e) => onAutoModeChange(e.target.checked)}
                className="accent-indigo-500"
              />
              Auto
            </label>
            {autoMode && (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={autoDelay}
                  onChange={(e) => onAutoDelayChange(Math.max(1, parseInt(e.target.value) || 5))}
                  className="w-14 bg-gray-900 border border-gray-600 rounded px-1 py-0.5 text-xs text-white text-center"
                  min={1}
                  max={3600}
                />
                <span className="text-xs text-gray-400">s</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-medium text-gray-400">
              JSON Payload
            </label>
            <button
              onClick={onFormatJson}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Format JSON
            </button>
          </div>

          <div className="relative">
            <textarea
              value={jsonPayload}
              onChange={(e) => onJsonChange(e.target.value)}
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
            <span className="text-white">{messageCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Current model:</span>
            <span className="text-white truncate max-w-[200px]">
              {modelName}
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
          <p>* Shows finish reason (length, content_filter, etc.) with explanations.</p>
        </div>
      </div>
    </div>
  );
});

export { ConfigPanel };
