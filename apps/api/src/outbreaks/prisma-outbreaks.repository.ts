import { PrismaService } from '../common/prisma.service';
import type { OutbreaksRepository } from './outbreaks.repository';
import type { OutbreakRecord } from './outbreaks.service';

export class PrismaOutbreaksRepository implements OutbreaksRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toRecord(r: any): OutbreakRecord {
    return {
      id: r.id, diseaseType: r.diseaseType,
      affectedAnimals: r.affectedAnimals, suspectedAnimals: r.suspectedAnimals,
      county: r.county, reportedBy: r.reportedBy,
      reportedAt: r.reportedAt.toISOString(),
      symptoms: r.symptoms as string[], actions: r.actions as string[],
      status: r.status,
    };
  }

  async report(data: {
    diseaseType: string; affectedAnimals: number; suspectedAnimals: number;
    lat: number; lng: number; county: string; reportedBy: string;
    symptoms: string[]; actions: string[]; status: string;
  }): Promise<OutbreakRecord> {
    const r = await this.prisma.outbreak.create({
      data: {
        diseaseType: data.diseaseType, affectedAnimals: data.affectedAnimals,
        suspectedAnimals: data.suspectedAnimals, lat: data.lat, lng: data.lng,
        county: data.county, reportedBy: data.reportedBy,
        symptoms: data.symptoms, actions: data.actions, status: data.status,
      },
    });
    return this.toRecord(r);
  }

  async findMany(filters: {
    status?: string; county?: string; diseaseType?: string;
  }, skip: number, take: number): Promise<OutbreakRecord[]> {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.county) where.county = filters.county;
    if (filters.diseaseType) where.diseaseType = filters.diseaseType;
    const rows = await this.prisma.outbreak.findMany({
      where, orderBy: { reportedAt: 'desc' }, skip, take,
    });
    return rows.map((r) => this.toRecord(r));
  }

  async update(id: number, data: Record<string, unknown>): Promise<OutbreakRecord> {
    const r = await this.prisma.outbreak.update({ where: { id }, data });
    return this.toRecord(r);
  }
}
