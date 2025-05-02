import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { IOperationResult, successResult } from '../results';
import { DECORATOR_CONSTANT } from '../constants';
import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Check if the interceptor should be skipped for this handler
    const skipInterceptorHandler = this.reflector.get<boolean>(
      DECORATOR_CONSTANT.KEYS.SKIP_INTERCEPTOR,
      context.getHandler(), // Metadata at the handler level
    );

    // Check if the interceptor should be skipped for this controller
    const skipInterceptorController = this.reflector.get<boolean>(
      DECORATOR_CONSTANT.KEYS.SKIP_INTERCEPTOR,
      context.getClass(), // Metadata at the controller level
    );

    // Skip the interceptor if metadata is set or if the context is RabbitMQ
    if (
      skipInterceptorHandler ||
      skipInterceptorController ||
      isRabbitContext(context)
    ) {
      return next.handle();
    }

    // Get the response object
    const response = context.switchToHttp().getResponse();

    // Proceed with formatting the response
    return next.handle().pipe(
      map((data) => {
        // Force status code to 200 before formatting the response
        response.status(200);
        return this.formatResponse(data);
      })
    );
  }

  private formatResponse(data: any): IOperationResult<any> {
    return successResult('', data || null);
  }
}