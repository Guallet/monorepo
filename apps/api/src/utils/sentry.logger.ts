import { ConsoleLogger } from '@nestjs/common';
import * as Sentry from '@sentry/node';

export class SentryLogger extends ConsoleLogger {
  exception(e: Error) {
    Sentry.captureException(e);
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);

    // Log to sentry too
    Sentry.captureMessage(message);
  }
}
