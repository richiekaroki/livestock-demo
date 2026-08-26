import { Inject, Injectable } from '@nestjs/common';
import type {
  CreateVaccinationDto,
  UpdateVaccinationDto,
  VaccinationQueryDto,
} from './dto/vaccination.dto';
import {
  VACCINATIONS_REPOSITORY,
  VaccinationsRepository,
  VaccinationRecord,
} from './vaccination.repository';
import { parsePagination } from '../common/pagination';

@Injectable()
export class VaccinationsService {
  constructor(
    @Inject(VACCINATIONS_REPOSITORY)
    private readonly repo: VaccinationsRepository,
  ) {}

  async list(query: VaccinationQueryDto): Promise<VaccinationRecord[]> {
    const { skip, take } = parsePagination(query);
    return this.repo.findMany(
      { animalId: query.animalId, type: query.type },
      skip,
      take,
    );
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.repo.count(where);
  }

  async create(dto: CreateVaccinationDto): Promise<VaccinationRecord> {
    return this.repo.create({
      type: dto.type,
      date: new Date(dto.date),
      batchNumber: dto.batchNumber,
      veterinarian: dto.veterinarian,
      nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : null,
      animalId: dto.animalId,
    });
  }

  async update(
    id: number,
    dto: UpdateVaccinationDto,
  ): Promise<VaccinationRecord | null> {
    try {
      const data: Record<string, unknown> = {};
      if (dto.type) data.type = dto.type;
      if (dto.date) data.date = new Date(dto.date);
      if (dto.batchNumber) data.batchNumber = dto.batchNumber;
      if (dto.veterinarian) data.veterinarian = dto.veterinarian;
      if (dto.nextDueDate !== undefined)
        data.nextDueDate = dto.nextDueDate ? new Date(dto.nextDueDate) : null;
      return await this.repo.update(id, data);
    } catch {
      return null;
    }
  }

  async remove(id: number): Promise<boolean> {
    return this.repo.remove(id);
  }

  async findDueReminders(daysAhead: number = 3): Promise<VaccinationRecord[]> {
    const now = new Date();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + daysAhead);
    return this.repo.findDueReminders(now, deadline);
  }
}

export type { VaccinationRecord } from './vaccination.repository';
