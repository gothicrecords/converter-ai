import { apiHandler } from '../../../../middleware/api';
import { sendError } from '../../../../api/helpers/response';
import { HTTP_STATUS } from '../../../../constants';
import { config } from '../../../../config';

/**
 * Initiate Facebook OAuth flow
 * Redirects user to Facebook OAuth consent screen
 */
async function facebookOAuthHandler(req, res) {
  const { appId, redirectBaseUrl } = config.oauth.facebook;
  
  if (!appId) {
    return sendError(res, 'Facebook OAuth not configured', HTTP_STATUS.SERVER_ERROR);
  }

  // Generate state token for CSRF protection
  const state = require('crypto').randomBytes(32).toString('hex');
  
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
  res.redirect(authUrl);
}

export default apiHandler(facebookOAuthHandler);

