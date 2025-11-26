import { config } from '../../../../config';
import crypto from 'crypto';

/**
 * Initiate Google OAuth flow
 * Redirects user to Google OAuth consent screen
 * Note: This handler doesn't use apiHandler because it needs to redirect, not return JSON
 */
export default async function googleOAuthHandler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).redirect(`/login?error=${encodeURIComponent('Method not allowed')}`);
  }

  try {
    // Check OAuth configuration
    const { clientId } = config.oauth?.google || {};
    const redirectBaseUrl = config.oauth?.redirectBaseUrl;
    
    if (!clientId) {
      console.error('Google OAuth not configured: missing clientId');
      return res.redirect(`/login?error=${encodeURIComponent('OAuth not configured')}`);
    }

    if (!redirectBaseUrl) {
      console.error('Google OAuth not configured: missing redirectBaseUrl');
      return res.redirect(`/login?error=${encodeURIComponent('OAuth not configured')}`);
    }

    // Generate state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in session/cookie (simplified - in production use secure session)
    res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`);

    // Google OAuth 2.0 authorization URL
    const redirectUri = `${redirectBaseUrl}/api/auth/oauth/google/callback`;
    const scope = 'openid email profile';
    const responseType = 'code';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${responseType}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;

    // Redirect to Google
    return res.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return res.redirect(`/login?error=${encodeURIComponent('Failed to initiate OAuth')}`);
  }
}

