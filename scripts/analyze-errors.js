/**
 * Analyze error patterns and provide insights
 * Usage: npm run error:analyze
 */

import errorTracker from '../lib/errorTracker.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🔍 Analyzing errors...\n');

  try {
    const stats = errorTracker.getStats();

    console.log('📊 ERROR ANALYSIS');
    console.log('='.repeat(60));
    console.log(`Total Errors Tracked: ${stats.totalErrors}`);
    console.log(`Unique Error Types: ${stats.uniqueErrors}\n`);

    // Errors by type
    console.log('📈 ERRORS BY TYPE');
    console.log('-'.repeat(60));
    const types = Object.entries(stats.errorsByType)
      .sort((a, b) => b[1] - a[1]);
    
    types.forEach(([type, count]) => {
      const percentage = ((count / stats.totalErrors) * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(percentage / 2));
      console.log(`${type.padEnd(20)} ${count.toString().padStart(5)} (${percentage}%) ${bar}`);
    });
    console.log('');

    // Errors by severity
    console.log('⚠️ ERRORS BY SEVERITY');
    console.log('-'.repeat(60));
    const severities = Object.entries(stats.errorsBySeverity)
      .sort((a, b) => {
        const order = { high: 3, medium: 2, low: 1 };
        return (order[b[0]] || 0) - (order[a[0]] || 0);
      });
    
    severities.forEach(([severity, count]) => {
      const icon = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢';
      const percentage = ((count / stats.totalErrors) * 100).toFixed(1);
      console.log(`${icon} ${severity.toUpperCase().padEnd(10)} ${count.toString().padStart(5)} (${percentage}%)`);
    });
    console.log('');

    // Top errors
    console.log('🔝 TOP 10 ERRORS');
    console.log('-'.repeat(60));
    stats.topErrors.forEach((err, idx) => {
      console.log(`${(idx + 1).toString().padStart(2)}. ${err.error}`);
      console.log(`    Occurrences: ${err.count}`);
      console.log('');
    });

    // Recent high severity errors
    const highSeverity = stats.recentErrors.filter(e => e.pattern?.severity === 'high');
    if (highSeverity.length > 0) {
      console.log('🚨 RECENT HIGH SEVERITY ERRORS');
      console.log('-'.repeat(60));
      highSeverity.slice(-5).forEach(err => {
        console.log(`Time: ${err.timestamp}`);
        console.log(`Error: ${err.error.message}`);
        console.log(`Type: ${err.pattern?.type}`);
        console.log(`Solution: ${err.pattern?.solution || 'N/A'}`);
        console.log('');
      });
    }

    // Try to read from persistent storage
    const errorDbPath = path.join(process.cwd(), 'logs', 'errors.db.json');
    try {
      const data = await fs.readFile(errorDbPath, 'utf-8');
      const errors = JSON.parse(data);
      console.log(`💾 Persistent storage: ${errors.length} errors stored`);
    } catch (e) {
      console.log('💾 Persistent storage: Not available');
    }

  } catch (error) {
    console.error('❌ Error analysis failed:', error.message);
    process.exit(1);
  }
}

main();

