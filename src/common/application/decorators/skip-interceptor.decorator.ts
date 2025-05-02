import { SetMetadata } from '@nestjs/common';
import { DECORATOR_CONSTANT } from '../constants';

export const SkipInterceptor = () =>
  SetMetadata(DECORATOR_CONSTANT.KEYS.SKIP_INTERCEPTOR, true);
