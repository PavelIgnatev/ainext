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
  webpack: (config, { dev, isServer }) => {
    if (!dev && isServer) {
      config.resolve.alias['next/dist/lib/is-error'] = require.resolve(
        './lib/custom-error-handler.js'
      );
    }
    return config;
  },
};

export default nextConfig;
