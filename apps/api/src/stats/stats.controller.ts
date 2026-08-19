import { Controller, Get } from '@nestjs/common';
import type { AnimalStats, ApiResponse } from '@wam-mfugo/shared';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get()
  async get(): Promise<ApiResponse<AnimalStats>> {
    const data = await this.stats.get();
    return { success: true, data };
  }
}
