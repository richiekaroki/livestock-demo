// src/components/sync/KALROSyncStatus.tsx

import { useCallback, useEffect, useState } from "react";
import { governmentAPI } from "../../services/governmentAPIs";

interface SyncStatus {
  lastSync: string | null;
  pendingItems: number;
  isOnline: boolean;
  isSyncing: boolean;
}

export default function KALROSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: localStorage.getItem("kalro_last_sync"),
    pendingItems: 0,
    isOnline: navigator.onLine,
    isSyncing: false,
  });

  const [syncResult, setSyncResult] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Manual sync handler - fixed circular dependency
  const handleManualSync = useCallback(async () => {
    // Use refs for latest values without re-creating callback
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
      // Process the offline queue
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
          message: `✅ Successfully synced ${result.processed} record(s) with KALRO!`,
        });
      }

      if (result.failed > 0) {
        setSyncResult({
          type: "error",
          message: `⚠️ ${result.failed} record(s) failed to sync. Will retry later.`,
        });
      }

      // Clear message after 5 seconds
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
  }, []); // ✅ Stable reference

  // Initialize and listen for online/offline events
  useEffect(() => {
    // Check pending queue on mount
    const queue = JSON.parse(localStorage.getItem("kalro_sync_queue") || "[]");
    setSyncStatus((prev) => ({ ...prev, pendingItems: queue.length }));

    // Online/offline event handlers
    const handleOnline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: true }));

      // Auto-sync when coming back online (if there are pending items)
      const pendingQueue = JSON.parse(
        localStorage.getItem("kalro_sync_queue") || "[]"
      );
      if (pendingQueue.length > 0) {
        console.log("🌐 Back online! Auto-syncing pending records...");
        handleManualSync();
      }
    };

    const handleOffline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: false }));
      setSyncResult({
        type: "error",
        message: "Connection lost. Changes will sync when back online.",
      });

      // Clear message after 5 seconds
      setTimeout(() => setSyncResult({ type: null, message: "" }), 5000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleManualSync]);

  // Format last sync time
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
      {/* Status Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Online/Offline Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                syncStatus.isOnline ? "bg-green-500" : "bg-red-500"
              } animate-pulse`}
            />
            <span className="text-sm font-medium text-text-primary">
              {syncStatus.isOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-border" />

          {/* Sync Status */}
          <div className="text-sm text-text-secondary">
            <span className="font-medium">KALRO Sync:</span>{" "}
            {syncStatus.isSyncing ? (
              <span className="text-blue-600 dark:text-blue-400">
                Syncing...
              </span>
            ) : syncStatus.pendingItems > 0 ? (
              <span className="text-yellow-600 dark:text-yellow-400">
                {syncStatus.pendingItems} pending
              </span>
            ) : (
              <span className="text-green-600 dark:text-green-400">
                All synced
              </span>
            )}
          </div>
        </div>

        {/* Sync Button */}
        {syncStatus.pendingItems > 0 && syncStatus.isOnline && (
          <button
            onClick={handleManualSync}
            disabled={syncStatus.isSyncing}
            className={`btn btn-primary text-xs py-1 px-3 ${
              syncStatus.isSyncing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {syncStatus.isSyncing ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin">⚙️</span>
                Syncing...
              </span>
            ) : (
              "Sync Now"
            )}
          </button>
        )}
      </div>

      {/* Last Sync Info */}
      <div className="text-xs text-text-tertiary">
        Last synced: {formatLastSync(syncStatus.lastSync)}
      </div>

      {/* Sync Result Message */}
      {syncResult.type && (
        <div
          className={`mt-3 p-2 rounded-md text-xs ${
            syncResult.type === "success"
              ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
              : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
          }`}
        >
          {syncResult.message}
        </div>
      )}

      {/* Offline Warning */}
      {!syncStatus.isOnline && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-start gap-2">
            <span className="text-sm">⚠️</span>
            <div className="text-xs text-red-800 dark:text-red-300">
              <strong>Offline Mode Active</strong>
              <p className="mt-1">
                Your changes are saved locally and will sync with KALRO when
                connection is restored.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text (only show when there are pending items) */}
      {syncStatus.pendingItems > 0 && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-xs text-blue-800 dark:text-blue-300">
          <strong>💡 Tip:</strong> Records will auto-sync when you reconnect.
          You can also manually sync using the button above.
        </div>
      )}
    </div>
  );
}
