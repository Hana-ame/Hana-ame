import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  Clock,
  Upload,
  User,
  Settings as SettingsIcon,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Download,
  History,
  UserCheck,
  MessageSquare,
  Database,
  LucideIcon,
} from "lucide-react";

// --- 类型定义 ---

type StatusType = "估计cost中" | "等待上传" | "已完成" | "已经关闭";

interface GalleryItem {
  id: number;
  g: string;
  title: string;
  submitter_id: string;
  submitter_balance: number;
  submit_time: string;
  estimated_cost: number;
  uploader_id?: string;
  uploader_balance?: number;
  download_url?: string;
  upload_time?: string;
  message?: string;
  g_likes?: number;
  g_dislikes?: number;
  sub_likes?: number;
  sub_dislikes?: number;
  status: StatusType;
  cover: string;
}

type TabType = "recent_submit" | "recent_upload" | "related" | "settings";

const API_BASE = "https://moonchan.xyz/api/v3";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("recent_submit");
  const [userId, setUserId] = useState<string>(
    localStorage.getItem("eh_user_id") || "",
  );
  const [userBalance, setUserBalance] = useState<number>(0);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. 初始化用户 ID
  useEffect(() => {
    if (!userId) {
      const newId = "UID-" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("eh_user_id", newId);
      setUserId(newId);
    }
    fetchUserData();
    fetchListData();
  }, [userId, activeTab]);


  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* --- Navigation Bar --- */}
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

      {/* --- Main Content --- */}
      <main className="max-w-5xl mx-auto p-3 md:p-6">
        {activeTab === "settings" ? (
          <SettingsPanel
            userId={userId}
            setUserId={setUserId}
            balance={userBalance}
          />
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20 text-gray-500">加载中...</div>
            ) : (
              items.map((item) => <GalleryCard key={item.id} item={item} />)
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// --- 子组件: 选项卡按钮 ---
interface TabButtonProps {
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

// --- 子组件: 列表项卡片 ---
interface GalleryCardProps {
  item: GalleryItem;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ item }) => {
  const getStatusStyle = (status: StatusType): string => {
    const styles: Record<StatusType, string> = {
      估计cost中: "bg-yellow-100 text-yellow-700",
      等待上传: "bg-blue-100 text-blue-700",
      已完成: "bg-green-100 text-green-700",
      已经关闭: "bg-gray-200 text-gray-600",
    };
    return styles[status] || "bg-gray-100";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row transition-all hover:shadow-md">
      {/* 左侧封面 */}
      <div className="w-full md:w-32 h-48 md:h-auto bg-gray-200 flex-shrink-0 relative">
        <img
          src={item.cover}
          alt="cover"
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm ${getStatusStyle(item.status)}`}
        >
          {item.status}
        </div>
      </div>

      {/* 右侧详情 */}
      <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
        <div>
          <h3
            className="text-lg font-bold text-gray-900 truncate pr-4 mb-2"
            title={item.title}
          >
            {item.title || item.g}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-600 mt-2">
            <div className="flex items-center space-x-1">
              <User size={14} className="text-gray-400" />
              <span className="font-medium text-gray-800">提交:</span>
              <span className="truncate">
                {item.submitter_id} ({item.submitter_balance} GP)
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} className="text-gray-400" />
              <span>{item.submit_time}</span>
            </div>
            <div className="flex items-center space-x-1 font-semibold text-indigo-600">
              <Database size={14} />
              <span>预期消耗: {item.estimated_cost} GP</span>
            </div>
            {item.uploader_id && (
              <div className="flex items-center space-x-1">
                <Upload size={14} className="text-gray-400" />
                <span className="font-medium text-gray-800">上传:</span>
                <span className="truncate">
                  {item.uploader_id} ({item.uploader_balance} GP)
                </span>
              </div>
            )}
          </div>

          {item.message && (
            <div className="mt-3 p-2 bg-blue-50 border-l-2 border-blue-400 text-xs text-blue-800 flex items-start space-x-2">
              <MessageSquare size={14} className="mt-0.5 flex-shrink-0" />
              <span>{item.message}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-500 hover:text-green-600 cursor-pointer">
              <ThumbsUp size={16} />{" "}
              <span className="text-xs font-bold">{item.sub_likes || 0}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500 hover:text-red-600 cursor-pointer">
              <ThumbsDown size={16} />{" "}
              <span className="text-xs font-bold">
                {item.sub_dislikes || 0}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <a
              href={item.g}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ExternalLink size={18} />
            </a>
            {item.download_url && (
              <button
                onClick={() => window.open(item.download_url, "_blank")}
                className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Download size={16} />
                <span>下载资源</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 子组件: 设置面板 ---
interface SettingsPanelProps {
  userId: string;
  setUserId: (id: string) => void;
  balance: number;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  userId,
  setUserId,
  balance,
}) => {
  const [tempId, setTempId] = useState<string>(userId);

  const saveId = () => {
    localStorage.setItem("eh_user_id", tempId);
    setUserId(tempId);
    alert("ID 已更新");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempId(e.target.value);
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
        <SettingsIcon size={20} /> <span>账户设置</span>
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            我的 ID (Auth Token)
          </label>
          <input
            type="text"
            value={tempId}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            此 ID 存储在本地，用于识别身份和余额。
          </p>
        </div>

        <div className="p-4 bg-indigo-50 rounded-lg">
          <div className="text-sm text-indigo-700 font-medium">当前余额</div>
          <div className="text-2xl font-black text-indigo-900">
            {balance.toLocaleString()}{" "}
            <span className="text-sm font-normal">GP</span>
          </div>
        </div>

        <button
          onClick={saveId}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          保存设置
        </button>
      </div>
    </div>
  );
};

export default App;
