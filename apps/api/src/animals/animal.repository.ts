import type {
  AnimalStats,
  Filters,
  HealthStatus,
  Livestock,
  LivestockFormData,
} from '@wam-mfugo/shared';

export const ANIMALS_REPOSITORY = Symbol('ANIMALS_REPOSITORY');

export interface AnimalsRepository {
  list(filters: Filters): Promise<Livestock[]>;
  create(data: LivestockFormData): Promise<Livestock>;
  updateHealth(id: number, health: HealthStatus): Promise<Livestock | null>;
  getStatistics(): Promise<AnimalStats>;
}
