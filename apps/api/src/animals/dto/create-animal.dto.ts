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

export class CreateAnimalDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsIn(animalTypes)
  type!: AnimalType;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsIn(healthStatuses)
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
