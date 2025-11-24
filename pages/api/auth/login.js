import { apiHandler, requireMethod } from '../../../middleware/api';
import { sendSuccess } from '../../../api/helpers/response';
import { authenticateUser } from '../../../services/auth';
import { HTTP_METHODS } from '../../../constants';

async function loginHandler(req, res) {
  // Check method explicitly
  if (req.method !== 'POST' && req.method !== HTTP_METHODS.POST) {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Allowed methods: POST`,
      code: 'METHOD_NOT_ALLOWED',
    });
  }

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
export default apiHandler(loginHandler);
