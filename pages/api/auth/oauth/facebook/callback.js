import { apiHandler } from '../../../../../middleware/api';
import { sendError } from '../../../../../api/helpers/response';
import { HTTP_STATUS } from '../../../../../constants';
import { config } from '../../../../../config';
import { registerOrLoginOAuthUser, createUserSession } from '../../../../../services/auth';

/**
 * Handle Facebook OAuth callback
 * Exchange code for token, get user info, create/login user
 */
async function facebookCallbackHandler(req, res) {
  const { code, state, error } = req.query;

  // Check for errors from Facebook
  if (error) {
    return res.redirect(`/login?error=${encodeURIComponent('OAuth authentication failed')}`);
  }

  if (!code || !state) {
    return res.redirect(`/login?error=${encodeURIComponent('Invalid OAuth response')}`);
  }

  // Verify state token (CSRF protection)
  // Parse cookies from header
  const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {}) || {};
  const cookieState = cookies.oauth_state;
  if (!cookieState || cookieState !== state) {
    return res.redirect(`/login?error=${encodeURIComponent('Invalid state token')}`);
  }

  // Clear state cookie
  res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');

  try {
    const { appId, appSecret } = config.oauth.facebook;
    const redirectUri = `${config.oauth.redirectBaseUrl}/api/auth/oauth/facebook/callback`;

    // Exchange authorization code for access token
    const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${encodeURIComponent(appId)}&` +
      `client_secret=${encodeURIComponent(appSecret)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `code=${encodeURIComponent(code)}`, {
      method: 'GET',
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Facebook token exchange error:', errorData);
      return res.redirect(`/login?error=${encodeURIComponent('Failed to exchange token')}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Get user info from Facebook
    const userInfoResponse = await fetch(`https://graph.facebook.com/v18.0/me?` +
      `fields=id,name,email,picture.width(200).height(200)&` +
      `access_token=${encodeURIComponent(access_token)}`, {
      method: 'GET',
    });

    if (!userInfoResponse.ok) {
      return res.redirect(`/login?error=${encodeURIComponent('Failed to get user info')}`);
    }

    const userInfo = await userInfoResponse.json();
    const { id: providerId, email, name, picture } = userInfo;

    if (!email) {
      return res.redirect(`/login?error=${encodeURIComponent('Email not provided by Facebook. Please grant email permission.')}`);
    }

    const avatarUrl = picture?.data?.url || null;

    // Register or login user
    const result = await registerOrLoginOAuthUser({
      provider: 'facebook',
      providerId,
      email,
      name: name || email.split('@')[0],
      avatarUrl,
    });

    // Create session
    const { sessionToken } = await createUserSession(result.user.id);

    // Save session token in cookie and redirect
    res.setHeader('Set-Cookie', `megapixelai_session=${sessionToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`);

    // Redirect to dashboard with success
    res.redirect('/dashboard?welcome=true');
  } catch (error) {
    console.error('Facebook OAuth callback error:', error);
    return res.redirect(`/login?error=${encodeURIComponent('Authentication error')}`);
  }
}

export default apiHandler(facebookCallbackHandler);

