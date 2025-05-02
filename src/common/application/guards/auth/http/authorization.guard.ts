import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppException } from '../../../exceptions';
import { Permission } from '../permission';
import { JwtPayload } from '../auth.model';
import { DECORATOR_CONSTANT } from '../../../constants';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<Permission[]>(
      DECORATOR_CONSTANT.KEYS.AUTHORIZED_PERMISSION_KEY,
      context.getHandler(),
    );

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user) {
      throw AppException.Unauthorized('User not authenticated');
    }

    // Convert user permissions from string to number for comparison
    const userPermissions = user.Permission
      ? user.Permission.map(p => parseInt(p, 10))
      : [];

    // Check if user has any of the required permissions
    const hasRequiredPermission = requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    );

    if (!hasRequiredPermission) {
      throw AppException.Forbidden(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }
}