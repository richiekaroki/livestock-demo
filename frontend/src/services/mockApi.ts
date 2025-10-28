// src/services/mockApi.ts

import { livestockData } from "../data/livestockData";

// Simulate real backend API with delays, errors, and proper responses
class MockLivestockAPI {
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAnimals(filters?: any) {
    await this.delay(300); // Simulate network delay
    let data = [...livestockData];

    // Simulate backend filtering
    if (filters?.type) {
      data = data.filter(animal => animal.type === filters.type);
    }
    if (filters?.health) {
      data = data.filter(animal => animal.health === filters.health);
    }
    if (filters?.county) {
      data = data.filter(animal => animal.county === filters.county);
    }

    return {
      data,
      total: data.length,
      page: 1,
      limit: 50,
      success: true
    };
  }

  async createAnimal(animalData: any) {
    await this.delay(400);
    const newAnimal = {
      id: Math.max(...livestockData.map(a => a.id)) + 1,
      ...animalData,
      createdAt: new Date().toISOString()
    };
    
    livestockData.push(newAnimal);
    
    return {
      data: newAnimal,
      success: true,
      message: "Animal registered successfully"
    };
  }

  async updateAnimalHealth(
    animalId: number,
    healthStatus: 'Healthy' | 'Sick' | 'Under Treatment' | 'Recovered'
  ) {
    await this.delay(300);
    const animal = livestockData.find(a => a.id === animalId);
    if (animal) {
      animal.health = healthStatus;
      return { success: true, data: animal };
    }
    return { success: false, error: "Animal not found" };
  }

  // Simulate API errors
  async getAnimalStatistics() {
    await this.delay(600);
    // Simulate occasional backend errors
    if (Math.random() > 0.8) {
      throw new Error("Backend service temporarily unavailable");
    }
    
    const stats = {
      totalAnimals: livestockData.length,
      healthyCount: livestockData.filter(a => a.health === 'Healthy').length,
      sickCount: livestockData.filter(a => a.health === 'Sick').length,
      counties: [...new Set(livestockData.map(a => a.county))].length,
      lastUpdated: new Date().toISOString()
    };
    
    return { data: stats, success: true };
  }
}

export const mockAPI = new MockLivestockAPI();