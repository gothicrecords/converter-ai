import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force correct project root for Turbopack to avoid parent lockfile
  turbopack: {
    root: __dirname,
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ['react-icons', 'framer-motion'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Internationalization
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'it', 'es', 'fr', 'de', 'pt', 'ru', 'ja', 'zh', 'ar', 'hi', 'ko'],
    localeDetection: true,
  },
  // Optimize route prefetching
  onDemandEntries: {
    // Keep pages in memory longer for instant revisits
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;
