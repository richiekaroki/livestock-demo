// src/components/sync/KALROSyncStatus.tsx

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { governmentAPI } from "../../services/governmentAPIs";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

interface SyncStatus {
  lastSync: string | null;
  pendingItems: number;
  isOnline: boolean;
  isSyncing: boolean;
}

const KALROSyncStatus = memo(function KALROSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => ({
    lastSync: localStorage.getItem("kalro_last_sync"),
    pendingItems: 0,
    isOnline: navigator.onLine,
    isSyncing: false,
  }));

  const [syncResult, setSyncResult] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleManualSync = useCallback(async () => {
    const currentOnlineStatus = navigator.onLine;
    const currentPendingItems = JSON.parse(
      localStorage.getItem("kalro_sync_queue") || "[]"
    ).length;

    if (!currentOnlineStatus) {
      setSyncResult({
        type: "error",
        message: "Cannot sync while offline. Please check your connection.",
      });
      return;
    }

    if (currentPendingItems === 0) {
      setSyncResult({
        type: "success",
        message: "All records are already synced!",
      });
      setTimeout(() => setSyncResult({ type: null, message: "" }), 3000);
      return;
    }

    setSyncStatus((prev) => ({ ...prev, isSyncing: true }));
    setSyncResult({ type: null, message: "" });

    try {
      const result = await governmentAPI.processOfflineQueue();

      const now = new Date().toISOString();
      localStorage.setItem("kalro_last_sync", now);

      setSyncStatus((prev) => ({
        ...prev,
        lastSync: now,
        pendingItems: currentPendingItems - result.processed,
        isSyncing: false,
      }));

      if (result.processed > 0) {
        setSyncResult({
          type: "success",
          message: `Successfully synced ${result.processed} record(s) with KALRO!`,
        });
      }

      if (result.failed > 0) {
        setSyncResult({
          type: "error",
          message: `${result.failed} record(s) failed to sync. Will retry later.`,
        });
      }

      setTimeout(() => setSyncResult({ type: null, message: "" }), 5000);
    } catch (error) {
      console.error("Sync failed:", error);

      setSyncStatus((prev) => ({ ...prev, isSyncing: false }));
      setSyncResult({
        type: "error",
        message: "Sync failed. Please try again later.",
      });

      setTimeout(() => setSyncResult({ type: null, message: "" }), 5000);
    }
  }, []);

  useEffect(() => {
    const queue = JSON.parse(localStorage.getItem("kalro_sync_queue") || "[]");
    setSyncStatus((prev) => ({ ...prev, pendingItems: queue.length }));
  }, []);

  const isOnline = useOnlineStatus();
  const prevOnlineRef = useRef<boolean | null>(null);

  useEffect(() => {
    const prev = prevOnlineRef.current;
    prevOnlineRef.current = isOnline;

    setSyncStatus((prev) => ({ ...prev, isOnline }));

    if (prev === null) return;

    if (!isOnline) {
      setSyncResult({
        type: "error",
        message: "Connection lost. Changes will sync when back online.",
      });

      const timer = setTimeout(() => setSyncResult({ type: null, message: "" }), 5000);
      return () => clearTimeout(timer);
    }

    if (!prev) {
      const pendingQueue = JSON.parse(
        localStorage.getItem("kalro_sync_queue") || "[]"
      );
      if (pendingQueue.length > 0) {
        handleManualSync();
      }
    }
  }, [isOnline, handleManualSync]);

  const formatLastSync = (timestamp: string | null): string => {
    if (!timestamp) return "Never";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card p-4 bg-bg-secondary border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                syncStatus.isOnline ? "bg-success" : "bg-error"
              } animate-pulse`}
            />
            <span className="text-sm font-medium text-text-primary">
              {syncStatus.isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <div className="w-px h-4 bg-border" />

          <div className="text-sm text-text-secondary">
            <span className="font-medium">KALRO Sync:</span>{" "}
            {syncStatus.isSyncing ? (
              <span className="text-info">Syncing...</span>
            ) : syncStatus.pendingItems > 0 ? (
              <span className="text-warning">{syncStatus.pendingItems} pending</span>
            ) : (
              <span className="text-success">All synced</span>
            )}
          </div>
        </div>

        {syncStatus.pendingItems > 0 && syncStatus.isOnline && (
          <button
            onClick={handleManualSync}
            disabled={syncStatus.isSyncing}
            className={`btn btn-primary text-xs py-1.5 px-3 ${
              syncStatus.isSyncing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {syncStatus.isSyncing ? (
              <span className="flex items-center gap-1.5">
                <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                Syncing...
              </span>
            ) : (
              "Sync Now"
            )}
          </button>
        )}
      </div>

      <div className="text-xs text-text-tertiary font-mono">
        Last synced: {formatLastSync(syncStatus.lastSync)}
      </div>

      {syncResult.type && (
        <div
          className={`mt-3 p-2.5 rounded-lg text-xs font-medium ${
            syncResult.type === "success"
              ? "bg-success/10 text-success border border-success/20"
              : "bg-warning/10 text-warning border border-warning/20"
          }`}
        >
          {syncResult.message}
        </div>
      )}

      {!syncStatus.isOnline && (
        <div className="mt-3 p-2.5 bg-error/5 border border-error/20 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-error mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="text-xs text-error">
              <strong>Offline Mode Active</strong>
              <p className="mt-1 text-error/80">
                Your changes are saved locally and will sync with KALRO when
                connection is restored.
              </p>
            </div>
          </div>
        </div>
      )}

      {syncStatus.pendingItems > 0 && (
        <div className="mt-3 p-2.5 bg-info/5 border border-info/20 rounded-lg text-xs text-info">
          <strong>Tip:</strong> Records will auto-sync when you reconnect.
          You can also manually sync using the button above.
        </div>
      )}
    </div>
  );
});

export default KALROSyncStatus;
