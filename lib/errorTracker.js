/**
 * Advanced Error Tracking and Analysis System
 * Tracks errors, analyzes patterns, and provides actionable insights
 */

import { log } from './logger.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ERROR_DB_PATH = path.join(process.cwd(), 'logs', 'errors.db.json');

// Error patterns and solutions database
const ERROR_PATTERNS = {
  // Database errors
  'ECONNREFUSED': {
    type: 'database',
    severity: 'high',
    solution: 'Check database connection settings and ensure database is running',
    autoFix: false,
  },
  'ETIMEDOUT': {
    type: 'network',
    severity: 'medium',
    solution: 'Check network connectivity and timeout settings',
    autoFix: false,
  },
  'ENOENT': {
    type: 'filesystem',
    severity: 'medium',
    solution: 'File or directory not found. Check file paths and permissions',
    autoFix: true,
  },
  'EACCES': {
    type: 'permission',
    severity: 'high',
    solution: 'Permission denied. Check file/directory permissions',
    autoFix: false,
  },
  'EMFILE': {
    type: 'resource',
    severity: 'high',
    solution: 'Too many open files. Increase ulimit or close file handles',
    autoFix: false,
  },
  'LIMIT_FILE_SIZE': {
    type: 'validation',
    severity: 'low',
    solution: 'File size exceeds limit. Check file size validation',
    autoFix: false,
  },
  'VALIDATION_ERROR': {
    type: 'validation',
    severity: 'low',
    solution: 'Input validation failed. Check input data format',
    autoFix: false,
  },
  'AUTHENTICATION_ERROR': {
    type: 'auth',
    severity: 'medium',
    solution: 'Authentication required. Check user session and tokens',
    autoFix: false,
  },
};

class ErrorTracker {
  constructor() {
    this.errorCounts = new Map();
    this.errorHistory = [];
    this.maxHistorySize = 1000;
  }

