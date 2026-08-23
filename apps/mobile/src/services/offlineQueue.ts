// src/offlineQueue.ts — persistent mutation queue for offline-first field use
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./api";

const QUEUE_KEY = "wam_offline_queue";
const MAX_RETRIES = 3;

export type QueueStatus = "pending" | "processing" | "completed" | "failed";

export interface QueueItem {
  id: string;
  method: "POST" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  timestamp: string;
  retryCount: number;
  status: QueueStatus;
  error?: string;
}

let listeners: Array<() => void> = [];

function notify() {
  for (const fn of listeners) fn();
}

export function onQueueChange(fn: () => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

async function readQueue(): Promise<QueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueueItem[]) : [];
  } catch {
    return [];
  }
}

async function writeQueue(items: QueueItem[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  notify();
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function enqueue(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown
): Promise<QueueItem> {
  const item: QueueItem = {
    id: generateId(),
    method,
    path,
    body,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    status: "pending",
  };
  const queue = await readQueue();
  queue.push(item);
  await writeQueue(queue);
  return item;
}

export async function dequeue(): Promise<QueueItem | null> {
  const queue = await readQueue();
  const item = queue.find((i) => i.status === "pending");
  if (!item) return null;
  item.status = "processing";
  await writeQueue(queue);
  return { ...item };
}

export async function markComplete(id: string): Promise<void> {
  const queue = await readQueue();
  const idx = queue.findIndex((i) => i.id === id);
  if (idx === -1) return;
  queue.splice(idx, 1);
  await writeQueue(queue);
}

export async function markFailed(id: string, error?: string): Promise<void> {
  const queue = await readQueue();
  const item = queue.find((i) => i.id === id);
  if (!item) return;
  item.retryCount += 1;
  item.status = item.retryCount >= MAX_RETRIES ? "failed" : "pending";
  item.error = error;
  await writeQueue(queue);
}

export async function getQueue(): Promise<QueueItem[]> {
  return readQueue();
}

export async function getPendingCount(): Promise<number> {
  const queue = await readQueue();
  return queue.filter((i) => i.status === "pending").length;
}

export async function getFailedCount(): Promise<number> {
  const queue = await readQueue();
  return queue.filter((i) => i.status === "failed").length;
}

export async function clearCompleted(): Promise<void> {
  const queue = await readQueue();
  const remaining = queue.filter((i) => i.status !== "completed");
  await writeQueue(remaining);
}

export async function retryAllFailed(): Promise<void> {
  const queue = await readQueue();
  for (const item of queue) {
    if (item.status === "failed") {
      item.status = "pending";
      item.retryCount = 0;
      item.error = undefined;
    }
  }
  await writeQueue(queue);
}

async function executeItem(item: QueueItem): Promise<void> {
  const token = await AsyncStorage.getItem("wam_auth_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE_URL}${item.path}`, {
    method: item.method,
    headers,
    body: item.body ? JSON.stringify(item.body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
}

export async function processQueue(): Promise<{ synced: number; failed: number }> {
  const queue = await readQueue();
  const pending = queue.filter((i) => i.status === "pending");
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    item.status = "processing";
    await writeQueue(queue);

    try {
      await executeItem(item);
      const idx = queue.findIndex((q) => q.id === item.id);
      if (idx !== -1) queue.splice(idx, 1);
      synced += 1;
    } catch (err) {
      item.retryCount += 1;
      item.status = item.retryCount >= MAX_RETRIES ? "failed" : "pending";
      item.error = err instanceof Error ? err.message : "Unknown error";
      failed += 1;
    }

    await writeQueue(queue);
  }

  return { synced, failed };
}

/** Retry a single failed item by id */
export async function retryItem(id: string): Promise<void> {
  const queue = await readQueue();
  const item = queue.find((i) => i.id === id);
  if (!item || item.status !== "failed") return;
  item.status = "pending";
  item.retryCount = 0;
  item.error = undefined;
  await writeQueue(queue);
}
