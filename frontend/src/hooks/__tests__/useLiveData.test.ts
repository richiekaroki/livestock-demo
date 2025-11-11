// src/hooks/__tests__/useLiveData.test.ts
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockAPI } from "../../services/mockApi";
import type { Livestock } from "../../types";
import { OFFLINE_PREFIX } from "../../utils/offlineStorage";
import { useLiveData } from "../useLiveData";

vi.mock("../../services/mockApi");

// ✅ Helper function to create mock livestock data
const createMockLivestock = (
  overrides: Partial<Livestock> = {}
): Livestock => ({
  id: 1,
  name: "Test Animal",
  type: "Cattle",
  health: "Healthy",
  county: "Test County",
  owner: "Test Owner",
  lat: 40.7128,
  lng: -74.006,
  ...overrides,
});

describe("useLiveData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("fetches data successfully", async () => {
    const mockData: Livestock[] = [createMockLivestock()];

    vi.mocked(mockAPI.getAnimals).mockResolvedValue({
      success: true,
      data: mockData,
      total: 1,
    });

    const { result } = renderHook(() => useLiveData());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it("handles API errors and loads offline data", async () => {
    // Suppress expected console warnings
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const offlineData: Livestock[] = [
      createMockLivestock({ id: 2, name: "Offline Animal", type: "Goat" }),
    ];

    const key = `${OFFLINE_PREFIX}livestockData`;
    localStorage.setItem(
      key,
      JSON.stringify({
        version: "v2",
        timestamp: new Date().toISOString(),
        data: offlineData,
      })
    );

    vi.mocked(mockAPI.getAnimals).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(offlineData);
    expect(result.current.error).toContain("offline");

    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("supports refetch", async () => {
    const mockData: Livestock[] = [createMockLivestock()];

    vi.mocked(mockAPI.getAnimals).mockResolvedValue({
      success: true,
      data: mockData,
      total: 1,
    });

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Wrap refetch in act to prevent warnings
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockAPI.getAnimals).toHaveBeenCalledTimes(2);
  });

  it("retries twice before giving up", async () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const mockData: Livestock[] = [createMockLivestock()];

    const spy = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail1"))
      .mockRejectedValueOnce(new Error("fail2"))
      .mockResolvedValue({
        success: true,
        data: mockData,
        total: 1,
      });

    vi.mocked(mockAPI.getAnimals).mockImplementation(spy);

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(spy).toHaveBeenCalledTimes(3);
    expect(result.current.error).toBeNull();

    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
});
