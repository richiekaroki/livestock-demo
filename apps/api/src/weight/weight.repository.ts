import type { WeightRecord, WeightGainStats } from './weight.service';

export const WEIGHT_REPOSITORY = Symbol('WEIGHT_REPOSITORY');

export interface WeightRepository {
  record(data: {
    animalId: number;
    weight: number;
    unit: string;
    recordedBy: string;
    notes: string | null;
    recordedAt?: Date;
  }): Promise<WeightRecord>;
  findMany(
    filters: {
      animalId?: number;
      county?: string;
      fromDate?: string;
      toDate?: string;
    },
    skip: number,
    take: number,
  ): Promise<WeightRecord[]>;
  findByAnimalId(animalId: number): Promise<WeightRecord[]>;
  getGainStats(query?: {
    county?: string;
    animalId?: number;
  }): Promise<WeightGainStats[]>;
  remove(id: number): Promise<boolean>;
}
