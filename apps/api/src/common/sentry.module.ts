import { Module, OnModuleInit, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Module({})
export class SentryModule implements OnModuleInit {
  private readonly logger = new Logger(SentryModule.name);

  onModuleInit() {
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
          ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE)
          : 0.1,
        beforeSend(event, _hint) {
          // Filter out sensitive data
          if (event.request) {
            delete event.request.cookies;
            delete event.request.headers?.['authorization'];
            delete event.request.headers?.['cookie'];
          }
          return event;
        },
      });
      this.logger.log('Sentry error tracking enabled');
    } else {
      this.logger.log(
        'Sentry error tracking disabled (no SENTRY_DSN configured)',
      );
    }
  }
}
