import { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";

// --- 子组件: 设置面板 ---
export interface SettingsPanelProps {
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

export default SettingsPanel;
