// src/components/ui/OfflineIndicator.tsx

import { useEffect, useRef, useState } from "react";
import { useDelayedUnmount } from "../../hooks/useDelayedUnmount";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export default function OfflineIndicator() {
  const isOffline = !useOnlineStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOfflineRef = useRef(false);

  const isVisible = isOffline || showReconnected;
  const { shouldRender, isAnimating } = useDelayedUnmount(isVisible && !isDismissed, 300);

  useEffect(() => {
    if (isOffline) {
      wasOfflineRef.current = true;
      setIsDismissed(false);
      setShowReconnected(false);
      return;
    }

    if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setIsDismissed(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        isOffline
          ? "bg-error"
          : "bg-success"
      } ${isAnimating ? "animate-slide-out-up" : "animate-slide-down"}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              {isOffline ? (
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                  <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>

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
              <p className="text-white/80 text-xs mt-0.5">
                {isOffline
                  ? "Changes will sync automatically when connection is restored."
                  : "Connection restored. Your data is syncing now."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