  /**
   * Track an error with full context
   */
  async trackError(error, context = {}) {
    const errorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
        statusCode: error.statusCode,
      },
      context: {
        ...context,
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
      },
      pattern: this.analyzeErrorPattern(error),
      frequency: 1,
    };

    // Update error counts
    const errorKey = this.getErrorKey(error);
    const currentCount = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, currentCount + 1);
    errorInfo.frequency = currentCount + 1;

    // Add to history
    this.errorHistory.push(errorInfo);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Log error
    log.error('Error Tracked', error, {
      errorId: errorInfo.id,
      pattern: errorInfo.pattern,
      frequency: errorInfo.frequency,
      ...context,
    });

    // Save to persistent storage
    await this.saveErrorToDB(errorInfo);

    // Check if error needs immediate attention
    if (this.shouldAlert(errorInfo)) {
      await this.sendAlert(errorInfo);
    }

    return errorInfo;
  }

  /**
   * Analyze error pattern and suggest solution
   */
  analyzeErrorPattern(error) {
    const pattern = {
      type: 'unknown',
      severity: 'low',
      solution: null,
      autoFixable: false,
      similarErrors: [],
    };

    // Check error code
    if (error.code && ERROR_PATTERNS[error.code]) {
      const match = ERROR_PATTERNS[error.code];
      pattern.type = match.type;
      pattern.severity = match.severity;
      pattern.solution = match.solution;
      pattern.autoFixable = match.autoFix;
    }

    // Check error message for patterns
    if (error.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('timeout')) {
        pattern.type = 'timeout';
        pattern.severity = 'medium';
        pattern.solution = 'Operation timed out. Consider increasing timeout or optimizing operation';
      } else if (message.includes('memory')) {
        pattern.type = 'memory';
        pattern.severity = 'high';
        pattern.solution = 'Memory issue detected. Check memory usage and optimize';
      } else if (message.includes('permission') || message.includes('access')) {
        pattern.type = 'permission';
        pattern.severity = 'high';
        pattern.solution = 'Permission issue. Check file/directory permissions';
      }
    }

    // Find similar errors
    pattern.similarErrors = this.findSimilarErrors(error);

    return pattern;
  }

  /**
   * Find similar errors in history
   */
  findSimilarErrors(error, limit = 5) {
    return this.errorHistory
      .filter(e => {
        // Similar if same error name or similar message
        return e.error.name === error.name ||
               (e.error.message && error.message && 
                this.similarity(e.error.message, error.message) > 0.7);
      })
      .slice(-limit)
      .map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        message: e.error.message,
      }));
  }

  /**
   * Calculate string similarity (simple Jaccard similarity)
   */
  similarity(str1, str2) {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error key for counting
   */
  getErrorKey(error) {
    return `${error.name || 'Error'}:${error.code || 'NO_CODE'}:${error.message?.substring(0, 50) || 'NO_MESSAGE'}`;
  }

  /**
   * Check if error should trigger alert
   */
  shouldAlert(errorInfo) {
    // Alert if high severity
    if (errorInfo.pattern.severity === 'high') {
      return true;
    }

    // Alert if error frequency is high
    if (errorInfo.frequency > 10) {
      return true;
    }

    // Alert if same error occurred multiple times in short period
    const recentSimilar = this.errorHistory
      .filter(e => 
        e.error.name === errorInfo.error.name &&
        new Date(e.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      ).length;

    return recentSimilar > 5;
  }

  /**
   * Send alert for critical errors
   */
  async sendAlert(errorInfo) {
    log.warn('Error Alert Triggered', {
      errorId: errorInfo.id,
      severity: errorInfo.pattern.severity,
      frequency: errorInfo.frequency,
      solution: errorInfo.pattern.solution,
    });

    // In production, you could send to monitoring service
    // Example: Sentry, PagerDuty, Slack, etc.
    if (process.env.ERROR_ALERT_WEBHOOK) {
      try {
        await fetch(process.env.ERROR_ALERT_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: errorInfo.error,
            pattern: errorInfo.pattern,
            frequency: errorInfo.frequency,
            timestamp: errorInfo.timestamp,
          }),
        });
      } catch (e) {
        log.error('Failed to send error alert', e);
      }
    }
  }

  /**
   * Save error to persistent database
   */
  async saveErrorToDB(errorInfo) {
    try {
      // Ensure logs directory exists
      const logsDir = path.dirname(ERROR_DB_PATH);
      await fs.mkdir(logsDir, { recursive: true });

      // Read existing errors
      let errors = [];
      try {
        const data = await fs.readFile(ERROR_DB_PATH, 'utf-8');
        errors = JSON.parse(data);
      } catch (e) {
        // File doesn't exist or is invalid, start fresh
      }

      // Add new error
      errors.push(errorInfo);

      // Keep only last 10000 errors
      if (errors.length > 10000) {
        errors = errors.slice(-10000);
      }

      // Write back
      await fs.writeFile(ERROR_DB_PATH, JSON.stringify(errors, null, 2));
    } catch (e) {
      log.error('Failed to save error to DB', e);
    }
  }

  /**
   * Get error statistics
   */
  getStats() {
    const stats = {
      totalErrors: this.errorHistory.length,
      uniqueErrors: this.errorCounts.size,
      errorsByType: {},
      errorsBySeverity: {},
      recentErrors: this.errorHistory.slice(-10),
      topErrors: Array.from(this.errorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([key, count]) => ({ error: key, count })),
    };

    // Count by type
    this.errorHistory.forEach(e => {
      const type = e.pattern.type;
      stats.errorsByType[type] = (stats.errorsByType[type] || 0) + 1;
    });

    // Count by severity
    this.errorHistory.forEach(e => {
      const severity = e.pattern.severity;
      stats.errorsBySeverity[severity] = (stats.errorsBySeverity[severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get errors by pattern
   */
  getErrorsByPattern(patternType) {
    return this.errorHistory.filter(e => e.pattern.type === patternType);
  }

  /**
   * Clear error history
   */
  clearHistory() {
    this.errorHistory = [];
    this.errorCounts.clear();
  }
}

// Singleton instance
const errorTracker = new ErrorTracker();

export default errorTracker;

