// src/utils/__tests__/offlineStorage.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Livestock } from "../../types";
import {
  clearOfflineData,
  loadOfflineData,
  saveOfflineData,
} from "../offlineStorage";

const testData: Livestock[] = [
  {
    id: 1,
    name: "Test Animal",
    type: "Cattle",
    health: "Healthy",
    county: "Nakuru",
    owner: "Test Owner",
    lat: -0.303099,
    lng: 36.080025,
  },
];

// Mock the original offlineStorage for backward compatibility
const offlineStorage = {
  saveData: (data: Livestock[]) => saveOfflineData("livestockData", data),
  getData: () => loadOfflineData<Livestock[]>("livestockData"),
  clearData: () => clearOfflineData("livestockData"),
  syncWithServer: vi.fn().mockResolvedValue(true),
};

describe("offlineStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should save and retrieve data", async () => {
    await saveOfflineData("livestockData", testData);

    const retrieved = await loadOfflineData<Livestock[]>("livestockData");

    expect(retrieved).toBeTruthy();
    expect(retrieved).toEqual(testData);

    // Verify structure was saved correctly
    const rawData = localStorage.getItem("livestockData");
    expect(rawData).toBeTruthy();

    if (rawData) {
      const parsed = JSON.parse(rawData);
      expect(parsed.version).toBe("v2");
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.data).toEqual(testData);
    }
  });

  it("should return null when no data is stored", async () => {
    const retrieved = await loadOfflineData("livestockData");
    expect(retrieved).toBeNull();
  });

  it("should clear data", () => {
    offlineStorage.saveData(testData);
    offlineStorage.clearData();

    const retrieved = offlineStorage.getData();
    expect(retrieved).toBeNull();
  });

  it("should sync with server", async () => {
    offlineStorage.saveData(testData);

    const syncResult = await offlineStorage.syncWithServer();

    expect(syncResult).toBe(true);

    // After sync, data should be cleared
    const retrieved = offlineStorage.getData();
    expect(retrieved).toBeNull();
  });

  it("should return false when syncing with no data", async () => {
    const syncResult = await offlineStorage.syncWithServer();
    expect(syncResult).toBe(false);
  });

  it("handles version mismatch by clearing cache", async () => {
    // Save data with old version directly to localStorage
    const oldData = {
      version: "v1",
      data: testData,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("livestockData", JSON.stringify(oldData));

    // Try to load - should clear and return null due to version mismatch
    const retrieved = await loadOfflineData("livestockData");
    expect(retrieved).toBeNull();
    expect(localStorage.getItem("livestockData")).toBeNull();
  });

  it("handles malformed JSON data gracefully", async () => {
    // Save invalid JSON
    localStorage.setItem("livestockData", "invalid json data");

    const retrieved = await loadOfflineData("livestockData");
    expect(retrieved).toBeNull();
  });

  it("handles different data types correctly", async () => {
    // Test with string data
    const stringData = "test string";
    await saveOfflineData("stringKey", stringData);
    const retrievedString = await loadOfflineData<string>("stringKey");
    expect(retrievedString).toBe(stringData);

    // Test with number data
    const numberData = 42;
    await saveOfflineData("numberKey", numberData);
    const retrievedNumber = await loadOfflineData<number>("numberKey");
    expect(retrievedNumber).toBe(numberData);

    // Test with object data
    const objectData = { key: "value" };
    await saveOfflineData("objectKey", objectData);
    const retrievedObject = await loadOfflineData<{ key: string }>("objectKey");
    expect(retrievedObject).toEqual(objectData);
  });

  it("clears specific key when key provided", () => {
    // Save data to multiple keys
    offlineStorage.saveData(testData);
    localStorage.setItem("otherKey", "some value");

    // Clear only livestockData
    clearOfflineData("livestockData");

    expect(localStorage.getItem("livestockData")).toBeNull();
    expect(localStorage.getItem("otherKey")).toBe("some value");
  });

  it("clears all data when no key provided", () => {
    // Save data to multiple keys
    offlineStorage.saveData(testData);
    localStorage.setItem("otherKey", "some value");

    // Clear all data
    clearOfflineData();

    expect(localStorage.getItem("livestockData")).toBeNull();
    expect(localStorage.getItem("otherKey")).toBeNull();
  });

  it("maintains data integrity with concurrent operations", async () => {
    // Simulate concurrent saves
    const promises = [
      saveOfflineData("concurrentKey", { data: "first" }),
      saveOfflineData("concurrentKey", { data: "second" }),
      saveOfflineData("concurrentKey", { data: "third" }),
    ];

    await Promise.all(promises);

    const finalData = await loadOfflineData("concurrentKey");
    expect(finalData).toBeDefined();
    // The final value should be one of the saved values
    expect(finalData).toHaveProperty("data");
  });

  it("handles localStorage errors gracefully", async () => {
    // Mock localStorage.setItem to throw error
    const setItemMock = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

    // Should not throw, but log error
    await saveOfflineData("errorKey", testData);

    // Restore mock
    setItemMock.mockRestore();

    // Data should not be saved due to error
    const retrieved = await loadOfflineData("errorKey");
    expect(retrieved).toBeNull();
  });

  it("preserves data structure with complex nested objects", async () => {
    const complexData = {
      animals: testData,
      metadata: {
        totalCount: 1,
        lastUpdated: new Date().toISOString(),
        syncStatus: "completed" as const,
      },
      nested: {
        deep: {
          value: "test",
        },
      },
    };

    await saveOfflineData("complexKey", complexData);
    const retrieved = await loadOfflineData<typeof complexData>("complexKey");

    expect(retrieved).toEqual(complexData);
    expect(retrieved?.animals[0].name).toBe("Test Animal");
    expect(retrieved?.metadata.syncStatus).toBe("completed");
    expect(retrieved?.nested.deep.value).toBe("test");
  });
});
