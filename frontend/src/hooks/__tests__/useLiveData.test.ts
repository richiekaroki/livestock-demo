// src/hooks/__tests__/useLiveData.test.ts
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockAPI } from "../../services/mockApi";
import { useLiveData } from "../useLiveData";

vi.mock("../../services/mockApi", () => ({
  mockAPI: {
    getAnimals: vi.fn(),
  },
}));

vi.mock("../../utils/offlineStorage", () => ({
  loadOfflineData: vi.fn(),
  saveOfflineData: vi.fn(),
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
  //  Make beforeEach async
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(mockAPI.getAnimals).mockReset();
    const { loadOfflineData, saveOfflineData } = await import(
      "../../utils/offlineStorage"
    );
    vi.mocked(loadOfflineData).mockReset();
    vi.mocked(saveOfflineData).mockReset();
  });

  it("should fetch data on mount", async () => {
    vi.mocked(mockAPI.getAnimals).mockResolvedValue({
      success: true,
      data: mockAnimalData,
    });

    const { result } = renderHook(() => useLiveData());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data.length).toBeGreaterThan(0);
    expect(result.current.data[0].name).toBe("Test Animal");
    expect(result.current.error).toBeNull();
  });

  it("should handle API errors when no cached data exists", async () => {
    vi.mocked(mockAPI.getAnimals).mockRejectedValue(new Error("API Error"));
    const { loadOfflineData } = await import("../../utils/offlineStorage");
    vi.mocked(loadOfflineData).mockResolvedValue(null);

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load data");
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

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockAPI.getAnimals).toHaveBeenCalledTimes(2);
  });

  it("should use cached data when API fails and offline data exists", async () => {
    const { loadOfflineData } = await import("../../utils/offlineStorage");

    vi.mocked(loadOfflineData).mockResolvedValue([
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
    ]);

    vi.mocked(mockAPI.getAnimals).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      "Loaded offline data (network unavailable)"
    );
    expect(result.current.data[0].name).toBe("Cached Animal");
  });

  it("should handle invalid data format from API", async () => {
    vi.mocked(mockAPI.getAnimals).mockResolvedValue({
      success: true,
      data: "invalid data format" as any,
    });

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load data");
    expect(result.current.data).toEqual([]);
  });

  it("should retry on API failure", async () => {
    vi.mocked(mockAPI.getAnimals)
      .mockRejectedValueOnce(new Error("First attempt failed"))
      .mockResolvedValueOnce({
        success: true,
        data: mockAnimalData,
      });

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockAPI.getAnimals).toHaveBeenCalledTimes(2);
    expect(result.current.data[0].name).toBe("Test Animal");
  });

  it("should save data to offline storage on successful fetch", async () => {
    vi.mocked(mockAPI.getAnimals).mockResolvedValue({
      success: true,
      data: mockAnimalData,
    });

    const { saveOfflineData } = await import("../../utils/offlineStorage");

    renderHook(() => useLiveData());

    await waitFor(() => {
      expect(vi.mocked(saveOfflineData)).toHaveBeenCalledWith(
        "livestockData",
        mockAnimalData
      );
    });
  });

  it("should handle empty API response", async () => {
    vi.mocked(mockAPI.getAnimals).mockResolvedValue({
      success: true,
      data: [],
    });

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should handle API success false response", async () => {
    //  Add data property to match ApiResponse type
    vi.mocked(mockAPI.getAnimals).mockResolvedValue({
      success: false,
      error: "Server error",
      data: [], // Required by ApiResponse type
    });

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load data");
    expect(result.current.data).toEqual([]);
  });

  it("should not cause infinite re-renders", async () => {
    vi.mocked(mockAPI.getAnimals).mockResolvedValue({
      success: true,
      data: mockAnimalData,
    });

    const { result } = renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    //  Remove unused 'rerender' variable
    renderHook(() => useLiveData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockAPI.getAnimals).toHaveBeenCalledTimes(1);
  });
});
