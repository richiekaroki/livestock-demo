// src/hooks/useLiveData.ts

import { useEffect, useState } from "react";
import { mockAPI } from "../services/mockApi";

export function useLiveData() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await mockAPI.getAnimals();
      if (response.success) {
        setData(response.data);
        setError(null);
      }
    } catch (err) {
      setError("Failed to fetch data");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Simulate real-time updates
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: fetchData };
}
