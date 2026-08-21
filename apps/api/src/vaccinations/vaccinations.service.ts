import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type {
  CreateVaccinationDto,
  UpdateVaccinationDto,
  VaccinationQueryDto,
} from './dto/vaccination.dto';

export interface VaccinationRecord {
  id: number;
  type: string;
  date: Date;
  batchNumber: string;
  veterinarian: string;
  nextDueDate: Date | null;
  animalId: number;
  animalName?: string;
  animalType?: string;
  owner?: string;
  county?: string;
}

@Injectable()
export class VaccinationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: VaccinationQueryDto): Promise<VaccinationRecord[]> {
    const where: Record<string, unknown> = {};
    if (query.animalId) where.animalId = query.animalId;
    if (query.type) where.type = query.type;

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const records = await this.prisma.vaccination.findMany({
      where,
      include: {
        animal: {
          select: { name: true, type: true, owner: true, county: true },
        },
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return records.map((r) => ({
      id: r.id,
      type: r.type,
      date: r.date,
      batchNumber: r.batchNumber,
      veterinarian: r.veterinarian,
      nextDueDate: r.nextDueDate,
      animalId: r.animalId,
      animalName: r.animal.name,
      animalType: r.animal.type,
      owner: r.animal.owner,
      county: r.animal.county,
    }));
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.prisma.vaccination.count({ where });
  }

  async create(dto: CreateVaccinationDto): Promise<VaccinationRecord> {
    const record = await this.prisma.vaccination.create({
      data: {
        type: dto.type,
        date: new Date(dto.date),
        batchNumber: dto.batchNumber,
        veterinarian: dto.veterinarian,
        nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : null,
        animalId: dto.animalId,
      },
      include: {
        animal: {
          select: { name: true, type: true, owner: true, county: true },
        },
      },
    });

    return {
      id: record.id,
      type: record.type,
      date: record.date,
      batchNumber: record.batchNumber,
      veterinarian: record.veterinarian,
      nextDueDate: record.nextDueDate,
      animalId: record.animalId,
      animalName: record.animal.name,
      animalType: record.animal.type,
      owner: record.animal.owner,
      county: record.animal.county,
    };
  }

  async update(
    id: number,
    dto: UpdateVaccinationDto,
  ): Promise<VaccinationRecord | null> {
    const data: Record<string, unknown> = {};
    if (dto.type) data.type = dto.type;
    if (dto.date) data.date = new Date(dto.date);
    if (dto.batchNumber) data.batchNumber = dto.batchNumber;
    if (dto.veterinarian) data.veterinarian = dto.veterinarian;
    if (dto.nextDueDate !== undefined)
      data.nextDueDate = dto.nextDueDate ? new Date(dto.nextDueDate) : null;

    const record = await this.prisma.vaccination.update({
      where: { id },
      data,
      include: {
        animal: {
          select: { name: true, type: true, owner: true, county: true },
        },
      },
    });

    return {
      id: record.id,
      type: record.type,
      date: record.date,
      batchNumber: record.batchNumber,
      veterinarian: record.veterinarian,
      nextDueDate: record.nextDueDate,
      animalId: record.animalId,
      animalName: record.animal.name,
      animalType: record.animal.type,
      owner: record.animal.owner,
      county: record.animal.county,
    };
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.prisma.vaccination.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findDueReminders(daysAhead: number = 3): Promise<VaccinationRecord[]> {
    const now = new Date();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + daysAhead);

    const records = await this.prisma.vaccination.findMany({
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

    return records.map((r) => ({
      id: r.id,
      type: r.type,
      date: r.date,
      batchNumber: r.batchNumber,
      veterinarian: r.veterinarian,
      nextDueDate: r.nextDueDate,
      animalId: r.animalId,
      animalName: r.animal.name,
      animalType: r.animal.type,
      owner: r.animal.owner,
      county: r.animal.county,
    }));
  }
}
