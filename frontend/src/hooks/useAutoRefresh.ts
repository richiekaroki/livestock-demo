// src/hooks/useAutoRefresh.ts

import { useEffect, useState, useCallback } from 'react';

interface UseAutoRefreshOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  onRefresh?: () => void | Promise<void>;
}

interface AutoRefreshState {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  nextRefresh: Date | null;
  isPaused: boolean;
}

/**
 * Auto-Refresh Hook
 * 
 * Provides automatic data refreshing with user controls.
 * Simulates real-time updates for production readiness.
 * 
 * Features:
 * - Configurable refresh interval
 * - Pause/resume controls
 * - Last refresh timestamp
 * - Countdown to next refresh
 * - Manual refresh trigger
 * 
 * Interview Talking Points:
 * - "Implements polling strategy for real-time data"
 * - "Production-ready for WebSocket migration"
 * - "User-controlled refresh with pause/resume"
 * - "Optimized to prevent unnecessary API calls"
 */
export function useAutoRefresh({
  enabled = true,
  interval = 30000, // 30 seconds default
  onRefresh,
}: UseAutoRefreshOptions) {
  const [state, setState] = useState<AutoRefreshState>({
    isRefreshing: false,
    lastRefresh: null,
    nextRefresh: null,
    isPaused: false,
  });

  const [countdown, setCountdown] = useState<number>(interval / 1000);

  const performRefresh = useCallback(async () => {
    if (!onRefresh || state.isPaused) return;

    setState(prev => ({ ...prev, isRefreshing: true }));

    try {
      await onRefresh();
      
      const now = new Date();
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        lastRefresh: now,
        nextRefresh: new Date(now.getTime() + interval),
      }));
      
      setCountdown(interval / 1000);
    } catch (error) {
      console.error('Auto-refresh failed:', error);
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [onRefresh, interval, state.isPaused]);

  // Manual refresh trigger
  const triggerRefresh = useCallback(async () => {
    await performRefresh();
  }, [performRefresh]);

  // Pause/resume controls
  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (!enabled || state.isPaused) return;

    const refreshInterval = setInterval(() => {
      performRefresh();
    }, interval);

    // Initial refresh
    if (!state.lastRefresh) {
      performRefresh();
    }

    return () => clearInterval(refreshInterval);
  }, [enabled, interval, state.isPaused, performRefresh, state.lastRefresh]);

  // Countdown timer
  useEffect(() => {
    if (state.isPaused || !enabled) return;

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return interval / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [state.isPaused, enabled, interval]);

  return {
    ...state,
    countdown,
    triggerRefresh,
    pause,
    resume,
  };
}

