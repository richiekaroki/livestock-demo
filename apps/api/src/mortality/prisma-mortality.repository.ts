import { PrismaService } from '../common/prisma.service';
import type { MortalityRepository } from './mortality.repository';
import type { MortalityRecord } from './mortality.service';

export class PrismaMortalityRepository implements MortalityRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toRecord(r: any): MortalityRecord {
    return {
      id: r.id,
      animalId: r.animalId,
      animalName: r.animal?.name ?? '',
      animalType: r.animal?.type ?? '',
      cause: r.cause,
      diseaseName: r.diseaseName,
      reportedBy: r.reportedBy,
      reportedAt: r.reportedAt.toISOString(),
      notes: r.notes,
      county: r.animal?.county ?? '',
      owner: r.animal?.owner ?? '',
    };
  }

  async report(data: {
    animalId: number;
    cause: string;
    diseaseName: string | null;
    reportedBy: string;
    notes: string | null;
  }): Promise<MortalityRecord> {
    const record = await this.prisma.mortality.create({
      data: {
        animalId: data.animalId,
        cause: data.cause,
        diseaseName: data.diseaseName,
        reportedBy: data.reportedBy,
        notes: data.notes,
      },
      include: {
        animal: {
          select: { name: true, type: true, county: true, owner: true },
        },
      },
    });
    return this.toRecord(record);
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
    const where: Record<string, unknown> = {};
    if (filters.cause) where.cause = filters.cause;
    if (filters.county) where.animal = { county: filters.county };
    if (filters.fromDate || filters.toDate) {
      where.reportedAt = {
        ...(filters.fromDate ? { gte: new Date(filters.fromDate) } : {}),
        ...(filters.toDate ? { lte: new Date(filters.toDate) } : {}),
      };
    }
    const records = await this.prisma.mortality.findMany({
      where,
      include: {
        animal: {
          select: { name: true, type: true, county: true, owner: true },
        },
      },
      orderBy: { reportedAt: 'desc' },
      skip,
      take,
    });
    return records.map((r) => this.toRecord(r));
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.prisma.mortality.count({ where: where as any });
  }

  async countRecent(days: number): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.prisma.mortality.count({
      where: { reportedAt: { gte: since } },
    });
  }

  async groupByCause(): Promise<{ cause: string; count: number }[]> {
    const groups = await this.prisma.mortality.groupBy({
      by: ['cause'],
      _count: true,
      orderBy: { _count: { cause: 'desc' } },
    });
    return groups.map((g) => ({ cause: g.cause, count: g._count }));
  }

  async groupByCounty(): Promise<{ county: string; count: number }[]> {
    const rows = await this.prisma.mortality.findMany({
      select: { animal: { select: { county: true } } },
    });
    const map = new Map<string, number>();
    for (const m of rows) {
      map.set(m.animal.county, (map.get(m.animal.county) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([county, count]) => ({ county, count }))
      .sort((a, b) => b.count - a.count);
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.prisma.mortality.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
