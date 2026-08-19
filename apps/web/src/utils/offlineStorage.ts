// src/utils/offlineStorage.ts
import Dexie, { type Table } from "dexie";

const STORAGE_VERSION = "v2";
export const OFFLINE_PREFIX = "livestock_offline_";

interface OfflineRecord<T> {
  key: string;
  version: string;
  timestamp: string;
  data: T;
}

class OfflineDatabase extends Dexie {
  records!: Table<OfflineRecord<unknown>, string>;

  constructor() {
    super("wam-mfugo-offline");
    this.version(1).stores({ records: "key" });
  }
}

let db: OfflineDatabase | null = null;

function getDb(): OfflineDatabase {
  if (!db) {
    db = new OfflineDatabase();
  }
  return db;
}

export function getOfflineDatabase(): OfflineDatabase {
  return getDb();
}

/**
 * Save data to IndexedDB-backed offline storage
 */
export async function saveOfflineData<T>(key: string, data: T) {
  try {
    await getDb().records.put({
      key: `${OFFLINE_PREFIX}${key}`,
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error) {
    console.error("Failed to save offline data:", error);
  }
}

/**
 * Load data from offline storage
 */
export async function loadOfflineData<T>(key: string): Promise<T | null> {
  try {
    const record = await getDb().records.get(`${OFFLINE_PREFIX}${key}`);
    if (!record) return null;

    if (record.version !== STORAGE_VERSION) {
      console.warn("Offline data version mismatch, clearing cache.");
      await getDb().records.delete(`${OFFLINE_PREFIX}${key}`);
      return null;
    }

    return record.data as T;
  } catch (error) {
    console.error("Failed to load offline data:", error);
    return null;
  }
}

/**
 * Clear offline data (single key or all)
 */
export async function clearOfflineData(key?: string) {
  try {
    if (key) {
      await getDb().records.delete(`${OFFLINE_PREFIX}${key}`);
    } else {
      await getDb().records.where("key").startsWith(OFFLINE_PREFIX).delete();
    }
  } catch (error) {
    console.error("Failed to clear offline data:", error);
  }
}
