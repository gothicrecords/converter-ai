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

// Error patterns and solutions database with enhanced resolution
const ERROR_PATTERNS = {
  // Database errors
  'ECONNREFUSED': {
    type: 'database',
    severity: 'high',
    solution: 'Verifica le impostazioni di connessione al database e assicurati che il database sia in esecuzione',
    detailedSolution: [
      'Controlla che il servizio database sia avviato',
      'Verifica le variabili d\'ambiente (NEXT_PUBLIC_SUPABASE_URL, ecc.)',
      'Controlla che la porta del database sia accessibile',
      'Verifica le credenziali di connessione'
    ],
    autoFix: false,
    recoverySteps: ['check_env_vars', 'verify_service'],
  },
  'ETIMEDOUT': {
    type: 'network',
    severity: 'medium',
    solution: 'Verifica la connettività di rete e le impostazioni di timeout',
    detailedSolution: [
      'Controlla la connessione internet',
      'Aumenta il timeout se l\'operazione richiede più tempo',
      'Verifica che il servizio remoto sia raggiungibile',
      'Controlla eventuali firewall o proxy'
    ],
    autoFix: false,
    recoverySteps: ['retry_with_backoff'],
  },
  'ENOENT': {
    type: 'filesystem',
    severity: 'medium',
    solution: 'File o directory non trovato. Verifica i percorsi e i permessi',
    detailedSolution: [
      'Verifica che il percorso del file/directory sia corretto',
      'Controlla che la directory esista',
      'Se è una directory necessaria, verrà creata automaticamente',
      'Verifica i permessi di lettura/scrittura'
    ],
    autoFix: true,
    recoverySteps: ['create_missing_directory', 'verify_path'],
  },
  'EACCES': {
    type: 'permission',
    severity: 'high',
    solution: 'Permesso negato. Verifica i permessi di file/directory',
    detailedSolution: [
      'Controlla i permessi del file/directory',
      'Su Linux/Mac: usa chmod per modificare i permessi',
      'Su Windows: verifica le impostazioni di sicurezza',
      'Assicurati che l\'utente del processo abbia i permessi necessari'
    ],
    autoFix: false,
    recoverySteps: ['check_permissions'],
  },
  'EMFILE': {
    type: 'resource',
    severity: 'high',
    solution: 'Troppi file aperti. Aumenta ulimit o chiudi i file handle',
    detailedSolution: [
      'Chiudi i file aperti non necessari',
      'Aumenta il limite di file aperti (ulimit -n)',
      'Verifica eventuali memory leak nei file handle',
      'Riavvia il processo se necessario'
    ],
    autoFix: false,
    recoverySteps: ['cleanup_resources'],
  },
  'LIMIT_FILE_SIZE': {
    type: 'validation',
    severity: 'low',
    solution: 'La dimensione del file supera il limite. Verifica la validazione della dimensione',
    detailedSolution: [
      'Il file è troppo grande per essere processato',
      'Riduci la dimensione del file o usa un formato compresso',
      'Verifica il limite massimo configurato',
      'Considera di processare il file in parti più piccole'
    ],
    autoFix: false,
    recoverySteps: [],
  },
  'VALIDATION_ERROR': {
    type: 'validation',
    severity: 'low',
    solution: 'Validazione input fallita. Verifica il formato dei dati',
    detailedSolution: [
      'Controlla che tutti i campi richiesti siano presenti',
      'Verifica il formato dei dati (email, URL, numeri, ecc.)',
      'Controlla i limiti di lunghezza dei campi',
      'Rivedi i messaggi di errore specifici per i campi'
    ],
    autoFix: false,
    recoverySteps: ['validate_input'],
  },
  'AUTHENTICATION_ERROR': {
    type: 'auth',
    severity: 'medium',
    solution: 'Autenticazione richiesta. Verifica la sessione utente e i token',
    detailedSolution: [
      'Verifica che l\'utente sia autenticato',
      'Controlla che il token di sessione sia valido',
      'Se scaduto, effettua un nuovo login',
      'Verifica le credenziali di autenticazione'
    ],
    autoFix: false,
    recoverySteps: ['refresh_token', 'redirect_login'],
  },
  // Additional common error patterns
  'ENOTFOUND': {
    type: 'network',
    severity: 'medium',
    solution: 'Hostname non trovato. Verifica l\'URL o il nome del dominio',
    detailedSolution: [
      'Controlla che l\'URL sia corretto',
      'Verifica la connessione DNS',
      'Assicurati che il dominio sia raggiungibile',
      'Controlla eventuali errori di digitazione nell\'URL'
    ],
    autoFix: false,
    recoverySteps: ['verify_url', 'check_dns'],
  },
  'ECONNRESET': {
    type: 'network',
    severity: 'medium',
    solution: 'Connessione resettata dal server. Riprova l\'operazione',
    detailedSolution: [
      'La connessione è stata interrotta dal server',
      'Riprova l\'operazione dopo alcuni secondi',
      'Verifica che il server sia ancora disponibile',
      'Controlla eventuali problemi di rete temporanei'
    ],
    autoFix: false,
    recoverySteps: ['retry_with_backoff'],
  },
  'EPIPE': {
    type: 'network',
    severity: 'low',
    solution: 'Pipe rotto. La connessione è stata chiusa inaspettatamente',
    detailedSolution: [
      'La connessione è stata chiusa prima del completamento',
      'Riprova l\'operazione',
      'Verifica la stabilità della connessione'
    ],
    autoFix: false,
    recoverySteps: ['retry_operation'],
  },
  'ENOSPC': {
    type: 'filesystem',
    severity: 'high',
    solution: 'Spazio su disco insufficiente. Libera spazio sul disco',
    detailedSolution: [
      'Non c\'è abbastanza spazio su disco',
      'Elimina file non necessari',
      'Sposta file su un altro disco',
      'Aumenta lo spazio disponibile'
    ],
    autoFix: false,
    recoverySteps: ['check_disk_space', 'cleanup_temp_files'],
  },
  'EISDIR': {
    type: 'filesystem',
    severity: 'low',
    solution: 'È una directory, non un file. Verifica il percorso',
    detailedSolution: [
      'Il percorso specificato è una directory, non un file',
      'Verifica che il percorso sia corretto',
      'Se necessario, specifica un file all\'interno della directory'
    ],
    autoFix: false,
    recoverySteps: ['verify_path'],
  },
  'EEXIST': {
    type: 'filesystem',
    severity: 'low',
    solution: 'File o directory già esistente',
    detailedSolution: [
      'Il file o directory che stai cercando di creare esiste già',
      'Usa un nome diverso o elimina quello esistente',
      'Verifica se vuoi sovrascrivere il file esistente'
    ],
    autoFix: false,
    recoverySteps: ['check_existing', 'handle_conflict'],
  },
  'RATE_LIMIT_EXCEEDED': {
    type: 'rate_limit',
    severity: 'medium',
    solution: 'Limite di richieste superato. Attendi prima di riprovare',
    detailedSolution: [
      'Hai superato il limite di richieste consentite',
      'Attendi il tempo indicato prima di riprovare',
      'Considera di implementare un sistema di cache',
      'Riduci la frequenza delle richieste'
    ],
    autoFix: false,
    recoverySteps: ['wait_retry_after'],
  },
  'TIMEOUT_ERROR': {
    type: 'timeout',
    severity: 'medium',
    solution: 'Timeout: l\'operazione ha richiesto troppo tempo',
    detailedSolution: [
      'L\'operazione ha superato il tempo massimo consentito',
      'Aumenta il timeout se l\'operazione è legittimamente lenta',
      'Ottimizza l\'operazione per renderla più veloce',
      'Considera di processare in modo asincrono'
    ],
    autoFix: false,
    recoverySteps: ['increase_timeout', 'optimize_operation'],
  },
};

