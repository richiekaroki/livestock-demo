import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVaccinationDto {
  @ApiProperty({ example: 'FMD' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: '2026-08-20' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'BATCH-2026-001' })
  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @ApiProperty({ example: 'Dr. Kamau' })
  @IsString()
  @IsNotEmpty()
  veterinarian: string;

  @ApiPropertyOptional({ example: '2026-11-20' })
  @IsOptional()
  @IsDateString()
  nextDueDate?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  animalId: number;
}

export class UpdateVaccinationDto {
  @ApiPropertyOptional({ example: 'FMD' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: '2026-08-20' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'BATCH-2026-001' })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ example: 'Dr. Kamau' })
  @IsOptional()
  @IsString()
  veterinarian?: string;

  @ApiPropertyOptional({ example: '2026-11-20' })
  @IsOptional()
  @IsDateString()
  nextDueDate?: string;
}

export class VaccinationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  animalId?: number;

  @ApiPropertyOptional({ example: 'FMD' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  limit?: number;
}
