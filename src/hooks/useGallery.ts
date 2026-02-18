import { useState, useEffect, useCallback } from "react";
import API_BASE from './apiBase'
import type { TabType, GalleryItem } from "../types";


export const useGallery = (activeTab: TabType, userId: string | null) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    // Don't fetch if user isn't ready or on settings tab
    if (!userId || activeTab === "settings") {
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/items?tab=${activeTab}&userId=${userId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch gallery items");

      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, userId]);

  // Auto-fetch when tab or user changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refresh: fetchItems };
};
