import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AppConfigService } from 'src/config';
import { Socket } from 'socket.io';
import { JwtPayload } from 'src/common/application';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly appConfigService: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const socket = context.switchToWs().getClient<Socket>();
    
    const jwtToken = this.extractJwtToken(socket);
    const partnerToken = this.extractPartnerToken(socket);

    if (!jwtToken && !partnerToken) {
      this.logger.log(`Socket ${socket.id} rejected - no authentication token provided`);
      return false;
    }

    // Try JWT authentication first if token exists
    if (jwtToken && this.tryJwtAuthentication(socket, jwtToken)) {
      return true;
    }

    // Only try partner auth if partner services are enabled in config
    if (partnerToken) {
      const partnerConfig = this.appConfigService.partnerServices;
      
      if (!partnerConfig.enabled) {
        this.logger.log(`Socket ${socket.id} rejected - partner services are disabled`);
        return false;
      }

      if (this.tryPartnerAuthentication(socket, partnerToken, partnerConfig)) {
        return true;
      }
    }

    this.logger.log(`Socket ${socket.id} rejected - all authentication methods failed`);
    return false;
  }

  private tryJwtAuthentication(socket: Socket, token: string): boolean {
    try {
      const payload = this.verifyJwtToken(token);
      this.validateJwtPayload(payload);
      
      socket.data.user = payload;
      socket.data.authType = 'jwt';
      this.logger.log(`Socket ${socket.id} authenticated via JWT`);
      return true;
    } catch (error) {
      this.logger.log(`Socket ${socket.id} JWT authentication failed: ${error.message}`);
      return false;
    }
  }

  private tryPartnerAuthentication(
    socket: Socket,
    partnerToken: { token: string; partnerId: string },
    partnerConfig: { authToken: string; partnerIds: string[] }
  ): boolean {
    try {
      // Verify token matches configured auth token
      if (partnerToken.token !== partnerConfig.authToken) {
        throw new Error('Invalid partner token');
      }

      // Verify partner ID is in allowed list if configured
      if (partnerConfig.partnerIds.length > 0 && 
          !partnerConfig.partnerIds.includes(partnerToken.partnerId)) {
        throw new Error('Partner ID not allowed');
      }

      socket.data.user = {
        partnerId: partnerToken.partnerId,
        roles: ['partner']
      };
      socket.data.authType = 'partner';
      this.logger.log(`Socket ${socket.id} authenticated as partner ${partnerToken.partnerId}`);
      return true;
    } catch (error) {
      this.logger.log(`Socket ${socket.id} partner authentication failed: ${error.message}`);
      return false;
    }
  }

  private extractJwtToken(socket: Socket): string | undefined {
    const [type, token] = socket.handshake.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractPartnerToken(socket: Socket): { token: string; partnerId: string } | null {
    const token = socket.handshake.auth?.token as string || '';
    const partnerId = socket.handshake.query?.partnerId as string || '';

    if (!token) return null;

    return { token, partnerId };
  }

  private verifyJwtToken(token: string): JwtPayload {
    const secretKey = this.appConfigService.auth.secretKey || 'default-secret-key';
    return jwt.verify(token, secretKey, { algorithms: ['HS256'] }) as JwtPayload;
  }

  private validateJwtPayload(payload: JwtPayload): void {
    const audience = this.appConfigService.auth.audience || 'default-audience';
    const authority = this.appConfigService.auth.authority || 'default-authority';

    if (payload.aud !== audience || payload.iss !== authority) {
      throw new Error('Invalid audience or authority');
    }
  }
}