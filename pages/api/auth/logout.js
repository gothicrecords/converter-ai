import { apiHandler, requireMethod } from '../../../middleware/api';
import { sendSuccess } from '../../../api/helpers/response';
import { logoutUser } from '../../../services/auth';
import { HTTP_METHODS } from '../../../constants';

async function logoutHandler(req, res) {
  const { sessionToken } = req.body;
  
  // Logout user (delete session)
  await logoutUser(sessionToken);

  sendSuccess(res, { message: 'Logged out successfully' });
}

// Export with middleware
export default apiHandler(
  requireMethod(HTTP_METHODS.POST)(logoutHandler)
);
