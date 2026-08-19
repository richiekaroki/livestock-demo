import {
  DEFAULT_DEMO_ANIMAL_COUNT,
  DEFAULT_DEMO_SEED,
  demoFarmerCountFor,
  generateDemoData,
  seedFarmers,
} from '@wam-mfugo/shared';
import type { Farmer } from '@wam-mfugo/shared';
import type { FarmersRepository } from './farmer.repository';

export class InMemoryFarmersRepository implements FarmersRepository {
  private farmers: Farmer[];

  constructor() {
    const demoMode = process.env.DEMO_MODE !== 'false';
    if (!demoMode) {
      this.farmers = [];
      return;
    }

    const envCount = process.env.DEMO_ANIMAL_COUNT;
    const envSeed = process.env.DEMO_SEED;
    const hasOverride = envCount !== undefined || envSeed !== undefined;

    if (hasOverride) {
      const animalCount = Number(envCount) || DEFAULT_DEMO_ANIMAL_COUNT;
      const seed = envSeed !== undefined ? Number(envSeed) : DEFAULT_DEMO_SEED;
      this.farmers = generateDemoData({
        animalCount,
        farmerCount: demoFarmerCountFor(animalCount),
        seed,
      }).farmers;
    } else {
      this.farmers = seedFarmers.map((f) => ({ ...f }));
    }
  }

  list(): Promise<Farmer[]> {
    return Promise.resolve([...this.farmers]);
  }
}
