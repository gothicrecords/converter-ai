import { apiHandler, requireMethod } from '../../../middleware/api';
import { sendSuccess } from '../../../api/helpers/response';
import { registerUser } from '../../../services/auth';
import { HTTP_METHODS, HTTP_STATUS } from '../../../constants';

async function signupHandler(req, res) {
  const { name, email, password } = req.body;

  // Register user (validation happens inside service)
  const result = await registerUser({ name, email, password });

  // Send success response with 201 status
  sendSuccess(res, {
    user: result.user,
    sessionToken: result.sessionToken,
  }, HTTP_STATUS.CREATED);
}

// Export with middleware
export default apiHandler(
  requireMethod(HTTP_METHODS.POST)(signupHandler)
);
