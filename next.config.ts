import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The site is content-driven and has no database: every route can be static.
  // Keeping it that way is a deliberate constraint — see docs/09-cms-architecture.md.
  output: 'standalone',
  poweredByHeader: false,
  eslint: { dirs: ['src', 'brand', 'scripts'] },
};

export default nextConfig;
