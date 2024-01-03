import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private logger = new Logger();

  use(request: Request, response: Response, next: () => void) {
    const { ip } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      // const log_message = `${request.method} ${request.originalUrl} - ${userAgent} ${ip} => ${response.statusCode}`;
      const log_message = `${request.method} ${request.originalUrl} => ${response.statusCode}`;
      if (response.statusCode >= 500) {
        this.logger.error(log_message);
      } else if (response.statusCode >= 400) {
        this.logger.warn(log_message);
      } else {
        this.logger.log(log_message);
      }
    });

    next();
  }
}
