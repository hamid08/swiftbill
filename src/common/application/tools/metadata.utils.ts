import { Reflector } from '@nestjs/core';
import { DECORATOR_CONSTANT } from '../constants';

export function getDisplayName(reflector: Reflector, dto: any, propertyKey: string): string | undefined {
  return reflector.get<string>(DECORATOR_CONSTANT.KEYS.DISPLAY_NAME_KEY, dto.prototype[propertyKey]);
}