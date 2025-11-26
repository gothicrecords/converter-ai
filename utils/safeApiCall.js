/**
 * Safe API Call - Sistema universale per chiamate API con gestione automatica errori
 * 
 * Questo modulo fornisce un wrapper robusto per tutte le chiamate API che:
 * - Valida automaticamente i risultati
 * - Gestisce errori e risultati vuoti/null
 * - Implementa retry automatico con exponential backoff
 * - Fornisce fallback quando necessario
 * - Garantisce sempre una risposta valida
 */

import { apiCall, uploadFile } from './apiClient';
import { retryOperation } from './errorHandler';
import { showToast } from '../components/Toast';

/**
 * Configurazione predefinita per le chiamate API sicure
 */
const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 300000, // 5 minuti
  validateResponse: true,
  allowEmpty: false,
  fallbackOnError: true,
  silentErrors: false,
};

/**
 * Validatori per diversi tipi di risposta
 */
const validators = {
  /**
   * Valida una risposta generica
   */
  generic: (data) => {
    if (data === null || data === undefined) {
      return { valid: false, error: 'Risposta vuota dal server' };
    }
    if (typeof data !== 'object') {
      return { valid: false, error: 'Formato risposta non valido' };
    }
    return { valid: true };
  },

  /**
   * Valida una risposta con dataUrl (per conversioni file)
   */
  dataUrl: (data) => {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Risposta non valida' };
    }
    
    // Controlla se ha dataUrl
    if (data.dataUrl) {
      if (typeof data.dataUrl !== 'string' || data.dataUrl.trim().length === 0) {
        return { valid: false, error: 'Data URL non valido nella risposta' };
      }
      return { valid: true, result: { name: data.name || 'converted', dataUrl: data.dataUrl } };
    }
    
    // Controlla se ha url (per PDF converters)
    if (data.url) {
      if (typeof data.url !== 'string' || data.url.trim().length === 0) {
        return { valid: false, error: 'URL non valido nella risposta' };
      }
      return { valid: true, result: { name: data.name || 'converted', url: data.url } };
    }
    
    return { valid: false, error: 'Risposta non contiene dati validi (manca dataUrl o url)' };
  },

  /**
   * Valida una risposta con file (blob)
   */
  blob: (data) => {
    if (!data || !(data instanceof Blob)) {
      return { valid: false, error: 'File non valido nella risposta' };
    }
    if (data.size === 0) {
      return { valid: false, error: 'File vuoto nella risposta' };
    }
    return { valid: true, result: data };
  },

  /**
   * Valida una risposta JSON generica
   */
  json: (data) => {
    if (data === null || data === undefined) {
      return { valid: false, error: 'Risposta vuota' };
    }
    // Controlla se ha almeno un campo valido
    if (typeof data === 'object' && Object.keys(data).length === 0) {
      return { valid: false, error: 'Risposta vuota (oggetto senza proprietà)' };
    }
    return { valid: true, result: data };
  },

  /**
   * Valida una risposta con array
   */
  array: (data) => {
    if (!Array.isArray(data)) {
      return { valid: false, error: 'Risposta non è un array' };
    }
    if (data.length === 0) {
      return { valid: false, error: 'Array vuoto nella risposta' };
    }
    return { valid: true, result: data };
  },
};

/**
 * Crea un AbortController con timeout
 */
function createTimeoutController(timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  
  return { controller, timeoutId };
}

/**
 * Valida una risposta API
 */
function validateResponse(data, validator, config) {
  if (!config.validateResponse) {
    return { valid: true, result: data };
  }

  const validatorFn = typeof validator === 'string' ? validators[validator] : validator;
  
  if (!validatorFn) {
    // Usa validatore generico se non specificato
    return validators.generic(data);
  }

  return validatorFn(data);
}

/**
 * Gestisce il fallback quando la chiamata principale fallisce
 */
