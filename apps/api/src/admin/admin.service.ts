import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { User, UserRole } from '@wam-mfugo/shared';
import { USER_REPOSITORY, type UserRepository } from '../auth/user.repository';
import { SessionService } from '../auth/session.service';
import { AuditService } from '../auth/audit.service';

@Injectable()
export class AdminService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    private readonly sessionService: SessionService,
    private readonly auditService: AuditService,
  ) {}

  async listUsers(filters?: {
    role?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;

    const [users, total] = await Promise.all([
      this.userRepo.list({
        role: filters?.role,
        isActive: filters?.isActive,
        search: filters?.search,
      }),
      this.userRepo.count({
        role: filters?.role,
        isActive: filters?.isActive,
      }),
    ]);

    return {
      users: users.slice((page - 1) * limit, page * limit).map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        role: u.role,
        county: u.county,
        subCounty: u.subCounty,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async getUser(id: number) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const sessions = await this.sessionService.listSessions(id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      county: user.county,
      subCounty: user.subCounty,
      isActive: user.isActive,
      failedOtpAttempts: user.failedOtpAttempts,
      lockedUntil: user.lockedUntil,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      sessions,
    };
  }

  async updateUser(id: number, data: { role?: UserRole; isActive?: boolean }) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.userRepo.update(id, data);

    await this.auditService.logEvent({
      event: 'account_updated',
      email: user.email,
      userId: id,
      metadata: data,
    });

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      role: updated.role,
      county: updated.county,
      subCounty: updated.subCounty,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deactivateUser(id: number, adminId: number) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');

    await this.userRepo.update(id, { isActive: false });
    await this.sessionService.revokeAllSessions(id);

    await this.auditService.logEvent({
      event: 'account_deactivated',
      email: user.email,
      userId: id,
      metadata: { adminId },
    });

    return { message: 'User deactivated' };
  }

  async revokeSessions(id: number) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');

    await this.sessionService.revokeAllSessions(id);

    await this.auditService.logEvent({
      event: 'sessions_revoked',
      email: user.email,
      userId: id,
    });

    return { message: 'All sessions revoked' };
  }

  async getAuditLogs(filters?: {
    event?: string;
    email?: string;
    userId?: number;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) {
    return this.auditService.getLogs(filters);
  }
}
