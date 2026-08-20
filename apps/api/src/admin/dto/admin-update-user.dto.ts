import { IsOptional, IsIn, IsBoolean } from 'class-validator';
import type { UserRole } from '@wam-mfugo/shared';

const validRoles: UserRole[] = ['admin', 'field_agent', 'farmer'];

export class AdminUpdateUserDto {
  @IsOptional()
  @IsIn(validRoles)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
