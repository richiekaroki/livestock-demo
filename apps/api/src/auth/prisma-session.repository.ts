import type { SessionInfo } from '@wam-mfugo/shared';
import { PrismaService } from '../common/prisma.service';
import type { SessionRepository, SessionRecord } from './session.repository';

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: number;
    refreshTokenHash: string;
    device?: string;
    ip?: string;
    expiresAt: Date;
  }): Promise<SessionRecord> {
    const row = await this.prisma.session.create({
      data: {
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        device: data.device,
        ip: data.ip,
        expiresAt: data.expiresAt,
      },
    });
    return {
      id: row.id,
      userId: row.userId,
      refreshTokenHash: row.refreshTokenHash,
      device: row.device ?? undefined,
      ip: row.ip ?? undefined,
      lastActive: row.lastActive,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    };
  }

  async findByRefreshTokenHash(hash: string): Promise<SessionRecord | null> {
    const row = await this.prisma.session.findFirst({
      where: { refreshTokenHash: hash },
    });
    return row
      ? {
          id: row.id,
          userId: row.userId,
          refreshTokenHash: row.refreshTokenHash,
          device: row.device ?? undefined,
          ip: row.ip ?? undefined,
          lastActive: row.lastActive,
          expiresAt: row.expiresAt,
          createdAt: row.createdAt,
        }
      : null;
  }

  async findById(id: number): Promise<SessionRecord | null> {
    const row = await this.prisma.session.findUnique({ where: { id } });
    return row
      ? {
          id: row.id,
          userId: row.userId,
          refreshTokenHash: row.refreshTokenHash,
          device: row.device ?? undefined,
          ip: row.ip ?? undefined,
          lastActive: row.lastActive,
          expiresAt: row.expiresAt,
          createdAt: row.createdAt,
        }
      : null;
  }

  async listByUserId(userId: number): Promise<SessionInfo[]> {
    const rows = await this.prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      device: r.device ?? undefined,
      ip: r.ip ?? undefined,
      lastActive: r.lastActive.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async delete(id: number): Promise<void> {
    await this.prisma.session.delete({ where: { id } });
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }

  async updateLastActive(id: number): Promise<void> {
    await this.prisma.session.update({
      where: { id },
      data: { lastActive: new Date() },
    });
  }
}
