/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  transpilePackages: ['@opony/design-system-web', '@opony/shared-types'],
};

module.exports = nextConfig;
