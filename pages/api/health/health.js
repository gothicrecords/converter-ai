/**
 * Health check endpoint - alias for /api/health
 * Supports both /api/health and /api/health/health paths
 */
import { config } from '../../../config';

export default function handler(req, res) {
  const diagnostics = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.app.env,
    services: {
      database: !!config.database.url,
      supabase: !!(config.supabase.url && config.supabase.anonKey),
      stripe: !!(config.stripe.secretKey && config.stripe.publishableKey),
      openai: !!config.openai.apiKey,
      cloudinary: !!(config.cloudinary.cloudName && config.cloudinary.apiKey),
      oauth_google: !!(config.oauth.google.clientId && config.oauth.google.clientSecret),
      oauth_facebook: !!(config.oauth.facebook.appId && config.oauth.facebook.appSecret),
    },
    endpoints: {
      signup: '/api/auth/signup',
      login: '/api/auth/login',
      google_oauth: '/api/auth/oauth/google',
      google_callback: '/api/auth/oauth/google/callback',
    },
    app_url: config.oauth.redirectBaseUrl,
  };

  res.status(200).json(diagnostics);
}

