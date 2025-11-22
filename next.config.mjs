import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  httpAgentOptions: { keepAlive: true },
  // Use a custom dist directory to avoid OneDrive file locking on .next
  distDir: '.next-build',
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Performance optimizations
    unoptimized: false,
    remotePatterns: [],
  },

  experimental: {
    optimizePackageImports: [
      'react-icons', 
      'framer-motion', 
      'lodash', 
      '@tanstack/react-query',
      'date-fns',
      'react-markdown'
    ],
    scrollRestoration: true,
    optimizeServerReact: true,
    // Mitigate HMR issues during development
    webpackBuildWorker: false,
  },
  
  // Suppress HMR warnings in development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Resolve .js extensions for ES modules
    if (config.resolve) {
      config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
      config.resolve.extensionAlias = {
        '.js': ['.js', '.ts', '.tsx'],
      };
      
      // Better tree shaking
      config.resolve.mainFields = ['main', 'module', 'browser'];
    }
    
    // Production optimizations
    if (!dev && !isServer) {
      // Enhanced code splitting
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        usedExports: true, // Enable tree shaking
        sideEffects: false, // Better tree shaking
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Large libraries get their own chunk
            lib: {
              test(module) {
                return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier());
              },
              name(module) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];
                return `lib-${packageName?.replace('@', '')}` || crypto.createHash('sha1')
                  .update(module.identifier())
                  .digest('hex')
                  .substring(0, 8);
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            // Common vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 25,
              minChunks: 2,
              reuseExistingChunk: true,
            },
            // Shared common code
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },
            shared: {
              name(module, chunks) {
                return crypto
                  .createHash('sha1')
                  .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                  .digest('hex')
                  .substring(0, 8);
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
      
      // Performance hints
      config.performance = {
        hints: 'warning',
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      };
    }
    return config;
  },
  
  // Turbopack configuration
  turbopack: {
    // Fix root inference so Next.js uses this project directory
    root: __dirname,
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { 
      exclude: ['error', 'warn'] 
    } : false,
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  
  // Internationalization
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'it', 'es', 'fr', 'de', 'pt', 'ru', 'ja', 'zh', 'ar', 'hi', 'ko'],
  },
  
  // Headers per caching aggressivo e security
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|gif|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          // Performance headers (rimuoviamo Content-Type forzato per non rompere API/asset)
        ],
      },
    ];
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      // Add any redirects here if needed
    ];
  },
};

export default nextConfig;
