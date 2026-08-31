import type { MortalityRepository } from './mortality.repository';
import type { MortalityRecord } from './mortality.service';

export class InMemoryMortalityRepository implements MortalityRepository {
  private records: MortalityRecord[] = [];
  private nextId = 1;

  async report(data: {
    animalId: number;
    cause: string;
    diseaseName: string | null;
    reportedBy: string;
    notes: string | null;
  }): Promise<MortalityRecord> {
    const record: MortalityRecord = {
      id: this.nextId++,
      animalId: data.animalId,
      animalName: `Animal #${data.animalId}`,
      animalType: 'Unknown',
      cause: data.cause,
      diseaseName: data.diseaseName,
      reportedBy: data.reportedBy,
      reportedAt: new Date().toISOString(),
      notes: data.notes,
      county: 'Unknown',
      owner: 'Unknown',
    };
    this.records.push(record);
    return record;
  }

  async findMany(
    filters: {
      cause?: string;
      county?: string;
      fromDate?: string;
      toDate?: string;
    },
    skip: number,
    take: number,
  ): Promise<MortalityRecord[]> {
    let filtered = this.records;
    if (filters.cause)
      filtered = filtered.filter((r) => r.cause === filters.cause);
    if (filters.county)
      filtered = filtered.filter((r) => r.county === filters.county);
    return filtered.slice(skip, skip + take);
  }

  async count(): Promise<number> {
    return this.records.length;
  }

  async countRecent(days: number): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.records.filter((r) => new Date(r.reportedAt) >= since).length;
  }

  async groupByCause(): Promise<{ cause: string; count: number }[]> {
    const map = new Map<string, number>();
    for (const r of this.records) map.set(r.cause, (map.get(r.cause) ?? 0) + 1);
    return Array.from(map.entries()).map(([cause, count]) => ({
      cause,
      count,
    }));
  }

  async groupByCounty(): Promise<{ county: string; count: number }[]> {
    const map = new Map<string, number>();
    for (const r of this.records)
      map.set(r.county, (map.get(r.county) ?? 0) + 1);
    return Array.from(map.entries()).map(([county, count]) => ({
      county,
      count,
    }));
  }

  async remove(id: number): Promise<boolean> {
    const i = this.records.findIndex((r) => r.id === id);
    if (i === -1) return false;
    this.records.splice(i, 1);
    return true;
  }
}
