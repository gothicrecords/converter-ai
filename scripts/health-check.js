/**
 * Quick health check
 * Usage: npm run health
 */

import diagnostics from '../lib/diagnostics.js';

async function main() {
  try {
    const health = await diagnostics.runAllChecks();
    
    console.log(JSON.stringify({
      status: health.overall,
      timestamp: health.timestamp,
      checks: Object.keys(health.checks).reduce((acc, key) => {
        acc[key] = health.checks[key].status;
        return acc;
      }, {}),
    }, null, 2));

    process.exit(health.overall === 'healthy' ? 0 : 1);
  } catch (error) {
    console.error(JSON.stringify({
      status: 'error',
      message: error.message,
    }, null, 2));
    process.exit(1);
  }
}

main();

