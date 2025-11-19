import { apiHandler } from '../../../../middleware/api';
import { sendError } from '../../../../api/helpers/response';
import { HTTP_STATUS } from '../../../../constants';
import { config } from '../../../../config';

/**
 * Initiate Google OAuth flow
 * Redirects user to Google OAuth consent screen
 */
async function googleOAuthHandler(req, res) {
  const { clientId, redirectBaseUrl } = config.oauth.google;
  
  if (!clientId) {
    return sendError(res, 'Google OAuth not configured', HTTP_STATUS.SERVER_ERROR);
  }

  // Generate state token for CSRF protection
  const state = require('crypto').randomBytes(32).toString('hex');
  
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
  res.redirect(authUrl);
}

export default apiHandler(googleOAuthHandler);

