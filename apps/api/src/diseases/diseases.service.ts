import { Inject, Injectable } from '@nestjs/common';
import { PredictRiskDto, GetRiskDto, Season } from './dto/predict.dto';
import {
  DISEASES_REPOSITORY,
  DiseasesRepository,
  DiseaseRiskRecord,
} from './disease.repository';
import { parsePagination } from '../common/pagination';

export interface RiskFactor {
  name: string;
  weight: number;
  value: number;
  description: string;
}

export type { DiseaseRiskRecord };

interface DiseaseProfile {
  name: string;
  seasonalWeights: Record<Season, number>;
  animalTypes: string[];
  symptoms: string[];
}

const DISEASE_PROFILES: Record<string, DiseaseProfile> = {
  'Foot and Mouth Disease': {
    name: 'Foot and Mouth Disease',
    seasonalWeights: { wet: 0.8, long_rains: 0.9, short_rains: 0.7, dry: 0.3 },
    animalTypes: ['Cattle', 'Goat', 'Sheep', 'Camel'],
    symptoms: ['Hoof lesions', 'Mouth blisters', 'Drooling', 'Lameness'],
  },
  'Rift Valley Fever': {
    name: 'Rift Valley Fever',
    seasonalWeights: { wet: 0.9, long_rains: 0.95, short_rains: 0.8, dry: 0.1 },
    animalTypes: ['Cattle', 'Goat', 'Sheep'],
    symptoms: ['Abortion', 'High mortality in young', 'Nasal discharge'],
  },
  Anthrax: {
    name: 'Anthrax',
    seasonalWeights: { wet: 0.5, long_rains: 0.5, short_rains: 0.5, dry: 0.4 },
    animalTypes: ['Cattle', 'Goat', 'Sheep', 'Camel'],
    symptoms: ['Sudden death', 'Swelling', 'Bloody discharge'],
  },
  Brucellosis: {
    name: 'Brucellosis',
    seasonalWeights: { wet: 0.6, long_rains: 0.6, short_rains: 0.5, dry: 0.4 },
    animalTypes: ['Cattle', 'Goat', 'Sheep'],
    symptoms: ['Abortion', 'Retained placenta', 'Infertility'],
  },
  'Contagious Caprine Pleuropneumonia': {
    name: 'Contagious Caprine Pleuropneumonia',
    seasonalWeights: { wet: 0.7, long_rains: 0.8, short_rains: 0.6, dry: 0.3 },
    animalTypes: ['Goat'],
    symptoms: ['Cough', 'Nasal discharge', 'Fever', 'Death'],
  },
  'Newcastle Disease': {
    name: 'Newcastle Disease',
    seasonalWeights: { wet: 0.7, long_rains: 0.7, short_rains: 0.6, dry: 0.5 },
    animalTypes: ['Chicken'],
    symptoms: ['Respiratory distress', 'Green diarrhea', 'Torticollis'],
  },
};

@Injectable()
export class DiseasesService {
  constructor(
    @Inject(DISEASES_REPOSITORY) private readonly repo: DiseasesRepository,
  ) {}

  private getCurrentSeason(): Season {
    const month = new Date().getMonth();
    if (month >= 3 && month <= 5) return 'long_rains';
    if (month >= 10 && month <= 12) return 'short_rains';
    if (month >= 6 && month <= 9) return 'dry';
    return 'wet';
  }

  private async getOutbreakHistory(county: string, diseaseType: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return this.repo.findOutbreaks(county, diseaseType, sixMonthsAgo);
  }

  private async getAnimalDensity(county: string) {
    return this.repo.countAnimalsInCounty(county);
  }

  private async getVaccinationCoverage(county: string, diseaseType: string) {
    return this.repo.getVaccinationCoverage(county, diseaseType);
  }

  private calculateRiskLevel(score: number): string {
    if (score >= 0.75) return 'critical';
    if (score >= 0.5) return 'high';
    if (score >= 0.25) return 'medium';
    return 'low';
  }

  private calculateConfidence(factors: RiskFactor[]): number {
    if (factors.length === 0) return 0;
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    if (totalWeight === 0) return 0;
    const avgWeight = totalWeight / factors.length;
    return Math.min(0.95, Math.max(0.1, avgWeight));
  }

