import { IsIn } from 'class-validator';
import type { HealthStatus } from '@wam-mfugo/shared';

const healthStatuses = [
  'Healthy',
  'Sick',
  'Under Treatment',
  'Recovered',
] as const;

export class UpdateHealthDto {
  @IsIn(healthStatuses)
  health!: HealthStatus;
}
