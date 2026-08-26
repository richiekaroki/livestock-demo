import { IsIn } from 'class-validator';
import type { HealthStatus } from '@wam-mfugo/shared';
import { HEALTH_STATUSES } from '../constants';

export class UpdateHealthDto {
  @IsIn(HEALTH_STATUSES)
  health!: HealthStatus;
}
