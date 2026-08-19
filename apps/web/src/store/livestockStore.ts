// src/store/livestockStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { backend } from "../services/backend";
import type { Livestock, Filters } from "@wam-mfugo/shared";

interface LivestockState {
  animals: Livestock[];
  error: string | null;
  filters: Filters;
  pendingChanges: number;
  isOnline: boolean;

  addAnimal: (animal: Omit<Livestock, "id" | "createdAt">) => Promise<void>;
  updateFilter: (key: keyof Filters, value: string) => void;
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
        const response = await backend.createAnimal(animalData);
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

    updateFilter: (key, value) => {
      set((state) => ({ filters: { ...state.filters, [key]: value } }));
    },

    syncPendingChanges: async () => {
      const state = get();
      if (!state.isOnline || state.pendingChanges === 0) return;

      const offlineAnimals = state.animals.filter((a) => a.id < 0);

      const results = await Promise.all(
        offlineAnimals.map(async (animal) => {
          try {
            const response = await backend.createAnimal(animal);
            return { tempId: animal.id, data: response.data };
          } catch {
            // keep offline animal in store
            return null;
          }
        })
      );

      const replacements = new Map<number, Livestock>();
      for (const result of results) {
        if (result) replacements.set(result.tempId, result.data);
      }

      if (replacements.size > 0) {
        set((s) => ({
          animals: s.animals.map((a) => replacements.get(a.id) ?? a),
        }));
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
