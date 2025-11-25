module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/formidable [external] (formidable, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("formidable");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/mammoth [external] (mammoth, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mammoth", () => require("mammoth"));

module.exports = mod;
}),
"[externals]/pdfkit [external] (pdfkit, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("pdfkit", () => require("pdfkit"));

module.exports = mod;
}),
"[externals]/openai [external] (openai, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("openai");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/tesseract.js [external] (tesseract.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tesseract.js", () => require("tesseract.js"));

module.exports = mod;
}),
"[externals]/sharp [external] (sharp, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("sharp", () => require("sharp"));

module.exports = mod;
}),
"[externals]/pdf-parse [external] (pdf-parse, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pdf-parse");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/bottleneck [external] (bottleneck, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("bottleneck", () => require("bottleneck"));

module.exports = mod;
}),
"[project]/lib/openai-queue.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Sistema di queue con retry automatico e rate limiting per OpenAI
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$bottleneck__$5b$external$5d$__$28$bottleneck$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/bottleneck [external] (bottleneck, cjs)");
;
// Configurazione rate limiter per OpenAI
// OpenAI ha limiti: 
// - GPT-4o: 10 RPM (requests per minute) per tier gratuito
// - GPT-4o-mini: 500 RPM per tier gratuito
// Usiamo valori conservativi per evitare rate limits
const limiter = new __TURBOPACK__imported__module__$5b$externals$5d2f$bottleneck__$5b$external$5d$__$28$bottleneck$2c$__cjs$29$__["default"]({
    reservoir: 50,
    reservoirRefreshAmount: 50,
    reservoirRefreshInterval: 60 * 1000,
    maxConcurrent: 3,
    minTime: 200
});
// Queue per le richieste con retry automatico
class OpenAIQueue {
    constructor(){
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
     */ async add(operation, options = {}) {
        const { priority = 5, maxRetries = this.maxRetries, retryDelay = this.baseDelay, id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` } = options;
        return new Promise((resolve, reject)=>{
            const queueItem = {
                id,
                operation,
                priority,
                maxRetries,
                retryDelay,
                attempts: 0,
                resolve,
                reject,
                timestamp: Date.now()
            };
            this.queue.push(queueItem);
            this.queue.sort((a, b)=>b.priority - a.priority); // Ordina per priorità
            // Avvia il processing se non è già in corso
            if (!this.processing) {
                this.processQueue();
            }
        });
    }
    /**
     * Processa la coda delle richieste
     */ async processQueue() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        this.processing = true;
        while(this.queue.length > 0){
            const item = this.queue.shift();
            try {
                // Esegui l'operazione con rate limiting
                const result = await limiter.schedule(async ()=>{
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
     */ async executeWithRetry(item) {
        let lastError;
        for(let attempt = 1; attempt <= item.maxRetries; attempt++){
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
                    const delay = retryAfter || item.retryDelay * Math.pow(2, attempt - 1) * 2; // Backoff esponenziale più aggressivo
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
     */ isRateLimitError(error) {
        if (!error) return false;
        const message = error.message || '';
        const status = error.status || error.statusCode || 0;
        return status === 429 || message.includes('rate limit') || message.includes('rate_limit') || message.includes('Limite') || message.includes('too many requests') || message.includes('quota') || message.includes('Quota');
    }
    /**
     * Estrae il valore retry-after da un errore
     * @param {Error} error - Errore
     * @returns {number|null} Millisecondi da attendere
     */ extractRetryAfter(error) {
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
     */ isRetryableError(error) {
        if (!error) return false;
        const status = error.status || error.statusCode || 0;
        const message = error.message || '';
        // Non ritentare su errori di validazione, autenticazione, autorizzazione
        if ([
            400,
            401,
            403
        ].includes(status)) {
            return false;
        }
        // Non ritentare su errori di formato
        if (message.includes('invalid') || message.includes('Invalid')) {
            return false;
        }
        // Ritenta su errori di rete, timeout, server errors
        return [
            408,
            429,
            500,
            502,
            503,
            504
        ].includes(status) || message.includes('timeout') || message.includes('network') || message.includes('ECONNRESET') || message.includes('ETIMEDOUT');
    }
    /**
     * Delay helper
     * @param {number} ms - Millisecondi da attendere
     * @returns {Promise}
     */ delay(ms) {
        return new Promise((resolve)=>setTimeout(resolve, ms));
    }
    /**
     * Ottiene statistiche della coda
     * @returns {Object} Statistiche
     */ getStats() {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
            limiterStats: {
                running: limiter.running(),
                done: limiter.done(),
                queued: limiter.queued()
            }
        };
    }
    /**
     * Pulisce la coda
     */ clear() {
        this.queue = [];
        this.processing = false;
    }
}
// Istanza singleton
const openAIQueue = new OpenAIQueue();
const __TURBOPACK__default__export__ = openAIQueue;
}),
"[project]/pages/api/tools/translate-document.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/formidable [external] (formidable, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$mammoth__$5b$external$5d$__$28$mammoth$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mammoth [external] (mammoth, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pdfkit__$5b$external$5d$__$28$pdfkit$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/pdfkit [external] (pdfkit, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/openai [external] (openai, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$tesseract$2e$js__$5b$external$5d$__$28$tesseract$2e$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/tesseract.js [external] (tesseract.js, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/sharp [external] (sharp, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$parse__$5b$external$5d$__$28$pdf$2d$parse$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pdf-parse [external] (pdf-parse, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2d$queue$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/openai-queue.js [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$parse__$5b$external$5d$__$28$pdf$2d$parse$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$parse__$5b$external$5d$__$28$pdf$2d$parse$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
const openai = new __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__["default"]({
    apiKey: process.env.OPENAI_API_KEY
});
const config = {
    api: {
        bodyParser: false
    }
};
// Funzione per estrarre testo da diversi formati
async function extractText(filePath, mimeType, originalFilename) {
    const ext = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].extname(originalFilename).toLowerCase();
    if (mimeType === 'application/pdf' || ext === '.pdf') {
        // Estrazione testo da PDF usando pdf-parse con fallback OCR
        let text = '';
        let numPages = 1;
        // Tentativo 1: pdf-parse per PDF con testo nativo
        try {
            console.log('[PDF Extract] Inizio estrazione PDF:', originalFilename);
            const dataBuffer = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath);
            console.log('[PDF Extract] Buffer letto, dimensione:', dataBuffer.length, 'bytes');
            const result = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$parse__$5b$external$5d$__$28$pdf$2d$parse$2c$__esm_import$29$__["default"])(dataBuffer);
            console.log('[PDF Extract] Parsing completato, testo estratto:', result?.text?.length || 0, 'caratteri');
            console.log('[PDF Extract] Numero pagine:', result?.numpages || 1);
            text = result && result.text ? result.text.trim() : '';
            numPages = result?.numpages || 1;
        } catch (pdfError) {
            console.log('[PDF Extract] pdf-parse fallito:', pdfError.message);
            console.error('[PDF Extract] Stack:', pdfError.stack);
            text = ''; // Continua con OCR
        }
        // Tentativo 2: OCR se pdf-parse ha fallito o testo insufficiente
        // Riduciamo la soglia minima a 10 caratteri per essere meno restrittivi
        if (!text || text.trim().length < 10) {
            console.log('[PDF Extract] Testo insufficiente, uso OCR automatico...');
            try {
                const dataBuffer = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath);
                const allTexts = [];
                // Converti ogni pagina del PDF in immagine e fai OCR
                console.log('[PDF Extract] Conversione PDF in immagini per OCR...');
                // Sharp potrebbe non supportare PDF direttamente senza librerie native
                // Proviamo diversi approcci per convertire PDF in immagine
                console.log('[PDF Extract] Conversione prima pagina PDF in immagine per OCR...');
                let imageBuffer = null;
                // Tentativo 1: Sharp con pages: 1 (plurale)
                try {
                    console.log('[PDF Extract] Tentativo 1: Sharp con pages: 1');
                    imageBuffer = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(dataBuffer, {
                        density: 300,
                        pages: 1
                    }).png().toBuffer();
                    console.log('[PDF Extract] Successo con pages: 1');
                } catch (sharpError1) {
                    console.log('[PDF Extract] Fallito con pages: 1, errore:', sharpError1.message);
                    // Tentativo 2: Sharp con page: 0 (singolare, 0-based)
                    try {
                        console.log('[PDF Extract] Tentativo 2: Sharp con page: 0');
                        imageBuffer = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(dataBuffer, {
                            density: 300,
                            page: 0
                        }).png().toBuffer();
                        console.log('[PDF Extract] Successo con page: 0');
                    } catch (sharpError2) {
                        console.log('[PDF Extract] Fallito con page: 0, errore:', sharpError2.message);
                        // Tentativo 3: Sharp senza specificare pagina (prima pagina di default)
                        try {
                            console.log('[PDF Extract] Tentativo 3: Sharp senza specificare pagina');
                            imageBuffer = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(dataBuffer, {
                                density: 300
                            }).png().toBuffer();
                            console.log('[PDF Extract] Successo senza specificare pagina');
                        } catch (sharpError3) {
                            console.error('[PDF Extract] Tutti i tentativi Sharp falliti');
                            console.error('[PDF Extract] Errore finale:', sharpError3.message);
                            // Se Sharp non può processare il PDF, usiamo OpenAI come fallback (stesso metodo dei documenti AI)
                            console.log('[PDF Extract] Sharp fallito, uso OpenAI per estrazione testo (stesso metodo documenti AI)');
                            try {
                                const { extractTextFromPdfWithOpenAI } = await __turbopack_context__.A("[project]/lib/openai.js [api] (ecmascript, async loader)");
                                // Salva temporaneamente il file per l'upload
                                const os = await __turbopack_context__.A("[externals]/os [external] (os, cjs, async loader)");
                                const tempDir = os.tmpdir();
                                const tempFilePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(tempDir, `temp_${Date.now()}_${originalFilename}`);
                                try {
                                    // Scrivi il buffer su file temporaneo
                                    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(tempFilePath, dataBuffer);
                                    // Estrai testo con OpenAI usando la queue (stesso metodo dei documenti AI)
                                    console.log('[PDF Extract] Aggiungo richiesta estrazione testo alla queue OpenAI');
                                    const openaiText = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2d$queue$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"].add(async ()=>{
                                        return await extractTextFromPdfWithOpenAI(tempFilePath);
                                    }, {
                                        priority: 7,
                                        maxRetries: 3,
                                        id: `extract_${Date.now()}`
                                    });
                                    if (openaiText && openaiText.trim().length > 0) {
                                        console.log('[OpenAI] Testo estratto dal PDF:', openaiText.trim().length, 'caratteri');
                                        return openaiText.trim();
                                    } else {
                                        throw new Error('OpenAI non ha estratto testo dal PDF');
                                    }
                                } finally{
                                    // Pulisci file temporaneo
                                    try {
                                        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(tempFilePath)) {
                                            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(tempFilePath);
                                        }
                                    } catch (cleanupError) {
                                        console.warn('Errore pulizia file temporaneo:', cleanupError);
                                    }
                                }
                            } catch (openaiError) {
                                console.error('[OpenAI] Estrazione testo fallita:', openaiError.message);
                                // Verifica se è un errore di rate limit
                                const isRateLimit = openaiError.message && (openaiError.message.includes('rate') || openaiError.message.includes('Limite') || openaiError.message.includes('429'));
                                if (isRateLimit) {
                                    console.log('[OpenAI] Rate limit raggiunto, provo OCR diretto come alternativa');
                                }
                                // Ultimo tentativo: OCR diretto sul PDF con Tesseract
                                console.log('[PDF Extract] Tentativo finale: OCR diretto sul PDF');
                                try {
                                    const { data: { text: directOcrText } } = await __TURBOPACK__imported__module__$5b$externals$5d2f$tesseract$2e$js__$5b$external$5d$__$28$tesseract$2e$js$2c$__cjs$29$__["default"].recognize(dataBuffer, 'ita+eng', {
                                        logger: (m)=>{
                                            if (m.status === 'recognizing text') {
                                                console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
                                            }
                                        }
                                    });
                                    if (directOcrText && directOcrText.trim().length > 0) {
                                        console.log('[OCR] Testo estratto direttamente dal PDF:', directOcrText.trim().length, 'caratteri');
                                        return directOcrText.trim();
                                    } else {
                                        throw new Error('OCR diretto non ha estratto testo');
                                    }
                                } catch (directOcrError) {
                                    console.error('[OCR] OCR diretto fallito:', directOcrError.message);
                                    // Costruisci messaggio di errore più informativo e utile
                                    let errorMessage = '';
                                    let suggestions = [];
                                    if (isRateLimit) {
                                        errorMessage = 'OpenAI ha raggiunto il limite di richieste. ';
                                        suggestions = [
                                            'Attendi 1-2 minuti e riprova',
                                            'Prova con un PDF che contiene testo nativo (non solo immagini scansionate)',
                                            'Converti il PDF in DOCX o TXT usando un altro tool prima di tradurlo',
                                            'Prova a estrarre il testo manualmente e incollalo come file TXT'
                                        ];
                                    } else {
                                        errorMessage = 'Impossibile estrarre testo dal PDF. ';
                                        suggestions = [
                                            'Il PDF potrebbe essere protetto o corrotto',
                                            'Il PDF potrebbe contenere solo immagini senza testo estraibile',
                                            'Prova a convertire il PDF in DOCX o TXT usando un altro tool',
                                            'Prova con un PDF diverso che contiene testo nativo'
                                        ];
                                    }
                                    errorMessage += '\n\nCosa puoi fare:\n';
                                    suggestions.forEach((suggestion, index)=>{
                                        errorMessage += `${index + 1}. ${suggestion}\n`;
                                    });
                                    errorMessage += '\nMetodi tentati: pdf-parse, conversione Sharp, estrazione OpenAI, OCR diretto.';
                                    throw new Error(errorMessage);
                                }
                            }
                        }
                    }
                }
                // Se abbiamo un'immagine, processiamola
                if (imageBuffer) {
                    console.log('[PDF Extract] Immagine ottenuta, dimensione:', imageBuffer.length, 'bytes');
                    try {
                        // Preprocessa l'immagine per migliorare OCR
                        const processedImage = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(imageBuffer).greyscale().normalize().sharpen().toBuffer();
                        // Esegui OCR sull'immagine
                        console.log('[OCR] Esecuzione OCR sulla prima pagina...');
                        const { data: { text: pageText } } = await __TURBOPACK__imported__module__$5b$externals$5d2f$tesseract$2e$js__$5b$external$5d$__$28$tesseract$2e$js$2c$__cjs$29$__["default"].recognize(processedImage, 'ita+eng', {
                            logger: (m)=>{
                                if (m.status === 'recognizing text') {
                                    console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
                                }
                            }
                        });
                        if (pageText && pageText.trim().length > 0) {
                            allTexts.push(pageText.trim());
                            console.log('[OCR] Testo estratto dalla prima pagina:', pageText.trim().length, 'caratteri');
                        } else {
                            throw new Error('OCR non ha estratto testo dall\'immagine');
                        }
                    } catch (processError) {
                        console.error('[OCR] Errore processando immagine:', processError.message);
                        throw new Error(`Errore durante l'OCR: ${processError.message}`);
                    }
                } else {
                    throw new Error('Impossibile ottenere immagine dal PDF');
                }
                if (allTexts.length > 0) {
                    const ocrText = allTexts.join('\n\n');
                    console.log('[OCR] Testo totale estratto via OCR:', ocrText.length, 'caratteri da', allTexts.length, 'pagina/e');
                    return ocrText;
                } else {
                    throw new Error('Nessun testo estratto dalle immagini del PDF');
                }
            } catch (ocrError) {
                console.error('[OCR] Errore OCR:', ocrError.message);
                throw new Error(`Errore durante l'estrazione del testo: ${ocrError.message}`);
            }
        }
        console.log('[PDF Extract] Estrazione completata con successo');
        return text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx') {
        const result = await __TURBOPACK__imported__module__$5b$externals$5d2f$mammoth__$5b$external$5d$__$28$mammoth$2c$__cjs$29$__["default"].extractRawText({
            path: filePath
        });
        return result.value;
    } else if (mimeType === 'application/msword' || ext === '.doc') {
        throw new Error('I file .doc non sono supportati. Converti in .docx o .pdf');
    } else if (mimeType === 'text/plain' || ext === '.txt') {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath, 'utf-8');
    } else if (mimeType === 'text/markdown' || ext === '.md') {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath, 'utf-8');
    } else {
        throw new Error('Formato file non supportato');
    }
}
// Funzione per tradurre testo usando OpenAI con queue e retry automatico
async function translateText(text, targetLanguage, preserveFormatting) {
    try {
        const languageNames = {
            'it': 'Italiano',
            'en': 'Inglese',
            'es': 'Spagnolo',
            'fr': 'Francese',
            'de': 'Tedesco',
            'pt': 'Portoghese',
            'ru': 'Russo',
            'ja': 'Giapponese',
            'zh': 'Cinese',
            'ar': 'Arabo'
        };
        const targetLangName = languageNames[targetLanguage] || targetLanguage;
        const prompt = preserveFormatting ? `Traduci il seguente testo in ${targetLangName} mantenendo ESATTAMENTE la stessa formattazione, struttura, interruzioni di riga e spaziatura. Non aggiungere commenti o spiegazioni, restituisci solo il testo tradotto:\n\n${text}` : `Traduci il seguente testo in ${targetLangName}. Restituisci solo la traduzione senza commenti:\n\n${text}`;
        // Usa la queue per gestire rate limiting e retry automatico
        console.log('[Translate] Aggiungo richiesta traduzione alla queue OpenAI');
        const translatedText = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2d$queue$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"].add(async ()=>{
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Sei un traduttore professionale. Traduci il testo mantenendo il tono e lo stile originale.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3
            });
            return response.choices[0].message.content;
        }, {
            priority: 8,
            maxRetries: 3,
            id: `translate_${Date.now()}_${targetLanguage}`
        });
        return translatedText;
    } catch (error) {
        console.error('Errore traduzione con OpenAI:', error);
        // Se è un errore di rate limit, fornisci un messaggio più chiaro
        if (error.message && (error.message.includes('rate') || error.message.includes('Limite') || error.message.includes('429'))) {
            throw new Error('OpenAI ha raggiunto il limite di richieste. La richiesta è stata messa in coda e verrà riprovata automaticamente. Riprova tra qualche minuto.');
        }
        throw new Error(`Errore durante la traduzione del testo: ${error.message || 'Errore sconosciuto'}`);
    }
}
// Funzione per creare documento tradotto
async function createTranslatedDocument(originalText, translatedText, originalPath, originalFilename, targetLanguage) {
    const ext = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].extname(originalFilename).toLowerCase();
    if (ext === '.pdf') {
        // Per PDF, creiamo un nuovo PDF con il testo tradotto
        // In produzione, useresti pdf-lib per mantenere meglio la formattazione
        const doc = new __TURBOPACK__imported__module__$5b$externals$5d2f$pdfkit__$5b$external$5d$__$28$pdfkit$2c$__cjs$29$__["default"]();
        const outputPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(originalPath), `translated_${Date.now()}.pdf`);
        const stream = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].createWriteStream(outputPath);
        doc.pipe(stream);
        doc.fontSize(12);
        // Dividi il testo in paragrafi per una migliore formattazione
        const paragraphs = translatedText.split('\n\n');
        paragraphs.forEach((para, index)=>{
            if (index > 0) doc.moveDown();
            doc.text(para, {
                align: 'left',
                continued: false
            });
        });
        doc.end();
        await new Promise((resolve, reject)=>{
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
        return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(outputPath);
    } else if (ext === '.docx') {
        // Per DOCX, creiamo un nuovo documento
        // In produzione, useresti docx o officegen per mantenere la formattazione
        const outputPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(originalPath), `translated_${Date.now()}.txt`);
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(outputPath, translatedText, 'utf-8');
        return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(outputPath);
    } else {
        // Per TXT e MD, creiamo un nuovo file di testo
        const outputPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(originalPath), `translated_${Date.now()}${ext}`);
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(outputPath, translatedText, 'utf-8');
        return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(outputPath);
    }
}
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }
    const uploadDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'uploads');
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(uploadDir)) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(uploadDir, {
            recursive: true
        });
    }
    const form = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__["default"])({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 50 * 1024 * 1024
    });
    try {
        const [fields, files] = await new Promise((resolve, reject)=>{
            form.parse(req, (err, fields, files)=>{
                if (err) reject(err);
                else resolve([
                    fields,
                    files
                ]);
            });
        });
        const documentFile = Array.isArray(files.document) ? files.document[0] : files.document;
        const targetLanguage = Array.isArray(fields.targetLanguage) ? fields.targetLanguage[0] : fields.targetLanguage || 'en';
        const preserveFormatting = Array.isArray(fields.preserveFormatting) ? fields.preserveFormatting[0] === 'true' : fields.preserveFormatting === 'true';
        if (!documentFile) {
            return res.status(400).json({
                error: 'Nessun documento caricato'
            });
        }
        // Estrai testo dal documento
        const originalText = await extractText(documentFile.filepath, documentFile.mimetype, documentFile.originalFilename);
        if (!originalText || originalText.trim().length === 0) {
            return res.status(400).json({
                error: 'Impossibile estrarre testo dal documento'
            });
        }
        // Traduci il testo
        const translatedText = await translateText(originalText, targetLanguage, preserveFormatting);
        // Crea documento tradotto
        const translatedBuffer = await createTranslatedDocument(originalText, translatedText, documentFile.filepath, documentFile.originalFilename, targetLanguage);
        // Determina il tipo MIME e nome file
        const ext = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].extname(documentFile.originalFilename).toLowerCase();
        let mimeType = 'application/octet-stream';
        let filename = `translated_${targetLanguage}_${documentFile.originalFilename}`;
        if (ext === '.pdf') {
            mimeType = 'application/pdf';
        } else if (ext === '.docx') {
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (ext === '.txt') {
            mimeType = 'text/plain';
        } else if (ext === '.md') {
            mimeType = 'text/markdown';
        }
        // Cleanup
        try {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(documentFile.filepath);
            // Pulisci anche i file temporanei creati
            const tempFiles = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(uploadDir).filter((f)=>f.startsWith('translated_'));
            tempFiles.forEach((f)=>{
                try {
                    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(uploadDir, f));
                } catch (e) {}
            });
        } catch (e) {
            console.error('Errore cleanup:', e);
        }
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.status(200).send(translatedBuffer);
    } catch (error) {
        console.error('Errore API Traduzione Documenti:', error);
        console.error('Stack trace:', error.stack);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            code: error.code
        });
        // Determina il messaggio di errore appropriato
        let errorMessage = 'Errore durante la traduzione del documento. Riprova con un file diverso.';
        if (error.message) {
            errorMessage = error.message;
        } else if (error.code === 'ENOENT') {
            errorMessage = 'File non trovato. Assicurati di aver caricato un file valido.';
        } else if (error.code === 'LIMIT_FILE_SIZE') {
            errorMessage = 'File troppo grande. Dimensione massima: 50MB.';
        }
        res.status(500).json({
            error: errorMessage,
            details: ("TURBOPACK compile-time truthy", 1) ? error.stack : "TURBOPACK unreachable"
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a7a833be._.js.map