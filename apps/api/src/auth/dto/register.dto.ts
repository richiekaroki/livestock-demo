import { IsEmail, IsString, IsOptional, IsIn, MinLength } from 'class-validator';
import type { UserRole } from '@wam-mfugo/shared';

const validRoles: UserRole[] = ['admin', 'field_agent', 'farmer'];

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsIn(validRoles)
  role?: UserRole;

  @IsString()
  county!: string;

  @IsOptional()
  @IsString()
  subCounty?: string;
}
