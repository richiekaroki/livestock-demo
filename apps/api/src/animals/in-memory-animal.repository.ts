import {
  DEFAULT_DEMO_ANIMAL_COUNT,
  DEFAULT_DEMO_SEED,
  demoFarmerCountFor,
  generateDemoData,
} from '@wam-mfugo/shared';
import type {
  AnimalStats,
  Filters,
  HealthStatus,
  Livestock,
  LivestockFormData,
  LivestockUpdate,
} from '@wam-mfugo/shared';
import type { AnimalsRepository } from './animal.repository';

export class InMemoryAnimalsRepository implements AnimalsRepository {
  private animals: Livestock[];
  private nextId: number;

  constructor() {
    const demoMode = process.env.DEMO_MODE !== 'false';

    if (!demoMode) {
      this.animals = [];
      this.nextId = 1;
      return;
    }

    const envCount = process.env.DEMO_ANIMAL_COUNT;
    const envSeed = process.env.DEMO_SEED;
    const hasOverride = envCount !== undefined || envSeed !== undefined;

    if (hasOverride) {
      const animalCount = Number(envCount) || DEFAULT_DEMO_ANIMAL_COUNT;
      const seed = envSeed !== undefined ? Number(envSeed) : DEFAULT_DEMO_SEED;
      this.animals = generateDemoData({
        animalCount,
        farmerCount: demoFarmerCountFor(animalCount),
        seed,
      }).animals;
    } else {
      // Fast path: use pre-generated default seed (seed 42, 23 animals).
      this.animals = generateDemoData().animals;
    }

    this.nextId = this.animals.reduce((max, a) => Math.max(max, a.id), 0) + 1;
  }

  list(filters: Filters): Promise<Livestock[]> {
    return Promise.resolve(
      this.animals.filter(
        (a) =>
          (filters.type ? a.type === filters.type : true) &&
          (filters.health ? a.health === filters.health : true) &&
          (filters.county ? a.county === filters.county : true),
      ),
    );
  }

  create(data: LivestockFormData): Promise<Livestock> {
    const animal: Livestock = {
      ...data,
      id: this.nextId++,
      createdAt: new Date().toISOString(),
    };
    this.animals.push(animal);
    return Promise.resolve(animal);
  }

  update(id: number, data: LivestockUpdate): Promise<Livestock | null> {
    const animal = this.animals.find((a) => a.id === id);
    if (!animal) return Promise.resolve(null);
    const { id: _id, ...rest } = data;
    Object.assign(animal, rest);
    return Promise.resolve(animal);
  }

  updateHealth(id: number, health: HealthStatus): Promise<Livestock | null> {
    const animal = this.animals.find((a) => a.id === id);
    if (!animal) return Promise.resolve(null);
    animal.health = health;
    return Promise.resolve(animal);
  }

  remove(id: number): Promise<boolean> {
    const index = this.animals.findIndex((a) => a.id === id);
    if (index === -1) return Promise.resolve(false);
    this.animals.splice(index, 1);
    return Promise.resolve(true);
  }

  getStatistics(): Promise<AnimalStats> {
    let healthyCount = 0;
    let sickCount = 0;
    let underTreatmentCount = 0;
    let recoveredCount = 0;
    const counties = new Set<string>();

    for (const a of this.animals) {
      counties.add(a.county);
      switch (a.health) {
        case 'Healthy':
          healthyCount++;
          break;
        case 'Sick':
          sickCount++;
          break;
        case 'Under Treatment':
          underTreatmentCount++;
          break;
        case 'Recovered':
          recoveredCount++;
          break;
      }
    }

    return Promise.resolve({
      totalAnimals: this.animals.length,
      healthyCount,
      sickCount,
      underTreatmentCount,
      recoveredCount,
      counties: counties.size,
      lastUpdated: new Date().toISOString(),
    });
  }
}
