import { Controller, Get } from '@nestjs/common';

import packageJson from '../package.json';
import { HealthCheck } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { SkipInterceptor } from './common';

@ApiTags('App')
@SkipInterceptor()
@Controller()
export class AppController {
  public message: string =
    `🚀 Welcome to the Swift Bill Api (Version: ${packageJson.version}) 🚀\n` +
    `✨ A product by Payever Company (${new Date().getFullYear()}) ✨`;

  constructor() { }

  @Get()
  getWellcome(): string {
    return this.message;
  }

  @Get('/version')
  getVersion(): string {
    return packageJson.version;
  }

  @Get('/health')
  @HealthCheck()
  check() {
    return 'Healthy';
  }
}
