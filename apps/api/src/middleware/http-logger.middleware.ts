import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger();

  use(request: Request, response: Response, next: () => void) {
    response.on('finish', () => {
      // OAuth codes and email reset tokens must not enter request logs, including path tokens.
      let path = request.originalUrl.split('?')[0];
      try {
        path = decodeURIComponent(path);
      } catch {
        path = '/auth/[redacted]';
      }
      path = path.toLowerCase();
      const safeUrl =
        path === '/auth' || path.startsWith('/auth/')
          ? '/auth/[redacted]'
          : path === '/native-auth' || path.startsWith('/native-auth/')
            ? '/native-auth/[redacted]'
            : request.originalUrl;
      const log_message = `${request.method} ${safeUrl} => ${response.statusCode}`;
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
