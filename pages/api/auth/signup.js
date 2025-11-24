import { apiHandler, requireMethod } from '../../../middleware/api';
import { sendSuccess } from '../../../api/helpers/response';
import { registerUser } from '../../../services/auth';
import { HTTP_METHODS, HTTP_STATUS } from '../../../constants';

async function signupHandler(req, res) {
  // Check method explicitly
  if (req.method !== 'POST' && req.method !== HTTP_METHODS.POST) {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Allowed methods: POST`,
      code: 'METHOD_NOT_ALLOWED',
    });
  }

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
export default apiHandler(signupHandler);
