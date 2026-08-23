import type {
  AnimalStats,
  Filters,
  HealthStatus,
  Livestock,
  LivestockFormData,
  LivestockUpdate,
} from '@wam-mfugo/shared';

export const ANIMALS_REPOSITORY = Symbol('ANIMALS_REPOSITORY');

export interface AnimalsRepository {
  list(filters: Filters): Promise<Livestock[]>;
  create(data: LivestockFormData): Promise<Livestock>;
  update(id: number, data: LivestockUpdate): Promise<Livestock | null>;
  updateHealth(id: number, health: HealthStatus): Promise<Livestock | null>;
  remove(id: number): Promise<boolean>;
  getStatistics(): Promise<AnimalStats>;
}
