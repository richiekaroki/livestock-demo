import type { SessionInfo } from '@wam-mfugo/shared';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface SessionRecord {
  id: number;
  userId: number;
  refreshTokenHash: string;
  device?: string;
  ip?: string;
  lastActive: Date;
  expiresAt: Date;
  createdAt: Date;
}

export interface SessionRepository {
  create(data: {
    userId: number;
    refreshTokenHash: string;
    device?: string;
    ip?: string;
    expiresAt: Date;
  }): Promise<SessionRecord>;
  findByRefreshTokenHash(hash: string): Promise<SessionRecord | null>;
  listByUserId(userId: number): Promise<SessionInfo[]>;
  delete(id: number): Promise<void>;
  deleteByUserId(userId: number): Promise<void>;
  deleteExpired(): Promise<void>;
  updateLastActive(id: number): Promise<void>;
}
