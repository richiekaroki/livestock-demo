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
    userAgent?: string;
    beforeValue?: string;
    afterValue?: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.auditRepo.log({
      event: data.event,
      email: data.email,
      userId: data.userId,
      ip: data.ip,
      userAgent: data.userAgent,
      beforeValue: data.beforeValue,
      afterValue: data.afterValue,
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
