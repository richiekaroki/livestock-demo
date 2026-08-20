import type { AuditLogEntry } from '@wam-mfugo/shared';
import { PrismaService } from '../common/prisma.service';
import type { AuditRepository } from './audit.repository';

export class PrismaAuditRepository implements AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    event: string;
    email?: string;
    userId?: number;
    ip?: string;
    metadata?: string;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        event: data.event,
        email: data.email,
        userId: data.userId,
        ip: data.ip,
        metadata: data.metadata,
      },
    });
  }

  async list(filters?: {
    event?: string;
    email?: string;
    userId?: number;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<{ entries: AuditLogEntry[]; total: number }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters?.event ? { event: filters.event } : {}),
      ...(filters?.email ? { email: filters.email } : {}),
      ...(filters?.userId ? { userId: filters.userId } : {}),
      ...(filters?.from || filters?.to
        ? {
            createdAt: {
              ...(filters.from ? { gte: new Date(filters.from) } : {}),
              ...(filters.to ? { lte: new Date(filters.to) } : {}),
            },
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      entries: rows.map((r) => ({
        id: r.id,
        event: r.event,
        email: r.email ?? undefined,
        userId: r.userId ?? undefined,
        ip: r.ip ?? undefined,
        metadata: r.metadata ?? undefined,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
    };
  }
}
