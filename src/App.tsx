import React, { useState } from "react";
import Navbar from "./components/layout/Navbar";
import { GalleryCard } from "./components/gallery/GalleryCard";
import SettingsPanel from "./components/settings/SettingsPanel";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { GalleryItem, TabType } from "./types";
// 1. Import the hooks (adjust paths as necessary)
import { useUser } from "./hooks/useUser";
import { useGallery } from "./hooks/useGallery";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("recent_submit");
  // 2. Replace the old userId state and useEffect with this:
  const userId = useUser();
  // 3. Replace items/loading/error state and the fetching useEffect with this:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { items, loading, error, refresh } = useGallery(activeTab, userId);

  if (loading) return <div>Loading...</div>;

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab as TabType)}
      />

      <main className="max-w-5xl mx-auto p-3 md:p-6">
        {activeTab === "settings" ? (
          <SettingsPanel userId={userId} balance={0} />
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
