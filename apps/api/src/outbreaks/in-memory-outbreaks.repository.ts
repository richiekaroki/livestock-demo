import type { OutbreaksRepository } from './outbreaks.repository';
import type { OutbreakRecord } from './outbreaks.service';

export class InMemoryOutbreaksRepository implements OutbreaksRepository {
  private records: OutbreakRecord[] = [];
  private nextId = 1;

  async report(data: {
    diseaseType: string; affectedAnimals: number; suspectedAnimals: number;
    lat: number; lng: number; county: string; reportedBy: string;
    symptoms: string[]; actions: string[]; status: string;
  }): Promise<OutbreakRecord> {
    const r: OutbreakRecord = {
      id: this.nextId++,
      diseaseType: data.diseaseType, affectedAnimals: data.affectedAnimals,
      suspectedAnimals: data.suspectedAnimals, county: data.county,
      reportedBy: data.reportedBy, reportedAt: new Date().toISOString(),
      symptoms: data.symptoms, actions: data.actions, status: data.status,
    };
    this.records.push(r);
    return r;
  }

  async findMany(filters: {
    status?: string; county?: string; diseaseType?: string;
  }, skip: number, take: number): Promise<OutbreakRecord[]> {
    let filtered = this.records;
    if (filters.status) filtered = filtered.filter((r) => r.status === filters.status);
    if (filters.county) filtered = filtered.filter((r) => r.county === filters.county);
    if (filters.diseaseType) filtered = filtered.filter((r) => r.diseaseType === filters.diseaseType);
    return filtered.slice(skip, skip + take);
  }

  async update(id: number, data: Record<string, unknown>): Promise<OutbreakRecord> {
    const r = this.records.find((r) => r.id === id);
    if (!r) throw new Error('Outbreak not found');
    Object.assign(r, data);
    return r;
  }
}
