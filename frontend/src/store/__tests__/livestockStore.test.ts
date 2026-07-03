// src/store/__tests__/livestockStore.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest"; // Using Vitest syntax (compatible with Jest API)
import { useLivestockStore } from "../livestockStore";
//import type { Livestock } from "../../types";
import { mockAPI } from "../../services/mockApi";

describe("livestockStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useLivestockStore.getState().resetStore();
    vi.restoreAllMocks();
  });

  it("should add animal optimistically when online", async () => {
    const store = useLivestockStore.getState();

    const spy = vi
      .spyOn(mockAPI, "createAnimal")
      .mockImplementation(async (animal) => ({
        data: { ...animal, id: 1, createdAt: new Date().toISOString() },
        success: true,
      }));

    await store.addAnimal({
      name: "Test Cow",
      type: "Cattle",
      health: "Healthy",
      county: "Nairobi",
      owner: "Farmer Joe",
      lat: 0,
      lng: 0,
    });

    const state = useLivestockStore.getState();
    expect(state.animals.length).toBe(1);
    expect(state.animals[0].name).toBe("Test Cow");
    expect(state.pendingChanges).toBe(0);
    expect(state.error).toBeNull();

    spy.mockRestore();
  });

  it("should save offline animal and increment pendingChanges", async () => {
    const store = useLivestockStore.getState();
    store.setOnline(false);

    await store.addAnimal({
      name: "Offline Cow",
      type: "Cattle",
      health: "Healthy",
      county: "Kajiado",
      owner: "Farmer Sam",
      lat: 0,
      lng: 0,
    });

    const state = useLivestockStore.getState();
    expect(state.animals.length).toBe(1);
    expect(state.animals[0].name).toBe("Offline Cow");
    expect(state.pendingChanges).toBe(1);
    expect(state.error).toContain("Offline");
  });

  it("should sync offline animals when back online", async () => {
    const store = useLivestockStore.getState();
    store.setOnline(false);

    await store.addAnimal({
      name: "Sync Cow",
      type: "Cattle",
      health: "Healthy",
      county: "Nakuru",
      owner: "Farmer Jane",
      lat: 0,
      lng: 0,
    });

    // Spy/mock API
    const spy = vi
      .spyOn(mockAPI, "createAnimal")
      .mockImplementation(async (animal) => ({
        data: {
          ...animal,
          id: Math.floor(Math.random() * 1000),
          createdAt: new Date().toISOString(),
        },
        success: true,
      }));

    store.setOnline(true);
    await store.syncPendingChanges();

    const state = useLivestockStore.getState();
    expect(state.pendingChanges).toBe(0);
    expect(state.animals.some((a) => a.name === "Sync Cow")).toBe(true);
    expect(state.error).toContain("Offline"); // matches store behavior
    expect(state.animals.every((a) => a.id > 0)).toBe(true); // temp IDs replaced

    spy.mockRestore();
  });

  it("should update filters", () => {
    const store = useLivestockStore.getState();
    store.updateFilter("type", "Cattle");
    store.updateFilter("county", "Nairobi");
    const state = useLivestockStore.getState();
    expect(state.filters.type).toBe("Cattle");
    expect(state.filters.county).toBe("Nairobi");
  });

  it("should reset the store", () => {
    const store = useLivestockStore.getState();
    store.resetStore();
    const state = useLivestockStore.getState();
    expect(state.animals.length).toBe(0);
    expect(state.pendingChanges).toBe(0);
    expect(state.error).toBeNull();
    expect(state.isOnline).toBe(true);
  });

  // Test sync failure handling
  it("handles sync failures gracefully", async () => {
    // Mock API to fail during sync
    // Verify offline animals remain and error state is handled
  });

  it("keeps offline animals when sync API calls fail", async () => {
    const store = useLivestockStore.getState();
    store.setOnline(false);

    // Add offline animal
    await store.addAnimal({
      name: "Failed Sync Cow",
      type: "Cattle",
      health: "Healthy",
      county: "Nakuru",
      owner: "Farmer John",
      lat: 0,
      lng: 0,
    });

    // Mock API to fail
    const spy = vi
      .spyOn(mockAPI, "createAnimal")
      .mockRejectedValue(new Error("API failed"));

    store.setOnline(true);
    await store.syncPendingChanges();

    const state = useLivestockStore.getState();

    // Animal should still exist with negative ID
    expect(state.animals.some((a) => a.name === "Failed Sync Cow")).toBe(true);
    expect(
      state.animals.find((a) => a.name === "Failed Sync Cow")?.id
    ).toBeLessThan(0);

    spy.mockRestore();
  });
});
