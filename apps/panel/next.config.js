const { withSentryConfig } = require('@sentry/nextjs');

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@opony/design-system-web', '@opony/shared-types'],
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${API_URL}/uploads/:path*`,
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Suppress Sentry source map upload warnings when no auth token is set
  silent: true,
  // Disable automatic Sentry webpack plugin telemetry
  telemetry: false,
  // Don't fail build if Sentry upload errors (no token in CI/local)
  dryRun: !process.env.SENTRY_AUTH_TOKEN,
  disableLogger: true,
});
