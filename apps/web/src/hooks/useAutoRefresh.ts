// src/hooks/useAutoRefresh.ts

import { useEffect, useState, useCallback, useRef } from 'react';

interface UseAutoRefreshOptions {
  enabled?: boolean;
  interval?: number;
  onRefresh?: () => void | Promise<void>;
  showCountdown?: boolean;
}

interface AutoRefreshState {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  nextRefresh: Date | null;
  isPaused: boolean;
}

export function useAutoRefresh({
  enabled = true,
  interval = 30000,
  onRefresh,
  showCountdown = true,
}: UseAutoRefreshOptions) {
  const [state, setState] = useState<AutoRefreshState>({
    isRefreshing: false,
    lastRefresh: null,
    nextRefresh: null,
    isPaused: false,
  });

  const [countdown, setCountdown] = useState<number>(interval / 1000);

  const isPausedRef = useRef(state.isPaused);
  isPausedRef.current = state.isPaused;

  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const lastRefreshRef = useRef<Date | null>(null);

  const performRefresh = useCallback(async () => {
    if (!onRefreshRef.current || isPausedRef.current) return;

    setState((prev) => ({ ...prev, isRefreshing: true }));

    try {
      await onRefreshRef.current();

      const now = new Date();
      lastRefreshRef.current = now;
      setState((prev) => ({
        ...prev,
        isRefreshing: false,
        lastRefresh: now,
        nextRefresh: new Date(now.getTime() + interval),
      }));

      setCountdown(interval / 1000);
    } catch (error) {
      console.error('Auto-refresh failed:', error);
      setState((prev) => ({ ...prev, isRefreshing: false }));
    }
  }, [interval]);

  const triggerRefresh = useCallback(async () => {
    await performRefresh();
  }, [performRefresh]);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  useEffect(() => {
    if (!enabled || state.isPaused) return;

    const refreshInterval = setInterval(() => {
      performRefresh();
    }, interval);

    if (!lastRefreshRef.current) {
      performRefresh();
    }

    return () => clearInterval(refreshInterval);
  }, [enabled, interval, state.isPaused, performRefresh]);

  useEffect(() => {
    if (state.isPaused || !enabled || !showCountdown) return;

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? interval / 1000 : prev - 1));
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [state.isPaused, enabled, interval, showCountdown]);

  return {
    ...state,
    countdown,
    triggerRefresh,
    pause,
    resume,
  };
}

