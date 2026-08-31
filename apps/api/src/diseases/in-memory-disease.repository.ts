import type { RiskFactor } from './diseases.service';
import type {
  DiseaseRiskRecord,
  DiseasesRepository,
} from './disease.repository';

export class InMemoryDiseasesRepository implements DiseasesRepository {
  private diseaseRisks: DiseaseRiskRecord[] = [];
  private nextId = 1;

  async findOutbreaks(): Promise<
    { date: string; affected: number; status: string }[]
  > {
    return [];
  }

  async countAnimalsInCounty(): Promise<number> {
    return 0;
  }

  async getVaccinationCoverage(): Promise<number> {
    return 0;
  }

  async findDiseaseRiskUnique(
    county: string,
    diseaseType: string,
  ): Promise<DiseaseRiskRecord | null> {
    return (
      this.diseaseRisks.find(
        (r) => r.county === county && r.diseaseType === diseaseType,
      ) ?? null
    );
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
    const record = this.diseaseRisks.find((r) => r.id === id);
    if (!record) throw new Error('DiseaseRisk not found');
    record.riskLevel = data.riskLevel;
    record.confidence = data.confidence;
    record.factors = data.factors;
    record.lastCalculated =
      data.lastCalculated instanceof Date
        ? data.lastCalculated.toISOString()
        : data.lastCalculated;
    return record;
  }

  async createDiseaseRisk(data: {
    county: string;
    diseaseType: string;
    riskLevel: string;
    confidence: number;
    factors: RiskFactor[];
    lastCalculated: Date;
  }): Promise<DiseaseRiskRecord> {
    const record: DiseaseRiskRecord = {
      id: this.nextId++,
      county: data.county,
      diseaseType: data.diseaseType,
      riskLevel: data.riskLevel,
      confidence: data.confidence,
      factors: data.factors,
      lastCalculated:
        data.lastCalculated instanceof Date
          ? data.lastCalculated.toISOString()
          : data.lastCalculated,
    };
    this.diseaseRisks.push(record);
    return record;
  }

  async findDiseaseRisks(
    where: Record<string, unknown>,
    _orderBy: Record<string, string>,
    skip: number,
    take: number,
  ): Promise<DiseaseRiskRecord[]> {
    let filtered = this.diseaseRisks;
    if (where.county)
      filtered = filtered.filter((r) => r.county === where.county);
    if (where.diseaseType)
      filtered = filtered.filter((r) => r.diseaseType === where.diseaseType);
    if (where.riskLevel)
      filtered = filtered.filter((r) => r.riskLevel === where.riskLevel);
    return filtered.slice(skip, skip + take);
  }
}