class ErrorTracker {
  constructor() {
    this.errorCounts = new Map();
    this.errorHistory = [];
    this.maxHistorySize = 1000;
  }

  /**
   * Track an error with full context and attempt auto-fix
   */
  async trackError(error, context = {}) {
    // Analyze error pattern with enhanced resolution
    const pattern = this.analyzeErrorPattern(error, context);
    
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
      pattern: pattern,
      frequency: 1,
      autoFixAttempted: false,
      autoFixResult: null,
    };

    // Attempt auto-fix if possible
    if (pattern.autoFixable || pattern.suggestedActions.length > 0) {
      try {
        const fixResult = await this.attemptAutoFix(error, pattern, context);
        errorInfo.autoFixAttempted = true;
        errorInfo.autoFixResult = fixResult;
        
        if (fixResult.fixed) {
          log.info('Error auto-fixed', {
            errorId: errorInfo.id,
            actions: fixResult.results.filter(r => r.success).map(r => r.action),
          });
        } else if (fixResult.canRetry) {
          log.info('Error can be retried', {
            errorId: errorInfo.id,
            retryActions: fixResult.results.filter(r => r.action?.type === 'retry' || r.action?.type === 'wait'),
          });
        }
      } catch (fixError) {
        log.error('Auto-fix attempt failed', fixError, { errorId: errorInfo.id });
        errorInfo.autoFixResult = { fixed: false, error: fixError.message };
      }
    }

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

