import { Inject, Injectable } from '@nestjs/common';
import type {
  AnimalStats,
  Filters,
  HealthStatus,
  Livestock,
  LivestockFormData,
} from '@wam-mfugo/shared';
import { ANIMALS_REPOSITORY, AnimalsRepository } from './animal.repository';

@Injectable()
export class AnimalsService {
  constructor(
    @Inject(ANIMALS_REPOSITORY) private readonly repo: AnimalsRepository,
  ) {}

  list(filters: Filters): Promise<Livestock[]> {
    return this.repo.list(filters);
  }

  create(data: LivestockFormData): Promise<Livestock> {
    return this.repo.create(data);
  }

  updateHealth(id: number, health: HealthStatus): Promise<Livestock | null> {
    return this.repo.updateHealth(id, health);
  }

  getStatistics(): Promise<AnimalStats> {
    return this.repo.getStatistics();
  }
}
