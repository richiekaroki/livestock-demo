import type { RiskFactor } from './diseases.service';

export const DISEASES_REPOSITORY = Symbol('DISEASES_REPOSITORY');

export interface DiseaseRiskRecord {
  id: number;
  county: string;
  diseaseType: string;
  riskLevel: string;
  confidence: number;
  factors: RiskFactor[];
  lastCalculated: string;
}

export interface DiseasesRepository {
  findOutbreaks(
    county: string,
    diseaseType: string,
    since: Date,
  ): Promise<{ date: string; affected: number; status: string }[]>;
  countAnimalsInCounty(county: string): Promise<number>;
  getVaccinationCoverage(
    county: string,
    diseaseType: string,
  ): Promise<number>;
  findDiseaseRiskUnique(
    county: string,
    diseaseType: string,
  ): Promise<DiseaseRiskRecord | null>;
  updateDiseaseRisk(
    id: number,
    data: {
      riskLevel: string;
      confidence: number;
      factors: RiskFactor[];
      lastCalculated: Date;
    },
  ): Promise<DiseaseRiskRecord>;
  createDiseaseRisk(data: {
    county: string;
    diseaseType: string;
    riskLevel: string;
    confidence: number;
    factors: RiskFactor[];
    lastCalculated: Date;
  }): Promise<DiseaseRiskRecord>;
  findDiseaseRisks(
    where: Record<string, unknown>,
    orderBy: Record<string, string>,
    skip: number,
    take: number,
  ): Promise<DiseaseRiskRecord[]>;
}
