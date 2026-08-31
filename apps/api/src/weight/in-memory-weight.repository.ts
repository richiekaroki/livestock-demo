import type { WeightRepository } from './weight.repository';
import type { WeightRecord, WeightGainStats } from './weight.service';

export class InMemoryWeightRepository implements WeightRepository {
  private records: WeightRecord[] = [];
  private nextId = 1;

  async record(data: {
    animalId: number;
    weight: number;
    unit: string;
    recordedBy: string;
    notes: string | null;
    recordedAt?: Date;
  }): Promise<WeightRecord> {
    const r: WeightRecord = {
      id: this.nextId++,
      animalId: data.animalId,
      animalName: `Animal #${data.animalId}`,
      animalType: 'Unknown',
      weight: data.weight,
      unit: data.unit,
      recordedAt: (data.recordedAt ?? new Date()).toISOString(),
      recordedBy: data.recordedBy,
      notes: data.notes,
      county: 'Unknown',
    };
    this.records.push(r);
    return r;
  }

  async findMany(
    filters: {
      animalId?: number;
      county?: string;
      fromDate?: string;
      toDate?: string;
    },
    skip: number,
    take: number,
  ): Promise<WeightRecord[]> {
    let filtered = this.records;
    if (filters.animalId)
      filtered = filtered.filter((r) => r.animalId === filters.animalId);
    if (filters.county)
      filtered = filtered.filter((r) => r.county === filters.county);
    return filtered.slice(skip, skip + take);
  }

  async findByAnimalId(animalId: number): Promise<WeightRecord[]> {
    return this.records.filter((r) => r.animalId === animalId);
  }

  async getGainStats(): Promise<WeightGainStats[]> {
    return [];
  }

  async remove(id: number): Promise<boolean> {
    const i = this.records.findIndex((r) => r.id === id);
    if (i === -1) return false;
    this.records.splice(i, 1);
    return true;
  }
}
