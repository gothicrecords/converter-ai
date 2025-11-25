import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';

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
  
  // Environment variables exposed to client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
      'react-markdown',
      'pdf-lib',
      'pdfjs-dist',
      'sharp',
      'tesseract.js'
    ],
    // Enable modern bundling optimizations
    optimizeCss: true,
    // Improve build performance
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB', 'INP'],
  },

  webpack: (config, { dev, isServer }) => {
    // Performance optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
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
              }
            },
            // Styles
            styles: {
              test: /\.(css|scss|sass)$/,
              name: 'styles',
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
      
      // Performance hints - more aggressive optimization
      config.performance = {
        hints: 'warning',
        maxEntrypointSize: 300000, // Reduced from 512KB to 300KB
        maxAssetSize: 300000,
      };
      
      // Additional optimizations
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        // Tree shaking
        providedExports: true,
        // Minimize bundle size
        minimize: true,
      };
    }
    
    // Assicurati che ffmpeg-static e altre dipendenze native siano incluse
    if (isServer) {
      config.externals = config.externals || [];
      // Non escludere ffmpeg-static, deve essere incluso
      if (Array.isArray(config.externals)) {
        config.externals = config.externals.filter(ext => {
          if (typeof ext === 'string') {
            return !ext.includes('ffmpeg-static');
          }
          return true;
        });
      }
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
    // Additional optimizations
    styledComponents: false,
  },
  
  // Output configuration for better caching
  generateBuildId: async () => {
    return process.env.BUILD_ID || `build-${Date.now()}`;
  },

  // Internationalization
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'it', 'es', 'fr', 'de', 'pt', 'ru', 'ja', 'zh', 'ar', 'hi', 'ko'],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
