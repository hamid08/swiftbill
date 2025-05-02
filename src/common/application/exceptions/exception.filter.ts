import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  NotFoundException,
  Logger,
  Inject,
  UnauthorizedException,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { IOperationResult } from '../results';
import { AppException } from '../exceptions';
import { AppConfigService } from 'src/config';
import { APPLICATION_CONSTANT } from '../constants';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);
  private readonly productionMessage = 'An error occurred. Please contact support.';

  constructor(
    @Inject(AppConfigService) private readonly configService: AppConfigService,
  ) { }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.determineErrorResponse(exception);
    this.logError(request, status, message, exception);

    const result: IOperationResult<null> = {
      success: false,
      data: null,
      messages: [message],
    };

    // Return native HTTP codes for unauthorized/forbidden
    if (this.shouldReturnNativeCode(exception)) {
      return response.status(status).json(result);
    }

    response.status(200).json(result);
  }

  private shouldReturnNativeCode(exception: unknown): boolean {
    return (
      exception instanceof UnauthorizedException ||
      exception instanceof ForbiddenException ||
      exception instanceof NotFoundException ||
      (exception instanceof AppException &&
        (exception.getStatus() === HttpStatus.UNAUTHORIZED ||
          exception.getStatus() === HttpStatus.FORBIDDEN ||
          exception.getStatus() === HttpStatus.NOT_FOUND))
    );
  }

  private determineErrorResponse(exception: unknown): { status: number; message: string } {
    const defaultResponse = {
      status: 500,
      message: 'Internal server error (code 500)'
    };

    if (exception instanceof NotFoundException) {
      return {
        status: 404,
        message: 'The requested path was not found'
      };
    }

    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        message: exception.message
      };
    }

    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        message: this.extractHttpExceptionMessage(exception)
      };
    }

    if (exception instanceof Error) {
      return {
        status: defaultResponse.status,
        message: this.shouldShowDetailedError()
          ? exception.message
          : this.productionMessage
      };
    }

    return defaultResponse;
  }

  private extractHttpExceptionMessage(exception: HttpException): string {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as Record<string, unknown>;
      if ('message' in responseObj) {
        if (Array.isArray(responseObj.message)) {
          return responseObj.message.join(', ');
        }
        if (typeof responseObj.message === 'string') {
          return responseObj.message;
        }
      }
    }

    return this.shouldShowDetailedError()
      ? 'Server error'
      : this.productionMessage;
  }

  private shouldShowDetailedError(): boolean {
    return this.configService.application.nodeEnv !== APPLICATION_CONSTANT.ENVIRONMENT.IS_PRODUCTION;
  }

  private logError(request: Request, status: number, message: string, exception: unknown): void {
    const errorLog = {
      method: request.method,
      url: request.originalUrl,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      stack: exception instanceof Error ? exception.stack : undefined
    };

    this.logger.error(JSON.stringify(errorLog, null, 2));
  }
}