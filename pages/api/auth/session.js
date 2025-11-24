import { apiHandler, requireMethod } from '../../../middleware/api';
import { sendSuccess, sendError } from '../../../api/helpers/response';
import { HTTP_METHODS, HTTP_STATUS } from '../../../constants';
import { getSession } from '../../../lib/db';

/**
 * Get session token from HttpOnly cookie
 * This endpoint is used after OAuth redirect to sync the session token to localStorage
 */
async function getSessionHandler(req, res) {
  try {
    // Parse cookies from header
    const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = decodeURIComponent(value || '');
      return acc;
    }, {}) || {};
    
    const sessionToken = cookies.megapixelai_session;
    
    if (!sessionToken) {
      return sendError(res, 'No session found', HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Verify session exists and is valid
    const session = await getSession(sessionToken);
    if (!session) {
      return sendError(res, 'Invalid session', HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Return session token (client will save it to localStorage)
    return sendSuccess(res, {
      sessionToken,
      user: {
        id: session.user_id,
        email: session.email,
        name: session.name,
      }
    });
  } catch (error) {
    console.error('Get session error:', error);
    return sendError(res, 'Failed to get session', HTTP_STATUS.SERVER_ERROR);
  }
}

export default apiHandler(
  requireMethod(HTTP_METHODS.GET)(getSessionHandler)
);

