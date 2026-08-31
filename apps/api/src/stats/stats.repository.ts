import type { CountyVaccinationCoverage } from './stats.service';
import type { AnimalStats } from '@wam-mfugo/shared';

export const STATS_REPOSITORY = Symbol('STATS_REPOSITORY');

export interface StatsRepository {
  getVaccinationCoverage(): Promise<CountyVaccinationCoverage[]>;
  getCountyComparison(): Promise<
    {
      county: string;
      totalAnimals: number;
      healthy: number;
      sick: number;
      underTreatment: number;
      recovered: number;
      healthyRate: number;
      animalTypes: Record<string, number>;
      vaccinatedCount: number;
      vaccinationRate: number;
      mortalityCount: number;
      mortalityRate: number;
      outbreakCount: number;
      outbreakDiseases: string[];
    }[]
  >;
}
