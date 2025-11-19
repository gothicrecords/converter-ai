/**
 * Advanced Diagnostics System
 * Comprehensive health checks, system analysis, and automated problem detection
 */

import { log } from './logger.js';
import errorTracker from './errorTracker.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DiagnosticsSystem {
  constructor() {
    this.checks = new Map();
    this.healthStatus = {
      overall: 'unknown',
      checks: {},
      timestamp: null,
      system: {},
    };
  }

  /**
   * Register a health check
   */
  registerCheck(name, checkFunction, options = {}) {
    this.checks.set(name, {
      fn: checkFunction,
      critical: options.critical !== false,
      interval: options.interval || 60000, // Default 1 minute
      timeout: options.timeout || 5000,
      lastRun: null,
      lastResult: null,
    });
  }

  /**
   * Run all health checks
   */
  async runAllChecks() {
    const results = {};
    const startTime = Date.now();

    // System information
    results.system = await this.getSystemInfo();

    // Run all registered checks
    for (const [name, check] of this.checks.entries()) {
      try {
        const result = await this.runCheck(name, check);
        results[name] = result;
      } catch (error) {
        log.error(`Health check failed: ${name}`, error);
        results[name] = {
          status: 'error',
          message: error.message,
          error: error.name,
        };
      }
    }

    // Determine overall health
    const criticalChecks = Array.from(this.checks.entries())
      .filter(([_, check]) => check.critical)
      .map(([name]) => name);

    const criticalFailed = criticalChecks.some(name => 
      results[name]?.status === 'error' || results[name]?.status === 'unhealthy'
    );

    const overallStatus = criticalFailed ? 'unhealthy' : 
                         Object.values(results).some(r => r?.status === 'warning') ? 'degraded' : 
                         'healthy';

    this.healthStatus = {
      overall: overallStatus,
      checks: results,
      timestamp: new Date().toISOString(),
      system: results.system,
      duration: Date.now() - startTime,
    };

    return this.healthStatus;
  }

  /**
   * Run a single health check
   */
  async runCheck(name, check) {
    const startTime = Date.now();
    
    try {
      // Run check with timeout
      const result = await Promise.race([
        check.fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Check timeout')), check.timeout)
        ),
      ]);

      const duration = Date.now() - startTime;
      check.lastRun = new Date();
      check.lastResult = result;

      return {
        status: result.status || 'healthy',
        message: result.message,
        data: result.data,
        duration: `${duration}ms`,
        timestamp: check.lastRun.toISOString(),
      };
    } catch (error) {
      check.lastRun = new Date();
      check.lastResult = { status: 'error', error: error.message };

      return {
        status: 'error',
        message: error.message,
        duration: `${Date.now() - startTime}ms`,
        timestamp: check.lastRun.toISOString(),
      };
    }
  }

  /**
   * Get system information
   */
  async getSystemInfo() {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: `${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`,
      cpu: {
        model: cpus[0]?.model || 'Unknown',
        cores: cpus.length,
        usage: process.cpuUsage(),
      },
      memory: {
        total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)}GB`,
        free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)}GB`,
        used: `${(usedMem / 1024 / 1024 / 1024).toFixed(2)}GB`,
        usagePercent: `${((usedMem / totalMem) * 100).toFixed(2)}%`,
      },
      loadAverage: os.loadavg(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Check database connectivity
   */
  async checkDatabase() {
    try {
      // Try to import and check database connection
      const { createClient } = await import('@supabase/supabase-js');
      
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return {
          status: 'warning',
          message: 'Database credentials not configured',
        };
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      // Simple query to test connection
      const { error } = await supabase.from('_health_check').select('1').limit(1);
      
      // If table doesn't exist, that's ok - connection works
      if (error && error.code !== 'PGRST116') {
        return {
          status: 'unhealthy',
          message: `Database connection failed: ${error.message}`,
        };
      }

      return {
        status: 'healthy',
        message: 'Database connection successful',
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Database check failed: ${error.message}`,
      };
    }
  }

  /**
   * Check file system
   */
  async checkFileSystem() {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const logsDir = path.join(process.cwd(), 'logs');
      const tmpDir = path.join(process.cwd(), 'tmp');

      const dirs = [uploadsDir, logsDir, tmpDir];
      const results = {};

      for (const dir of dirs) {
        try {
          await fs.access(dir);
          const stats = await fs.stat(dir);
          results[path.basename(dir)] = {
            exists: true,
            writable: true,
            isDirectory: stats.isDirectory(),
          };
        } catch (error) {
          if (error.code === 'ENOENT') {
            // Try to create directory
            try {
              await fs.mkdir(dir, { recursive: true });
              results[path.basename(dir)] = {
                exists: true,
                writable: true,
                created: true,
              };
            } catch (createError) {
              results[path.basename(dir)] = {
                exists: false,
                writable: false,
                error: createError.message,
              };
            }
          } else {
            results[path.basename(dir)] = {
              exists: false,
              writable: false,
              error: error.message,
            };
          }
        }
      }

      const hasErrors = Object.values(results).some(r => !r.exists || !r.writable);

      return {
        status: hasErrors ? 'warning' : 'healthy',
        message: hasErrors ? 'Some directories have issues' : 'File system healthy',
        data: results,
      };
    } catch (error) {
      return {
        status: 'error',
        message: `File system check failed: ${error.message}`,
      };
    }
  }

  /**
   * Check environment variables
   */
  async checkEnvironment() {
    const required = [
      'NODE_ENV',
    ];

    const optional = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'STRIPE_SECRET_KEY',
      'HF_API_TOKEN',
    ];

    const missing = required.filter(key => !process.env[key]);
    const configured = optional.filter(key => process.env[key]);

    return {
      status: missing.length > 0 ? 'warning' : 'healthy',
      message: missing.length > 0 
        ? `Missing required environment variables: ${missing.join(', ')}`
        : 'Environment variables configured',
      data: {
        required: {
          total: required.length,
          configured: required.length - missing.length,
          missing,
        },
        optional: {
          total: optional.length,
          configured: configured.length,
          configuredKeys: configured,
        },
      },
    };
  }

  /**
   * Check error statistics
   */
  async checkErrors() {
    try {
      const stats = errorTracker.getStats();
      const recentErrors = stats.recentErrors.filter(e => {
        const errorTime = new Date(e.timestamp);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return errorTime > fiveMinutesAgo;
      });

      const highSeverityErrors = stats.recentErrors.filter(e => 
        e.pattern?.severity === 'high'
      );

      let status = 'healthy';
      let message = 'No recent errors';

      if (highSeverityErrors.length > 0) {
        status = 'unhealthy';
        message = `${highSeverityErrors.length} high severity errors in last 5 minutes`;
      } else if (recentErrors.length > 10) {
        status = 'warning';
        message = `${recentErrors.length} errors in last 5 minutes`;
      }

      return {
        status,
        message,
        data: {
          totalErrors: stats.totalErrors,
          uniqueErrors: stats.uniqueErrors,
          recentErrors: recentErrors.length,
          highSeverityErrors: highSeverityErrors.length,
          topErrors: stats.topErrors.slice(0, 5),
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Error check failed: ${error.message}`,
      };
    }
  }

  /**
   * Check disk space
   */
  async checkDiskSpace() {
    try {
      // Check if we can write to temp directory
      const testFile = path.join(process.cwd(), 'tmp', '.health-check');
      try {
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
        
        return {
          status: 'healthy',
          message: 'Disk space available',
        };
      } catch (error) {
        return {
          status: 'warning',
          message: `Disk write test failed: ${error.message}`,
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Disk space check failed: ${error.message}`,
      };
    }
  }

  /**
   * Get comprehensive diagnostics report
   */
  async getFullDiagnostics() {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      health: await this.runAllChecks(),
      errorStats: errorTracker.getStats(),
      recommendations: await this.getRecommendations(),
    };

    return diagnostics;
  }

  /**
   * Get recommendations based on diagnostics
   */
  async getRecommendations() {
    const recommendations = [];
    const health = this.healthStatus;

    // Check memory usage
    if (health.system?.memory) {
      const usagePercent = parseFloat(health.system.memory.usagePercent);
      if (usagePercent > 90) {
        recommendations.push({
          type: 'memory',
          severity: 'high',
          message: 'Memory usage is very high. Consider optimizing memory usage or scaling up.',
          action: 'Review memory-intensive operations and consider caching strategies',
        });
      } else if (usagePercent > 75) {
        recommendations.push({
          type: 'memory',
          severity: 'medium',
          message: 'Memory usage is elevated. Monitor closely.',
          action: 'Review memory usage patterns',
        });
      }
    }

    // Check error rates
    const errorStats = errorTracker.getStats();
    if (errorStats.recentErrors.length > 20) {
      recommendations.push({
        type: 'errors',
        severity: 'high',
        message: 'High error rate detected. Immediate attention required.',
        action: 'Review error logs and fix critical issues',
      });
    }

    // Check file system
    const fsCheck = health.checks?.fileSystem;
    if (fsCheck?.status === 'warning' || fsCheck?.status === 'error') {
      recommendations.push({
        type: 'filesystem',
        severity: 'medium',
        message: 'File system issues detected',
        action: 'Check directory permissions and disk space',
      });
    }

    // Check database
    const dbCheck = health.checks?.database;
    if (dbCheck?.status === 'unhealthy' || dbCheck?.status === 'error') {
      recommendations.push({
        type: 'database',
        severity: 'high',
        message: 'Database connectivity issues',
        action: 'Check database connection settings and ensure database is running',
      });
    }

    return recommendations;
  }

  /**
   * Initialize default health checks
   */
  initializeDefaultChecks() {
    this.registerCheck('database', () => this.checkDatabase(), { critical: true });
    this.registerCheck('fileSystem', () => this.checkFileSystem(), { critical: true });
    this.registerCheck('environment', () => this.checkEnvironment(), { critical: false });
    this.registerCheck('errors', () => this.checkErrors(), { critical: false });
    this.registerCheck('diskSpace', () => this.checkDiskSpace(), { critical: false });
  }
}

// Singleton instance
const diagnostics = new DiagnosticsSystem();
diagnostics.initializeDefaultChecks();

export default diagnostics;

