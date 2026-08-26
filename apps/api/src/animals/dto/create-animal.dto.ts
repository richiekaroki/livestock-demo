import {
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import type {
  AnimalType,
  BiometricData,
  GovernmentRegistration,
  HealthStatus,
} from '@wam-mfugo/shared';
import { ANIMAL_TYPES, HEALTH_STATUSES } from '../constants';

export class CreateAnimalDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsIn(ANIMAL_TYPES)
  type!: AnimalType;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsIn(HEALTH_STATUSES)
  health!: HealthStatus;

  @IsString()
  county!: string;

  @IsString()
  @MinLength(2)
  owner!: string;

  @IsOptional()
  @IsInt()
  farmerId?: number;

  @IsLatitude()
  lat!: number;

  @IsLongitude()
  lng!: number;

  @IsOptional()
  @IsObject()
  biometricData?: BiometricData;

  @IsOptional()
  @IsObject()
  governmentRegistration?: GovernmentRegistration;
}
