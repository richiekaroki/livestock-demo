// src/services/__tests__/mockApi.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { livestockData } from "../../data/livestockData";
import type { Filters, Livestock } from "../../types";
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
      expect(Array.isArray(parsed)).toBe(true);
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
      } as any);
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
        stored.some((a: Livestock) => a.name === "Persistent Animal")
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
      const stats = await mockAPI.getAnimalStatistics();
      expect(stats.success).toBe(true);
      expect(stats.data.totalAnimals).toBeGreaterThan(0);
    });

    it("simulates backend error", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.9);
      await expect(mockAPI.getAnimalStatistics()).rejects.toThrow(
        "Backend service temporarily unavailable"
      );
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
});
