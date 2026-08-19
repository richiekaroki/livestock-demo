import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class GpsCoordinatesDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

export class RegisterWithKiamisDto {
  @IsString()
  animalType!: string;

  @Matches(/^\d{7,8}$/, { message: 'Invalid National ID format' })
  ownerNationalID!: string;

  @IsString()
  countyCode!: string;

  @IsString()
  subCountyCode!: string;

  @IsString()
  wardCode!: string;

  @IsString()
  biometricHash!: string;

  @ValidateNested()
  @Type(() => GpsCoordinatesDto)
  gpsCoordinates!: GpsCoordinatesDto;

  @IsString()
  timestamp!: string;

  @IsOptional()
  @IsObject()
  ownerDetails?: Record<string, unknown>;
}
