import {
  IsIn,
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

export class UpdateAnimalDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsIn(ANIMAL_TYPES)
  type?: AnimalType;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsIn(HEALTH_STATUSES)
  health?: HealthStatus;

  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  owner?: string;

  @IsOptional()
  @IsObject()
  biometricData?: BiometricData;

  @IsOptional()
  @IsObject()
  governmentRegistration?: GovernmentRegistration;
}
