import { useState, useEffect } from "react";
import { backend } from "../services/backend";
import { mockAPI } from "../services/mockApi";
import type { County } from "@wam-mfugo/shared";

export function useCounties() {
  const [counties, setCounties] = useState<County[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await backend.getCounties();
        if (!cancelled && res.success && res.data.length > 0) {
          setCounties(res.data);
        } else {
          // Fallback to mock data if API returns empty
          const mock = await mockAPI.getCounties();
          if (!cancelled && mock.success) setCounties(mock.data);
        }
      } catch {
        // Fallback to mock data on network error
        try {
          const mock = await mockAPI.getCounties();
          if (!cancelled && mock.success) setCounties(mock.data);
        } catch {
          // silently fail — county list is non-critical
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { counties, loading };
}
