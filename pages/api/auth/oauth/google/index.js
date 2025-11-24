import { config } from '../../../../../config';
import crypto from 'crypto';

/**
 * Initiate Google OAuth flow
 * Redirects user to Google consent screen with state token for CSRF protection
 */
export default async function googleOAuthInitHandler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).redirect('/login?error=' + encodeURIComponent('Method not allowed'));
  }

  try {
    // Check OAuth configuration
    const { clientId } = config.oauth.google || {};
    if (!clientId) {
      console.error('Google OAuth client ID not configured');
      return res.redirect('/login?error=' + encodeURIComponent('OAuth not configured'));
    }

    const redirectUri = `${config.oauth.redirectBaseUrl}/api/auth/oauth/google/callback`;

    // Generate and store state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Set state cookie (expires in 10 minutes)
    res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`);

    // Build Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('state', state);
    googleAuthUrl.searchParams.set('access_type', 'online');
    googleAuthUrl.searchParams.set('prompt', 'select_account');

    console.log('Redirecting to Google OAuth:', {
      clientId: clientId.substring(0, 20) + '...',
      redirectUri,
      state: state.substring(0, 16) + '...'
    });

    // Redirect to Google
    return res.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error('Google OAuth init error:', error);
    return res.redirect('/login?error=' + encodeURIComponent('Failed to initiate OAuth'));
  }
}
