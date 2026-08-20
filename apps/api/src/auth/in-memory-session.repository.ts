import type { SessionInfo } from '@wam-mfugo/shared';
import type { SessionRepository, SessionRecord } from './session.repository';

export class InMemorySessionRepository implements SessionRepository {
  private sessions: SessionRecord[] = [];
  private nextId = 1;

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(data: {
    userId: number;
    refreshTokenHash: string;
    device?: string;
    ip?: string;
    expiresAt: Date;
  }): Promise<SessionRecord> {
    const now = new Date();
    const session: SessionRecord = {
      id: this.nextId++,
      userId: data.userId,
      refreshTokenHash: data.refreshTokenHash,
      device: data.device,
      ip: data.ip,
      lastActive: now,
      expiresAt: data.expiresAt,
      createdAt: now,
    };
    this.sessions.push(session);
    return session;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findByRefreshTokenHash(hash: string): Promise<SessionRecord | null> {
    return this.sessions.find((s) => s.refreshTokenHash === hash) ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async listByUserId(userId: number): Promise<SessionInfo[]> {
    const now = new Date();
    return this.sessions
      .filter((s) => s.userId === userId && s.expiresAt > now)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((s) => ({
        id: s.id,
        device: s.device,
        ip: s.ip,
        lastActive: s.lastActive.toISOString(),
        createdAt: s.createdAt.toISOString(),
      }));
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async delete(id: number): Promise<void> {
    this.sessions = this.sessions.filter((s) => s.id !== id);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async deleteByUserId(userId: number): Promise<void> {
    this.sessions = this.sessions.filter((s) => s.userId !== userId);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async deleteExpired(): Promise<void> {
    const now = new Date();
    this.sessions = this.sessions.filter((s) => s.expiresAt > now);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async updateLastActive(id: number): Promise<void> {
    const session = this.sessions.find((s) => s.id === id);
    if (session) session.lastActive = new Date();
  }
}
