import { NextFunction, Request, Response } from 'express';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  logger = new Logger('Response');
  constructor() {}
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl: url } = req;
    const requestTime = new Date().getTime();
    res.on('finish', () => {
      const { statusCode, statusMessage } = res;
      const responseTime = new Date().getTime();
      if (statusCode === 201 || statusCode === 200) {
        this.logger.log(
          `${method} ${url} ${statusCode} - ${responseTime - requestTime} ms`,
        );
      }
    });

    next();
  }
}
