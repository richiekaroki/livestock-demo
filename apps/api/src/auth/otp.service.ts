import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { OTP_REPOSITORY, type OtpRepository } from './otp.repository';
import { AUDIT_REPOSITORY, type AuditRepository } from './audit.repository';

@Injectable()
export class OtpService {
  private readonly otpExpiryMinutes: number;
  private readonly maxRequests: number;
  private readonly maxFailedAttempts: number;
  private readonly lockoutMinutes: number;

  constructor(
    @Inject(OTP_REPOSITORY) private readonly otpRepo: OtpRepository,
    @Inject(AUDIT_REPOSITORY) private readonly auditRepo: AuditRepository,
  ) {
    this.otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
    this.maxRequests = parseInt(process.env.OTP_MAX_REQUESTS || '5', 10);
    this.maxFailedAttempts = parseInt(
      process.env.OTP_MAX_FAILED_ATTEMPTS || '5',
      10,
    );
    this.lockoutMinutes = parseInt(process.env.OTP_LOCKOUT_MINUTES || '15', 10);
  }

  generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  async createOtp(email: string, purpose: string): Promise<string> {
    const otp = this.generateOtp();
    const hashedCode = this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + this.otpExpiryMinutes * 60 * 1000);

    await this.otpRepo.create({ email, code: hashedCode, expiresAt, purpose });

    await this.auditRepo.log({
      event: 'otp_requested',
      email,
      metadata: JSON.stringify({ purpose }),
    });

    return otp;
  }

  async verifyOtp(
    email: string,
    otp: string,
    purpose: string,
    ip?: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    const hashedOtp = this.hashOtp(otp);
    const record = await this.otpRepo.findValid(email, purpose);

    if (!record) {
      await this.auditRepo.log({
        event: 'otp_failed',
        email,
        ip,
        metadata: JSON.stringify({ reason: 'no_valid_otp' }),
      });
      return { valid: false, reason: 'Invalid or expired OTP' };
    }

    if (record.code !== hashedOtp) {
      await this.auditRepo.log({
        event: 'otp_failed',
        email,
        ip,
        metadata: JSON.stringify({ reason: 'wrong_code' }),
      });
      return { valid: false, reason: 'Invalid OTP code' };
    }

    await this.otpRepo.markUsed(record.id);
    await this.auditRepo.log({
      event: 'otp_verified',
      email,
      ip,
    });

    return { valid: true };
  }

  isLocked(failedAttempts: number, lockedUntil?: string | null): boolean {
    if (!lockedUntil) return false;
    return new Date(lockedUntil) > new Date();
  }

  getLockoutSeconds(lockedUntil: string): number {
    const remaining = new Date(lockedUntil).getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async incrementFailedAttempts(
    failedAttempts: number,
  ): Promise<{ failedOtpAttempts: number; lockedUntil?: Date }> {
    const newCount = failedAttempts + 1;
    if (newCount >= this.maxFailedAttempts) {
      const lockedUntil = new Date(
        Date.now() + this.lockoutMinutes * 60 * 1000,
      );
      return { failedOtpAttempts: newCount, lockedUntil };
    }
    return { failedOtpAttempts: newCount };
  }
}
