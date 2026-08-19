// src/services/__tests__/mockApi.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { livestockData } from "../../data/livestockData";
import type { Filters, Livestock } from "@wam-mfugo/shared";
import { mockAPI } from "../mockApi";

describe("MockLivestockAPI", () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset API data before each test to ensure localStorage is populated
    await mockAPI.resetData();
  });

  // -----------------------------
  // Initialization & Storage
  // -----------------------------
  describe("Initialization", () => {
    it("loads initial data on first run", async () => {
      const response = await mockAPI.getAnimals();
      expect(response.success).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.total).toBe(response.data.length);
    });

    it("persists data to localStorage", () => {
      const stored = localStorage.getItem("livestock_data");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(false);
      expect(parsed.version).toBe("v1");
      expect(Array.isArray(parsed.data)).toBe(true);
    });

    it("loads existing data from localStorage on subsequent runs", async () => {
      const testData: Livestock[] = [
        {
          id: 999,
          name: "Stored Animal",
          type: "Cattle",
          health: "Healthy",
          county: "Test County",
          owner: "Test Owner",
          lat: 0,
          lng: 0,
        },
      ];
      localStorage.setItem("livestock_data", JSON.stringify(testData));

      const response = await mockAPI.getAnimals();
      expect(response.success).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it("handles corrupted localStorage gracefully", async () => {
      localStorage.setItem("livestock_data", "invalid json{");
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const response = await mockAPI.getAnimals();
      expect(response.success).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      consoleErrorSpy.mockRestore();
    });
  });

  // -----------------------------
  // getAnimals
  // -----------------------------
  describe("getAnimals", () => {
    it("returns all animals without filters", async () => {
      const response = await mockAPI.getAnimals();
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(response.total);
      expect(response.page).toBe(1);
      expect(response.limit).toBe(50);
    });

    it("filters animals by type", async () => {
      const response = await mockAPI.getAnimals({
        type: "Cattle",
      } as Partial<Filters>);
      expect(response.data.every((a) => a.type === "Cattle")).toBe(true);
    });

    it("filters animals by health status", async () => {
      const response = await mockAPI.getAnimals({
        health: "Healthy",
      } as Partial<Filters>);
      expect(response.data.every((a) => a.health === "Healthy")).toBe(true);
    });

    it("filters animals by county", async () => {
      const response = await mockAPI.getAnimals({
        county: "Nakuru",
      } as Partial<Filters>);
      expect(response.data.every((a) => a.county === "Nakuru")).toBe(true);
    });

    it("applies multiple filters simultaneously", async () => {
      const response = await mockAPI.getAnimals({
        type: "Cattle",
        health: "Healthy",
      } as Partial<Filters>);
      expect(
        response.data.every(
          (a) => a.type === "Cattle" && a.health === "Healthy"
        )
      ).toBe(true);
    });

    it("returns empty array when no animals match filters", async () => {
      const response = await mockAPI.getAnimals({
        type: "NonExistentType",
      } as unknown as Filters);
      expect(response.data).toEqual([]);
      expect(response.total).toBe(0);
    });
  });

  // -----------------------------
  // createAnimal
  // -----------------------------
  describe("createAnimal", () => {
    it("creates a new animal successfully", async () => {
      const newAnimal = {
        name: "New Test Cow",
        type: "Cattle" as const,
        health: "Healthy" as const,
        county: "Nakuru",
        owner: "Test Owner",
        lat: 0,
        lng: 0,
      };
      const response = await mockAPI.createAnimal(newAnimal);
      expect(response.success).toBe(true);
      expect(response.data).toMatchObject(newAnimal);
      expect(response.data.id).toBeDefined();
      expect(response.data.createdAt).toBeDefined();
      expect(response.message).toBe("Animal registered successfully");
    });

    it("assigns unique sequential IDs", async () => {
      const animal1 = await mockAPI.createAnimal({
        name: "Animal1",
        type: "Cattle",
        health: "Healthy",
        county: "Nakuru",
        owner: "Owner1",
        lat: 0,
        lng: 0,
      });
      const animal2 = await mockAPI.createAnimal({
        name: "Animal2",
        type: "Goat",
        health: "Healthy",
        county: "Nakuru",
        owner: "Owner2",
        lat: 0,
        lng: 0,
      });
      expect(animal2.data.id).toBeGreaterThan(animal1.data.id);
    });

    it("persists created animal to localStorage", async () => {
      const newAnimal = {
        name: "Persistent Animal",
        type: "Sheep" as const,
        health: "Healthy" as const,
        county: "Nakuru",
        owner: "Test Owner",
        lat: 0,
        lng: 0,
      };
      await mockAPI.createAnimal(newAnimal);
      const stored = JSON.parse(localStorage.getItem("livestock_data")!);
      expect(
        stored.data.some((a: Livestock) => a.name === "Persistent Animal")
      ).toBe(true);
    });
  });

  // -----------------------------
  // updateAnimalHealth
  // -----------------------------
  describe("updateAnimalHealth", () => {
    it("updates existing animal health status", async () => {
      const animals = await mockAPI.getAnimals();
      const target = animals.data[0];
      const response = await mockAPI.updateAnimalHealth(target.id, "Sick");
      expect(response.success).toBe(true);
      expect(response.data?.health).toBe("Sick");
    });

    it("returns error for non-existent animal", async () => {
      const response = await mockAPI.updateAnimalHealth(999999, "Sick");
      expect(response.success).toBe(false);
      expect(response.error).toBe("Animal not found");
    });
  });

  // -----------------------------
  // getAnimalStatistics
  // -----------------------------
  describe("getAnimalStatistics", () => {
    it("returns correct statistics", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const stats = await mockAPI.getAnimalStatistics();
      expect(stats.success).toBe(true);
      expect(stats.data.totalAnimals).toBeGreaterThan(0);
      vi.restoreAllMocks();
    });

    it("simulates backend error", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.9);
      const result = await mockAPI.getAnimalStatistics();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Backend service temporarily unavailable");
      vi.restoreAllMocks();
    });
  });

  // -----------------------------
  // getStorageInfo
  // -----------------------------
  describe("getStorageInfo", () => {
    it("returns storage information", async () => {
      const info = await mockAPI.getStorageInfo();
      expect(info.totalAnimals).toBeGreaterThan(0);
      expect(info.storageKey).toBe("livestock_data");
      expect(Array.isArray(info.allAnimals)).toBe(true);
    });
  });

  // -----------------------------
  // resetData
  // -----------------------------
  describe("resetData", () => {
    it("resets data to initial state", async () => {
      await mockAPI.createAnimal({
        name: "Temp Animal",
        type: "Cattle",
        health: "Healthy",
        county: "Test",
        owner: "Test",
        lat: 0,
        lng: 0,
      });
      await mockAPI.resetData();
      const animals = await mockAPI.getAnimals();
      expect(animals.data.some((a) => a.name === "Temp Animal")).toBe(false);
      expect(animals.data.length).toBe(livestockData.length);
    });
  });
  // Test localStorage error scenarios
  it("handles localStorage read errors", () => {
    //const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Mock localStorage.getItem to throw error
    // Verify fallback to initial data works
  });

  // Test localStorage write errors
  it("handles localStorage write errors", async () => {
    // Mock localStorage.setItem to throw error
    // Verify API doesn't crash and continues operation
  });

  it("falls back to default data when localStorage read fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock localStorage.getItem to throw error BEFORE creating instance
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockImplementation(() => {
      throw new Error("Storage read error");
    });

    // Create a NEW instance to trigger initialization with the error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MockAPI = (mockAPI as any).constructor as new () => typeof mockAPI;
    const newInstance = new MockAPI();

    // Wait a bit for initialization to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify the error was logged during initialization
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to load data from localStorage:",
      expect.any(Error)
    );

    // Verify the instance still works with default data
    const response = await newInstance.getAnimals();
    expect(response.success).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);

    getItemSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it("continues operation when localStorage write fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    setItemSpy.mockImplementation(() => {
      throw new Error("Storage write error");
    });

    const newAnimal = {
      name: "Test Animal",
      type: "Cattle" as const,
      health: "Healthy" as const,
      county: "Nakuru",
      owner: "Test Owner",
      lat: 0,
      lng: 0,
    };

    const response = await mockAPI.createAnimal(newAnimal);
    expect(response.success).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();

    setItemSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
