import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  
  // Ottimizzazioni critiche per FCP/LCP
  optimizeFonts: true,
  
  // Image optimization
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 1080, 1200],
    minimumCacheTTL: 3600,
    dangerouslyAllowSVG: true,
  },

  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  
  // Internationalization
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'it', 'es', 'fr', 'de', 'pt', 'ru', 'ja', 'zh', 'ar', 'hi', 'ko'],
  },
  
  // Headers per caching aggressivo
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|gif|woff|woff2|css|js)',
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
