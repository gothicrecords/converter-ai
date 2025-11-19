/**
 * Enhanced Diagnostics API Endpoint
 * Provides comprehensive system diagnostics and health checks
 */

import diagnostics from '../../lib/diagnostics.js';
import errorTracker from '../../lib/errorTracker.js';
import { handleApiError } from '../../errors/index.js';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type = 'full' } = req.query;

    let result;

    switch (type) {
      case 'health':
        // Quick health check
        const health = await diagnostics.runAllChecks();
        result = {
          status: health.overall,
          timestamp: health.timestamp,
          checks: Object.keys(health.checks).reduce((acc, key) => {
            acc[key] = {
              status: health.checks[key].status,
              message: health.checks[key].message,
            };
            return acc;
          }, {}),
        };
        break;

      case 'errors':
        // Error statistics
        const stats = errorTracker.getStats();
        result = {
          timestamp: new Date().toISOString(),
          ...stats,
        };
        break;

      case 'system':
        // System information only
        const systemInfo = await diagnostics.getSystemInfo();
        result = {
          timestamp: new Date().toISOString(),
          system: systemInfo,
        };
        break;

      case 'full':
      default:
        // Full diagnostics
        result = await diagnostics.getFullDiagnostics();
        break;
    }

    // Add cache headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).json(result);
  } catch (error) {
    return handleApiError(error, res, {
      endpoint: '/api/diagnostics-enhanced',
      method: req.method,
    });
  }
}

