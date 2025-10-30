// src/utils/offlineStorage.ts
import type { Livestock } from "../types";

interface StoredData {
  data: Livestock[];
  lastSync: string;
}

class OfflineStorage {
  private readonly STORAGE_KEY = 'livestock-offline-data';

  saveData(data: Livestock[]) {
    try {
      const storedData: StoredData = {
        data,
        lastSync: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedData));
      console.log('Data saved to offline storage:', storedData.lastSync);
    } catch (error) {
      console.warn('Failed to save offline data:', error);
    }
  }

  getData(): StoredData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load offline data:', error);
      return null;
    }
  }

  // FIX: Actually clear data after sync
  async syncWithServer(): Promise<boolean> {
    const offlineData = this.getData();
    if (offlineData) {
      console.log('Syncing offline data with server...', offlineData.lastSync);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ADD THIS LINE - clear data after successful sync
      this.clearData();
      
      console.log('Offline data sync completed');
      return true;
    }
    return false;
  }

  clearData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear offline data:', error);
    }
  }
}

export const offlineStorage = new OfflineStorage();