// src/hooks/useLiveData.ts
import { useCallback, useEffect, useState } from "react";
import { mockAPI } from "../services/mockApi";
import type { Livestock } from "../types";
import { loadOfflineData, saveOfflineData } from "../utils/offlineStorage";

export function useLiveData() {
  const [data, setData] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validateData = (items: unknown): items is Livestock[] => {
    return (
      Array.isArray(items) &&
      items.every(
        (a) =>
          a && typeof a === "object" && "id" in a && "name" in a && "type" in a
      )
    );
  };

  const fetchData = useCallback(async (retryCount = 0): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await mockAPI.getAnimals();
      if (response.success && validateData(response.data)) {
        setData(response.data);
        await saveOfflineData("livestockData", response.data); // ✅ Added await
      } else {
        throw new Error("Invalid data format from API");
      }
    } catch (err) {
      console.warn("API fetch failed:", err);
      if (retryCount < 2) {
        console.log(`Retrying... (${retryCount + 1})`);
        await fetchData(retryCount + 1);
        return; // ✅ Early return prevents finally block
      }

      const offline = await loadOfflineData<Livestock[]>("livestockData");
      if (validateData(offline)) {
        setData(offline);
        setError("Loaded offline data (network unavailable)");
      } else {
        setError("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, refetch: () => fetchData() };
}