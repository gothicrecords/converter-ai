/**
 * Run comprehensive diagnostics
 * Usage: npm run diagnostics
 */

import diagnostics from '../lib/diagnostics.js';
import { log } from '../lib/logger.js';

async function main() {
  console.log('🔍 Running comprehensive diagnostics...\n');

  try {
    const report = await diagnostics.getFullDiagnostics();

    console.log('📊 DIAGNOSTICS REPORT');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Overall Health: ${report.health.overall.toUpperCase()}`);
    console.log(`Duration: ${report.health.duration}ms\n`);

    // System Information
    console.log('💻 SYSTEM INFORMATION');
    console.log('-'.repeat(60));
    if (report.health.system) {
      const sys = report.health.system;
      console.log(`Platform: ${sys.platform} (${sys.arch})`);
      console.log(`Node Version: ${sys.nodeVersion}`);
      console.log(`Uptime: ${sys.uptime}`);
      console.log(`CPU: ${sys.cpu?.cores} cores - ${sys.cpu?.model}`);
      console.log(`Memory: ${sys.memory?.used} / ${sys.memory?.total} (${sys.memory?.usagePercent} used)`);
      console.log(`Environment: ${sys.environment}`);
    }
    console.log('');

    // Health Checks
    console.log('🏥 HEALTH CHECKS');
    console.log('-'.repeat(60));
    for (const [name, check] of Object.entries(report.health.checks)) {
      if (name === 'system') continue;
      
      const status = check.status || 'unknown';
      const icon = status === 'healthy' ? '✅' : status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${name.toUpperCase()}: ${status.toUpperCase()}`);
      if (check.message) {
        console.log(`   ${check.message}`);
      }
      if (check.duration) {
        console.log(`   Duration: ${check.duration}`);
      }
      if (check.data && Object.keys(check.data).length > 0) {
        console.log(`   Data: ${JSON.stringify(check.data, null, 2).split('\n').join('\n   ')}`);
      }
      console.log('');
    }

    // Error Statistics
    console.log('📈 ERROR STATISTICS');
    console.log('-'.repeat(60));
    if (report.errorStats) {
      const stats = report.errorStats;
      console.log(`Total Errors: ${stats.totalErrors}`);
      console.log(`Unique Errors: ${stats.uniqueErrors}`);
      console.log(`Errors by Type: ${JSON.stringify(stats.errorsByType, null, 2)}`);
      console.log(`Errors by Severity: ${JSON.stringify(stats.errorsBySeverity, null, 2)}`);
      
      if (stats.topErrors.length > 0) {
        console.log('\nTop Errors:');
        stats.topErrors.forEach((err, idx) => {
          console.log(`  ${idx + 1}. ${err.error} (${err.count} times)`);
        });
      }
    }
    console.log('');

    // Recommendations
    console.log('💡 RECOMMENDATIONS');
    console.log('-'.repeat(60));
    if (report.recommendations && report.recommendations.length > 0) {
      report.recommendations.forEach((rec, idx) => {
        const icon = rec.severity === 'high' ? '🔴' : rec.severity === 'medium' ? '🟡' : '🟢';
        console.log(`${icon} ${idx + 1}. ${rec.message}`);
        console.log(`   Action: ${rec.action}`);
        console.log('');
      });
    } else {
      console.log('✅ No recommendations at this time.\n');
    }

    // Exit code based on health
    const exitCode = report.health.overall === 'healthy' ? 0 : 
                     report.health.overall === 'degraded' ? 1 : 2;
    
    process.exit(exitCode);
  } catch (error) {
    log.error('Diagnostics failed', error);
    console.error('❌ Failed to run diagnostics:', error.message);
    process.exit(1);
  }
}

main();

