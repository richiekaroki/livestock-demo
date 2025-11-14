// src/utils/__tests__/offlineStorage.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearOfflineData,
  loadOfflineData,
  OFFLINE_PREFIX,
  saveOfflineData,
} from "../offlineStorage";

describe("offlineStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("saveOfflineData", () => {
    it("saves data with correct structure", async () => {
      const testData = { id: 1, name: "Test" };
      await saveOfflineData("testKey", testData);

      const stored = localStorage.getItem(`${OFFLINE_PREFIX}testKey`);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveProperty("version", "v2");
      expect(parsed).toHaveProperty("timestamp");
      expect(parsed).toHaveProperty("data", testData);
    });

    it("handles storage quota exceeded error", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock localStorage.setItem to throw quota error
      const setItemSpy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new DOMException("QuotaExceededError");
        });

      await saveOfflineData("testKey", { data: "test" });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to save offline data:",
        expect.any(DOMException)
      );

      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it("saves different data types", async () => {
      const testCases = [
        { key: "string", data: "test string" },
        { key: "number", data: 42 },
        { key: "array", data: [1, 2, 3] },
        { key: "object", data: { nested: { value: true } } },
        { key: "null", data: null },
      ];

      for (const testCase of testCases) {
        await saveOfflineData(testCase.key, testCase.data);
        const loaded = await loadOfflineData(testCase.key);
        expect(loaded).toEqual(testCase.data);
      }
    });
  });

  describe("loadOfflineData", () => {
    it("loads data successfully", async () => {
      const testData = { id: 1, name: "Test" };
      await saveOfflineData("testKey", testData);

      const loaded = await loadOfflineData("testKey");
      expect(loaded).toEqual(testData);
    });

    it("returns null for non-existent key", async () => {
      const loaded = await loadOfflineData("nonExistentKey");
      expect(loaded).toBeNull();
    });

    it("handles version mismatch and clears old data", async () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // Manually set old version data
      localStorage.setItem(
        `${OFFLINE_PREFIX}testKey`,
        JSON.stringify({
          version: "v1", // Old version
          timestamp: new Date().toISOString(),
          data: { old: "data" },
        })
      );

      const loaded = await loadOfflineData("testKey");

      expect(loaded).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Offline data version mismatch, clearing cache."
      );
      expect(localStorage.getItem(`${OFFLINE_PREFIX}testKey`)).toBeNull();

      consoleWarnSpy.mockRestore();
    });

    it("handles corrupted JSON data", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Set invalid JSON
      localStorage.setItem(`${OFFLINE_PREFIX}testKey`, "invalid json{");

      const loaded = await loadOfflineData("testKey");

      expect(loaded).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to load offline data:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("handles missing data property", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Set payload without data property
      localStorage.setItem(
        `${OFFLINE_PREFIX}testKey`,
        JSON.stringify({
          version: "v2",
          timestamp: new Date().toISOString(),
          // Missing data property
        })
      );

      const loaded = await loadOfflineData("testKey");

      // Should return undefined (the value of parsed.data)
      expect(loaded).toBeUndefined();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("clearOfflineData", () => {
    it("clears specific key", () => {
      localStorage.setItem(`${OFFLINE_PREFIX}key1`, "data1");
      localStorage.setItem(`${OFFLINE_PREFIX}key2`, "data2");
      localStorage.setItem("otherKey", "other");

      clearOfflineData("key1");

      expect(localStorage.getItem(`${OFFLINE_PREFIX}key1`)).toBeNull();
      expect(localStorage.getItem(`${OFFLINE_PREFIX}key2`)).not.toBeNull();
      expect(localStorage.getItem("otherKey")).not.toBeNull();
    });

    it("clears all offline data when no key provided", () => {
      localStorage.setItem(`${OFFLINE_PREFIX}key1`, "data1");
      localStorage.setItem(`${OFFLINE_PREFIX}key2`, "data2");
      localStorage.setItem("otherKey", "other");

      clearOfflineData();

      expect(localStorage.getItem(`${OFFLINE_PREFIX}key1`)).toBeNull();
      expect(localStorage.getItem(`${OFFLINE_PREFIX}key2`)).toBeNull();
      expect(localStorage.getItem("otherKey")).not.toBeNull();
    });

    it("handles clearing non-existent key", () => {
      expect(() => clearOfflineData("nonExistent")).not.toThrow();
    });
  });

  describe("OFFLINE_PREFIX", () => {
    it("has correct value", () => {
      expect(OFFLINE_PREFIX).toBe("livestock_offline_");
    });

    it("prefixes all saved keys", async () => {
      await saveOfflineData("test", { data: "test" });

      const keys = Object.keys(localStorage);
      expect(keys[0].startsWith(OFFLINE_PREFIX)).toBe(true);
    });
  });

  describe("integration scenarios", () => {
    it("handles save, load, and clear cycle", async () => {
      const testData = { id: 1, value: "test" };

      // Save
      await saveOfflineData("cycleTest", testData);
      expect(localStorage.getItem(`${OFFLINE_PREFIX}cycleTest`)).toBeTruthy();

      // Load
      const loaded = await loadOfflineData("cycleTest");
      expect(loaded).toEqual(testData);

      // Clear
      clearOfflineData("cycleTest");
      expect(localStorage.getItem(`${OFFLINE_PREFIX}cycleTest`)).toBeNull();

      // Load after clear
      const afterClear = await loadOfflineData("cycleTest");
      expect(afterClear).toBeNull();
    });

    it("handles multiple concurrent saves", async () => {
      const saves = [
        saveOfflineData("key1", { data: 1 }),
        saveOfflineData("key2", { data: 2 }),
        saveOfflineData("key3", { data: 3 }),
      ];

      await Promise.all(saves);

      const loaded1 = await loadOfflineData("key1");
      const loaded2 = await loadOfflineData("key2");
      const loaded3 = await loadOfflineData("key3");

      expect(loaded1).toEqual({ data: 1 });
      expect(loaded2).toEqual({ data: 2 });
      expect(loaded3).toEqual({ data: 3 });
    });

    it("overwrites existing data on save", async () => {
      await saveOfflineData("overwrite", { value: "original" });
      await saveOfflineData("overwrite", { value: "updated" });

      const loaded = await loadOfflineData("overwrite");
      expect(loaded).toEqual({ value: "updated" });
    });
  });
});
