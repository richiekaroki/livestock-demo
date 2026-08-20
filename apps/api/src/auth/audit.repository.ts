import type { AuditLogEntry } from '@wam-mfugo/shared';

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');

export interface AuditRepository {
  log(data: { event: string; email?: string; userId?: number; ip?: string; metadata?: string }): Promise<void>;
  list(filters?: { event?: string; email?: string; userId?: number; from?: string; to?: string; page?: number; limit?: number }): Promise<{ entries: AuditLogEntry[]; total: number }>;
}
