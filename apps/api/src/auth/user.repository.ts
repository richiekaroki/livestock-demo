import type { User, UserRole } from '@wam-mfugo/shared';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(data: {
    email: string;
    name: string;
    phone: string;
    role: UserRole;
    county: string;
    subCounty?: string;
  }): Promise<User>;
  update(
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
  ): Promise<User>;
  list(filters?: {
    role?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<User[]>;
  count(filters?: { role?: string; isActive?: boolean }): Promise<number>;
}
