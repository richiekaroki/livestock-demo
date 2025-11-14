// src/utils/offlineStorage.ts
const STORAGE_VERSION = "v2";
export const OFFLINE_PREFIX = "livestock_offline_";

interface OfflinePayload<T> {
  version: string;
  timestamp: string;
  data: T;
}

/**
 * Save data to offline storage (localStorage)
 */
export async function saveOfflineData<T>(key: string, data: T) {
  try {
    const payload: OfflinePayload<T> = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      data,
    };
    localStorage.setItem(`${OFFLINE_PREFIX}${key}`, JSON.stringify(payload)); 
  } catch (error) {
    console.error("Failed to save offline data:", error);
  }
}

/**
 * Load data from offline storage
 */
export async function loadOfflineData<T>(key: string): Promise<T | null> {
  try {
    const item = localStorage.getItem(`${OFFLINE_PREFIX}${key}`); 
    if (!item) return null;

    const parsed: OfflinePayload<T> = JSON.parse(item);

    if (parsed.version !== STORAGE_VERSION) {
      console.warn("Offline data version mismatch, clearing cache.");
      localStorage.removeItem(`${OFFLINE_PREFIX}${key}`); 
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error("Failed to load offline data:", error);
    return null;
  }
}

/**
 * Clear offline data (single key or all)
 */
export function clearOfflineData(key?: string) {
  if (key) {
    localStorage.removeItem(`${OFFLINE_PREFIX}${key}`); 
  } else {
    // Clear all offline data by filtering keys with our prefix
    Object.keys(localStorage)
      .filter(k => k.startsWith(OFFLINE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }
}

// NOTE:
// In production, consider replacing localStorage with IndexedDB (Web) or
// AsyncStorage (React Native) for larger or persistent datasets.