import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ReportMortalityDto, MortalityQueryDto } from './dto/mortality.dto';
import {
  MORTALITY_REPOSITORY,
  MortalityRepository,
} from './mortality.repository';
import { parsePagination } from '../common/pagination';

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
  constructor(
    @Inject(MORTALITY_REPOSITORY) private readonly repo: MortalityRepository,
  ) {}

  async report(dto: ReportMortalityDto): Promise<MortalityRecord> {
    return this.repo.report({
      animalId: dto.animalId,
      cause: dto.cause,
      diseaseName: dto.diseaseName ?? null,
      reportedBy: dto.reportedBy,
      notes: dto.notes ?? null,
    });
  }

  async list(query: MortalityQueryDto): Promise<MortalityRecord[]> {
    const { skip, take } = parsePagination(query);
    return this.repo.findMany(
      {
        cause: query.cause,
        county: query.county,
        fromDate: query.fromDate,
        toDate: query.toDate,
      },
      skip,
      take,
    );
  }

  async getStats() {
    const total = await this.repo.count();
    const byCause = await this.repo.groupByCause();
    const byCounty = await this.repo.groupByCounty();
    const recentCount = await this.repo.countRecent(30);
    return { total, recentCount, byCause, byCounty };
  }

  async remove(id: number): Promise<boolean> {
    return this.repo.remove(id);
  }
}
