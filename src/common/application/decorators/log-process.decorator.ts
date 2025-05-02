import { SetMetadata } from '@nestjs/common';
import { DECORATOR_CONSTANT } from '../constants';

export const LogProcess = (processName: string) =>
    SetMetadata(DECORATOR_CONSTANT.KEYS.LOG_PROCESS_INTERCEPTOR, processName);
