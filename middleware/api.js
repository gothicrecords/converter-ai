/**
 * API Middleware
 * Reusable middleware functions for API routes
 */

import { HTTP_METHODS, HTTP_STATUS } from '../constants';
import { AuthenticationError, handleApiError } from '../errors';
import { getSession } from '../lib/db';
import { getServiceSupabase } from '../lib/supabase';

/**
 * Wrapper for API route handlers with error handling
 */
export function apiHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleApiError(error, res, {
        method: req.method,
        url: req.url,
        path: req.path,
        query: req.query,
        user: req.user?.id,
      });
    }
  };
}

/**
 * Middleware to check HTTP method
 * Returns a wrapper function that checks the method before calling the handler
 */
export function requireMethod(allowedMethods) {
  const methods = Array.isArray(allowedMethods) ? allowedMethods : [allowedMethods];
  
  return (handler) => {
    return async (req, res) => {
      if (!methods.includes(req.method)) {
        res.setHeader('Allow', methods.join(', '));
        return res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
          error: `Method ${req.method} not allowed. Allowed methods: ${methods.join(', ')}`,
          code: 'METHOD_NOT_ALLOWED',
        });
      }
      return handler(req, res);
    };
  };
}

/**
 * Middleware to require authentication (session-based)
 * Returns a wrapper function that checks authentication before calling the handler
 */
export function requireAuth(handler) {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        throw new AuthenticationError();
      }

      const token = authHeader.replace('Bearer ', '');
      const session = await getSession(token);

      if (!session) {
        throw new AuthenticationError('Invalid or expired session');
      }

      // Attach user to request
      req.user = {
        id: session.user_id,
        email: session.email,
        name: session.name,
        images_processed: session.images_processed,
        tools_used: session.tools_used,
        has_discount: session.has_discount,
        plan: session.plan,
      };

      return handler(req, res);
    } catch (error) {
      return handleApiError(error, res);
    }
  };
}

/**
 * Middleware to require authentication (Supabase-based)
 * Returns a wrapper function that checks authentication before calling the handler
 */
export function requireSupabaseAuth(handler) {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        throw new AuthenticationError();
      }

      const supabase = getServiceSupabase();
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        throw new AuthenticationError('Invalid token');
      }

      // Attach user to request
      req.user = user;

      return handler(req, res);
    } catch (error) {
      return handleApiError(error, res);
    }
  };
}

/**
 * Middleware to require specific user plan
 * Returns a wrapper function that checks plan before calling the handler
 */
export function requirePlan(requiredPlan) {
  return (handler) => {
    return async (req, res) => {
      if (!req.user) {
        return handleApiError(new AuthenticationError(), res);
      }

      const userPlan = req.user.plan || 'free';
      const planHierarchy = { free: 0, pro: 1, premium: 2 };
      
      if (planHierarchy[userPlan] < planHierarchy[requiredPlan]) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          error: `This feature requires a ${requiredPlan} plan`,
          code: 'PLAN_REQUIRED',
        });
      }

      return handler(req, res);
    };
  };
}

/**
 * Compose multiple middleware functions
 * Applies middleware from right to left (like function composition)
 */
export function composeMiddleware(...middlewares) {
  return (handler) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

