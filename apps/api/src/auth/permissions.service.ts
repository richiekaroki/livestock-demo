import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type { Permission } from './permissions.decorator';

const ROLE_DEFAULTS: Record<string, Permission[]> = {
  admin: [
    'can_register',
    'can_vaccinate',
    'can_export',
    'can_admin',
    'can_view_reports',
    'can_manage_users',
    'can_manage_outbreaks',
  ],
  field_agent: [
    'can_register',
    'can_vaccinate',
    'can_export',
    'can_view_reports',
    'can_manage_outbreaks',
  ],
  farmer: ['can_register', 'can_export'],
  viewer: ['can_view_reports'],
};

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  getDefaultPermissions(role: string): Permission[] {
    return ROLE_DEFAULTS[role] || ROLE_DEFAULTS.farmer;
  }

  async getUserPermissions(userId: number): Promise<Permission[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return [];

    try {
      return JSON.parse(user.permissions || '[]') as Permission[];
    } catch {
      return this.getDefaultPermissions(user.role);
    }
  }

  async setUserPermissions(
    userId: number,
    permissions: Permission[],
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { permissions: JSON.stringify(permissions) },
    });
    this.logger.log(
      `Updated permissions for user ${userId}: ${permissions.join(', ')}`,
    );
  }

  async syncRoleDefaults(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const defaults = this.getDefaultPermissions(user.role);
    await this.setUserPermissions(userId, defaults);
  }

  hasPermission(userPermissions: string[], required: Permission): boolean {
    return userPermissions.includes(required);
  }
}
