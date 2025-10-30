// src/hooks/useLiveData.ts

import { useEffect, useRef, useState } from "react";
import { mockAPI } from "../services/mockApi";
import type { Livestock } from "../types";
import { offlineStorage } from "../utils/offlineStorage";

export function useLiveData() {
  const [data, setData] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const response = await mockAPI.getAnimals();

      if (response.success) {
        setData(response.data);
        setError(null);
        // Save to offline storage
        offlineStorage.saveData(response.data);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        // Try to load from offline storage when API fails
        const offlineData = offlineStorage.getData();
        if (offlineData) {
          setData(offlineData.data as Livestock[]);
          setError("Using cached data - connection issue");
        } else {
          setError("Failed to fetch data and no cached data available");
        }
        console.error("API Error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load offline data on initial mount
  useEffect(() => {
    const offlineData = offlineStorage.getData();
    if (offlineData) {
      setData(offlineData.data as Livestock[]);
      setLoading(false);
    }
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync when coming back online
      offlineStorage.syncWithServer();
      fetchData(); // Refresh data
    };

    const handleOffline = () => {
      setIsOnline(false);
      setError("You are currently offline - using cached data");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => {
      clearInterval(interval);
      abortControllerRef.current?.abort();
    };
  }, []);

  return { data, loading, error, isOnline, refetch: fetchData };
}
