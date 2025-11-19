/**
 * API Response Helpers
 * Standardized response formatting for API routes
 */

import { HTTP_STATUS } from '../../constants';

/**
 * Send success response
 */
export function sendSuccess(res, data = null, statusCode = HTTP_STATUS.OK) {
  const response = { success: true };
  
  if (data !== null) {
    if (typeof data === 'object' && !Array.isArray(data)) {
      Object.assign(response, data);
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function sendError(res, error, statusCode = null) {
  const code = statusCode || error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  
  const response = {
    success: false,
    error: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR',
  };

  if (error.details) {
    response.details = error.details;
  }

  return res.status(code).json(response);
}

/**
 * Send paginated response
 */
export function sendPaginated(res, data, pagination) {
  return sendSuccess(res, {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasMore: pagination.page * pagination.limit < pagination.total,
    },
  });
}

