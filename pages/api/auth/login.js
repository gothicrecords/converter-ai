import { apiHandler, requireMethod } from '../../../middleware/api';
import { sendSuccess } from '../../../api/helpers/response';
import { authenticateUser } from '../../../services/auth';
import { HTTP_METHODS } from '../../../constants';

async function loginHandler(req, res) {
  const { email, password } = req.body;

  // Authenticate user (validation happens inside service)
  const result = await authenticateUser({ email, password });

  // Send success response
  sendSuccess(res, {
    user: result.user,
    sessionToken: result.sessionToken,
  });
}

// Export with middleware
export default apiHandler(
  requireMethod(HTTP_METHODS.POST)(loginHandler)
);
