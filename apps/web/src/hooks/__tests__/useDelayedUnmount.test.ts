// src/hooks/__tests__/useDelayedUnmount.test.ts
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDelayedUnmount } from "../useDelayedUnmount";

describe("useDelayedUnmount", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initially renders when isMounted is true", () => {
    const { result } = renderHook(() => useDelayedUnmount(true));
    expect(result.current.shouldRender).toBe(true);
    expect(result.current.isAnimating).toBe(false);
  });

  it("initially does not render when isMounted is false", () => {
    const { result } = renderHook(() => useDelayedUnmount(false));
    expect(result.current.shouldRender).toBe(false);
    expect(result.current.isAnimating).toBe(false);
  });

  it("shows immediately when mounting", () => {
    const { result, rerender } = renderHook(
      ({ mounted }) => useDelayedUnmount(mounted),
      { initialProps: { mounted: false } }
    );

    expect(result.current.shouldRender).toBe(false);

    act(() => {
      rerender({ mounted: true });
    });

    expect(result.current.shouldRender).toBe(true);
    expect(result.current.isAnimating).toBe(false);
  });

  it("delays unmounting by specified duration", () => {
    const { result, rerender } = renderHook(
      ({ mounted }) => useDelayedUnmount(mounted, 300),
      { initialProps: { mounted: true } }
    );

    expect(result.current.shouldRender).toBe(true);

    act(() => {
      rerender({ mounted: false });
    });

    // Should still be rendering during delay
    expect(result.current.shouldRender).toBe(true);
    expect(result.current.isAnimating).toBe(true);

    // Advance partway — still rendering
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.shouldRender).toBe(true);

    // Advance past duration — now unmounted
    act(() => {
      vi.advanceTimersByTime(101);
    });
    expect(result.current.shouldRender).toBe(false);
    expect(result.current.isAnimating).toBe(false);
  });

  it("uses default duration of 200ms", () => {
    const { result, rerender } = renderHook(
      ({ mounted }) => useDelayedUnmount(mounted),
      { initialProps: { mounted: true } }
    );

    act(() => {
      rerender({ mounted: false });
    });

    expect(result.current.isAnimating).toBe(true);

    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current.shouldRender).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.shouldRender).toBe(false);
  });

  it("cancels timeout if remounted before duration expires", () => {
    const { result, rerender } = renderHook(
      ({ mounted }) => useDelayedUnmount(mounted, 300),
      { initialProps: { mounted: true } }
    );

    // Start unmounting
    act(() => {
      rerender({ mounted: false });
    });
    expect(result.current.isAnimating).toBe(true);

    // Remount before timeout fires
    act(() => {
      vi.advanceTimersByTime(150);
      rerender({ mounted: true });
    });

    // Should still be rendering — timeout was cleared
    expect(result.current.shouldRender).toBe(true);
    expect(result.current.isAnimating).toBe(false);

    // Advance past original timeout — should NOT unmount
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.shouldRender).toBe(true);
  });

  it("isAnimating is true only when unmounting", () => {
    const { result, rerender } = renderHook(
      ({ mounted }) => useDelayedUnmount(mounted),
      { initialProps: { mounted: false } }
    );

    // Not mounted, not animating
    expect(result.current.isAnimating).toBe(false);

    // Mounting — not animating
    act(() => {
      rerender({ mounted: true });
    });
    expect(result.current.isAnimating).toBe(false);

    // Unmounting — animating
    act(() => {
      rerender({ mounted: false });
    });
    expect(result.current.isAnimating).toBe(true);

    // After delay — not animating
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.isAnimating).toBe(false);
  });
});
