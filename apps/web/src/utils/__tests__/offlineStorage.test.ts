// src/utils/__tests__/offlineStorage.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearOfflineData,
  getOfflineDatabase,
  loadOfflineData,
  OFFLINE_PREFIX,
  saveOfflineData,
} from "../offlineStorage";

describe("offlineStorage", () => {
  beforeEach(async () => {
    await clearOfflineData();
    vi.clearAllMocks();
  });

  describe("saveOfflineData", () => {
    it("saves data with correct structure", async () => {
      const testData = { id: 1, name: "Test" };
      await saveOfflineData("testKey", testData);

      const stored = await getOfflineDatabase()
        .records.get(`${OFFLINE_PREFIX}testKey`);
      expect(stored).toBeTruthy();
      expect(stored!.version).toBe("v2");
      expect(stored!.timestamp).toBeTruthy();
      expect(stored!.data).toEqual(testData);
    });

    it("persists large payloads beyond localStorage limits", async () => {
      const largeData = { blob: "x".repeat(5 * 1024 * 1024) };
      await saveOfflineData("bigKey", largeData);

      const loaded = await loadOfflineData<typeof largeData>("bigKey");
      expect(loaded).toEqual(largeData);
      expect(loaded!.blob).toHaveLength(5 * 1024 * 1024);
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

      await getOfflineDatabase().records.put({
        key: `${OFFLINE_PREFIX}testKey`,
        version: "v1",
        timestamp: new Date().toISOString(),
        data: { old: "data" },
      });

      const loaded = await loadOfflineData("testKey");

      expect(loaded).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Offline data version mismatch, clearing cache."
      );
      expect(
        await getOfflineDatabase().records.get(`${OFFLINE_PREFIX}testKey`)
      ).toBeUndefined();

      consoleWarnSpy.mockRestore();
    });

    it("returns undefined for records missing the data property", async () => {
      await getOfflineDatabase().records.put({
        key: `${OFFLINE_PREFIX}testKey`,
        version: "v2",
        timestamp: new Date().toISOString(),
      } as never);

      const loaded = await loadOfflineData("testKey");

      expect(loaded).toBeUndefined();
    });
  });

  describe("clearOfflineData", () => {
    it("clears specific key", async () => {
      await saveOfflineData("key1", "data1");
      await saveOfflineData("key2", "data2");

      await clearOfflineData("key1");

      expect(await loadOfflineData("key1")).toBeNull();
      expect(await loadOfflineData("key2")).toBe("data2");
    });

    it("clears all offline data when no key provided", async () => {
      await saveOfflineData("key1", "data1");
      await saveOfflineData("key2", "data2");

      await clearOfflineData();

      expect(await loadOfflineData("key1")).toBeNull();
      expect(await loadOfflineData("key2")).toBeNull();
    });

    it("handles clearing non-existent key", async () => {
      await expect(clearOfflineData("nonExistent")).resolves.toBeUndefined();
    });
  });

  describe("OFFLINE_PREFIX", () => {
    it("has correct value", () => {
      expect(OFFLINE_PREFIX).toBe("livestock_offline_");
    });

    it("prefixes all saved keys", async () => {
      await saveOfflineData("test", { data: "test" });

      const records = await getOfflineDatabase().records.toArray();
      expect(records.length).toBeGreaterThan(0);
      expect(records.every((r) => r.key.startsWith(OFFLINE_PREFIX))).toBe(true);
    });
  });

  describe("integration scenarios", () => {
    it("handles save, load, and clear cycle", async () => {
      const testData = { id: 1, value: "test" };

      await saveOfflineData("cycleTest", testData);
      expect(
        await getOfflineDatabase().records.get(`${OFFLINE_PREFIX}cycleTest`)
      ).toBeTruthy();

      const loaded = await loadOfflineData("cycleTest");
      expect(loaded).toEqual(testData);

      await clearOfflineData("cycleTest");
      expect(
        await getOfflineDatabase().records.get(`${OFFLINE_PREFIX}cycleTest`)
      ).toBeUndefined();

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

      expect(await loadOfflineData("key1")).toEqual({ data: 1 });
      expect(await loadOfflineData("key2")).toEqual({ data: 2 });
      expect(await loadOfflineData("key3")).toEqual({ data: 3 });
    });

    it("overwrites existing data on save", async () => {
      await saveOfflineData("overwrite", { value: "original" });
      await saveOfflineData("overwrite", { value: "updated" });

      const loaded = await loadOfflineData("overwrite");
      expect(loaded).toEqual({ value: "updated" });
    });
  });
});
