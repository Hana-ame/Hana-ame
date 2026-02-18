import { useState, useEffect } from "react";
import API_BASE from './apiBase'

export const useUser = () => {
  const [userId, setUserId] = useState<string | null>(
    localStorage.getItem("eh_user_id"),
  );

  useEffect(() => {
    const initUser = async () => {
      if (!userId) {
        try {
          const res = await fetch(`${API_BASE}/new`);
          const data = await res.json();
          localStorage.setItem("eh_user_id", data.userId);
          setUserId(data.userId);
        } catch (e) {
          console.error("Failed to initialize user", e);
        }
      }
    };
    initUser();
  }, [userId]);

  return userId;
};
