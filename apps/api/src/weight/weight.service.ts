import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RecordWeightDto, WeightQueryDto } from './dto/weight.dto';
import { WEIGHT_REPOSITORY, WeightRepository } from './weight.repository';
import { parsePagination } from '../common/pagination';

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
  constructor(
    @Inject(WEIGHT_REPOSITORY) private readonly repo: WeightRepository,
  ) {}

  async record(dto: RecordWeightDto): Promise<WeightRecord> {
    return this.repo.record({
      animalId: dto.animalId,
      weight: dto.weight,
      unit: dto.unit ?? 'kg',
      recordedBy: dto.recordedBy,
      notes: dto.notes ?? null,
      recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : undefined,
    });
  }

  async list(query: WeightQueryDto): Promise<WeightRecord[]> {
    const { skip, take } = parsePagination(query);
    return this.repo.findMany(
      { animalId: query.animalId, county: query.county, fromDate: query.fromDate, toDate: query.toDate },
      skip,
      take,
    );
  }

  async getAnimalHistory(animalId: number): Promise<WeightRecord[]> {
    return this.repo.findByAnimalId(animalId);
  }

  async getWeightGainStats(query?: { county?: string; animalId?: number }): Promise<WeightGainStats[]> {
    return this.repo.getGainStats(query);
  }

  async remove(id: number): Promise<boolean> {
    return this.repo.remove(id);
  }
}
