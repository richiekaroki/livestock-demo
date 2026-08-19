// src/useAnimals.ts — data hook with offline-first caching
import { useCallback, useEffect, useState } from "react";
import type { AnimalStats, Livestock } from "@wam-mfugo/shared";
import * as api from "./api";
import {
  drainQueue,
  enqueueCreate,
  loadAnimalsCache,
  saveAnimalsCache,
} from "./storage";

export interface UseAnimalsResult {
  animals: Livestock[];
  stats: AnimalStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addAnimal: (data: Omit<Livestock, "id">) => Promise<boolean>;
}

export function useAnimals(): UseAnimalsResult {
  const [animals, setAnimals] = useState<Livestock[]>([]);
  const [stats, setStats] = useState<AnimalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [animalRes, statsRes] = await Promise.all([
        api.getAnimals(),
        api.getAnimalStatistics(),
      ]);
      const data = animalRes.data ?? [];
      setAnimals(data);
      if (statsRes.data) setStats(statsRes.data);
      setError(null);
      await saveAnimalsCache(data);
    } catch (err) {
      const cached = await loadAnimalsCache();
      if (cached && cached.length > 0) setAnimals(cached);
      setError(err instanceof Error ? err.message : "Failed to load animals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addAnimal = useCallback(
    async (data: Omit<Livestock, "id">): Promise<boolean> => {
      try {
        await api.createAnimal(data);
        const synced = await drainQueue(api.createAnimal);
        if (synced > 0) {
          await refresh();
        } else {
          const updated = [...animals, { ...data, id: animals.length + 1 }];
          setAnimals(updated);
          await saveAnimalsCache(updated);
        }
        return true;
      } catch {
        await enqueueCreate(data);
        return false;
      }
    },
    [animals, refresh]
  );

  return { animals, stats, loading, error, refresh, addAnimal };
}