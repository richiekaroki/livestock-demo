import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_REPOSITORY, type AuditRepository } from './audit.repository';

@Injectable()
export class AuditService {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepo: AuditRepository,
  ) {}

  async logEvent(data: {
    event: string;
    email?: string;
    userId?: number;
    ip?: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.auditRepo.log({
      event: data.event,
      email: data.email,
      userId: data.userId,
      ip: data.ip,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    });
  }

  async getLogs(filters?: {
    event?: string;
    email?: string;
    userId?: number;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) {
    return this.auditRepo.list(filters);
  }
}
