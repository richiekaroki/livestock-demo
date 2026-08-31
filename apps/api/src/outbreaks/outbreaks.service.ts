import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  OutbreakQueryDto,
  ReportOutbreakDto,
  UpdateOutbreakDto,
} from './dto/report-outbreak.dto';
import {
  OUTBREAKS_REPOSITORY,
  OutbreaksRepository,
} from './outbreaks.repository';
import { parsePagination } from '../common/pagination';

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
  constructor(
    @Inject(OUTBREAKS_REPOSITORY) private readonly repo: OutbreaksRepository,
  ) {}

  async report(dto: ReportOutbreakDto): Promise<OutbreakRecord> {
    return this.repo.report({
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
    });
  }

  async list(query: OutbreakQueryDto): Promise<OutbreakRecord[]> {
    const { skip, take } = parsePagination(query);
    return this.repo.findMany(
      {
        status: query.status,
        county: query.county,
        diseaseType: query.diseaseType,
      },
      skip,
      take,
    );
  }

  async update(id: number, dto: UpdateOutbreakDto): Promise<OutbreakRecord> {
    const data: Record<string, unknown> = {};
    if (dto.status) data.status = dto.status;
    if (dto.diseaseType) data.diseaseType = dto.diseaseType;
    if (dto.affectedAnimals !== undefined)
      data.affectedAnimals = dto.affectedAnimals;
    if (dto.symptoms) data.symptoms = dto.symptoms;
    if (dto.actions) data.actions = dto.actions;
    return this.repo.update(id, data);
  }
}
