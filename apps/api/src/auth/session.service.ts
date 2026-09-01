import { Inject, Injectable } from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from './session.repository';
import * as crypto from 'crypto';

@Injectable()
export class SessionService {
  private readonly refreshExpiresInDays: number;

  constructor(
    @Inject(SESSION_REPOSITORY) private readonly sessionRepo: SessionRepository,
  ) {
    const refreshStr = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    this.refreshExpiresInDays = parseInt(refreshStr, 10) || 7;
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async createSession(
    userId: number,
    refreshToken: string,
    device?: string,
    ip?: string,
  ): Promise<{
    id: number;
    device?: string;
    ip?: string;
    lastActive: string;
    createdAt: string;
  }> {
    const expiresAt = new Date(
      Date.now() + this.refreshExpiresInDays * 24 * 60 * 60 * 1000,
    );
    const hash = this.hashToken(refreshToken);

    const session = await this.sessionRepo.create({
      userId,
      refreshTokenHash: hash,
      device,
      ip,
      expiresAt,
    });

    return {
      id: session.id,
      device: session.device,
      ip: session.ip,
      lastActive: session.lastActive.toISOString(),
      createdAt: session.createdAt.toISOString(),
    };
  }

  async findSession(refreshToken: string) {
    const hash = this.hashToken(refreshToken);
    return this.sessionRepo.findByRefreshTokenHash(hash);
  }

  async rotateSession(
    oldSessionId: number,
    userId: number,
    newRefreshToken: string,
    device?: string,
    ip?: string,
  ) {
    await this.sessionRepo.delete(oldSessionId);
    return this.createSession(userId, newRefreshToken, device, ip);
  }

  async listSessions(userId: number) {
    return this.sessionRepo.listByUserId(userId);
  }

  async revokeSession(id: number, userId: number) {
    const session = await this.sessionRepo.findById(id);
    if (!session || session.userId !== userId) {
      return false;
    }
    await this.sessionRepo.delete(id);
    return true;
  }

  async revokeAllSessions(userId: number) {
    await this.sessionRepo.deleteByUserId(userId);
  }
}
