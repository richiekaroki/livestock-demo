// src/syncService.ts — monitors connectivity and auto-processes the offline queue
import { useEffect, useRef, useState, useCallback } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import {
  processQueue,
  getPendingCount,
  getFailedCount,
  onQueueChange,
} from "./offlineQueue";

const BACKOFF_DELAYS = [1000, 2000, 4000, 8000];

interface SyncState {
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncResult: { synced: number; failed: number } | null;
  isOnline: boolean;
}

let globalListeners: Array<(state: SyncState) => void> = [];
let currentState: SyncState = {
  isSyncing: false,
  pendingCount: 0,
  failedCount: 0,
  lastSyncResult: null,
  isOnline: true,
};

function setState(partial: Partial<SyncState>) {
  currentState = { ...currentState, ...partial };
  for (const fn of globalListeners) fn(currentState);
}

let backoffAttempt = 0;
let processing = false;

async function syncWithBackoff() {
  if (processing) return;
  processing = true;

  let pending = await getPendingCount();
  while (pending > 0) {
    setState({ isSyncing: true });
    const result = await processQueue();
    setState({
      lastSyncResult: result,
      isSyncing: false,
    });

    pending = await getPendingCount();
    const failed = await getFailedCount();
    setState({ pendingCount: pending, failedCount: failed });

    if (pending > 0 && backoffAttempt < BACKOFF_DELAYS.length) {
      const delay = BACKOFF_DELAYS[backoffAttempt];
      backoffAttempt += 1;
      await new Promise((r) => setTimeout(r, delay));
    } else {
      backoffAttempt = 0;
      break;
    }
  }

  processing = false;
}

function handleConnectivityChange(state: NetInfoState) {
  const online = state.isConnected === true && state.isInternetReachable !== false;
  setState({ isOnline: online });
  if (online) {
    backoffAttempt = 0;
    void syncWithBackoff();
  }
}

let started = false;

export function startSyncService(): () => void {
  if (started) return () => {};
  started = true;

  const unsub = NetInfo.addEventListener(handleConnectivityChange);

  // Check initial state
  NetInfo.fetch().then(handleConnectivityChange);

  // Listen for queue changes
  const unsubQueue = onQueueChange(async () => {
    const [pending, failed] = await Promise.all([
      getPendingCount(),
      getFailedCount(),
    ]);
    setState({ pendingCount: pending, failedCount: failed });
  });

  return () => {
    unsub();
    unsubQueue();
    started = false;
  };
}

/** Manually trigger an immediate sync (e.g. pull-to-refresh). */
export async function syncNow() {
  backoffAttempt = 0;
  await syncWithBackoff();
}

export function useSyncState(): SyncState & {
  retryFailed: () => Promise<void>;
  triggerSync: () => Promise<void>;
} {
  const [state, setLocal] = useState<SyncState>(currentState);
  const stateRef = useRef(currentState);
  stateRef.current = state;

  useEffect(() => {
    const unsub = startSyncService();
    const unsubChange = onQueueChange(async () => {
      const [pending, failed] = await Promise.all([
        getPendingCount(),
        getFailedCount(),
      ]);
      setLocal((prev) => ({ ...prev, pendingCount: pending, failedCount: failed }));
    });

    // Subscribe to global state changes
    const listener = (s: SyncState) => setLocal(s);
    globalListeners.push(listener);

    return () => {
      unsub();
      unsubChange();
      globalListeners = globalListeners.filter((l) => l !== listener);
    };
  }, []);

  const retryFailed = useCallback(async () => {
    const { retryAllFailed } = await import("./offlineQueue");
    await retryAllFailed();
    const pending = await getPendingCount();
    const failed = await getFailedCount();
    setLocal((prev) => ({ ...prev, pendingCount: pending, failedCount: failed }));
    void syncWithBackoff();
  }, []);

  const triggerSync = useCallback(async () => {
    backoffAttempt = 0;
    void syncWithBackoff();
  }, []);

  return { ...state, retryFailed, triggerSync };
}
