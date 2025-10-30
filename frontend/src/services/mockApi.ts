// src/services/mockApi.ts

import { livestockData } from "../data/livestockData";
import type { AnimalStats, ApiResponse, Filters, Livestock } from "../types";

// Simulate real backend API with delays, errors, and proper responses
class MockLivestockAPI {
  private data: Livestock[] = [];

  constructor() {
    // Create a copy on instantiation
    this.data = [...livestockData];
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
      id: Math.max(0, ...this.data.map((a) => a.id)) + 1, // Added Math.max(0, ...) to handle empty array
      ...animalData,
      createdAt: new Date().toISOString(),
    };

    this.data.push(newAnimal); // Now mutates internal copy

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
    // Simulate occasional backend errors
    if (Math.random() > 0.8) {
      throw new Error("Backend service temporarily unavailable");
    }

    const stats: AnimalStats = {
      totalAnimals: this.data.length,
      healthyCount: this.data.filter((a) => a.health === "Healthy").length,
      sickCount: this.data.filter((a) => a.health === "Sick").length,
      underTreatmentCount: this.data.filter(
        (a) => a.health === "Under Treatment"
      ).length,
      recoveredCount: this.data.filter((a) => a.health === "Recovered").length,
      counties: [...new Set(this.data.map((a) => a.county))].length,
      lastUpdated: new Date().toISOString(),
    };

    return { data: stats, success: true };
  }
}

export const mockAPI = new MockLivestockAPI();
