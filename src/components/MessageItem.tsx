import React, { memo } from "react";
import {
  FiUser,
  FiCpu,
  FiSettings,
  FiEdit2,
  FiX,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiAlertTriangle,
  FiAlertCircle,
  FiInfo,
  FiHash,
  FiClock,
  FiActivity,
} from "react-icons/fi";
import type {
  Message,
  TextContentPart,
  UserContentItem,
} from "../types.ts";
import { MarkdownRenderer } from "./MarkdownRenderer.tsx";

interface MessageItemProps {
  msg: Message;
  index: number;
  isEditing: boolean;
  isExpanded: boolean;
  editContent: string;
  onStartEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onDeleteFrom: (index: number) => void;
  onSaveEdit: (index: number) => void;
  onCancelEdit: () => void;
  onEditContentChange: (value: string) => void;
  onToggleThinking: (index: number) => void;
}

const MessageItem = memo(function MessageItem({
  msg,
  index,
  isEditing,
  isExpanded,
  editContent,
  onStartEdit,
  onDelete,
  onDeleteFrom,
  onSaveEdit,
  onCancelEdit,
  onEditContentChange,
  onToggleThinking,
}: MessageItemProps) {
  const roleColor =
    msg.role === "user"
      ? "bg-indigo-900/50 border border-indigo-700/50"
      : msg.role === "system"
        ? "bg-gray-800 border border-gray-600"
        : "bg-gray-800 border border-gray-700";

  const roleIcon =
    msg.role === "user" ? <FiUser /> : msg.role === "system" ? <FiSettings /> : <FiCpu />;

  const finishStyle =
    msg.finish_reason === "length"
      ? "bg-yellow-900/30 border border-yellow-700/50 text-yellow-300"
      : msg.finish_reason === "content_filter"
        ? "bg-red-900/30 border border-red-700/50 text-red-300"
        : "bg-blue-900/30 border border-blue-700/50 text-blue-300";

  const finishIcon =
    msg.finish_reason === "length" ? (
      <FiAlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
    ) : msg.finish_reason === "content_filter" ? (
      <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
    ) : (
      <FiInfo size={16} className="mt-0.5 flex-shrink-0" />
    );

  return (
    <div className="group relative">
      <div
        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
      >
        <div className={`max-w-3xl w-full p-4 rounded-lg ${roleColor}`}>
          <div className="flex justify-between items-center mb-2 opacity-70 text-xs uppercase tracking-wider">
            <span className="flex items-center gap-1">
              {roleIcon}
              {msg.role}
            </span>
            <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onDeleteFrom(index)}
                className="text-orange-400 hover:text-orange-300"
                title="Delete messages from here"
              >
                <FiTrash2 size={14} />
              </button>
              <button
                onClick={() => onStartEdit(index)}
                className="text-gray-400 hover:text-white"
                title="Edit"
              >
                <FiEdit2 size={14} />
              </button>
              <button
                onClick={() => onDelete(index)}
                className="text-red-400 hover:text-red-300"
                title="Delete"
              >
                <FiX size={14} />
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => onEditContentChange(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm min-h-[100px] focus:border-indigo-500 focus:outline-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={onCancelEdit}
                  className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSaveEdit(index)}
                  className="px-2 py-1 text-xs bg-indigo-600 rounded hover:bg-indigo-500 flex items-center gap-1"
                >
                  <FiEdit2 size={12} /> Save
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm prose-invert max-none break-words">
              {msg.role === "assistant" && msg.reasoning_content && (
                <div className="mb-3">
                  <button
                    onClick={() => onToggleThinking(index)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-1 transition-colors"
                  >
                    {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    Thinking Process
                    <span className="text-gray-600 ml-1">
                      ({isExpanded ? "Hide" : "Show"})
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="p-3 bg-gray-900/80 border border-gray-700 rounded-md text-sm text-gray-400 italic whitespace-pre-wrap font-mono text-xs leading-relaxed overflow-x-auto">
                      {msg.reasoning_content}
                    </div>
                  )}
                </div>
              )}

              {msg.role === "assistant" ? (
                <div className="markdown-content">
                  <MarkdownRenderer content={(msg.content as string) || "▋"} />
                </div>
              ) : (
                <div className="whitespace-pre-wrap">
                  {typeof msg.content === "string"
                    ? msg.content
                    : (msg.content as UserContentItem[]).map((part, i) =>
                        part.type === "text" ? (
                          <p key={i} className="m-0 mb-2">{part.text}</p>
                        ) : (
                          <img key={i} src={part.image_url.url} alt="uploaded" className="max-h-48 rounded-lg my-2" />
                        ),
                      )}
                </div>
              )}

              {msg.role === "assistant" && msg.finish_message && (
                <div className={`mt-2 p-2 rounded-md text-sm flex items-start gap-2 ${finishStyle}`}>
                  {finishIcon}
                  <span>{msg.finish_message}</span>
                </div>
              )}

              {msg.role === "assistant" && msg.usage && (
                <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1">
                      <FiHash size={12} />
                      <span>Tokens: {msg.usage.total_tokens} (Prompt: {msg.usage.prompt_tokens}, Completion: {msg.usage.completion_tokens})</span>
                    </div>
                    {msg.usage.processing_time != null && msg.usage.processing_time > 0 && msg.usage.completion_tokens > 0 && (
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
  );
});

function messagePropsAreEqual(prev: MessageItemProps, next: MessageItemProps): boolean {
  if (prev.msg.role !== next.msg.role) return false;
  if (prev.msg.content !== next.msg.content) return false;
  if (prev.msg.reasoning_content !== next.msg.reasoning_content) return false;
  if (prev.msg.finish_message !== next.msg.finish_message) return false;
  if (prev.msg.finish_reason !== next.msg.finish_reason) return false;
  if (prev.msg.usage !== next.msg.usage) return false;
  if (prev.isEditing !== next.isEditing) return false;
  if (prev.isExpanded !== next.isExpanded) return false;
  if (prev.editContent !== next.editContent) return false;
  return true;
}

const MemoizedMessageItem = memo(MessageItem, messagePropsAreEqual);

export { MemoizedMessageItem as MessageItem };
export type { MessageItemProps };
