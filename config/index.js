/**
 * Centralized configuration for the application
 * All environment variables and app settings should be defined here
 */

export const config = {
  // App
  app: {
    name: process.env.APP_NAME || 'Tool Suite',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    url: (() => {
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      // Normalize to HTTPS in production (Vercel always uses HTTPS)
      if (process.env.NODE_ENV === 'production' && appUrl.startsWith('http://')) {
        return appUrl.replace('http://', 'https://');
      }
      return appUrl;
    })(),
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
    },
  },

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    productId: process.env.STRIPE_PRODUCT_ID || 'prod_TTkHuBeh8iAAht',
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  // File upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB default
    allowedMimeTypes: {
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    },
    tempDir: process.env.TEMP_DIR || '/tmp',
  },

  // Session
  session: {
    cookieName: 'megapixelai_session',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secret: process.env.SESSION_SECRET || 'change-me-in-production',
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },
  },

  // Analytics
  analytics: {
    gaTrackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  },

  // OAuth
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
    },
    // Prefer explicit APP_URL, else infer from Vercel's provided URL in production
    redirectBaseUrl: (() => {
      const baseUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      // Normalize to HTTPS in production (Vercel always uses HTTPS)
      if (process.env.NODE_ENV === 'production' && baseUrl.startsWith('http://')) {
        return baseUrl.replace('http://', 'https://');
      }
      return baseUrl;
    })(),
  },
};

// Validation helper
export function validateConfig() {
  const required = [
    { key: 'database.url', value: config.database.url },
    { key: 'supabase.url', value: config.supabase.url },
    { key: 'supabase.anonKey', value: config.supabase.anonKey },
  ];

  const missing = required.filter(({ value }) => !value);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required configuration: ${missing.map(({ key }) => key).join(', ')}`
    );
  }
}

// Validate on import in production
if (config.app.env === 'production') {
  validateConfig();
}

