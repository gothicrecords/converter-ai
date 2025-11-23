// Sistema di queue con retry automatico e rate limiting per OpenAI
import Bottleneck from 'bottleneck';

// Configurazione rate limiter per OpenAI
// OpenAI ha limiti: 
// - GPT-4o: 10 RPM (requests per minute) per tier gratuito
// - GPT-4o-mini: 500 RPM per tier gratuito
// Usiamo valori conservativi per evitare rate limits
const limiter = new Bottleneck({
    reservoir: 50, // Numero di richieste disponibili
    reservoirRefreshAmount: 50, // Ricarica ogni intervallo
    reservoirRefreshInterval: 60 * 1000, // 1 minuto
    maxConcurrent: 3, // Massimo 3 richieste concorrenti
    minTime: 200, // Minimo 200ms tra le richieste
});

// Queue per le richieste con retry automatico
class OpenAIQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.maxRetries = 3;
        this.baseDelay = 1000; // 1 secondo base delay
    }

    /**
     * Aggiunge una richiesta alla coda con retry automatico
     * @param {Function} operation - Funzione async da eseguire
     * @param {Object} options - Opzioni per la richiesta
     * @returns {Promise} Promise che si risolve con il risultato
     */
    async add(operation, options = {}) {
        const {
            priority = 5, // Priorità (1-10, più alto = più prioritario)
            maxRetries = this.maxRetries,
            retryDelay = this.baseDelay,
            id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        } = options;

        return new Promise((resolve, reject) => {
            const queueItem = {
                id,
                operation,
                priority,
                maxRetries,
                retryDelay,
                attempts: 0,
                resolve,
                reject,
                timestamp: Date.now(),
            };

            this.queue.push(queueItem);
            this.queue.sort((a, b) => b.priority - a.priority); // Ordina per priorità

            // Avvia il processing se non è già in corso
            if (!this.processing) {
                this.processQueue();
            }
        });
    }

    /**
     * Processa la coda delle richieste
     */
    async processQueue() {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        while (this.queue.length > 0) {
            const item = this.queue.shift();

            try {
                // Esegui l'operazione con rate limiting
                const result = await limiter.schedule(async () => {
                    return await this.executeWithRetry(item);
                });

                item.resolve(result);
            } catch (error) {
                // Se tutti i retry sono falliti, rifiuta la promise
                item.reject(error);
            }
        }

        this.processing = false;
    }

    /**
     * Esegue un'operazione con retry automatico e backoff esponenziale
     * @param {Object} item - Item della coda
     * @returns {Promise} Risultato dell'operazione
     */
    async executeWithRetry(item) {
        let lastError;

        for (let attempt = 1; attempt <= item.maxRetries; attempt++) {
            try {
                item.attempts = attempt;
                console.log(`[OpenAI Queue] Tentativo ${attempt}/${item.maxRetries} per richiesta ${item.id}`);

                const result = await item.operation();
                console.log(`[OpenAI Queue] Richiesta ${item.id} completata con successo`);
                return result;
            } catch (error) {
                lastError = error;

                // Verifica se è un errore di rate limit
                const isRateLimit = this.isRateLimitError(error);

                if (isRateLimit) {
                    // Per rate limit, usa un delay più lungo
                    const retryAfter = this.extractRetryAfter(error);
                    const delay = retryAfter || (item.retryDelay * Math.pow(2, attempt - 1) * 2); // Backoff esponenziale più aggressivo

                    console.log(`[OpenAI Queue] Rate limit rilevato per richiesta ${item.id}, attesa ${delay}ms prima del retry`);

                    if (attempt < item.maxRetries) {
                        await this.delay(delay);
                        continue; // Riprova
                    }
                } else {
                    // Per altri errori, verifica se sono retryable
                    if (!this.isRetryableError(error)) {
                        console.log(`[OpenAI Queue] Errore non retryable per richiesta ${item.id}:`, error.message);
                        throw error; // Non ritentare
                    }

                    // Backoff esponenziale standard
                    if (attempt < item.maxRetries) {
                        const delay = item.retryDelay * Math.pow(2, attempt - 1);
                        console.log(`[OpenAI Queue] Errore per richiesta ${item.id}, retry tra ${delay}ms`);
                        await this.delay(delay);
                        continue; // Riprova
                    }
                }

                // Se siamo all'ultimo tentativo, lancia l'errore
                if (attempt === item.maxRetries) {
                    break;
                }
            }
        }

        console.error(`[OpenAI Queue] Richiesta ${item.id} fallita dopo ${item.attempts} tentativi:`, lastError.message);
        throw lastError;
    }

    /**
     * Verifica se un errore è un rate limit
     * @param {Error} error - Errore da verificare
     * @returns {boolean}
     */
    isRateLimitError(error) {
        if (!error) return false;

        const message = error.message || '';
        const status = error.status || error.statusCode || 0;

        return (
            status === 429 ||
            message.includes('rate limit') ||
            message.includes('rate_limit') ||
            message.includes('Limite') ||
            message.includes('too many requests') ||
            message.includes('quota') ||
            message.includes('Quota')
        );
    }

    /**
     * Estrae il valore retry-after da un errore
     * @param {Error} error - Errore
     * @returns {number|null} Millisecondi da attendere
     */
    extractRetryAfter(error) {
        if (error.headers && error.headers['retry-after']) {
            return parseInt(error.headers['retry-after']) * 1000;
        }
        if (error.retryAfter) {
            return error.retryAfter * 1000;
        }
        return null;
    }

    /**
     * Verifica se un errore è retryable
     * @param {Error} error - Errore da verificare
     * @returns {boolean}
     */
    isRetryableError(error) {
        if (!error) return false;

        const status = error.status || error.statusCode || 0;
        const message = error.message || '';

        // Non ritentare su errori di validazione, autenticazione, autorizzazione
        if ([400, 401, 403].includes(status)) {
            return false;
        }

        // Non ritentare su errori di formato
        if (message.includes('invalid') || message.includes('Invalid')) {
            return false;
        }

        // Ritenta su errori di rete, timeout, server errors
        return [408, 429, 500, 502, 503, 504].includes(status) || 
               message.includes('timeout') ||
               message.includes('network') ||
               message.includes('ECONNRESET') ||
               message.includes('ETIMEDOUT');
    }

    /**
     * Delay helper
     * @param {number} ms - Millisecondi da attendere
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Ottiene statistiche della coda
     * @returns {Object} Statistiche
     */
    getStats() {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
            limiterStats: {
                running: limiter.running(),
                done: limiter.done(),
                queued: limiter.queued(),
            },
        };
    }

    /**
     * Pulisce la coda
     */
    clear() {
        this.queue = [];
        this.processing = false;
    }
}

// Istanza singleton
const openAIQueue = new OpenAIQueue();

export default openAIQueue;

