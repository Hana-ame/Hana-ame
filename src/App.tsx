import React, { useState, useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import { GalleryCard } from "./components/gallery/GalleryCard";
import SettingsPanel from "./components/settings/SettingsPanel";
import type { GalleryItem, TabType } from "./types";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("recent_submit");
  const [userId, setUserId] = useState<string>(
    localStorage.getItem("eh_user_id") || "",
  );
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化用户
  useEffect(() => {
    (async () => {
      if (!userId) {
        const newId = "UID-" + Math.random().toString(36).substring(2, 11);
        localStorage.setItem("eh_user_id", newId);
        setUserId(newId);
      }
    })();
  }, [userId]);

  // 模拟数据加载（实际开发中请移至 hooks/useGallery.ts）
  useEffect(() => {
    (async () => {
      if (activeTab === "settings") return;
      setLoading(true);
      // TODO: fetch(`${API_BASE}/${userId}/items?tab=${activeTab}`)
      setTimeout(() => {
        setItems([]); // 填入你的 mock 或 接口数据
        setLoading(false);
      }, 500);
    })();
  }, [activeTab, userId]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab as TabType)}
      />

      <main className="max-w-5xl mx-auto p-3 md:p-6">
        {activeTab === "settings" ? (
          <SettingsPanel userId={userId} setUserId={setUserId} balance={0} />
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20 text-gray-400">加载中...</div>
            ) : (
              items.map((item) => <GalleryCard key={item.id} item={item} />)
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
