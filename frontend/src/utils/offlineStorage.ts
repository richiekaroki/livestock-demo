// src/utils/offlineStorage.ts

// Simulate offline-first architecture
class OfflineStorage {
  private readonly STORAGE_KEY = 'livestock-offline-data';

  saveData(data: any[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        data,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Failed to save offline data:', error);
    }
  }

  getData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load offline data:', error);
      return null;
    }
  }

  // Simulate sync when back online
  async syncWithServer() {
    const offlineData = this.getData();
    if (offlineData) {
      console.log('Syncing offline data with server...');
      // In real app, this would send data to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    }
    return false;
  }
}

export const offlineStorage = new OfflineStorage();