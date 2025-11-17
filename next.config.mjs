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
  compress: true,
  poweredByHeader: false,
  
  // Ottimizzazioni critiche per FCP
  optimizeFonts: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
  },

  experimental: {
    optimizePackageImports: ['react-icons', 'framer-motion'],
    optimizeCss: true,
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Internationalization
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'it', 'es', 'fr', 'de', 'pt', 'ru', 'ja', 'zh', 'ar', 'hi', 'ko'],
  },
  
  // Optimize route prefetching
  onDemandEntries: {
    // Keep pages in memory longer for instant revisits
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Headers per caching e performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
      {
        source: '/locales/:locale/common.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|png|webp|avif|gif|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/styles.css',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
