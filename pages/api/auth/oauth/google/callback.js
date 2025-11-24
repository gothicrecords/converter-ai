import { config } from '../../../../../config';
import { registerOrLoginOAuthUser, createUserSession } from '../../../../../services/auth';

/**
 * Handle Google OAuth callback
 * Exchange code for token, get user info, create/login user
 * Note: This handler doesn't use apiHandler because it needs to redirect, not return JSON
 */
export default async function googleCallbackHandler(req, res) {
  // Only allow GET requests (OAuth callbacks are GET)
  if (req.method !== 'GET') {
    return res.status(405).redirect(`/login?error=${encodeURIComponent('Method not allowed')}`);
  }

  try {
    const { code, state, error } = req.query;

    // Check for errors from Google
    if (error) {
      console.error('Google OAuth error:', error);
      return res.redirect(`/login?error=${encodeURIComponent('OAuth authentication failed')}`);
    }

    if (!code || !state) {
      console.error('Missing code or state in OAuth callback');
      return res.redirect(`/login?error=${encodeURIComponent('Invalid OAuth response')}`);
    }

    // Verify state token (CSRF protection)
    // Parse cookies from header
    const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = decodeURIComponent(value || '');
      return acc;
    }, {}) || {};
    const cookieState = cookies.oauth_state;
    
    if (!cookieState || cookieState !== state) {
      console.error('Invalid state token:', { cookieState, state });
      return res.redirect(`/login?error=${encodeURIComponent('Invalid state token')}`);
    }

    // Clear state cookie
    res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');

    // Check OAuth configuration
    const { clientId, clientSecret } = config.oauth.google || {};
    if (!clientId || !clientSecret) {
      console.error('Google OAuth not configured');
      return res.redirect(`/login?error=${encodeURIComponent('OAuth not configured')}`);
    }

    const redirectUri = `${config.oauth.redirectBaseUrl}/api/auth/oauth/google/callback`;

    // Exchange authorization code for access token
    let tokenResponse;
    try {
      tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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
    } catch (fetchError) {
      console.error('Failed to fetch token from Google:', fetchError);
      return res.redirect(`/login?error=${encodeURIComponent('Failed to connect to Google')}`);
    }

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Google token exchange error:', errorData);
      return res.redirect(`/login?error=${encodeURIComponent('Failed to exchange token')}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    if (!access_token) {
      console.error('No access token in response:', tokenData);
      return res.redirect(`/login?error=${encodeURIComponent('No access token received')}`);
    }

    // Get user info from Google
    let userInfoResponse;
    try {
      userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
    } catch (fetchError) {
      console.error('Failed to fetch user info from Google:', fetchError);
      return res.redirect(`/login?error=${encodeURIComponent('Failed to get user info')}`);
    }

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('Google user info error:', errorText);
      return res.redirect(`/login?error=${encodeURIComponent('Failed to get user info')}`);
    }

    const userInfo = await userInfoResponse.json();
    const { id: providerId, email, name, picture: avatarUrl } = userInfo;

    if (!email) {
      console.error('No email in user info:', userInfo);
      return res.redirect(`/login?error=${encodeURIComponent('Email not provided by Google')}`);
    }

    if (!providerId) {
      console.error('No provider ID in user info:', userInfo);
      return res.redirect(`/login?error=${encodeURIComponent('User ID not provided by Google')}`);
    }

    // Register or login user
    let result;
    try {
      console.log('Attempting to register/login OAuth user:', {
        provider: 'google',
        providerId: String(providerId),
        email,
        name: name || email.split('@')[0],
      });
      
      result = await registerOrLoginOAuthUser({
        provider: 'google',
        providerId: String(providerId),
        email,
        name: name || email.split('@')[0],
        avatarUrl: avatarUrl || null,
      });
      
      console.log('registerOrLoginOAuthUser result:', {
        hasUser: !!result?.user,
        userId: result?.user?.id,
        hasSessionToken: !!result?.sessionToken,
      });
    } catch (authError) {
      console.error('Error in registerOrLoginOAuthUser:', {
        error: authError.message,
        stack: authError.stack,
        name: authError.name,
      });
      return res.redirect(`/login?error=${encodeURIComponent(`Failed to create user: ${authError.message || 'Unknown error'}`)}`);
    }

    if (!result || !result.user) {
      console.error('Invalid result from registerOrLoginOAuthUser:', result);
      return res.redirect(`/login?error=${encodeURIComponent('Failed to authenticate')}`);
    }

    // Use session token from registerOrLoginOAuthUser (it already creates the session)
    let sessionToken = result.sessionToken;
    
    if (!sessionToken) {
      console.error('No session token in result, creating manually:', result);
      // Try to create session manually as fallback
      try {
        const sessionResult = await createUserSession(result.user.id);
        sessionToken = sessionResult.sessionToken;
        console.log('Created session manually:', !!sessionToken);
      } catch (sessionError) {
        console.error('Error creating session manually:', sessionError);
        return res.redirect(`/login?error=${encodeURIComponent('Failed to create session')}`);
      }
    }
    
    if (!sessionToken) {
      console.error('No session token available after all attempts');
      return res.redirect(`/login?error=${encodeURIComponent('Failed to create session')}`);
    }

    // Save session token in cookie and redirect
    const cookieMaxAge = 7 * 24 * 60 * 60; // 7 days
    res.setHeader('Set-Cookie', `megapixelai_session=${sessionToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${cookieMaxAge}`);

    // Redirect to dashboard with success
    return res.redirect('/dashboard?welcome=true');
  } catch (error) {
    console.error('Google OAuth callback unexpected error:', error);
    return res.redirect(`/login?error=${encodeURIComponent('Authentication error')}`);
  }
}

