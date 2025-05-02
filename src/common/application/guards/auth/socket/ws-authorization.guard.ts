import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { DECORATOR_CONSTANT } from '../../../constants';
import { Socket } from 'socket.io';
import { Permission } from '../permission';

@Injectable()
export class WsAuthorizationGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.get<Permission[]>(
            DECORATOR_CONSTANT.KEYS.AUTHORIZED_PERMISSION_KEY,
            context.getHandler(),
        );

        if (!requiredPermissions?.length) {
            return true;
        }

        const client = context.switchToWs().getClient<Socket>();
        const user = client.data.user;

        if (!user) {
            throw new WsException('User not authenticated');
        }

        const userPermissions = user.Permission
            ? user.Permission.map(p => parseInt(p, 10))
            : [];

        const hasPermission = requiredPermissions.some(permission =>
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            throw new WsException(
                `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`
            );
        }

        return true;
    }
}