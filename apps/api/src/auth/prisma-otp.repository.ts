import { PrismaService } from '../common/prisma.service';
import type { OtpRepository, OtpRecord } from './otp.repository';

export class PrismaOtpRepository implements OtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    email: string;
    code: string;
    expiresAt: Date;
    purpose: string;
  }): Promise<OtpRecord> {
    const row = await this.prisma.otpCode.create({
      data: {
        email: data.email,
        code: data.code,
        expiresAt: data.expiresAt,
        purpose: data.purpose,
      },
    });
    return {
      id: row.id,
      email: row.email,
      code: row.code,
      expiresAt: row.expiresAt,
      used: row.used,
      purpose: row.purpose,
      createdAt: row.createdAt,
    };
  }

  async findValid(email: string, purpose: string): Promise<OtpRecord | null> {
    const row = await this.prisma.otpCode.findFirst({
      where: {
        email,
        purpose,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    return row
      ? {
          id: row.id,
          email: row.email,
          code: row.code,
          expiresAt: row.expiresAt,
          used: row.used,
          purpose: row.purpose,
          createdAt: row.createdAt,
        }
      : null;
  }

  async markUsed(id: number): Promise<void> {
    await this.prisma.otpCode.update({
      where: { id },
      data: { used: true },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.otpCode.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
