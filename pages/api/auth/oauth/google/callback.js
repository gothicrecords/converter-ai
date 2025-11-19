import { apiHandler } from '../../../../../middleware/api';
import { sendError, sendSuccess } from '../../../../../api/helpers/response';
import { HTTP_STATUS } from '../../../../../constants';
import { config } from '../../../../../config';
import { registerOrLoginOAuthUser, createUserSession } from '../../../../../services/auth';

/**
 * Handle Google OAuth callback
 * Exchange code for token, get user info, create/login user
 */
async function googleCallbackHandler(req, res) {
  const { code, state, error } = req.query;

  // Check for errors from Google
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
    const { clientId, clientSecret } = config.oauth.google;
    const redirectUri = `${config.oauth.redirectBaseUrl}/api/auth/oauth/google/callback`;

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Google token exchange error:', errorData);
      return res.redirect(`/login?error=${encodeURIComponent('Failed to exchange token')}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      return res.redirect(`/login?error=${encodeURIComponent('Failed to get user info')}`);
    }

    const userInfo = await userInfoResponse.json();
    const { id: providerId, email, name, picture: avatarUrl } = userInfo;

    if (!email) {
      return res.redirect(`/login?error=${encodeURIComponent('Email not provided by Google')}`);
    }

    // Register or login user
    const result = await registerOrLoginOAuthUser({
      provider: 'google',
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
    console.error('Google OAuth callback error:', error);
    return res.redirect(`/login?error=${encodeURIComponent('Authentication error')}`);
  }
}

export default apiHandler(googleCallbackHandler);

