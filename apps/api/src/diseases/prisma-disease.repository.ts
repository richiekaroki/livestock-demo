import { PrismaService } from '../common/prisma.service';
import type { RiskFactor } from './diseases.service';
import type {
  DiseaseRiskRecord,
  DiseasesRepository,
} from './disease.repository';

export class PrismaDiseasesRepository implements DiseasesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toRecord(row: any): DiseaseRiskRecord {
    return {
      id: row.id,
      county: row.county,
      diseaseType: row.diseaseType,
      riskLevel: row.riskLevel,
      confidence: row.confidence,
      factors: row.factors as unknown as RiskFactor[],
      lastCalculated: row.lastCalculated,
    };
  }

  async findOutbreaks(
    county: string,
    diseaseType: string,
    since: Date,
  ): Promise<{ date: string; affected: number; status: string }[]> {
    const outbreaks = await this.prisma.outbreak.findMany({
      where: {
        county,
        diseaseType,
        reportedAt: { gte: since },
      },
      orderBy: { reportedAt: 'desc' },
    });

    return outbreaks.map((o) => ({
      date: o.reportedAt.toISOString(),
      affected: o.affectedAnimals,
      status: o.status,
    }));
  }

  async countAnimalsInCounty(county: string): Promise<number> {
    return this.prisma.animal.count({ where: { county } });
  }

  async getVaccinationCoverage(
    county: string,
    diseaseType: string,
  ): Promise<number> {
    const animalsInCounty = await this.prisma.animal.findMany({
      where: { county },
      select: { id: true },
    });
    const animalIds = animalsInCounty.map((a) => a.id);
    if (animalIds.length === 0) return 0;

    const vaccinated = await this.prisma.vaccination.count({
      where: {
        animalId: { in: animalIds },
        type: diseaseType,
      },
    });

    return vaccinated / animalsInCounty.length;
  }

  async findDiseaseRiskUnique(
    county: string,
    diseaseType: string,
  ): Promise<DiseaseRiskRecord | null> {
    const row = await this.prisma.diseaseRisk.findUnique({
      where: {
        county_diseaseType: { county, diseaseType },
      },
    });
    return row ? this.toRecord(row) : null;
  }

  async updateDiseaseRisk(
    id: number,
    data: {
      riskLevel: string;
      confidence: number;
      factors: RiskFactor[];
      lastCalculated: Date;
    },
  ): Promise<DiseaseRiskRecord> {
    const row = await this.prisma.diseaseRisk.update({
      where: { id },
      data: {
        riskLevel: data.riskLevel,
        confidence: data.confidence,
        factors: data.factors as any,
        lastCalculated: data.lastCalculated,
      },
    });
    return this.toRecord(row);
  }

  async createDiseaseRisk(data: {
    county: string;
    diseaseType: string;
    riskLevel: string;
    confidence: number;
    factors: RiskFactor[];
    lastCalculated: Date;
  }): Promise<DiseaseRiskRecord> {
    const row = await this.prisma.diseaseRisk.create({
      data: {
        county: data.county,
        diseaseType: data.diseaseType,
        riskLevel: data.riskLevel,
        confidence: data.confidence,
        factors: data.factors as any,
        lastCalculated: data.lastCalculated,
      },
    });
    return this.toRecord(row);
  }

  async findDiseaseRisks(
    where: Record<string, unknown>,
    orderBy: Record<string, string>,
    skip: number,
    take: number,
  ): Promise<DiseaseRiskRecord[]> {
    const rows = await this.prisma.diseaseRisk.findMany({
      where: where as any,
      orderBy: orderBy as any,
      skip,
      take,
    });
    return rows.map((r) => this.toRecord(r));
  }
}
