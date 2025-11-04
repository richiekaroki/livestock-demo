// src/utils/offlineStorage.ts
const STORAGE_VERSION = "v2"; // Increment this when data structure changes

interface OfflinePayload<T> {
  version: string;
  timestamp: string;
  data: T;
}

export async function saveOfflineData<T>(key: string, data: T) {
  try {
    const payload: OfflinePayload<T> = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      data,
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to save offline data:", error);
  }
}

export async function loadOfflineData<T>(key: string): Promise<T | null> {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed: OfflinePayload<T> = JSON.parse(item);

    if (parsed.version !== STORAGE_VERSION) {
      console.warn("Offline data version mismatch, clearing cache.");
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error("Failed to load offline data:", error);
    return null;
  }
}

export function clearOfflineData(key?: string) {
  if (key) localStorage.removeItem(key);
  else localStorage.clear();
}
