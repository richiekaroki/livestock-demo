import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator';
import { PaginatedDto } from '../../common/pagination';

export class ReportMortalityDto {
  @IsInt()
  animalId!: number;

  @IsString()
  cause!: string;

  @IsOptional()
  @IsString()
  diseaseName?: string;

  @IsString()
  reportedBy!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMortalityDto {
  @IsOptional()
  @IsString()
  cause?: string;

  @IsOptional()
  @IsString()
  diseaseName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class MortalityQueryDto extends PaginatedDto {
  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsString()
  cause?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
