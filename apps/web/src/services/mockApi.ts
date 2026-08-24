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

  async updateAnimal(
    animalId: number,
    data: Partial<Omit<Livestock, "id">>
  ): Promise<ApiResponse<Livestock>> {
    await this.delay(300);
    const animal = this.data.find((a) => a.id === animalId);
    if (!animal) {
      return { success: false, error: "Animal not found", data: {} as Livestock };
    }
    Object.assign(animal, data);
    this.saveData();
    return { success: true, data: animal };
  }

  async deleteAnimal(animalId: number): Promise<ApiResponse<{ message: string }>> {
    await this.delay(300);
    const index = this.data.findIndex((a) => a.id === animalId);
    if (index === -1) {
      return { success: false, error: "Animal not found", data: { message: "Not found" } };
    }
    this.data.splice(index, 1);
    this.saveData();
    return { success: true, data: { message: "Animal deleted" } };
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

  async predictDiseaseRisk(payload: { county: string; diseaseType?: string; season?: string }): Promise<ApiResponse<unknown[]>> {
    await this.delay(300);
    const diseases = payload.diseaseType
      ? [payload.diseaseType]
      : ["Foot and Mouth Disease", "Rift Valley Fever", "Anthrax", "Brucellosis"];

    const results = diseases.map((disease) => ({
      id: Math.floor(Math.random() * 1000),
      county: payload.county,
      diseaseType: disease,
      riskLevel: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)],
      confidence: Math.round((0.3 + Math.random() * 0.6) * 100) / 100,
      factors: [
        { name: "outbreak_history", weight: 0.15, value: Math.floor(Math.random() * 5), description: "Outbreak history in last 6 months" },
        { name: "seasonal_risk", weight: 0.12, value: 0.5, description: "Seasonal risk factor" },
        { name: "animal_density", weight: 0.08, value: Math.floor(Math.random() * 500), description: "Animal density in county" },
      ],
      lastCalculated: new Date().toISOString(),
    }));

    return { success: true, data: results };
  }

  async getDiseaseRisks(): Promise<ApiResponse<unknown[]>> {
    await this.delay(200);
    return { success: true, data: [] };
  }

  async getCountyRiskSummary(county: string): Promise<ApiResponse<unknown>> {
    await this.delay(200);
    return {
      success: true,
      data: {
        county,
        totalDiseases: 0,
        riskBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
        highestRisk: "low",
      },
    };
  }

  async simulateWhatIf(): Promise<ApiResponse<unknown>> {
    await this.delay(300);
    return {
      success: true,
      data: {
        county: "Mock",
        scenario: { vaccinationIncrease: 0, livestockReduction: 0, season: "wet" },
        results: [],
      },
    };
  }

  async getVaccinationCoverage(): Promise<ApiResponse<unknown[]>> {
    await this.delay(200);
    const counties = [...new Set(this.data.map((a) => a.county))];
    const results = counties.map((county) => {
      const animals = this.data.filter((a) => a.county === county);
      return {
        county,
        totalAnimals: animals.length,
        vaccinatedAnimals: Math.floor(animals.length * 0.6),
        coveragePercent: 60,
        vaccinationTypes: { FMD: 5, Anthrax: 3 },
        lastVaccinated: new Date().toISOString(),
      };
    });
    return { success: true, data: results };
  }

  async getCountyComparison(): Promise<ApiResponse<unknown[]>> {
    await this.delay(200);
    const counties = [...new Set(this.data.map((a) => a.county))];
    const results = counties.map((county) => {
      const animals = this.data.filter((a) => a.county === county);
      const healthy = animals.filter((a) => a.health === "Healthy").length;
      const sick = animals.filter((a) => a.health === "Sick").length;
      return {
        county,
        totalAnimals: animals.length,
        healthy,
        sick,
        underTreatment: animals.filter((a) => a.health === "Under Treatment").length,
        recovered: animals.filter((a) => a.health === "Recovered").length,
        healthyRate: animals.length > 0 ? Math.round((healthy / animals.length) * 100) : 0,
        animalTypes: {},
        vaccinatedCount: Math.floor(animals.length * 0.6),
        vaccinationRate: 60,
        mortalityCount: 0,
        mortalityRate: 0,
        outbreakCount: 0,
        outbreakDiseases: [],
      };
    });
    return { success: true, data: results };
  }

  async getMortalities(): Promise<ApiResponse<unknown[]>> {
    await this.delay(200);
    return { success: true, data: [] };
  }

  async reportMortality(): Promise<ApiResponse<unknown>> {
    await this.delay(300);
    return { success: true, data: { id: Math.floor(Math.random() * 1000), message: "Reported (mock)" } };
  }

  async getMortalityStats(): Promise<ApiResponse<unknown>> {
    await this.delay(200);
    return {
      success: true,
      data: { total: 0, recentCount: 0, byCause: [], byCounty: [] },
    };
  }

  async getWeightRecords(): Promise<ApiResponse<unknown[]>> {
    await this.delay(200);
    return { success: true, data: [] };
  }

  async getAnimalWeightHistory(): Promise<ApiResponse<unknown[]>> {
    await this.delay(200);
    return { success: true, data: [] };
  }

  async getWeightGainStats(): Promise<ApiResponse<unknown[]>> {
    await this.delay(200);
    return { success: true, data: [] };
  }

  async recordWeight(): Promise<ApiResponse<unknown>> {
    await this.delay(300);
    return { success: true, data: { id: Math.floor(Math.random() * 1000), message: "Recorded (mock)" } };
  }

  async getVaccinationReminders(): Promise<ApiResponse<unknown[]>> {
    await this.delay(200);
    return { success: true, data: [] };
  }

  async assessHealth(): Promise<ApiResponse<unknown>> {
    await this.delay(1500);
    const statuses = ["healthy", "sick", "under_treatment", "needs_attention"] as const;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      success: true,
      data: {
        id: `ha_${Date.now()}`,
        healthStatus: status,
        confidence: 0.65 + Math.random() * 0.3,
        findings: [
          { category: "Body Condition", status: status === "healthy" ? "normal" : "warning", description: "Assessment from photo", confidence: 0.8 },
          { category: "Coat/Skin", status: "normal", description: "Coat appears healthy", confidence: 0.75 },
        ],
        recommendations: ["Monitor closely", "Consult veterinarian if symptoms persist"],
        assessedAt: new Date().toISOString(),
        model: "mock-v1 (demo)",
      },
    };
  }

  async getUserPermissions(): Promise<ApiResponse<string[]>> {
    await this.delay(100);
    return { success: true, data: ["can_register", "can_vaccinate", "can_export", "can_admin"] };
  }

  async setUserPermissions(): Promise<ApiResponse<unknown>> {
    await this.delay(200);
    return { success: true, data: { message: "Permissions updated (mock)" } };
  }

  async getPermissionDefaults(): Promise<ApiResponse<Record<string, string[]>>> {
    await this.delay(100);
    return {
      success: true,
      data: {
        admin: ["can_register", "can_vaccinate", "can_export", "can_admin", "can_view_reports", "can_manage_users", "can_manage_outbreaks"],
        field_agent: ["can_register", "can_vaccinate", "can_export", "can_view_reports", "can_manage_outbreaks"],
        farmer: ["can_register", "can_export"],
        viewer: ["can_view_reports"],
      },
    };
  }

  async importAnimalsCsv(): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    await this.delay(1000);
    return { success: true, data: { imported: 5, errors: [] } };
  }

  async bulkUpdateHealth(): Promise<ApiResponse<{ updated: number }>> {
    await this.delay(300);
    return { success: true, data: { updated: 3 } };
  }

  async bulkDelete(): Promise<ApiResponse<{ deleted: number }>> {
    await this.delay(300);
    return { success: true, data: { deleted: 2 } };
  }

  async bulkExport(): Promise<ApiResponse<{ exported: number }>> {
    await this.delay(300);
    return { success: true, data: { exported: 0 } };
  }

  async getStats(): Promise<ApiResponse<AnimalStats>> {
    await this.delay(200);
    const animals: Livestock[] = this.data;
    return {
      success: true,
      data: {
        totalAnimals: animals.length,
        healthyCount: animals.filter((a: Livestock) => a.health === "Healthy").length,
        sickCount: animals.filter((a: Livestock) => a.health === "Sick").length,
        underTreatmentCount: animals.filter((a: Livestock) => a.health === "Under Treatment").length,
        recoveredCount: animals.filter((a: Livestock) => a.health === "Recovered").length,
        counties: new Set(animals.map((a: Livestock) => a.county)).size,
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}

export const mockAPI = new MockLivestockAPI();
