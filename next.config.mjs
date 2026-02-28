import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compress: true,
  // Use a custom dist directory to avoid OneDrive file locking on .next
  distDir: '.next-build',

  // Environment variables exposed to client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://megapixelsuite.up.railway.app'
        : 'http://localhost:8000'),
  },

  // Image optimization
  images: {
    unoptimized: true,
  },

  // Turbopack configuration
  turbopack: {
    root: __dirname,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // Output configuration for better caching
  generateBuildId: async () => {
    return process.env.BUILD_ID || `build-${Date.now()}`;
  },
};

export default nextConfig;
