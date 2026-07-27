import React, { memo, useRef } from "react";
import { FiSend, FiX, FiPlus } from "react-icons/fi";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  uploadedImage: string | null;
  uploadedImageName: string | null;
  jsonError: string | null;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const ChatInput = memo(function ChatInput({
  input,
  isLoading,
  uploadedImage,
  uploadedImageName,
  jsonError,
  onInputChange,
  onSend,
  onStop,
  onImageUpload,
  onRemoveImage,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
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
            onClick={onRemoveImage}
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
          onChange={onImageUpload}
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
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type message... (Shift+Enter for new line)"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 focus:border-indigo-500 focus:outline-none resize-none min-h-[50px] max-h-[150px]"
          onKeyDown={handleKeyDown}
        />

        {isLoading ? (
          <button
            onClick={onStop}
            className="p-3 bg-red-600 rounded-lg hover:bg-red-700 text-white"
            title="Stop"
          >
            <FiX />
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={(!input.trim() && !uploadedImage) || !!jsonError}
            className="p-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend />
          </button>
        )}
      </div>
    </div>
  );
});

function inputPropsAreEqual(prev: ChatInputProps, next: ChatInputProps): boolean {
  return (
    prev.input === next.input &&
    prev.isLoading === next.isLoading &&
    prev.uploadedImage === next.uploadedImage &&
    prev.uploadedImageName === next.uploadedImageName &&
    prev.jsonError === next.jsonError
  );
}

export { ChatInput };
export type { ChatInputProps };
