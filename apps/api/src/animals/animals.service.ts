import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

  async update(id: number, dto: Partial<Omit<Livestock, 'id' | 'createdAt'>>): Promise<Livestock> {
    const animal = await this.repo.update(id, { id, ...dto });
    if (!animal) throw new NotFoundException('Animal not found');
    return animal;
  }

  updateHealth(id: number, health: HealthStatus): Promise<Livestock | null> {
    return this.repo.updateHealth(id, health);
  }

  async remove(id: number): Promise<boolean> {
    const deleted = await this.repo.remove(id);
    if (!deleted) throw new NotFoundException('Animal not found');
    return true;
  }

  getStatistics(): Promise<AnimalStats> {
    return this.repo.getStatistics();
  }

  async bulkUpdateHealth(ids: number[], health: HealthStatus): Promise<{ updated: number }> {
    let updated = 0;
    for (const id of ids) {
      const result = await this.repo.updateHealth(id, health);
      if (result) updated++;
    }
    return { updated };
  }

  async bulkDelete(ids: number[]): Promise<{ deleted: number }> {
    let deleted = 0;
    for (const id of ids) {
      const result = await this.repo.remove(id);
      if (result) deleted++;
    }
    return { deleted };
  }

  async getByIds(ids: number[]): Promise<Livestock[]> {
    const all = await this.repo.list({});
    return all.filter((a) => ids.includes(a.id));
  }
}
