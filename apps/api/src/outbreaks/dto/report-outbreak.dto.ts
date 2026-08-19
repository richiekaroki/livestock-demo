import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsString,
  IsArray,
  IsOptional,
} from 'class-validator';

const outbreakStatuses = [
  'reported',
  'investigating',
  'contained',
  'resolved',
] as const;

export class ReportOutbreakDto {
  @IsString()
  diseaseType!: string;

  @IsNumber()
  affectedAnimals!: number;

  @IsOptional()
  @IsNumber()
  suspectedAnimals?: number;

  @IsString()
  county!: string;

  @IsLatitude()
  lat!: number;

  @IsLongitude()
  lng!: number;

  @IsString()
  reportedBy!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actions?: string[];

  @IsOptional()
  @IsIn(outbreakStatuses)
  status?: string;
}