    // Log error with enhanced information
    log.error('Error Tracked', error, {
      errorId: errorInfo.id,
      pattern: {
        type: pattern.type,
        severity: pattern.severity,
        autoFixable: pattern.autoFixable,
        solution: pattern.solution,
      },
      frequency: errorInfo.frequency,
      autoFixAttempted: errorInfo.autoFixAttempted,
      autoFixSuccess: errorInfo.autoFixResult?.fixed || false,
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
   * Analyze error pattern and suggest solution with enhanced resolution
   */
  analyzeErrorPattern(error, context = {}) {
    const pattern = {
      type: 'unknown',
      severity: 'low',
      solution: null,
      detailedSolution: [],
      autoFixable: false,
      recoverySteps: [],
      similarErrors: [],
      suggestedActions: [],
    };

    // Check error code
    if (error.code && ERROR_PATTERNS[error.code]) {
      const match = ERROR_PATTERNS[error.code];
      pattern.type = match.type;
      pattern.severity = match.severity;
      pattern.solution = match.solution;
      pattern.detailedSolution = match.detailedSolution || [];
      pattern.autoFixable = match.autoFix;
      pattern.recoverySteps = match.recoverySteps || [];
    }

    // Check error message for patterns
    if (error.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('timeout') || message.includes('timed out')) {
        pattern.type = 'timeout';
        pattern.severity = 'medium';
        pattern.solution = 'Timeout: l\'operazione ha richiesto troppo tempo';
        pattern.detailedSolution = [
          'L\'operazione ha superato il tempo massimo consentito',
          'Aumenta il timeout se l\'operazione è legittimamente lenta',
          'Ottimizza l\'operazione per renderla più veloce',
          'Considera di processare in modo asincrono'
        ];
        pattern.recoverySteps = ['increase_timeout', 'retry_with_backoff'];
      } else if (message.includes('memory') || message.includes('heap')) {
        pattern.type = 'memory';
        pattern.severity = 'high';
        pattern.solution = 'Problema di memoria rilevato. Verifica l\'utilizzo della memoria';
        pattern.detailedSolution = [
          'Memoria insufficiente o memory leak rilevato',
          'Verifica l\'utilizzo della memoria del processo',
          'Ottimizza le operazioni che consumano molta memoria',
          'Considera di aumentare la memoria disponibile'
        ];
        pattern.recoverySteps = ['check_memory', 'optimize_operations'];
      } else if (message.includes('permission') || message.includes('access') || message.includes('denied')) {
        pattern.type = 'permission';
        pattern.severity = 'high';
        pattern.solution = 'Problema di permessi. Verifica i permessi di file/directory';
        pattern.detailedSolution = [
          'Permesso negato per l\'operazione richiesta',
          'Controlla i permessi del file/directory',
          'Assicurati che l\'utente del processo abbia i permessi necessari'
        ];
        pattern.recoverySteps = ['check_permissions'];
      } else if (message.includes('not found') || message.includes('missing')) {
        pattern.type = 'not_found';
        pattern.severity = 'medium';
        pattern.solution = 'Risorsa non trovata. Verifica il percorso o l\'ID';
        pattern.detailedSolution = [
          'La risorsa richiesta non è stata trovata',
          'Verifica che il percorso o l\'ID siano corretti',
          'Controlla che la risorsa esista nel sistema'
        ];
        pattern.recoverySteps = ['verify_path', 'check_resource'];
      } else if (message.includes('already exists') || message.includes('duplicate')) {
        pattern.type = 'conflict';
        pattern.severity = 'low';
        pattern.solution = 'Risorsa già esistente. Usa un identificatore diverso';
        pattern.detailedSolution = [
          'La risorsa che stai cercando di creare esiste già',
          'Usa un identificatore o nome diverso',
          'Oppure aggiorna la risorsa esistente'
        ];
        pattern.recoverySteps = ['handle_conflict'];
      } else if (message.includes('invalid') || message.includes('malformed')) {
        pattern.type = 'validation';
        pattern.severity = 'low';
        pattern.solution = 'Dati non validi. Verifica il formato dei dati';
        pattern.detailedSolution = [
          'I dati forniti non sono nel formato corretto',
          'Verifica la struttura e il tipo dei dati',
          'Controlla i requisiti di validazione'
        ];
        pattern.recoverySteps = ['validate_input'];
      }
    }

    // Generate suggested actions based on pattern
    pattern.suggestedActions = this.generateSuggestedActions(pattern, error, context);

    // Find similar errors
    pattern.similarErrors = this.findSimilarErrors(error);

    return pattern;
  }

  /**
   * Generate suggested actions based on error pattern
   */
  generateSuggestedActions(pattern, error, context) {
    const actions = [];

    if (pattern.type === 'filesystem' && error.code === 'ENOENT') {
      // Try to extract path from error message or context
      const pathMatch = error.message?.match(/['"]([^'"]+)['"]/) || 
                       context.path || 
                       context.filePath;
      if (pathMatch) {
        const filePath = typeof pathMatch === 'string' ? pathMatch : pathMatch[1];
        actions.push({
          type: 'auto_fix',
          action: 'create_missing_directory',
          description: 'Crea automaticamente la directory mancante',
          path: path.dirname(filePath),
        });
      }
    }

    if (pattern.type === 'timeout') {
      actions.push({
        type: 'retry',
        action: 'retry_with_increased_timeout',
        description: 'Riprova con timeout aumentato',
        timeout: (context.timeout || 30000) * 2,
      });
    }

    if (pattern.type === 'network' && ['ETIMEDOUT', 'ECONNRESET'].includes(error.code)) {
      actions.push({
        type: 'retry',
        action: 'retry_with_backoff',
        description: 'Riprova con backoff esponenziale',
        maxRetries: 3,
      });
    }

    if (pattern.type === 'rate_limit') {
      const retryAfter = error.retryAfter || error.details?.retryAfter || 60;
      actions.push({
        type: 'wait',
        action: 'wait_and_retry',
        description: `Attendi ${retryAfter} secondi prima di riprovare`,
        waitTime: retryAfter * 1000,
      });
    }

    return actions;
  }

  /**
   * Attempt to automatically fix an error
   */
  async attemptAutoFix(error, pattern, context = {}) {
    if (!pattern.autoFixable && pattern.suggestedActions.length === 0) {
      return { fixed: false, reason: 'Error not auto-fixable' };
    }

    const fixResults = [];

    // Try each suggested action
    for (const action of pattern.suggestedActions) {
      try {
        let result = { success: false };

        switch (action.action) {
          case 'create_missing_directory':
            result = await this.fixMissingDirectory(action.path);
            break;
          case 'retry_with_backoff':
            result = { success: true, message: 'Retry suggested', action: action };
            break;
          case 'retry_with_increased_timeout':
            result = { success: true, message: 'Increased timeout suggested', action: action };
            break;
          case 'wait_and_retry':
            result = { success: true, message: 'Wait and retry suggested', action: action };
            break;
          default:
            result = { success: false, reason: 'Unknown action' };
        }

        fixResults.push({
          action: action.action,
          ...result,
        });
      } catch (fixError) {
        log.error('Auto-fix failed', fixError, { action: action.action });
        fixResults.push({
          action: action.action,
          success: false,
          error: fixError.message,
        });
      }
    }

    const anySuccess = fixResults.some(r => r.success);
    return {
      fixed: anySuccess,
      results: fixResults,
      canRetry: fixResults.some(r => r.action?.type === 'retry' || r.action?.type === 'wait'),
    };
  }

  /**
   * Fix missing directory by creating it
   */
  async fixMissingDirectory(dirPath) {
    try {
      if (!dirPath) {
        return { success: false, reason: 'No path provided' };
      }

      // Ensure the directory exists
      await fs.mkdir(dirPath, { recursive: true });
      
      // Verify it was created
      const stats = await fs.stat(dirPath);
      if (stats.isDirectory()) {
        log.info('Auto-fixed: Created missing directory', { path: dirPath });
        return { success: true, path: dirPath };
      }

      return { success: false, reason: 'Directory creation failed' };
    } catch (error) {
      log.error('Failed to create directory', error, { path: dirPath });
      return { success: false, error: error.message };
    }
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

