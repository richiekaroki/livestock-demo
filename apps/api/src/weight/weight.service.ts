import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RecordWeightDto, WeightQueryDto } from './dto/weight.dto';

export interface WeightRecord {
  id: number;
  animalId: number;
  animalName: string;
  animalType: string;
  weight: number;
  unit: string;
  recordedAt: string;
  recordedBy: string;
  notes: string | null;
  county: string;
}

export interface WeightGainStats {
  animalId: number;
  animalName: string;
  animalType: string;
  county: string;
  firstWeight: number;
  latestWeight: number;
  gain: number;
  gainPercent: number;
  recordCount: number;
  firstRecorded: string;
  lastRecorded: string;
  unit: string;
}

@Injectable()
export class WeightService {
  constructor(private readonly prisma: PrismaService) {}

  async record(dto: RecordWeightDto): Promise<WeightRecord> {
    const animal = await this.prisma.animal.findUnique({
      where: { id: dto.animalId },
    });
    if (!animal) throw new NotFoundException(`Animal #${dto.animalId} not found`);

    const record = await this.prisma.weightRecord.create({
      data: {
        animalId: dto.animalId,
        weight: dto.weight,
        unit: dto.unit ?? 'kg',
        recordedBy: dto.recordedBy,
        notes: dto.notes ?? null,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
      },
      include: {
        animal: { select: { name: true, type: true, county: true } },
      },
    });

    return {
      id: record.id,
      animalId: record.animalId,
      animalName: record.animal.name,
      animalType: record.animal.type,
      weight: record.weight,
      unit: record.unit,
      recordedAt: record.recordedAt.toISOString(),
      recordedBy: record.recordedBy,
      notes: record.notes,
      county: record.animal.county,
    };
  }

  async list(query: WeightQueryDto): Promise<WeightRecord[]> {
    const where: Record<string, unknown> = {};
    if (query.animalId) where.animalId = query.animalId;
    if (query.county) where.animal = { county: query.county };
    if (query.fromDate || query.toDate) {
      where.recordedAt = {
        ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
        ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
      };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const records = await this.prisma.weightRecord.findMany({
      where,
      include: {
        animal: { select: { name: true, type: true, county: true } },
      },
      orderBy: { recordedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return records.map((r) => ({
      id: r.id,
      animalId: r.animalId,
      animalName: r.animal.name,
      animalType: r.animal.type,
      weight: r.weight,
      unit: r.unit,
      recordedAt: r.recordedAt.toISOString(),
      recordedBy: r.recordedBy,
      notes: r.notes,
      county: r.animal.county,
    }));
  }

  async getAnimalHistory(animalId: number): Promise<WeightRecord[]> {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
    });
    if (!animal) throw new NotFoundException(`Animal #${animalId} not found`);

    const records = await this.prisma.weightRecord.findMany({
      where: { animalId },
      include: {
        animal: { select: { name: true, type: true, county: true } },
      },
      orderBy: { recordedAt: 'asc' },
    });

    return records.map((r) => ({
      id: r.id,
      animalId: r.animalId,
      animalName: r.animal.name,
      animalType: r.animal.type,
      weight: r.weight,
      unit: r.unit,
      recordedAt: r.recordedAt.toISOString(),
      recordedBy: r.recordedBy,
      notes: r.notes,
      county: r.animal.county,
    }));
  }

  async getWeightGainStats(query?: { county?: string; animalId?: number }): Promise<WeightGainStats[]> {
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
        animalId: animal.id,
        animalName: animal.name,
        animalType: animal.type,
        county: animal.county,
        firstWeight: first.weight,
        latestWeight: latest.weight,
        gain: Math.round(gain * 100) / 100,
        gainPercent,
        recordCount: records.length,
        firstRecorded: first.recordedAt.toISOString(),
        lastRecorded: latest.recordedAt.toISOString(),
        unit: latest.unit,
      });
    }

    return results.sort((a, b) => b.gainPercent - a.gainPercent);
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.prisma.weightRecord.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
