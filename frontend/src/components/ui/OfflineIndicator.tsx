// src/components/ui/OfflineIndicator.tsx

import { useEffect, useState } from "react";

/**
 * Offline Indicator Component
 *
 * Shows a banner when the user loses internet connection
 * Critical for offline-first architecture in rural Kenya
 *
 * Features:
 * - Automatic detection of online/offline status
 * - Dismissible banner
 * - Helpful message about offline capabilities
 * - Visual feedback for connection state
 */
export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);

      // Auto-hide "reconnected" message after 5 seconds
      setTimeout(() => {
        setShowReconnected(false);
        setIsDismissed(false);
      }, 5000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Don't show anything if online and not showing reconnected message
  if (!isOffline && !showReconnected) {
    return null;
  }

  // Don't show if dismissed
  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOffline
          ? "bg-red-600 dark:bg-red-700"
          : "bg-green-600 dark:bg-green-700"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Icon and Message */}
          <div className="flex items-center gap-3 flex-1">
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {isOffline ? (
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414L8.586 11l-3.293 3.293a1 1 0 101.414 1.414L10 12.414l3.293 3.293a1 1 0 001.414-1.414L11.414 11l3.293-3.293z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            {/* Message */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-sm">
                  {isOffline ? "No Internet Connection" : "Back Online"}
                </p>
                {isOffline && (
                  <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white font-medium">
                    Offline Mode
                  </span>
                )}
              </div>
              <p className="text-white/90 text-xs mt-0.5">
                {isOffline
                  ? "You're working offline. Changes will sync automatically when connection is restored."
                  : "Connection restored. Your data is syncing now."}
              </p>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss notification"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
