// src/hooks/__tests__/useAutoRefresh.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutoRefresh } from '../useAutoRefresh';

describe('useAutoRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useAutoRefresh({}));

    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.lastRefresh).toBeNull();
  });

  it('triggers manual refresh', async () => {
    const mockRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => 
      useAutoRefresh({ onRefresh: mockRefresh, enabled: false }) // ← ADD enabled: false
    );

    await act(async () => {
      await result.current.triggerRefresh();
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.lastRefresh).toBeInstanceOf(Date);
  });

  it('pauses and resumes auto-refresh', () => {
    const { result } = renderHook(() => useAutoRefresh({ enabled: true }));

    act(() => {
      result.current.pause();
    });
    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.resume();
    });
    expect(result.current.isPaused).toBe(false);
  });

  it('respects enabled flag', () => {
    const mockRefresh = vi.fn();
    renderHook(() => 
      useAutoRefresh({ enabled: false, onRefresh: mockRefresh })
    );

    vi.advanceTimersByTime(30000); // Default interval
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('handles refresh errors gracefully', async () => {
    const mockRefresh = vi.fn().mockRejectedValue(new Error('Refresh failed'));
    const { result } = renderHook(() => 
      useAutoRefresh({ onRefresh: mockRefresh, enabled: false }) // ← ADD enabled: false
    );

    await act(async () => {
      await result.current.triggerRefresh();
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.isRefreshing).toBe(false);
  });
});
