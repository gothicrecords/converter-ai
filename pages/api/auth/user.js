import { apiHandler, requireMethod, requireAuth, composeMiddleware } from '../../../middleware/api';
import { sendSuccess } from '../../../api/helpers/response';
import { HTTP_METHODS } from '../../../constants';

async function getUserHandler(req, res) {
  // User is already attached to req by requireAuth middleware
  sendSuccess(res, {
    user: req.user,
  });
}

// Export with middleware: method check + authentication
export default apiHandler(
  composeMiddleware(
    requireMethod(HTTP_METHODS.GET),
    requireAuth
  )(getUserHandler)
);
