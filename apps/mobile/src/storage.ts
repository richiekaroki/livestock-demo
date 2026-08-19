// src/storage.ts — AsyncStorage offline cache + write queue
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Livestock } from "@wam-mfugo/shared";

const CACHE_KEY = "wam_animals_cache";
const QUEUE_KEY = "wam_offline_queue";

interface QueuedCreate {
  data: Omit<Livestock, "id">;
  createdAt: string;
}

export async function saveAnimalsCache(animals: Livestock[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(animals));
  } catch (error) {
    console.warn("Failed to save offline cache:", error);
  }
}

export async function loadAnimalsCache(): Promise<Livestock[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Livestock[]) : null;
  } catch (error) {
    console.warn("Failed to load offline cache:", error);
    return null;
  }
}

export async function enqueueCreate(
  data: Omit<Livestock, "id">
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: QueuedCreate[] = raw ? JSON.parse(raw) : [];
    queue.push({ data, createdAt: new Date().toISOString() });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn("Failed to enqueue offline create:", error);
  }
}

export async function drainQueue(
  create: (data: Omit<Livestock, "id">) => Promise<unknown>
): Promise<number> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return 0;

  const queue: QueuedCreate[] = JSON.parse(raw);
  const remaining: QueuedCreate[] = [];
  let synced = 0;

  for (const item of queue) {
    try {
      await create(item.data);
      synced += 1;
    } catch {
      remaining.push(item);
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return synced;
}