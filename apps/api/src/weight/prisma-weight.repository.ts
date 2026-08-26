import { PrismaService } from '../common/prisma.service';
import type { WeightRepository } from './weight.repository';
import type { WeightRecord, WeightGainStats } from './weight.service';

export class PrismaWeightRepository implements WeightRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toRecord(r: any): WeightRecord {
    return {
      id: r.id,
      animalId: r.animalId,
      animalName: r.animal?.name ?? '',
      animalType: r.animal?.type ?? '',
      weight: r.weight,
      unit: r.unit,
      recordedAt: r.recordedAt.toISOString(),
      recordedBy: r.recordedBy,
      notes: r.notes,
      county: r.animal?.county ?? '',
    };
  }

  async record(data: {
    animalId: number;
    weight: number;
    unit: string;
    recordedBy: string;
    notes: string | null;
    recordedAt?: Date;
  }): Promise<WeightRecord> {
    const r = await this.prisma.weightRecord.create({
      data: {
        animalId: data.animalId,
        weight: data.weight,
        unit: data.unit,
        recordedBy: data.recordedBy,
        notes: data.notes,
        recordedAt: data.recordedAt ?? new Date(),
      },
      include: { animal: { select: { name: true, type: true, county: true } } },
    });
    return this.toRecord(r);
  }

  async findMany(filters: {
    animalId?: number;
    county?: string;
    fromDate?: string;
    toDate?: string;
  }, skip: number, take: number): Promise<WeightRecord[]> {
    const where: Record<string, unknown> = {};
    if (filters.animalId) where.animalId = filters.animalId;
    if (filters.county) where.animal = { county: filters.county };
    if (filters.fromDate || filters.toDate) {
      where.recordedAt = {
        ...(filters.fromDate ? { gte: new Date(filters.fromDate) } : {}),
        ...(filters.toDate ? { lte: new Date(filters.toDate) } : {}),
      };
    }
    const rows = await this.prisma.weightRecord.findMany({
      where,
      include: { animal: { select: { name: true, type: true, county: true } } },
      orderBy: { recordedAt: 'desc' },
      skip, take,
    });
    return rows.map((r) => this.toRecord(r));
  }

  async findByAnimalId(animalId: number): Promise<WeightRecord[]> {
    const rows = await this.prisma.weightRecord.findMany({
      where: { animalId },
      include: { animal: { select: { name: true, type: true, county: true } } },
      orderBy: { recordedAt: 'asc' },
    });
    return rows.map((r) => this.toRecord(r));
  }

  async getGainStats(query?: { county?: string; animalId?: number }): Promise<WeightGainStats[]> {
    const where: Record<string, unknown> = {};
    if (query?.county) where.county = query.county;
    const animals = await this.prisma.animal.findMany({
      where,
      select: { id: true, name: true, type: true, county: true },
    });
    const results: WeightGainStats[] = [];
    for (const animal of animals) {
      if (query?.animalId && animal.id !== query.animalId) continue;
      const records = await this.prisma.weightRecord.findMany({
        where: { animalId: animal.id },
        orderBy: { recordedAt: 'asc' },
      });
      if (records.length < 2) continue;
      const first = records[0];
      const latest = records[records.length - 1];
      const gain = latest.weight - first.weight;
      const gainPercent = first.weight > 0 ? Math.round((gain / first.weight) * 100) : 0;
      results.push({
        animalId: animal.id, animalName: animal.name, animalType: animal.type,
        county: animal.county, firstWeight: first.weight, latestWeight: latest.weight,
        gain: Math.round(gain * 100) / 100, gainPercent, recordCount: records.length,
        firstRecorded: first.recordedAt.toISOString(), lastRecorded: latest.recordedAt.toISOString(),
        unit: latest.unit,
      });
    }
    return results.sort((a, b) => b.gainPercent - a.gainPercent);
  }

  async remove(id: number): Promise<boolean> {
    try { await this.prisma.weightRecord.delete({ where: { id } }); return true; }
    catch { return false; }
  }
}
