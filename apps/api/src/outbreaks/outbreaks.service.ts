import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type {
  OutbreakQueryDto,
  ReportOutbreakDto,
  UpdateOutbreakDto,
} from './dto/report-outbreak.dto';

export interface OutbreakRecord {
  id: number;
  diseaseType: string;
  affectedAnimals: number;
  suspectedAnimals: number;
  county: string;
  reportedBy: string;
  reportedAt: string;
  symptoms: string[];
  actions: string[];
  status: string;
}

@Injectable()
export class OutbreaksService {
  constructor(private readonly prisma: PrismaService) {}

  async report(dto: ReportOutbreakDto): Promise<OutbreakRecord> {
    const record = await this.prisma.outbreak.create({
      data: {
        diseaseType: dto.diseaseType,
        affectedAnimals: dto.affectedAnimals,
        suspectedAnimals: dto.suspectedAnimals ?? 0,
        lat: dto.lat,
        lng: dto.lng,
        county: dto.county,
        reportedBy: dto.reportedBy,
        symptoms: dto.symptoms ?? [],
        actions: dto.actions ?? [],
        status: dto.status ?? 'reported',
      },
    });

    return {
      id: record.id,
      diseaseType: record.diseaseType,
      affectedAnimals: record.affectedAnimals,
      suspectedAnimals: record.suspectedAnimals,
      county: record.county,
      reportedBy: record.reportedBy,
      reportedAt: record.reportedAt.toISOString(),
      symptoms: record.symptoms as string[],
      actions: record.actions as string[],
      status: record.status,
    };
  }

  async list(query: OutbreakQueryDto): Promise<OutbreakRecord[]> {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.county) where.county = query.county;
    if (query.diseaseType) where.diseaseType = query.diseaseType;

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const records = await this.prisma.outbreak.findMany({
      where,
      orderBy: { reportedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return records.map((r) => ({
      id: r.id,
      diseaseType: r.diseaseType,
      affectedAnimals: r.affectedAnimals,
      suspectedAnimals: r.suspectedAnimals,
      county: r.county,
      reportedBy: r.reportedBy,
      reportedAt: r.reportedAt.toISOString(),
      symptoms: r.symptoms as string[],
      actions: r.actions as string[],
      status: r.status,
    }));
  }

  async update(id: number, dto: UpdateOutbreakDto): Promise<OutbreakRecord> {
    const existing = await this.prisma.outbreak.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Outbreak #${id} not found`);

    const data: Record<string, unknown> = {};
    if (dto.status) data.status = dto.status;
    if (dto.diseaseType) data.diseaseType = dto.diseaseType;
    if (dto.affectedAnimals !== undefined)
      data.affectedAnimals = dto.affectedAnimals;
    if (dto.symptoms) data.symptoms = dto.symptoms;
    if (dto.actions) data.actions = dto.actions;

    const record = await this.prisma.outbreak.update({
      where: { id },
      data,
    });

    return {
      id: record.id,
      diseaseType: record.diseaseType,
      affectedAnimals: record.affectedAnimals,
      suspectedAnimals: record.suspectedAnimals,
      county: record.county,
      reportedBy: record.reportedBy,
      reportedAt: record.reportedAt.toISOString(),
      symptoms: record.symptoms as string[],
      actions: record.actions as string[],
      status: record.status,
    };
  }
}
