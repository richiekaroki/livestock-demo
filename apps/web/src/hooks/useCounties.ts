import { useState, useEffect } from "react";
import { remoteApi } from "../services/remoteApi";
import type { County } from "@wam-mfugo/shared";

export function useCounties() {
  const [counties, setCounties] = useState<County[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await remoteApi.getCounties();
        if (!cancelled && res.success) {
          setCounties(res.data);
        }
      } catch {
        // silently fail — county list is non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { counties, loading };
}
