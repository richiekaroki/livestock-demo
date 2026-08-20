import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import type { AnimalStats, ApiResponse } from '@wam-mfugo/shared';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { toCsv } from '../common/csv';

@ApiTags('stats')
@ApiBearerAuth('access-token')
@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get()
  async get(): Promise<ApiResponse<AnimalStats>> {
    const data = await this.stats.get();
    return { success: true, data };
  }

  @Get('export')
  async export(@Res() res: Response): Promise<void> {
    const data = await this.stats.get();
    const csv = toCsv([
      {
        metric: 'totalAnimals',
        value: data.totalAnimals,
      },
      {
        metric: 'healthyCount',
        value: data.healthyCount,
      },
      {
        metric: 'sickCount',
        value: data.sickCount,
      },
      {
        metric: 'underTreatmentCount',
        value: data.underTreatmentCount,
      },
      {
        metric: 'recoveredCount',
        value: data.recoveredCount,
      },
      {
        metric: 'counties',
        value: data.counties,
      },
      {
        metric: 'lastUpdated',
        value: data.lastUpdated,
      },
    ]);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="stats-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    res.send(csv);
  }
}