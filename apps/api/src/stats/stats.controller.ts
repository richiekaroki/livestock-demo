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

  @Get('vaccination-coverage')
  async getVaccinationCoverage() {
    const data = await this.stats.getVaccinationCoverage();
    return { success: true, data };
  }

  @Get('county-comparison')
  async getCountyComparison() {
    const data = await this.stats.getCountyComparison();
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

  @Get('report')
  async generateReport(@Res() res: Response): Promise<void> {
    const [stats, coverage, comparison] = await Promise.all([
      this.stats.get(),
      this.stats.getVaccinationCoverage(),
      this.stats.getCountyComparison(),
    ]);

    const sections: Array<Record<string, unknown>> = [];

    sections.push(
      { section: '=== SUMMARY ===', metric: 'Total Animals', value: stats.totalAnimals },
      { section: '', metric: 'Healthy', value: stats.healthyCount },
      { section: '', metric: 'Sick', value: stats.sickCount },
      { section: '', metric: 'Under Treatment', value: stats.underTreatmentCount },
      { section: '', metric: 'Recovered', value: stats.recoveredCount },
      { section: '', metric: 'Counties', value: stats.counties },
      { section: '', metric: 'Report Date', value: new Date().toISOString().slice(0, 10) },
    );

    sections.push({ section: '' });
    sections.push({ section: '=== VACCINATION COVERAGE ===', county: 'County', coverage: 'Coverage %', animals: 'Total', vaccinated: 'Vaccinated' });
    for (const c of coverage) {
      sections.push({ section: '', county: c.county, coverage: c.coveragePercent, animals: c.totalAnimals, vaccinated: c.vaccinatedAnimals });
    }

    sections.push({ section: '' });
    sections.push({ section: '=== COUNTY COMPARISON ===', county: 'County', animals: 'Animals', healthyRate: 'Healthy %', vaccinationRate: 'Vaccinated %', mortalityRate: 'Mortality %', outbreaks: 'Outbreaks' });
    for (const c of comparison) {
      sections.push({ section: '', county: c.county, animals: c.totalAnimals, healthyRate: c.healthyRate, vaccinationRate: c.vaccinationRate, mortalityRate: c.mortalityRate, outbreaks: c.outbreakCount });
    }

    const csv = toCsv(sections);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="wam-mfugo-report-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    res.send(csv);
  }
}
