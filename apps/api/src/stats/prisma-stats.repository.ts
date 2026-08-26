import { PrismaService } from '../common/prisma.service';
import type { StatsRepository } from './stats.repository';
import type { CountyVaccinationCoverage } from './stats.service';

export class PrismaStatsRepository implements StatsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getVaccinationCoverage(): Promise<CountyVaccinationCoverage[]> {
    const animals = await this.prisma.animal.findMany({ select: { id: true, county: true } });
    const countyAnimals = new Map<string, number[]>();
    for (const a of animals) {
      const ids = countyAnimals.get(a.county) ?? [];
      ids.push(a.id);
      countyAnimals.set(a.county, ids);
    }
    const vaccinations = await this.prisma.vaccination.findMany({
      select: { animalId: true, type: true, date: true }, orderBy: { date: 'desc' },
    });
    const vaccinatedByAnimal = new Map<number, { types: Map<string, number>; lastDate: Date }>();
    for (const v of vaccinations) {
      const existing = vaccinatedByAnimal.get(v.animalId);
      if (existing) {
        existing.types.set(v.type, (existing.types.get(v.type) ?? 0) + 1);
        if (v.date > existing.lastDate) existing.lastDate = v.date;
      } else {
        vaccinatedByAnimal.set(v.animalId, { types: new Map([[v.type, 1]]), lastDate: v.date });
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
          for (const [type, count] of info.types) allTypes.set(type, (allTypes.get(type) ?? 0) + count);
          if (!lastVaccinated || info.lastDate > lastVaccinated) lastVaccinated = info.lastDate;
        }
      }
      results.push({
        county, totalAnimals: animalIds.length, vaccinatedAnimals: vaccinatedCount,
        coveragePercent: animalIds.length > 0 ? Math.round((vaccinatedCount / animalIds.length) * 100) : 0,
        vaccinationTypes: Object.fromEntries(allTypes),
        lastVaccinated: lastVaccinated?.toISOString(),
      });
    }
    return results.sort((a, b) => b.coveragePercent - a.coveragePercent);
  }

  async getCountyComparison() {
    const animals = await this.prisma.animal.findMany({
      select: { id: true, county: true, type: true, health: true, createdAt: true },
    });
    const vaccinations = await this.prisma.vaccination.findMany({ select: { animalId: true, type: true } });
    const mortalities = await this.prisma.mortality.findMany({ select: { animal: { select: { county: true } } } });
    const outbreaks = await this.prisma.outbreak.findMany({ select: { county: true, diseaseType: true, affectedAnimals: true } });
    const countyMap = new Map<string, {
      totalAnimals: number; healthy: number; sick: number; underTreatment: number; recovered: number;
      types: Map<string, number>; vaccinated: Set<number>; mortalityCount: number; outbreakCount: number; outbreakDiseases: Set<string>;
    }>();
    for (const a of animals) {
      let c = countyMap.get(a.county);
      if (!c) { c = { totalAnimals: 0, healthy: 0, sick: 0, underTreatment: 0, recovered: 0, types: new Map<string, number>(), vaccinated: new Set<number>(), mortalityCount: 0, outbreakCount: 0, outbreakDiseases: new Set<string>() }; countyMap.set(a.county, c); }
      c.totalAnimals++;
      if (a.health === 'Healthy') c.healthy++;
      else if (a.health === 'Sick') c.sick++;
      else if (a.health === 'UNDER_TREATMENT') c.underTreatment++;
      else if (a.health === 'Recovered') c.recovered++;
      c.types.set(a.type, (c.types.get(a.type) ?? 0) + 1);
    }
    const animalCounty = new Map(animals.map((a) => [a.id, a.county]));
    for (const v of vaccinations) { const county = animalCounty.get(v.animalId); if (county) countyMap.get(county)?.vaccinated.add(v.animalId); }
    for (const m of mortalities) { const c = countyMap.get(m.animal.county); if (c) c.mortalityCount++; }
    for (const o of outbreaks) { const c = countyMap.get(o.county); if (c) { c.outbreakCount++; c.outbreakDiseases.add(o.diseaseType); } }
    return Array.from(countyMap.entries())
      .map(([county, d]) => ({
        county,
        totalAnimals: d.totalAnimals as number,
        healthy: d.healthy as number,
        sick: d.sick as number,
        underTreatment: d.underTreatment as number,
        recovered: d.recovered as number,
        healthyRate: d.totalAnimals > 0 ? Math.round((d.healthy / d.totalAnimals) * 100) : 0,
        animalTypes: Object.fromEntries(d.types) as Record<string, number>,
        vaccinatedCount: d.vaccinated.size,
        vaccinationRate: d.totalAnimals > 0 ? Math.round((d.vaccinated.size / d.totalAnimals) * 100) : 0,
        mortalityCount: d.mortalityCount as number,
        mortalityRate: d.totalAnimals > 0 ? Math.round((d.mortalityCount / d.totalAnimals) * 100) : 0,
        outbreakCount: d.outbreakCount as number,
        outbreakDiseases: Array.from(d.outbreakDiseases) as string[],
      }))
      .sort((a, b) => b.totalAnimals - a.totalAnimals);
  }
}
