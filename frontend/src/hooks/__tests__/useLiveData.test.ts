// src/hooks/__tests__/useLiveData.test.ts
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockAPI } from "../../services/mockApi";
import { useLiveData } from "../useLiveData";

// Mock the API
vi.mock("../../services/mockApi", () => ({
  mockAPI: {
    getAnimals: vi.fn(),
  },
}));

const mockAnimalData = [
  {
    id: 1,
    name: "Test Animal",
    type: "Cattle" as const,
    health: "Healthy" as const,
    county: "Nakuru",
    owner: "Test Owner",
    lat: -0.303099,
    lng: 36.080025,
  },
];

describe("useLiveData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear(); // Clear localStorage between tests
  });

  it("should fetch data on mount", async () => {
    vi.mocked(mockAPI.getAnimals).mockResolvedValue({
      success: true,
      data: mockAnimalData,
    });

    const { result } = renderHook(() => useLiveData());

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);

    // After data loads
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data.length).toBeGreaterThan(0);
    expect(result.current.data[0].name).toBe("Test Animal");
    expect(result.current.error).toBeNull();
  });

  it("should handle API errors when no cached data exists", async () => {
    vi.mocked(mockAPI.getAnimals).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Since we cleared localStorage, no cached data should exist
    expect(result.current.error).toBe(
      "Failed to fetch data and no cached data available"
    );
    expect(result.current.data).toEqual([]);
  });

  it("should refetch data when refetch is called", async () => {
    vi.mocked(mockAPI.getAnimals).mockResolvedValue({
      success: true,
      data: mockAnimalData,
    });

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Wrap refetch in act() to prevent warnings
    await act(async () => {
      await result.current.refetch();
    });

    expect(mockAPI.getAnimals).toHaveBeenCalledTimes(2); // Once on mount, once on refetch
  });

  it("should provide online status", async () => {
    vi.mocked(mockAPI.getAnimals).mockResolvedValue({
      success: true,
      data: mockAnimalData,
    });

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have isOnline property (from our enhanced hook)
    expect(result.current).toHaveProperty("isOnline");
  });

  it("should use cached data when API fails and offline data exists", async () => {
    // Mock localStorage to simulate cached data
    const cachedData = {
      data: [
        {
          id: 99,
          name: "Cached Animal",
          type: "Goat" as const,
          health: "Healthy" as const,
          county: "Kiambu",
          owner: "Cached Owner",
          lat: -1.0166,
          lng: 37.8521,
        },
      ],
      lastSync: new Date().toISOString(),
    };

    // Mock localStorage getItem to return cached data
    const getItemMock = vi.spyOn(Storage.prototype, "getItem");
    getItemMock.mockReturnValue(JSON.stringify(cachedData));

    vi.mocked(mockAPI.getAnimals).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Using cached data - connection issue");
    expect(result.current.data[0].name).toBe("Cached Animal");

    // Clean up the mock
    getItemMock.mockRestore();
  });
});
