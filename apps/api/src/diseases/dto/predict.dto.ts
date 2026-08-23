import { IsString, IsOptional, IsIn } from 'class-validator';
import { PaginatedDto } from '../../common/pagination';

export const SEASONS = ['wet', 'dry', 'short_rains', 'long_rains'] as const;
export type Season = (typeof SEASONS)[number];

export class PredictRiskDto {
  @IsString()
  county!: string;

  @IsOptional()
  @IsString()
  diseaseType?: string;

  @IsOptional()
  @IsIn(SEASONS)
  season?: Season;
}

export class GetRiskDto extends PaginatedDto {
  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsString()
  diseaseType?: string;

  @IsOptional()
  @IsString()
  riskLevel?: string;
}
