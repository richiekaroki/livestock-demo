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

const animalTypes = [
  'Cattle',
  'Goat',
  'Sheep',
  'Camel',
  'Pig',
  'Chicken',
] as const;
const healthStatuses = [
  'Healthy',
  'Sick',
  'Under Treatment',
  'Recovered',
] as const;

export class UpdateAnimalDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsIn(animalTypes)
  type?: AnimalType;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsIn(healthStatuses)
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
