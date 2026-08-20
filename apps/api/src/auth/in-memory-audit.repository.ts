import type { AuditLogEntry } from '@wam-mfugo/shared';
import type { AuditRepository } from './audit.repository';

type StoredLog = Omit<AuditLogEntry, 'createdAt'> & { createdAt: Date };

export class InMemoryAuditRepository implements AuditRepository {
  private logs: StoredLog[] = [];
  private nextId = 1;

  async log(data: {
    event: string;
    email?: string;
    userId?: number;
    ip?: string;
    metadata?: string;
  }): Promise<void> {
    const entry = {
      id: this.nextId++,
      event: data.event,
      email: data.email,
      userId: data.userId,
      ip: data.ip,
      metadata: data.metadata,
      createdAt: new Date(),
    };
    this.logs.push(entry);
    console.log(`[AUDIT] ${data.event} | email=${data.email ?? '-'} | userId=${data.userId ?? '-'} | ip=${data.ip ?? '-'}`);
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
    const filtered = this.logs.filter((l) => {
      if (filters?.event && l.event !== filters.event) return false;
      if (filters?.email && l.email !== filters.email) return false;
      if (filters?.userId && l.userId !== filters.userId) return false;
      if (filters?.from && l.createdAt < new Date(filters.from)) return false;
      if (filters?.to && l.createdAt > new Date(filters.to)) return false;
      return true;
    });

    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const start = (page - 1) * limit;
    const entries = filtered.slice(start, start + limit).map((e) => ({
      id: e.id,
      event: e.event,
      email: e.email,
      userId: e.userId,
      ip: e.ip,
      metadata: e.metadata,
      createdAt: e.createdAt.toISOString(),
    }));

    return { entries, total: filtered.length };
  }
}