  async predictRisk(dto: PredictRiskDto): Promise<DiseaseRiskRecord[]> {
    const season = dto.season ?? this.getCurrentSeason();
    const diseases = dto.diseaseType
      ? [dto.diseaseType]
      : Object.keys(DISEASE_PROFILES);

    const results: DiseaseRiskRecord[] = [];

    for (const diseaseName of diseases) {
      const profile = DISEASE_PROFILES[diseaseName] ?? {
        name: diseaseName,
        seasonalWeights: {
          wet: 0.5,
          long_rains: 0.5,
          short_rains: 0.5,
          dry: 0.5,
        },
        animalTypes: ['Cattle', 'Goat', 'Sheep'],
        symptoms: [],
      };

      const factors: RiskFactor[] = [];

      const outbreakHistory = await this.getOutbreakHistory(
        dto.county,
        diseaseName,
      );
      const outbreakScore = Math.min(1, outbreakHistory.length * 0.2);
      factors.push({
        name: 'outbreak_history',
        weight: outbreakScore * 0.4,
        value: outbreakHistory.length,
        description: `${outbreakHistory.length} outbreak(s) in the last 6 months`,
      });

      const seasonalWeight = profile.seasonalWeights[season];
      factors.push({
        name: 'seasonal_risk',
        weight: seasonalWeight * 0.3,
        value: seasonalWeight,
        description: `${season.replace('_', ' ')} season increases risk`,
      });

      const density = await this.getAnimalDensity(dto.county);
      const densityScore = Math.min(1, density / 1000);
      factors.push({
        name: 'animal_density',
        weight: densityScore * 0.2,
        value: density,
        description: `${density} animals in county (higher density = higher transmission risk)`,
      });

      const coverage = await this.getVaccinationCoverage(
        dto.county,
        diseaseName,
      );
      factors.push({
        name: 'vaccination_coverage',
        weight: (1 - coverage) * 0.1,
        value: coverage,
        description: `${Math.round(coverage * 100)}% vaccination coverage (lower = higher risk)`,
      });

      const totalScore = factors.reduce((sum, f) => sum + f.weight, 0);
      const riskLevel = this.calculateRiskLevel(totalScore);
      const confidence = this.calculateConfidence(factors);

      let existing = await this.repo.findDiseaseRiskUnique(
        dto.county,
        diseaseName,
      );

      if (existing) {
        existing = await this.repo.updateDiseaseRisk(existing.id, {
          riskLevel,
          confidence,
          factors,
          lastCalculated: new Date(),
        });
      } else {
        existing = await this.repo.createDiseaseRisk({
          county: dto.county,
          diseaseType: diseaseName,
          riskLevel,
          confidence,
          factors,
          lastCalculated: new Date(),
        });
      }

      results.push({
        id: existing.id,
        county: existing.county,
        diseaseType: existing.diseaseType,
        riskLevel: existing.riskLevel,
        confidence: existing.confidence,
        factors: existing.factors,
        lastCalculated: String(existing.lastCalculated),
      });
    }

    return results;
  }

  async getRisks(query: GetRiskDto): Promise<DiseaseRiskRecord[]> {
    const where: Record<string, unknown> = {};
    if (query.county) where.county = query.county;
    if (query.diseaseType) where.diseaseType = query.diseaseType;
    if (query.riskLevel) where.riskLevel = query.riskLevel;

    const { skip, take } = parsePagination(query);

    const records = await this.repo.findDiseaseRisks(
      where,
      { lastCalculated: 'desc' },
      skip,
      take,
    );

    return records.map((r) => ({
      id: r.id,
      county: r.county,
      diseaseType: r.diseaseType,
      riskLevel: r.riskLevel,
      confidence: r.confidence,
      factors: r.factors,
      lastCalculated: String(r.lastCalculated),
    }));
  }

  async getCountyRiskSummary(county: string) {
    const risks = await this.repo.findDiseaseRisks(
      { county },
      { riskLevel: 'desc' },
      0,
      1000,
    );

    const levels = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const r of risks) {
      if (r.riskLevel in levels) levels[r.riskLevel as keyof typeof levels]++;
    }

    return {
      county,
      totalDiseases: risks.length,
      riskBreakdown: levels,
      highestRisk: risks[0]?.riskLevel ?? 'low',
    };
  }

  async simulateWhatIf(params: {
    county: string;
    vaccinationIncrease?: number;
    livestockReduction?: number;
    season?: Season;
  }) {
    const currentRisks = await this.predictRisk({
      county: params.county,
      season: params.season,
    });

    const projected = currentRisks.map((risk) => {
      const vaccinationImpact = ((params.vaccinationIncrease ?? 0) / 100) * 0.3;
      const densityImpact = ((params.livestockReduction ?? 0) / 100) * 0.2;

      const newFactors = risk.factors.map((f) => {
        if (f.name === 'vaccination_coverage') {
          return {
            ...f,
            weight: Math.max(0, f.weight - vaccinationImpact),
            description: `${f.description} (simulated +${params.vaccinationIncrease ?? 0}%)`,
          };
        }
        if (f.name === 'animal_density') {
          return {
            ...f,
            weight: Math.max(0, f.weight - densityImpact),
            description: `${f.description} (simulated -${params.livestockReduction ?? 0}%)`,
          };
        }
        return f;
      });

      const newScore = newFactors.reduce((sum, f) => sum + f.weight, 0);
      const newLevel = this.calculateRiskLevel(newScore);

      return {
        ...risk,
        factors: newFactors,
        projectedRiskLevel: newLevel,
        projectedScore: newScore,
        currentRiskLevel: risk.riskLevel,
        change: risk.riskLevel !== newLevel ? 'improved' : 'unchanged',
      };
    });

    return {
      county: params.county,
      scenario: {
        vaccinationIncrease: params.vaccinationIncrease ?? 0,
        livestockReduction: params.livestockReduction ?? 0,
        season: params.season ?? this.getCurrentSeason(),
      },
      results: projected,
    };
  }
}
