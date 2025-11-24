import { config } from '../../config';

/**
 * Health check and configuration diagnostic endpoint
 * Shows if OAuth and other services are properly configured
 * DO NOT expose in production (remove or protect with auth)
 */
export default function handler(req, res) {
  const diagnostics = {
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
