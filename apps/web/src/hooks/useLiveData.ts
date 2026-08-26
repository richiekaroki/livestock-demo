// src/hooks/useLiveData.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { backend } from "../services/backend";
import { mockAPI } from "../services/mockApi";
import type { Livestock } from "@wam-mfugo/shared";
import { loadOfflineData, saveOfflineData } from "../utils/offlineStorage";
import { TOKEN_KEY } from "../config";

function isAuthenticated(): boolean {
  try {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  } catch {
    return false;
  }
}

export function useLiveData() {
  const [data, setData] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);
  const dataRef = useRef<Livestock[]>([]);

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

    // Decide API once per call — don't re-evaluate on retry
    const api = isAuthenticated() ? backend : mockAPI;

    // Mock data never fails, so skip retries entirely
    const maxRetries = api === mockAPI ? 0 : 2;

    try {
      const response = await api.getAnimals();
      if (response.success && validateData(response.data)) {
        const prev = dataRef.current;
        const unchanged =
          prev.length === response.data.length &&
          response.data.every((item, i) => item === prev[i]);

        if (!unchanged) {
          dataRef.current = response.data;
          setData(response.data);
          await saveOfflineData("livestockData", response.data);
        }
      } else {
        throw new Error("Invalid data format from API");
      }
    } catch (err) {
      console.warn("API fetch failed:", err);
      if (retryCount < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (retryCount + 1)));
        setLoading(false);
        await fetchData(retryCount + 1);
        return;
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
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchData();
    }
  }, [fetchData]);

  return { data, loading, error, refetch: () => fetchData() };
}