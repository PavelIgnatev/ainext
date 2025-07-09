import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: [],
  productionBrowserSourceMaps: true, // Включаем source maps для отладки
  experimental: {
    serverComponentsHmrCache: false, // Отключаем кеш для лучшей отладки
  },
  // Отключаем минификацию в development
  swcMinify: false,
  env: {
    NODE_ENV: 'development', // Принудительно ставим development для детальных ошибок
  },
  // Принудительно показываем ошибки в продакшене
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
