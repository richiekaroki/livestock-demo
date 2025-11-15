// src/store/livestockStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { mockAPI } from "../services/mockApi";
import type { Livestock, Filters } from "../types";

interface LivestockState {
  animals: Livestock[];
  error: string | null;
  filters: Filters;
  pendingChanges: number;
  isOnline: boolean;

  addAnimal: (animal: Omit<Livestock, "id" | "createdAt">) => Promise<void>;
  updateFilters: (filters: Partial<Filters>) => void;
  syncPendingChanges: () => Promise<void>;
  resetStore: () => void;
  setOnline: (online: boolean) => void;
}

let tempIdCounter = -1; // Negative IDs for offline animals

export const useLivestockStore = create<LivestockState>()(
  devtools((set, get) => ({
    animals: [],
    error: null,
    filters: { type: "", health: "", county: "" },
    pendingChanges: 0,
    isOnline: true,

    addAnimal: async (animalData) => {
      const state = get();

      const tempAnimal: Livestock = {
        ...animalData,
        id: tempIdCounter--,
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      set({ animals: [...state.animals, tempAnimal], error: null });

      if (!state.isOnline) {
        set((s) => ({
          pendingChanges: s.pendingChanges + 1,
          error: "Offline: animal saved locally",
        }));
        return;
      }

      try {
        const response = await mockAPI.createAnimal(animalData);
        set((s) => ({
          animals: s.animals.map((a) =>
            a.id === tempAnimal.id ? response.data : a
          ),
        }));
      } catch {
        // Revert optimistic update if API fails
        set((s) => ({
          animals: s.animals.filter((a) => a.id !== tempAnimal.id),
          pendingChanges: s.pendingChanges + 1,
          error: "API failed: animal saved locally",
        }));
      }
    },

    updateFilters: (filters) => {
      set((state) => ({ filters: { ...state.filters, ...filters } }));
    },

    syncPendingChanges: async () => {
      const state = get();
      if (!state.isOnline || state.pendingChanges === 0) return;

      const offlineAnimals = state.animals.filter((a) => a.id < 0);

      for (const animal of offlineAnimals) {
        try {
          const response = await mockAPI.createAnimal(animal);
          set((s) => ({
            animals: s.animals.map((a) =>
              a.id === animal.id ? response.data : a
            ),
          }));
        } catch {
          // keep offline animal in store
        }
      }

      set({ pendingChanges: 0 });
    },

    resetStore: () => {
      set({
        animals: [],
        error: null,
        filters: { type: "", health: "", county: "" },
        pendingChanges: 0,
        isOnline: true,
      });
      tempIdCounter = -1;
    },

    setOnline: (online) => {
      set({ isOnline: online });
    },
  }))
);
