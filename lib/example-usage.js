/**
 * Example Usage of Advanced Development Ecosystem
 * 
 * Questo file mostra esempi pratici di utilizzo di tutti i sistemi
 * creati per diagnostica, logging e gestione errori.
 */

// ============================================
// LOGGING EXAMPLES
// ============================================

import { log } from './logger.js';

// Log di base
log.info('Applicazione avviata', { port: 3000 });
log.warn('Configurazione mancante', { key: 'API_KEY' });
log.error('Operazione fallita', new Error('Something went wrong'));

// Log API request
export function exampleApiHandler(req, res) {
  const startTime = Date.now();
  
  // ... logica API ...
  
  const duration = Date.now() - startTime;
  log.api(req, res, duration);
}

// Log database operation
export async function exampleDatabaseOperation() {
  const startTime = Date.now();
  
  try {
    // ... query database ...
    const duration = Date.now() - startTime;
    log.database('SELECT', 'SELECT * FROM users', duration);
  } catch (error) {
    log.database('SELECT', 'SELECT * FROM users', null, error);
  }
}

// Log file operation
export async function exampleFileOperation() {
  try {
    // ... operazione file ...
    log.file('read', '/path/to/file.pdf', 1024000); // 1MB
  } catch (error) {
    log.file('read', '/path/to/file.pdf', null, error);
  }
}

// ============================================
// ERROR TRACKING EXAMPLES
// ============================================

import errorTracker from './errorTracker.js';

// Traccia un errore
export async function exampleErrorTracking() {
  try {
    // ... operazione che può fallire ...
    throw new Error('Database connection failed');
  } catch (error) {
    await errorTracker.trackError(error, {
      endpoint: '/api/users',
      userId: '123',
      operation: 'fetchUser',
    });
  }
}

// Ottieni statistiche errori
export function exampleGetErrorStats() {
  const stats = errorTracker.getStats();
  console.log('Total errors:', stats.totalErrors);
  console.log('Top errors:', stats.topErrors);
}

// Trova errori simili
export function exampleFindSimilarErrors() {
  const error = new Error('Connection timeout');
  const similar = errorTracker.findSimilarErrors(error);
  console.log('Similar errors:', similar);
}

// ============================================
// DIAGNOSTICS EXAMPLES
// ============================================

import diagnostics from './diagnostics.js';

// Esegui health checks
export async function exampleHealthChecks() {
  const health = await diagnostics.runAllChecks();
  console.log('Overall health:', health.overall);
  console.log('Checks:', health.checks);
}

// Ottieni informazioni sistema
export async function exampleSystemInfo() {
  const systemInfo = await diagnostics.getSystemInfo();
  console.log('Platform:', systemInfo.platform);
  console.log('Memory:', systemInfo.memory);
  console.log('CPU:', systemInfo.cpu);
}

// Diagnostica completa
export async function exampleFullDiagnostics() {
  const report = await diagnostics.getFullDiagnostics();
  console.log('Health:', report.health);
  console.log('Error stats:', report.errorStats);
  console.log('Recommendations:', report.recommendations);
}

// Registra custom health check
export function exampleCustomHealthCheck() {
  diagnostics.registerCheck('external-api', async () => {
    try {
      const response = await fetch('https://api.example.com/health');
      const isHealthy = response.ok;
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: isHealthy ? 'External API is reachable' : 'External API is down',
        data: {
          statusCode: response.status,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: `External API check failed: ${error.message}`,
      };
    }
  }, {
    critical: false,
    interval: 60000, // 1 minute
    timeout: 5000,
  });
}

// ============================================
// ERROR HANDLING EXAMPLES
// ============================================

import { 
  AppError, 
  ValidationError, 
  DatabaseError,
  handleApiError,
  asyncHandler,
} from '../errors/index.js';

// Usa errori tipizzati
export function exampleTypedErrors() {
  // Validation error
  if (!email) {
    throw new ValidationError('Email is required', { field: 'email' });
  }
  
  // Database error
  try {
    // ... database operation ...
  } catch (error) {
    throw new DatabaseError('Failed to save user', error);
  }
}

// Usa asyncHandler per API routes
export const exampleApiRoute = asyncHandler(async (req, res) => {
  // Il wrapper gestisce automaticamente gli errori
  if (req.method !== 'POST') {
    throw new AppError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
  }
  
  // ... logica API ...
  
  res.json({ success: true });
});

// Gestione errori manuale
export async function exampleManualErrorHandling(req, res) {
  try {
    // ... logica ...
  } catch (error) {
    await handleApiError(error, res, {
      endpoint: '/api/example',
      method: req.method,
    });
  }
}

// ============================================
// INTEGRATION EXAMPLE
// ============================================

// Esempio completo di integrazione in un API route
export async function exampleCompleteIntegration(req, res) {
  const startTime = Date.now();
  
  try {
    // Log request
    log.info('API request started', {
      method: req.method,
      path: req.path,
    });
    
    // Validazione
    if (!req.body.email) {
      throw new ValidationError('Email is required');
    }
    
    // Database operation
    const startDb = Date.now();
    // ... database query ...
    const dbDuration = Date.now() - startDb;
    log.database('SELECT', 'SELECT * FROM users WHERE email = ?', dbDuration);
    
    // File operation
    const startFile = Date.now();
    // ... file operation ...
    const fileDuration = Date.now() - startFile;
    log.file('read', '/path/to/file', null);
    
    // Success response
    const totalDuration = Date.now() - startTime;
    log.api(req, res, totalDuration);
    
    res.json({ success: true });
    
  } catch (error) {
    // Track error
    await errorTracker.trackError(error, {
      endpoint: req.path,
      method: req.method,
      body: req.body,
    });
    
    // Log error
    log.error('API request failed', error, {
      method: req.method,
      path: req.path,
    });
    
    // Handle error response
    await handleApiError(error, res, {
      endpoint: req.path,
      method: req.method,
    });
  }
}

