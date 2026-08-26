import { Inject, Injectable } from '@nestjs/common';
import type { AnimalStats } from '@wam-mfugo/shared';
import { AnimalsService } from '../animals/animals.service';
import { STATS_REPOSITORY, StatsRepository } from './stats.repository';

export interface CountyVaccinationCoverage {
  county: string;
  totalAnimals: number;
  vaccinatedAnimals: number;
  coveragePercent: number;
  vaccinationTypes: Record<string, number>;
  lastVaccinated?: string;
}

@Injectable()
export class StatsService {
  constructor(
    private readonly animals: AnimalsService,
    @Inject(STATS_REPOSITORY) private readonly repo: StatsRepository,
  ) {}

  get(): Promise<AnimalStats> {
    return this.animals.getStatistics();
  }

  async getVaccinationCoverage(): Promise<CountyVaccinationCoverage[]> {
    return this.repo.getVaccinationCoverage();
  }

  async getCountyComparison() {
    return this.repo.getCountyComparison();
  }
}