async function handleFallback(endpoint, options, config, error) {
  if (!config.fallbackOnError) {
    return null;
  }

  // Se l'errore è un errore di validazione, non fare fallback
  if (error?.code === 'VALIDATION_ERROR' || error?.status === 400) {
    return null;
  }

  try {
    // Prova con endpoint alternativo (es. da Python backend a Next.js API)
    const fallbackEndpoint = endpoint.replace(/^\/api\//, '/api/');
    
    // Se siamo già su Next.js API, non c'è fallback
    if (fallbackEndpoint === endpoint) {
      return null;
    }

    if (!config.silentErrors) {
      console.warn(`[safeApiCall] Tentativo fallback per ${endpoint}`);
    }

    const fallbackData = await apiCall(fallbackEndpoint, {
      ...options,
      signal: options.signal, // Mantieni lo stesso signal
    }, false); // Non fare retry sul fallback per evitare loop

    // Valida anche il fallback
    const validation = validateResponse(fallbackData, config.validator, config);
    if (validation.valid) {
      return validation.result || fallbackData;
    }

    return null;
  } catch (fallbackError) {
    if (!config.silentErrors) {
      console.warn(`[safeApiCall] Fallback fallito per ${endpoint}:`, fallbackError);
    }
    return null;
  }
}

/**
 * Chiamata API sicura con validazione automatica e retry
 * 
 * @param {string} endpoint - Endpoint API
 * @param {object} options - Opzioni fetch
 * @param {object} config - Configurazione personalizzata
 * @returns {Promise<any>} Risultato validato
 */
export async function safeApiCall(endpoint, options = {}, config = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Crea controller per timeout
  const { controller, timeoutId } = createTimeoutController(finalConfig.timeout);
  
  // Aggiungi signal alle opzioni
  const finalOptions = {
    ...options,
    signal: controller.signal,
  };

  let lastError = null;
  let lastResponse = null;

  // Funzione di retry
  const operation = async () => {
    try {
      // Pulisci timeout precedente
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Fai la chiamata API
      const response = await apiCall(endpoint, finalOptions, finalConfig.fallbackOnError);
      lastResponse = response;

      // Valida la risposta
      const validation = validateResponse(response, finalConfig.validator, finalConfig);
      
      if (!validation.valid) {
        throw new Error(validation.error || 'Risposta non valida');
      }

      // Restituisci il risultato validato o la risposta originale
      return validation.result || response;
    } catch (error) {
      lastError = error;
      
      // Se è un errore di abort (timeout), non fare retry
      if (error.name === 'AbortError' || controller.signal.aborted) {
        throw new Error('Timeout: l\'operazione ha richiesto troppo tempo');
      }

      // Se è un errore di validazione, non fare retry
      if (error.code === 'VALIDATION_ERROR' || error.status === 400) {
        throw error;
      }

      throw error;
    } finally {
      // Pulisci sempre il timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

  try {
    // Esegui con retry
    const result = await retryOperation(
      operation,
      finalConfig.maxRetries,
      finalConfig.retryDelay
    );

    return result;
  } catch (error) {
    // Se tutti i retry sono falliti, prova il fallback
    const fallbackResult = await handleFallback(endpoint, finalOptions, finalConfig, error);
    
    if (fallbackResult) {
      return fallbackResult;
    }

    // Se anche il fallback è fallito, gestisci l'errore
    if (!finalConfig.silentErrors) {
      const errorMessage = error.message || 'Errore sconosciuto durante la chiamata API';
      showToast(errorMessage, 'error', 6000);
    }

    // Se allowEmpty è true, restituisci un valore di default invece di lanciare errore
    if (finalConfig.allowEmpty && finalConfig.defaultValue !== undefined) {
      return finalConfig.defaultValue;
    }

    throw error;
  }
}

/**
 * Upload file sicuro con validazione
 * 
 * @param {string} endpoint - Endpoint API
 * @param {File} file - File da caricare
 * @param {object} additionalFields - Campi aggiuntivi
 * @param {object} config - Configurazione personalizzata
 * @returns {Promise<any>} Risultato validato
 */
export async function safeUploadFile(endpoint, file, additionalFields = {}, config = {}) {
  // Valida il file prima di caricarlo
  if (!file) {
    throw new Error('File non fornito');
  }
  if (file.size === 0) {
    throw new Error('Il file è vuoto');
  }
  if (file.size > (config.maxFileSize || 100 * 1024 * 1024)) { // 100MB default
    throw new Error(`File troppo grande. Dimensione massima: ${(config.maxFileSize || 100 * 1024 * 1024) / 1024 / 1024}MB`);
  }

  const finalConfig = {
    ...DEFAULT_CONFIG,
    validator: 'dataUrl', // Default per upload file
    ...config,
  };

  // Crea controller per timeout
  const { controller, timeoutId } = createTimeoutController(finalConfig.timeout);

  let lastError = null;

  const operation = async () => {
    try {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Usa uploadFile helper
      const response = await uploadFile(endpoint, file, additionalFields);
      
      // Valida la risposta
      const validation = validateResponse(response, finalConfig.validator, finalConfig);
      
      if (!validation.valid) {
        throw new Error(validation.error || 'Risposta non valida');
      }

      return validation.result || response;
    } catch (error) {
      lastError = error;
      
      if (error.name === 'AbortError' || controller.signal.aborted) {
        throw new Error('Timeout: l\'operazione ha richiesto troppo tempo');
      }

      throw error;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

  try {
    const result = await retryOperation(
      operation,
      finalConfig.maxRetries,
      finalConfig.retryDelay
    );

    return result;
  } catch (error) {
    // Prova fallback
    const fallbackResult = await handleFallback(endpoint, {
      method: 'POST',
      body: (() => {
        const formData = new FormData();
        formData.append('file', file);
        Object.entries(additionalFields).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        return formData;
      })(),
      signal: controller.signal,
    }, finalConfig, error);

    if (fallbackResult) {
      return fallbackResult;
    }

    if (!finalConfig.silentErrors) {
      const errorMessage = error.message || 'Errore durante il caricamento del file';
      showToast(errorMessage, 'error', 6000);
    }

    if (finalConfig.allowEmpty && finalConfig.defaultValue !== undefined) {
      return finalConfig.defaultValue;
    }

    throw error;
  }
}

/**
 * Wrapper per chiamate API che restituiscono JSON
 */
export async function safeJsonCall(endpoint, options = {}, config = {}) {
  return safeApiCall(endpoint, options, {
    ...config,
    validator: 'json',
  });
}

/**
 * Wrapper per chiamate API che restituiscono array
 */
export async function safeArrayCall(endpoint, options = {}, config = {}) {
  return safeApiCall(endpoint, options, {
    ...config,
    validator: 'array',
  });
}

/**
 * Wrapper per chiamate API che restituiscono blob
 */
export async function safeBlobCall(endpoint, options = {}, config = {}) {
  return safeApiCall(endpoint, options, {
    ...config,
    validator: 'blob',
  });
}

/**
 * Helper per creare validatori personalizzati
 */
export function createValidator(validateFn) {
  return validateFn;
}

/**
 * Esporta validatori per uso esterno
 */
export { validators };

