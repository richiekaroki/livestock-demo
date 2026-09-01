import { PrismaService } from '../common/prisma.service';
import type {
  VaccinationRecord,
  VaccinationsRepository,
} from './vaccination.repository';

export class PrismaVaccinationsRepository implements VaccinationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toRecord(row: any): VaccinationRecord {
    return {
      id: row.id,
      type: row.type,
      date: row.date,
      batchNumber: row.batchNumber,
      veterinarian: row.veterinarian,
      nextDueDate: row.nextDueDate,
      animalId: row.animalId,
      animalName: row.animal?.name,
      animalType: row.animal?.type,
      owner: row.animal?.owner,
      county: row.animal?.county,
    };
  }

  async findMany(
    filters: { animalId?: number; type?: string },
    skip: number,
    take: number,
  ): Promise<VaccinationRecord[]> {
    const where: Record<string, unknown> = {};
    if (filters.animalId) where.animalId = filters.animalId;
    if (filters.type) where.type = filters.type;

    const rows = await this.prisma.vaccination.findMany({
      where,
      include: {
        animal: {
          select: { name: true, type: true, owner: true, county: true },
        },
      },
      orderBy: { date: 'desc' },
      skip,
      take,
    });

    return rows.map((r: any) => this.toRecord(r));
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.prisma.vaccination.count({ where: where as any });
  }

  async create(data: {
    type: string;
    date: Date;
    batchNumber: string;
    veterinarian: string;
    nextDueDate: Date | null;
    animalId: number;
  }): Promise<VaccinationRecord> {
    const row = await this.prisma.vaccination.create({
      data: {
        type: data.type,
        date: data.date,
        batchNumber: data.batchNumber,
        veterinarian: data.veterinarian,
        nextDueDate: data.nextDueDate,
        animalId: data.animalId,
      },
      include: {
        animal: {
          select: { name: true, type: true, owner: true, county: true },
        },
      },
    });
    return this.toRecord(row);
  }

  async update(
    id: number,
    data: Record<string, unknown>,
  ): Promise<VaccinationRecord> {
    const row = await this.prisma.vaccination.update({
      where: { id },
      data,
      include: {
        animal: {
          select: { name: true, type: true, owner: true, county: true },
        },
      },
    });
    return this.toRecord(row);
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.prisma.vaccination.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findDueReminders(
    now: Date,
    deadline: Date,
  ): Promise<VaccinationRecord[]> {
    const rows = await this.prisma.vaccination.findMany({
      where: {
        nextDueDate: {
          not: null,
          gte: now,
          lte: deadline,
        },
      },
      include: {
        animal: {
          select: { name: true, type: true, owner: true, county: true },
        },
      },
    });
    return rows.map((r: any) => this.toRecord(r));
  }
}
