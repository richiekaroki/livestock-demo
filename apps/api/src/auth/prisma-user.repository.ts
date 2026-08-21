import type { User, UserRole } from '@wam-mfugo/shared';
import { PrismaService } from '../common/prisma.service';
import type { UserRepository } from './user.repository';

type UserRow = {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  county: string;
  subCounty: string | null;
  isActive: boolean;
  failedOtpAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const toDomain = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  phone: row.phone,
  role: row.role as UserRole,
  county: row.county,
  subCounty: row.subCounty ?? undefined,
  isActive: row.isActive,
  failedOtpAttempts: row.failedOtpAttempts,
  lockedUntil: row.lockedUntil?.toISOString(),
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? toDomain(row) : null;
  }

  async findById(id: number): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async create(data: {
    email: string;
    name: string;
    phone: string;
    role: UserRole;
    county: string;
    subCounty?: string;
  }): Promise<User> {
    const row = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role,
        county: data.county,
        subCounty: data.subCounty,
      },
    });
    return toDomain(row);
  }

  async update(
    id: number,
    data: Partial<
      Pick<
        User,
        | 'name'
        | 'phone'
        | 'county'
        | 'subCounty'
        | 'role'
        | 'isActive'
        | 'failedOtpAttempts'
      >
    > & { lockedUntil?: string | null },
  ): Promise<User> {
    const row = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.county !== undefined && { county: data.county }),
        ...(data.subCounty !== undefined && { subCounty: data.subCounty }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.failedOtpAttempts !== undefined && {
          failedOtpAttempts: data.failedOtpAttempts,
        }),
        ...(data.lockedUntil !== undefined && {
          lockedUntil: data.lockedUntil ? new Date(data.lockedUntil) : null,
        }),
      },
    });
    return toDomain(row);
  }

  async list(filters?: {
    role?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      where: {
        ...(filters?.role ? { role: filters.role } : {}),
        ...(filters?.isActive !== undefined
          ? { isActive: filters.isActive }
          : {}),
        ...(filters?.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => toDomain(r));
  }

  async count(filters?: {
    role?: string;
    isActive?: boolean;
  }): Promise<number> {
    return this.prisma.user.count({
      where: {
        ...(filters?.role ? { role: filters.role } : {}),
        ...(filters?.isActive !== undefined
          ? { isActive: filters.isActive }
          : {}),
      },
    });
  }
}
