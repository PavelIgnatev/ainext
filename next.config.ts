import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  productionBrowserSourceMaps: false,
  env: {
    CUSTOM_ERROR_HANDLING: 'true',
    SHOW_DETAILED_ERRORS: 'true',
  },
};

export default nextConfig;
