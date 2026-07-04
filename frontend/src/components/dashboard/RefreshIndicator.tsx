// src/components/dashboard/RefreshIndicator.tsx

import { useState } from "react";
import { useDelayedUnmount } from "../../hooks/useDelayedUnmount";

interface RefreshIndicatorProps {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  countdown: number;
  isPaused: boolean;
  onRefresh: () => void;
  onPause: () => void;
  onResume: () => void;
}

export default function RefreshIndicator({
  isRefreshing,
  lastRefresh,
  countdown,
  isPaused,
  onRefresh,
  onPause,
  onResume,
}: RefreshIndicatorProps) {
  const [showControls, setShowControls] = useState(false);
  const { shouldRender, isAnimating } = useDelayedUnmount(showControls, 200);

  const formatTime = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString("en-KE", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getContainerStyles = () => {
    if (isRefreshing) {
      return "bg-info/10 border-info/20 text-info";
    }
    if (isPaused) {
      return "bg-bg-secondary border-border text-text-secondary";
    }
    return "bg-success/10 border-success/20 text-success";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowControls(!showControls)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer ${getContainerStyles()}`}
      >
        {isRefreshing ? (
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        )}

        <div className="text-sm font-medium">
          {isRefreshing
            ? "Refreshing..."
            : isPaused
            ? "Updates Paused"
            : `Next: ${countdown}s`}
        </div>
      </button>

      {shouldRender && (
        <div
          className={`absolute top-full right-0 mt-2 w-64 card z-50 ${
            isAnimating ? "animate-scale-out" : "animate-scale-in"
          }`}
        >
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="text-sm font-medium text-text-primary">
                Auto-Refresh Status
              </div>
              <div className="text-xs text-text-secondary space-y-1.5">
                <div className="flex justify-between">
                  <span>Last refresh:</span>
                  <span className="font-medium text-text-primary font-mono">
                    {formatTime(lastRefresh)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span
                    className={`font-medium ${
                      isPaused ? "text-warning" : "text-success"
                    }`}
                  >
                    {isPaused ? "Paused" : "Active"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isPaused ? (
                <button
                  onClick={() => {
                    onResume();
                    setShowControls(false);
                  }}
                  className="flex-1 btn btn-primary text-sm"
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={() => {
                    onPause();
                    setShowControls(false);
                  }}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  Pause
                </button>
              )}

              <button
                onClick={() => {
                  onRefresh();
                  setShowControls(false);
                }}
                disabled={isRefreshing}
                className="flex-1 btn btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Refresh Now
              </button>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="text-xs text-text-tertiary">
                Data updates {isPaused ? "paused" : "every 30 seconds"}
              </div>
            </div>
          </div>

          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setShowControls(false)}
          />
        </div>
      )}
    </div>
  );
}
