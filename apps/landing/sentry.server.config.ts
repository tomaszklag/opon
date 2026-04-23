import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN_LANDING;

if (dsn && dsn !== 'placeholder') {
  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
  });
}
