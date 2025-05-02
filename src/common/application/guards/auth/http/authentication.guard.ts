// auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppException } from '../../../exceptions';
import * as jwt from 'jsonwebtoken';
import { AppConfigService } from 'src/config';
import { JwtPayload } from '../auth.model';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly appConfigService: AppConfigService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw AppException.Unauthorized('No token provided');
    }

    const payload = this.verifyToken(token);

    const audience = this.appConfigService.auth.audience || 'default-audience';
    const authority = this.appConfigService.auth.authority || 'default-authority';

    if (payload.aud !== audience || payload.iss !== authority) {
      throw AppException.Unauthorized('Invalid audience or authority');
    }

    // Attach full user payload to request
    request.user = payload;
    return true;

  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private verifyToken(token: string): JwtPayload {
    try {
      const secretKey = this.appConfigService.auth.secretKey || 'default-secret-key';
      return jwt.verify(token, secretKey, {
        algorithms: ['HS256']
      }) as JwtPayload;
    } catch (error) {
      throw AppException.Unauthorized('Invalid or expired token');
    }
  }
}