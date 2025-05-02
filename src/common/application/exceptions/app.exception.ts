import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception class that extends HttpException.
 * It provides more specific error handling with optional English messages.
 */
export class AppException extends HttpException {
  private readonly errorCode?: string;

  constructor(message: string, statusCode: HttpStatus, errorCode?: string) {
    super(message, statusCode);
    this.errorCode = errorCode;
  }

  static NotFound(message?: string, errorCode?: string): AppException {
    return new AppException(
      message || 'The requested resource was not found',
      HttpStatus.NOT_FOUND,
      errorCode,
    );
  }

  static Unauthorized(message?: string, errorCode?: string): AppException {
    return new AppException(
      message || 'Unauthorized access',
      HttpStatus.UNAUTHORIZED,
      errorCode,
    );
  }

  static BadRequest(message?: string, errorCode?: string): AppException {
    return new AppException(
      message || 'Bad request',
      HttpStatus.BAD_REQUEST,
      errorCode,
    );
  }

  static Conflict(message?: string, errorCode?: string): AppException {
    return new AppException(message || 'Request conflict', HttpStatus.CONFLICT, errorCode);
  }

  static Forbidden(message?: string, errorCode?: string): AppException {
    return new AppException(message || 'Forbidden access', HttpStatus.FORBIDDEN, errorCode);
  }

  static InternalServerError(message?: string, errorCode?: string): AppException {
    return new AppException(
      message || 'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode,
    );
  }

  /**
   * Optional method to get the error code, if present.
   */
  public getErrorCode(): string | undefined {
    return this.errorCode;
  }
}