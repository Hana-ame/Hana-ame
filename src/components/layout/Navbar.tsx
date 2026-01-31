import React from 'react';
// 假设你使用的是 lucide-react 或类似的图标库
import { History, Upload, UserCheck, Settings as SettingsIcon } from 'lucide-react';
import TabButton from '../ui/TabButton';

// 1. 定义 Props 的接口
interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// 2. 使用 React.FC (Functional Component) 或者直接解构并标注类型
const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-1 md:space-x-4">
        <TabButton
          active={activeTab === "recent_submit"}
          onClick={() => setActiveTab("recent_submit")}
          icon={<History size={18} />}
          label="最近提交"
        />
        <TabButton
          active={activeTab === "recent_upload"}
          onClick={() => setActiveTab("recent_upload")}
          icon={<Upload size={18} />}
          label="最近上传"
        />
      </div>

      <div className="flex items-center space-x-1 md:space-x-4">
        <TabButton
          active={activeTab === "related"}
          onClick={() => setActiveTab("related")}
          icon={<UserCheck size={18} />}
          label="与我相关"
        />
        <TabButton
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          icon={<SettingsIcon size={18} />}
          label="设置"
        />
      </div>
    </nav>
  );
};

export default Navbar;

// /** 
//  * 附赠：如果你还没有定义 TabButton，它的 TSX 结构通常如下：
//  */
// interface TabButtonProps {
//   active: boolean;
//   onClick: () => void;
//   icon: React.ReactNode;
//   label: string;
// }

// const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
//   <button
//     onClick={onClick}
//     className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
//       active 
//         ? "bg-blue-50 text-blue-600" 
//         : "text-gray-600 hover:bg-gray-100"
//     }`}
//   >
//     {icon}
//     <span className="text-sm font-medium">{label}</span>
//   </button>
// );