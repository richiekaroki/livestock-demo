// src/services/mockApi.ts

import { livestockData } from "../data/livestockData";
import type {
  AnimalStats,
  ApiResponse,
  Filters,
  Livestock,
  Farmer,
  County,
  AnimalTypeInfo,
} from "@wam-mfugo/shared";
import {
  KENYA_COUNTIES,
  ANIMAL_TYPES,
  seedFarmers,
} from "@wam-mfugo/shared";

// Sandbox stub — used only when no real API base URL is configured. Replace with the live backend (remoteApi) in production.
// Simulate real backend API with delays, errors, and proper responses
class MockLivestockAPI {
  private data: Livestock[] = [];
  private readonly STORAGE_KEY = "livestock_data";
  private readonly STORAGE_VERSION = "v1";

  constructor() {
    // Load from localStorage OR use initial data
    this.loadData();
  }

  private loadData() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const items = Array.isArray(parsed)
          ? parsed
          : parsed?.version === this.STORAGE_VERSION &&
              Array.isArray(parsed.data)
            ? parsed.data
            : null;
        if (items && items.length > 0) {
          this.data = items;
          this.saveData();
          return;
        }
      }
      // Fallback to initial data
      this.data = [...livestockData];
      this.saveData();
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
      this.data = [...livestockData];
    }
  }

  private saveData() {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({ version: this.STORAGE_VERSION, data: this.data })
      );
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
    }
  }

  private delay(ms: number = 500) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getAnimals(filters?: Filters): Promise<ApiResponse<Livestock[]>> {
    await this.delay(300); // Simulate network delay
    let data = [...this.data]; // Use internal copy

    // Simulate backend filtering
    if (filters?.type) {
      data = data.filter((animal) => animal.type === filters.type);
    }
    if (filters?.health) {
      data = data.filter((animal) => animal.health === filters.health);
    }
    if (filters?.county) {
      data = data.filter((animal) => animal.county === filters.county);
    }

    return {
      data,
      total: data.length,
      page: 1,
      limit: 50,
      success: true,
    };
  }

  async createAnimal(
    animalData: Omit<Livestock, "id">
  ): Promise<ApiResponse<Livestock>> {
    await this.delay(400);

    const newAnimal: Livestock = {
      id: Math.max(0, ...this.data.map((a) => a.id)) + 1,
      ...animalData,
      createdAt: new Date().toISOString(),
    };

    this.data.push(newAnimal);
    this.saveData();

    return {
      data: newAnimal,
      success: true,
      message: "Animal registered successfully",
    };
  }

  async updateAnimalHealth(
    animalId: number,
    healthStatus: "Healthy" | "Sick" | "Under Treatment" | "Recovered"
  ): Promise<ApiResponse<Livestock>> {
    await this.delay(300);
    const animal = this.data.find((a) => a.id === animalId);
    if (animal) {
      animal.health = healthStatus;
      this.saveData(); // Save changes to localStorage
      return { success: true, data: animal };
    }
    return {
      success: false,
      error: "Animal not found",
      data: {} as Livestock,
    };
  }

  async getAnimalStatistics(): Promise<ApiResponse<AnimalStats>> {
    await this.delay(600);
    if (Math.random() > 0.8) {
      return {
        data: {} as AnimalStats,
        success: false,
        error: "Backend service temporarily unavailable",
      };
    }

    const stats: AnimalStats = {
      totalAnimals: this.data.length,
      healthyCount: 0,
      sickCount: 0,
      underTreatmentCount: 0,
      recoveredCount: 0,
      counties: 0,
      lastUpdated: new Date().toISOString(),
    };
    const counties = new Set<string>();

    for (const a of this.data) {
      counties.add(a.county);
      if (a.health === "Healthy") stats.healthyCount++;
      else if (a.health === "Sick") stats.sickCount++;
      else if (a.health === "Under Treatment") stats.underTreatmentCount++;
      else if (a.health === "Recovered") stats.recoveredCount++;
    }
    stats.counties = counties.size;

    return { data: stats, success: true };
  }

  async getStorageInfo() {
    return {
      totalAnimals: this.data.length,
      storageKey: this.STORAGE_KEY,
      lastAnimal: this.data[this.data.length - 1],
      allAnimals: this.data.map((a) => ({ id: a.id, name: a.name })),
    };
  }

  async resetData(): Promise<void> {
    this.data = [...livestockData];
    this.saveData();
  }

  async getCounties(): Promise<ApiResponse<County[]>> {
    await this.delay(100);
    return { success: true, data: KENYA_COUNTIES };
  }

  async getAnimalTypes(): Promise<ApiResponse<AnimalTypeInfo[]>> {
    await this.delay(100);
    return { success: true, data: ANIMAL_TYPES };
  }

  async getFarmers(): Promise<ApiResponse<Farmer[]>> {
    await this.delay(200);
    return { success: true, data: seedFarmers.map((f) => ({ ...f })) };
  }
}

export const mockAPI = new MockLivestockAPI();
