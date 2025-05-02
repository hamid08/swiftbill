import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { DateTimeUtils } from '../tools';
import { DECORATOR_CONSTANT } from '../constants';

@Injectable()
export class ProcessStepsLogger implements NestInterceptor {
    private readonly logger = new Logger(ProcessStepsLogger.name);

    constructor(private readonly reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        let processName = this.reflector.get<string>(
            DECORATOR_CONSTANT.KEYS.LOG_PROCESS_INTERCEPTOR,
            context.getHandler(),
        );

        const handlerName = context.getHandler().name;
        const className = context.getClass().name;

        if (!processName) {
            processName = handlerName;
        }

        const startMessage = `------------ (Run ${processName} at ${DateTimeUtils.formatDate()}) ------------`;
        const finishMessage = `------------ (Finish ${processName} at ${DateTimeUtils.formatDate()}) ------------`;

        this.logger.log(startMessage);

        return next.handle().pipe(
            tap(() => this.logger.log(finishMessage)),
            catchError((error) => {
                this.logger.error(
                    `Error in ${handlerName}: ${error.message}`,
                    error.stack,
                    className,
                );
                throw error;
            }),
        );
    }
}
