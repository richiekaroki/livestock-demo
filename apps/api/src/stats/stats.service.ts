import { Injectable } from '@nestjs/common';
import type { AnimalStats } from '@wam-mfugo/shared';
import { AnimalsService } from '../animals/animals.service';

@Injectable()
export class StatsService {
  constructor(private readonly animals: AnimalsService) {}

  get(): Promise<AnimalStats> {
    return this.animals.getStatistics();
  }
}
