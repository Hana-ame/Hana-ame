import type { ReactNode } from "react";

// --- 子组件: 选项卡按钮 ---
export interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  active,
  onClick,
  icon,
  label,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
      active
        ? "bg-indigo-100 text-indigo-700"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);


export default TabButton;