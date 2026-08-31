import { PrismaService } from '../common/prisma.service';
import type {
  InvitationRepository,
  PendingInvitationData,
} from './invitation.repository';

export class PrismaInvitationRepository implements InvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    email: string;
    name: string;
    phone?: string;
    county: string;
    subCounty?: string;
    token: string;
    expiresAt: Date;
  }): Promise<PendingInvitationData> {
    const record = await this.prisma.pendingInvitation.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone ?? null,
        county: data.county,
        subCounty: data.subCounty ?? null,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
    return {
      id: record.id,
      email: record.email,
      name: record.name,
      phone: record.phone,
      county: record.county,
      subCounty: record.subCounty,
      token: record.token,
      expiresAt: record.expiresAt,
      used: record.used,
      createdAt: record.createdAt,
    };
  }

  async findByToken(token: string): Promise<PendingInvitationData | null> {
    const record = await this.prisma.pendingInvitation.findUnique({
      where: { token },
    });
    if (!record) return null;
    return {
      id: record.id,
      email: record.email,
      name: record.name,
      phone: record.phone,
      county: record.county,
      subCounty: record.subCounty,
      token: record.token,
      expiresAt: record.expiresAt,
      used: record.used,
      createdAt: record.createdAt,
    };
  }

  async markUsed(id: number): Promise<void> {
    await this.prisma.pendingInvitation.update({
      where: { id },
      data: { used: true },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.pendingInvitation.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { used: true }],
      },
    });
  }
}
