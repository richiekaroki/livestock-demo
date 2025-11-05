// src/store/livestockStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mockAPI } from "../services/mockApi";
import type { AnimalStats, Filters, Livestock } from "../types";

interface LivestockState {
  // Data
  animals: Livestock[];
  stats: AnimalStats | null;
  filters: Filters;

  // UI State
  loading: boolean;
  error: string | null;

  // Sync State (CRITICAL for offline-first)
  lastSyncTime: string | null;
  syncStatus: "idle" | "syncing" | "error";
  pendingChanges: number;
  isOnline: boolean;

  // Actions
  fetchAnimals: () => Promise<void>;
  fetchStats: () => Promise<void>;
  addAnimal: (animal: Omit<Livestock, "id">) => Promise<void>;
  updateAnimalHealth: (
    id: number,
    health: Livestock["health"]
  ) => Promise<void>;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;

  // Sync Actions
  syncWithServer: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
}

export const useLivestockStore = create<LivestockState>()(
  persist(
    (set, get) => ({
      // Initial State
      animals: [],
      stats: null,
      filters: { type: "", health: "", county: "" },
      loading: false,
      error: null,
      lastSyncTime: null,
      syncStatus: "idle",
      pendingChanges: 0,
      isOnline: navigator.onLine,

      // Fetch all animals
      fetchAnimals: async () => {
        set({ loading: true, error: null });

        try {
          const response = await mockAPI.getAnimals();

          if (response.success) {
            set({
              animals: response.data,
              loading: false,
              lastSyncTime: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Failed to fetch animals:", error);
          set({
            error: "Failed to load animals. Using cached data.",
            loading: false,
          });
        }
      },

      // Fetch statistics
      fetchStats: async () => {
        try {
          const response = await mockAPI.getAnimalStatistics();
          if (response.success) {
            set({ stats: response.data });
          }
        } catch (error) {
          console.error("Failed to fetch stats:", error);
        }
      },

      // Add new animal with optimistic update
      addAnimal: async (animalData) => {
        const { isOnline, animals } = get();

        // Optimistic update
        const optimisticAnimal: Livestock = {
          id: Date.now(), // Temporary ID
          ...animalData,
          createdAt: new Date().toISOString(),
        };

        set({
          animals: [...animals, optimisticAnimal],
          pendingChanges: isOnline ? 0 : get().pendingChanges + 1,
        });

        if (!isOnline) {
          console.log("Offline: Queued for sync");
          return;
        }

        try {
          const response = await mockAPI.createAnimal(animalData);

          if (response.success) {
            // Replace optimistic with real data
            set((state) => ({
              animals: state.animals.map((a) =>
                a.id === optimisticAnimal.id ? response.data : a
              ),
            }));

            // Refresh stats
            get().fetchStats();
          }
        } catch (error) {
          console.error("Failed to add animal:", error);

          // Mark as pending sync
          set((state) => ({
            pendingChanges: state.pendingChanges + 1,
            error: "Animal saved locally. Will sync when online.",
          }));
        }
      },

      // Update animal health
      updateAnimalHealth: async (id, health) => {
        const { animals, isOnline } = get();

        // Optimistic update
        set({
          animals: animals.map((a) => (a.id === id ? { ...a, health } : a)),
        });

        if (!isOnline) {
          set((state) => ({ pendingChanges: state.pendingChanges + 1 }));
          return;
        }

        try {
          await mockAPI.updateAnimalHealth(id, health);
          get().fetchStats();
        } catch (error) {
          console.error("Failed to update health:", error);

          // Revert on failure
          set({
            animals,
            error: "Update failed. Changes saved locally.",
          });
        }
      },

      // Filter management
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      resetFilters: () => {
        set({ filters: { type: "", health: "", county: "" } });
      },

      // Sync with server (for offline changes)
      syncWithServer: async () => {
        const { pendingChanges, isOnline } = get();

        if (!isOnline || pendingChanges === 0) return;

        set({ syncStatus: "syncing" });

        try {
          // In production: Process offline queue
          await new Promise((resolve) => setTimeout(resolve, 1000));

          set({
            syncStatus: "idle",
            pendingChanges: 0,
            lastSyncTime: new Date().toISOString(),
          });

          // Refresh data
          await get().fetchAnimals();
        } catch (error) {
          console.error("Sync failed:", error);
          set({ syncStatus: "error" });
        }
      },

      // Update online status
      setOnlineStatus: (isOnline) => {
        set({ isOnline });

        // Auto-sync when coming back online
        if (isOnline && get().pendingChanges > 0) {
          get().syncWithServer();
        }
      },
    }),
    {
      name: "livestock-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),

      // Only persist certain fields
      partialPersist: true,
      partialize: (state) => ({
        animals: state.animals,
        filters: state.filters,
        lastSyncTime: state.lastSyncTime,
        pendingChanges: state.pendingChanges,
      }),
    }
  )
);

// Hook to get filtered animals (memoized selector)
export const useFilteredAnimals = () => {
  return useLivestockStore((state) => {
    const { animals, filters } = state;

    return animals.filter((animal) => {
      return (
        (filters.type === "" || animal.type === filters.type) &&
        (filters.health === "" || animal.health === filters.health) &&
        (filters.county === "" || animal.county === filters.county)
      );
    });
  });
};

// Hook for sync status indicator
export const useSyncStatus = () => {
  return useLivestockStore((state) => ({
    isOnline: state.isOnline,
    pendingChanges: state.pendingChanges,
    syncStatus: state.syncStatus,
    lastSyncTime: state.lastSyncTime,
  }));
};
