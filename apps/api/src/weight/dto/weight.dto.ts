import {
  IsInt,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { PaginatedDto } from '../../common/pagination';

export class RecordWeightDto {
  @IsInt()
  animalId!: number;

  @IsNumber()
  @Min(0.1)
  weight!: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsString()
  recordedBy!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}

export class WeightQueryDto extends PaginatedDto {
  @IsOptional()
  @IsInt()
  animalId?: number;

  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export class WeightStatsQueryDto {
  @IsOptional()
  @IsInt()
  animalId?: number;

  @IsOptional()
  @IsString()
  county?: string;
}
