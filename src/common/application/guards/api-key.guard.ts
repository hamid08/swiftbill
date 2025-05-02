import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AppConfigService } from 'src/config';
import { AppException } from '../exceptions';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly appConfigService: AppConfigService,) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKey(request);

    if (apiKey !== this.appConfigService.auth.apiKey && apiKey !== this.appConfigService.partnerServices.authToken) {
      throw AppException.Unauthorized('Invalid API key');
    }

    return true;
  }

  private extractApiKey(request: Request): string {
    const key = request.headers['x-api-key'];
    if (!key) {
      throw new UnauthorizedException('API key missing');
    }
    return Array.isArray(key) ? key[0] : key;
  }
}