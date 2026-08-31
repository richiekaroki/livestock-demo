import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  type Permission,
} from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string; permissions?: string } }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No user in request');
    }

    if (user.role === 'admin') {
      return true;
    }

    let userPermissions: string[] = [];
    try {
      userPermissions = JSON.parse(user.permissions || '[]') as string[];
    } catch {
      userPermissions = [];
    }

    const hasAll = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!hasAll) {
      throw new ForbiddenException(
        `Missing permissions: ${requiredPermissions.filter((p) => !userPermissions.includes(p)).join(', ')}`,
      );
    }

    return true;
  }
}
