import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export type Permission =
  | 'can_register'
  | 'can_vaccinate'
  | 'can_export'
  | 'can_admin'
  | 'can_view_reports'
  | 'can_manage_users'
  | 'can_manage_outbreaks';

export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
