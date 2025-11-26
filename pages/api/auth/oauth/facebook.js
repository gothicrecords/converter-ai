import { config } from '../../../../config';
import crypto from 'crypto';

/**
 * Initiate Facebook OAuth flow
 * Redirects user to Facebook OAuth consent screen
 * Note: This handler doesn't use apiHandler because it needs to redirect, not return JSON
 */
export default async function facebookOAuthHandler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).redirect(`/login?error=${encodeURIComponent('Method not allowed')}`);
  }

  try {
    // Check OAuth configuration
    const { appId } = config.oauth?.facebook || {};
    const redirectBaseUrl = config.oauth?.redirectBaseUrl;
    
    if (!appId) {
      console.error('Facebook OAuth not configured: missing appId');
      return res.redirect(`/login?error=${encodeURIComponent('OAuth not configured')}`);
    }

    if (!redirectBaseUrl) {
      console.error('Facebook OAuth not configured: missing redirectBaseUrl');
      return res.redirect(`/login?error=${encodeURIComponent('OAuth not configured')}`);
    }

    // Generate state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in cookie
    res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`);

    // Facebook OAuth 2.0 authorization URL
    const redirectUri = `${redirectBaseUrl}/api/auth/oauth/facebook/callback`;
    const scope = 'email,public_profile';
    const responseType = 'code';
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${encodeURIComponent(appId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${responseType}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;

    // Redirect to Facebook
    return res.redirect(authUrl);
  } catch (error) {
    console.error('Facebook OAuth initiation error:', error);
    return res.redirect(`/login?error=${encodeURIComponent('Failed to initiate OAuth')}`);
  }
}

