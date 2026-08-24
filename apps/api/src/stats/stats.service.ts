import { Injectable } from '@nestjs/common';
import type { AnimalStats } from '@wam-mfugo/shared';
import { AnimalsService } from '../animals/animals.service';
import { VaccinationsService } from '../vaccinations/vaccinations.service';
import { PrismaService } from '../common/prisma.service';

export interface CountyVaccinationCoverage {
  county: string;
  totalAnimals: number;
  vaccinatedAnimals: number;
  coveragePercent: number;
  vaccinationTypes: Record<string, number>;
  lastVaccinated?: string;
}

@Injectable()
export class StatsService {
  constructor(
    private readonly animals: AnimalsService,
    private readonly vaccinations: VaccinationsService,
    private readonly prisma: PrismaService,
  ) {}

  get(): Promise<AnimalStats> {
    return this.animals.getStatistics();
  }

  async getVaccinationCoverage(): Promise<CountyVaccinationCoverage[]> {
    const animals = await this.prisma.animal.findMany({
      select: { id: true, county: true },
    });

    const countyAnimals = new Map<string, number[]>();
    for (const animal of animals) {
      const ids = countyAnimals.get(animal.county) ?? [];
      ids.push(animal.id);
      countyAnimals.set(animal.county, ids);
    }

    const vaccinations = await this.prisma.vaccination.findMany({
      select: { animalId: true, type: true, date: true },
      orderBy: { date: 'desc' },
    });

    const vaccinatedByAnimal = new Map<
      number,
      { types: Map<string, number>; lastDate: Date }
    >();
    for (const v of vaccinations) {
      const existing = vaccinatedByAnimal.get(v.animalId);
      if (existing) {
        existing.types.set(v.type, (existing.types.get(v.type) ?? 0) + 1);
        if (v.date > existing.lastDate) existing.lastDate = v.date;
      } else {
        vaccinatedByAnimal.set(v.animalId, {
          types: new Map([[v.type, 1]]),
          lastDate: v.date,
        });
      }
    }

    const results: CountyVaccinationCoverage[] = [];
    for (const [county, animalIds] of countyAnimals) {
      let vaccinatedCount = 0;
      const allTypes = new Map<string, number>();
      let lastVaccinated: Date | undefined;

      for (const id of animalIds) {
        const info = vaccinatedByAnimal.get(id);
        if (info) {
          vaccinatedCount++;
          for (const [type, count] of info.types) {
            allTypes.set(type, (allTypes.get(type) ?? 0) + count);
          }
          if (!lastVaccinated || info.lastDate > lastVaccinated) {
            lastVaccinated = info.lastDate;
          }
        }
      }

      results.push({
        county,
        totalAnimals: animalIds.length,
        vaccinatedAnimals: vaccinatedCount,
        coveragePercent:
          animalIds.length > 0
            ? Math.round((vaccinatedCount / animalIds.length) * 100)
            : 0,
        vaccinationTypes: Object.fromEntries(allTypes),
        lastVaccinated: lastVaccinated?.toISOString(),
      });
    }

    return results.sort((a, b) => b.coveragePercent - a.coveragePercent);
  }

  async getCountyComparison() {
    const animals = await this.prisma.animal.findMany({
      select: {
        id: true,
        county: true,
        type: true,
        health: true,
        createdAt: true,
      },
    });

    const vaccinations = await this.prisma.vaccination.findMany({
      select: { animalId: true, type: true },
    });

    const mortalities = await this.prisma.mortality.findMany({
      select: { animal: { select: { county: true } } },
    });

    const outbreaks = await this.prisma.outbreak.findMany({
      select: { county: true, diseaseType: true, affectedAnimals: true },
    });

    const countyMap = new Map<
      string,
      {
        totalAnimals: number;
        healthy: number;
        sick: number;
        underTreatment: number;
        recovered: number;
        types: Map<string, number>;
        vaccinated: Set<number>;
        mortalityCount: number;
        outbreakCount: number;
        outbreakDiseases: Set<string>;
      }
    >();

    for (const a of animals) {
      let c = countyMap.get(a.county);
      if (!c) {
        c = {
          totalAnimals: 0,
          healthy: 0,
          sick: 0,
          underTreatment: 0,
          recovered: 0,
          types: new Map(),
          vaccinated: new Set(),
          mortalityCount: 0,
          outbreakCount: 0,
          outbreakDiseases: new Set(),
        };
        countyMap.set(a.county, c);
      }
      c.totalAnimals++;
      if (a.health === 'Healthy') c.healthy++;
      else if (a.health === 'Sick') c.sick++;
      else if (a.health === 'UNDER_TREATMENT') c.underTreatment++;
      else if (a.health === 'Recovered') c.recovered++;
      c.types.set(a.type, (c.types.get(a.type) ?? 0) + 1);
    }

    for (const v of vaccinations) {
      void v;
      for (const [, c] of countyMap) {
        void c;
        // We need animal county lookup — use animal IDs
        break;
      }
    }

    // Vaccinated animals by county
    const animalCounty = new Map(animals.map((a) => [a.id, a.county]));
    for (const v of vaccinations) {
      const county = animalCounty.get(v.animalId);
      if (county) {
        countyMap.get(county)?.vaccinated.add(v.animalId);
      }
    }

    for (const m of mortalities) {
      const c = countyMap.get(m.animal.county);
      if (c) c.mortalityCount++;
    }

    for (const o of outbreaks) {
      const c = countyMap.get(o.county);
      if (c) {
        c.outbreakCount++;
        c.outbreakDiseases.add(o.diseaseType);
      }
    }

    return Array.from(countyMap.entries())
      .map(([county, data]) => ({
        county,
        totalAnimals: data.totalAnimals,
        healthy: data.healthy,
        sick: data.sick,
        underTreatment: data.underTreatment,
        recovered: data.recovered,
        healthyRate:
          data.totalAnimals > 0
            ? Math.round((data.healthy / data.totalAnimals) * 100)
            : 0,
        animalTypes: Object.fromEntries(data.types),
        vaccinatedCount: data.vaccinated.size,
        vaccinationRate:
          data.totalAnimals > 0
            ? Math.round((data.vaccinated.size / data.totalAnimals) * 100)
            : 0,
        mortalityCount: data.mortalityCount,
        mortalityRate:
          data.totalAnimals > 0
            ? Math.round((data.mortalityCount / data.totalAnimals) * 100)
            : 0,
        outbreakCount: data.outbreakCount,
        outbreakDiseases: Array.from(data.outbreakDiseases),
      }))
      .sort((a, b) => b.totalAnimals - a.totalAnimals);
  }
}
