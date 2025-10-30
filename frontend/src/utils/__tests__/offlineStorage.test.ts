// src/utils/__tests__/offlineStorage.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Livestock } from "../../types";
import { offlineStorage } from "../../utils/offlineStorage";

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

describe("offlineStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should save and retrieve data", () => {
    offlineStorage.saveData(testData);

    const retrieved = offlineStorage.getData();

    expect(retrieved).toBeTruthy();
    expect(retrieved?.data).toEqual(testData);
    expect(retrieved?.lastSync).toBeDefined();
  });

  it("should return null when no data is stored", () => {
    const retrieved = offlineStorage.getData();
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
});
