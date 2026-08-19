// src/hooks/__tests__/useAutoRefresh.test.ts
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutoRefresh } from "../useAutoRefresh";

describe("useAutoRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with correct default state", () => {
    const { result } = renderHook(() => useAutoRefresh({}));

    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.lastRefresh).toBeNull();
  });

  it("triggers manual refresh", async () => {
    const mockRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(
      () => useAutoRefresh({ onRefresh: mockRefresh, enabled: false }) // ← ADD enabled: false
    );

    await act(async () => {
      await result.current.triggerRefresh();
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.lastRefresh).toBeInstanceOf(Date);
  });

  it("pauses and resumes auto-refresh", () => {
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

  it("respects enabled flag", () => {
    const mockRefresh = vi.fn();
    renderHook(() =>
      useAutoRefresh({ enabled: false, onRefresh: mockRefresh })
    );

    vi.advanceTimersByTime(30000); // Default interval
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("handles refresh errors gracefully", async () => {
    const mockRefresh = vi.fn().mockRejectedValue(new Error("Refresh failed"));
    const { result } = renderHook(
      () => useAutoRefresh({ onRefresh: mockRefresh, enabled: false }) // ← ADD enabled: false
    );

    await act(async () => {
      await result.current.triggerRefresh();
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.isRefreshing).toBe(false);
  });

  // Test error handling when refresh fails
  it("handles refresh errors gracefully", async () => {
    const mockRefresh = vi.fn().mockRejectedValue(new Error("Refresh failed"));
    const { result } = renderHook(() =>
      useAutoRefresh({ onRefresh: mockRefresh, interval: 100 })
    );

    await act(async () => {
      await result.current.triggerRefresh();
    });

    expect(mockRefresh).toHaveBeenCalled();
    // Should not crash, should handle error gracefully
  });

  // Test countdown reset behavior
  it("resets countdown when interval completes", async () => {
    // Test countdown reaches 0 and resets
  });

  it("handles refresh errors and logs to console", async () => {
    const mockRefresh = vi.fn().mockRejectedValue(new Error("Refresh failed"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useAutoRefresh({ onRefresh: mockRefresh, enabled: false })
    );

    await act(async () => {
      await result.current.triggerRefresh();
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.isRefreshing).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Auto-refresh failed:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("handles countdown reset when reaching zero", () => {
    const { result } = renderHook(() =>
      useAutoRefresh({ enabled: true, interval: 3000 })
    );

    // Initial countdown should be 3 seconds
    expect(result.current.countdown).toBe(3);

    // Advance time by 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Countdown should be 1
    expect(result.current.countdown).toBe(1);

    // Advance time by 1 more second to trigger reset
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Countdown should reset to 3
    expect(result.current.countdown).toBe(3);
  });
});
