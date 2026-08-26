import type { User, UserRole } from '@wam-mfugo/shared';
import type { UserRepository } from './user.repository';

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];
  private nextId = 1;

  constructor() {
    const demoMode = process.env.DEMO_MODE !== 'false';
    if (demoMode) {
      this.seed();
    }
  }

  private seed() {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'demo@wamfugo.ke';
    this.users.push({
      id: this.nextId++,
      email: adminEmail,
      name: 'Admin User',
      phone: '+254700000000',
      role: 'admin',
      county: 'Nairobi',
      subCounty: 'Westlands',
      isActive: true,
      failedOtpAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findById(id: number): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(data: {
    email: string;
    name: string;
    phone: string;
    role: UserRole;
    county: string;
    subCounty?: string;
  }): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      id: this.nextId++,
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      county: data.county,
      subCounty: data.subCounty,
      isActive: true,
      failedOtpAttempts: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(user);
    return user;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
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
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.county !== undefined) user.county = data.county;
    if (data.subCounty !== undefined) user.subCounty = data.subCounty;
    if (data.role !== undefined) user.role = data.role;
    if (data.isActive !== undefined) user.isActive = data.isActive;
    if (data.failedOtpAttempts !== undefined)
      user.failedOtpAttempts = data.failedOtpAttempts;
    if (data.lockedUntil !== undefined)
      user.lockedUntil = data.lockedUntil ?? undefined;
    user.updatedAt = new Date().toISOString();
    return user;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async list(filters?: {
    role?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<User[]> {
    return this.users.filter((u) => {
      if (filters?.role && u.role !== filters.role) return false;
      if (filters?.isActive !== undefined && u.isActive !== filters.isActive)
        return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        if (
          !u.name.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }

  async count(filters?: {
    role?: string;
    isActive?: boolean;
  }): Promise<number> {
    return this.list(filters).then((u) => u.length);
  }
}
