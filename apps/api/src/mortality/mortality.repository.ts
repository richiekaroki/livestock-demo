import type { MortalityRecord } from './mortality.service';

export const MORTALITY_REPOSITORY = Symbol('MORTALITY_REPOSITORY');

export interface MortalityRepository {
  report(data: {
    animalId: number;
    cause: string;
    diseaseName: string | null;
    reportedBy: string;
    notes: string | null;
  }): Promise<MortalityRecord>;
  findMany(filters: {
    cause?: string;
    county?: string;
    fromDate?: string;
    toDate?: string;
  }, skip: number, take: number): Promise<MortalityRecord[]>;
  count(where?: Record<string, unknown>): Promise<number>;
  countRecent(days: number): Promise<number>;
  groupByCause(): Promise<{ cause: string; count: number }[]>;
  groupByCounty(): Promise<{ county: string; count: number }[]>;
  remove(id: number): Promise<boolean>;
}
