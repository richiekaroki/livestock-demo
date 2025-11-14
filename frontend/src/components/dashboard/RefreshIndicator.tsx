// src/components/dashboard/RefreshIndicator.tsx

import { useState } from "react";

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

  const formatTime = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString("en-KE", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Dynamic styles using CSS variables
  const getContainerStyles = () => {
    if (isRefreshing) {
      return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300";
    }
    if (isPaused) {
      return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300";
    }
    return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300";
  };

  return (
    <div className="relative">
      {/* Main Indicator */}
      <button
        onClick={() => setShowControls(!showControls)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${getContainerStyles()}`}
      >
        {/* Refresh Icon */}
        {isRefreshing ? (
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        ) : (
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
              clipRule="evenodd"
            />
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

      {/* Dropdown Controls */}
      {showControls && (
        <div className="absolute top-full right-0 mt-2 w-64 card z-50 animate-fadeIn">
          <div className="p-4 space-y-3">
            {/* Status Info */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-text-primary">
                Auto-Refresh Status
              </div>
              <div className="text-xs text-text-secondary space-y-1">
                <div className="flex justify-between">
                  <span>Last refresh:</span>
                  <span className="font-medium text-text-primary">
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

            {/* Action Buttons */}
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

            {/* Quick Actions */}
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-text-tertiary">
                Data updates {isPaused ? "paused" : "every 30 seconds"}
              </div>
            </div>
          </div>

          {/* Click outside to close */}
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setShowControls(false)}
          />
        </div>
      )}
    </div>
  );
}
