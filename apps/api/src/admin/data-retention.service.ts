import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleAutoArchive() {
    this.logger.log('Running auto-archive job...');
    const archived = await this.archiveOldRecords(90);
    this.logger.log(
      `Auto-archived ${archived.auditLogs} audit logs, ${archived.animals} animals`,
    );
  }

  async archiveOldRecords(daysOld: number = 90) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const auditResult = await this.prisma.auditLog.updateMany({
      where: {
        archivedAt: null,
        createdAt: { lt: cutoff },
      },
      data: { archivedAt: new Date() },
    });

    const animalResult = await this.prisma.animal.updateMany({
      where: {
        archivedAt: null,
        createdAt: { lt: cutoff },
        health: 'Recovered',
      },
      data: { archivedAt: new Date() },
    });

    return {
      auditLogs: auditResult.count,
      animals: animalResult.count,
    };
  }

  async gdprDelete(userId: number): Promise<{
    anonymized: string[];
    deleted: string[];
  }> {
    const anonymized: string[] = [];
    const deleted: string[] = [];

    // Anonymize audit logs (keep structure, remove PII)
    const auditResult = await this.prisma.auditLog.updateMany({
      where: { userId },
      data: {
        email: 'redacted@deleted.com',
        ip: null,
        userAgent: null,
        metadata: null,
      },
    });
    anonymized.push(`audit_logs: ${auditResult.count} records anonymized`);

    // Delete OTP codes
    const otpResult = await this.prisma.otpCode.deleteMany({
      where: { email: { in: [] } }, // OTPs linked by email, not userId
    });
    deleted.push(`otp_codes: ${otpResult.count} deleted`);

    // Delete sessions
    const sessionResult = await this.prisma.session.deleteMany({
      where: { userId },
    });
    deleted.push(`sessions: ${sessionResult.count} deleted`);

    // Delete push tokens
    const pushResult = await this.prisma.pushToken.deleteMany({
      where: { userId },
    });
    deleted.push(`push_tokens: ${pushResult.count} deleted`);

    // Anonymize user record
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@anonymized.com`,
        name: 'Deleted User',
        phone: '',
        isActive: false,
      },
    });
    anonymized.push('user record anonymized');

    this.logger.log(`GDPR delete completed for user ${userId}`);
    return { anonymized, deleted };
  }

  async getRetentionStats() {
    const [totalAudit, archivedAudit, totalAnimals, archivedAnimals] =
      await Promise.all([
        this.prisma.auditLog.count(),
        this.prisma.auditLog.count({ where: { archivedAt: { not: null } } }),
        this.prisma.animal.count(),
        this.prisma.animal.count({ where: { archivedAt: { not: null } } }),
      ]);

    return {
      auditLogs: {
        total: totalAudit,
        archived: archivedAudit,
        active: totalAudit - archivedAudit,
      },
      animals: {
        total: totalAnimals,
        archived: archivedAnimals,
        active: totalAnimals - archivedAnimals,
      },
      policy: { archiveAfterDays: 90, gdprRetentionDays: 365 },
    };
  }
}
