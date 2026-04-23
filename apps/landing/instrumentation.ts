export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs');
    const dsn = process.env.SENTRY_DSN_LANDING;
    if (dsn && dsn !== 'placeholder') {
      Sentry.init({ dsn, tracesSampleRate: 1.0 });
    }
  }
}
