import type { StatsRepository } from './stats.repository';
import type { CountyVaccinationCoverage } from './stats.service';

export class InMemoryStatsRepository implements StatsRepository {
  async getVaccinationCoverage(): Promise<CountyVaccinationCoverage[]> {
    return [];
  }

  async getCountyComparison() {
    return [];
  }
}
