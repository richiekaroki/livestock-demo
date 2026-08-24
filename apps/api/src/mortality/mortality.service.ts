import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ReportMortalityDto, MortalityQueryDto } from './dto/mortality.dto';

export interface MortalityRecord {
  id: number;
  animalId: number;
  animalName: string;
  animalType: string;
  cause: string;
  diseaseName: string | null;
  reportedBy: string;
  reportedAt: string;
  notes: string | null;
  county: string;
  owner: string;
}

@Injectable()
export class MortalityService {
  constructor(private readonly prisma: PrismaService) {}

  async report(dto: ReportMortalityDto): Promise<MortalityRecord> {
    const animal = await this.prisma.animal.findUnique({
      where: { id: dto.animalId },
    });
    if (!animal)
      throw new NotFoundException(`Animal #${dto.animalId} not found`);

    const record = await this.prisma.mortality.create({
      data: {
        animalId: dto.animalId,
        cause: dto.cause,
        diseaseName: dto.diseaseName ?? null,
        reportedBy: dto.reportedBy,
        notes: dto.notes ?? null,
      },
      include: {
        animal: {
          select: { name: true, type: true, county: true, owner: true },
        },
      },
    });

    return {
      id: record.id,
      animalId: record.animalId,
      animalName: record.animal.name,
      animalType: record.animal.type,
      cause: record.cause,
      diseaseName: record.diseaseName,
      reportedBy: record.reportedBy,
      reportedAt: record.reportedAt.toISOString(),
      notes: record.notes,
      county: record.animal.county,
      owner: record.animal.owner,
    };
  }

  async list(query: MortalityQueryDto): Promise<MortalityRecord[]> {
    const where: Record<string, unknown> = {};
    if (query.cause) where.cause = query.cause;
    if (query.county) {
      where.animal = { county: query.county };
    }
    if (query.fromDate || query.toDate) {
      where.reportedAt = {
        ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
        ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
      };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const records = await this.prisma.mortality.findMany({
      where,
      include: {
        animal: {
          select: { name: true, type: true, county: true, owner: true },
        },
      },
      orderBy: { reportedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return records.map((r) => ({
      id: r.id,
      animalId: r.animalId,
      animalName: r.animal.name,
      animalType: r.animal.type,
      cause: r.cause,
      diseaseName: r.diseaseName,
      reportedBy: r.reportedBy,
      reportedAt: r.reportedAt.toISOString(),
      notes: r.notes,
      county: r.animal.county,
      owner: r.animal.owner,
    }));
  }

  async getStats() {
    const total = await this.prisma.mortality.count();

    const byCause = await this.prisma.mortality.groupBy({
      by: ['cause'],
      _count: true,
      orderBy: { _count: { cause: 'desc' } },
    });

    const byCounty = await this.prisma.mortality.findMany({
      select: { animal: { select: { county: true } } },
    });
    const countyMap = new Map<string, number>();
    for (const m of byCounty) {
      countyMap.set(m.animal.county, (countyMap.get(m.animal.county) ?? 0) + 1);
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCount = await this.prisma.mortality.count({
      where: { reportedAt: { gte: thirtyDaysAgo } },
    });

    return {
      total,
      recentCount,
      byCause: byCause.map((c) => ({ cause: c.cause, count: c._count })),
      byCounty: Array.from(countyMap.entries())
        .map(([county, count]) => ({ county, count }))
        .sort((a, b) => b.count - a.count),
    };
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
