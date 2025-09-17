export default function ModeSelector({ mode, setMode }: { mode: string; setMode: (mode: string) => void }) {
  return (
    <nav className="flex w-full bg-gray-100 rounded-lg p-1 shadow-sm">
      <button
        onClick={() => setMode("mouse-pad")}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          mode === "mouse-pad"
            ? "bg-white text-blue-600 shadow-md" // 选中状态样式
            : "bg-transparent text-gray-600 hover:bg-gray-200" // 默认状态样式
        }`}
      >
        Mouse Pad
      </button>
      <button
        onClick={() => setMode("keyboard")}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          mode === "keyboard"
            ? "bg-white text-blue-600 shadow-md"
            : "bg-transparent text-gray-600 hover:bg-gray-200"
        }`}
      >
        Keyboard
      </button>
      <button
        onClick={() => setMode("text-area")}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          mode === "text-area"
            ? "bg-white text-blue-600 shadow-md"
            : "bg-transparent text-gray-600 hover:bg-gray-200"
        }`}
      >
        Text Area
      </button>
    </nav>
  );
}