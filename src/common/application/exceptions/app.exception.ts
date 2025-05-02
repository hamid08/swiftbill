import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception class that extends HttpException.
 * It provides more specific error handling with optional Persian messages.
 */
export class AppException extends HttpException {
  private readonly errorCode?: string;

  constructor(message: string, statusCode: HttpStatus, errorCode?: string) {
    super(message, statusCode);
    this.errorCode = errorCode;

    // Optional logging of the error, for example, using a logger service
    // Logger.error(`AppException: ${message}`, errorCode);
  }

  static NotFound(message?: string, errorCode?: string): AppException {
    return new AppException(
      message || 'منبع مورد نظر یافت نشد',
      HttpStatus.NOT_FOUND,
      errorCode,
    );
  }

  static Unauthorized(message?: string, errorCode?: string): AppException {
    return new AppException(
      message || 'اعتبار سنجی غیرمجاز',
      HttpStatus.UNAUTHORIZED,
      errorCode,
    );
  }

  static BadRequest(message?: string, errorCode?: string): AppException {
    return new AppException(
      message || 'درخواست نادرست',
      HttpStatus.BAD_REQUEST,
      errorCode,
    );
  }

  static Conflict(message?: string, errorCode?: string): AppException {
    return new AppException(message || 'تضاد در درخواست', HttpStatus.CONFLICT, errorCode);
  }

  static Forbidden(message?: string, errorCode?: string): AppException {
    return new AppException(message || 'دسترسی غیر مجاز', HttpStatus.FORBIDDEN, errorCode);
  }

  static InternalServerError(message?: string, errorCode?: string): AppException {
    return new AppException(
      message || 'خطای داخلی سرور',
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
