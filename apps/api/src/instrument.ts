import * as Sentry from '@sentry/node';

const dsn = process.env['SENTRY_DSN_API'];

if (dsn && dsn !== 'placeholder') {
  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
  });
}
