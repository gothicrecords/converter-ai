module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/config/index.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized configuration for the application
 * All environment variables and app settings should be defined here
 */ __turbopack_context__.s([
    "config",
    ()=>config,
    "validateConfig",
    ()=>validateConfig
]);
const config = {
    // App
    app: {
        name: process.env.APP_NAME || 'Tool Suite',
        env: ("TURBOPACK compile-time value", "development") || 'development',
        port: parseInt(process.env.PORT || '3000', 10),
        url: (()=>{
            const appUrl = process.env.APP_URL || 'http://localhost:3000';
            // Normalize to HTTPS in production (Vercel always uses HTTPS)
            if (("TURBOPACK compile-time value", "development") === 'production' && appUrl.startsWith('http://')) //TURBOPACK unreachable
            ;
            return appUrl;
        })()
    },
    // Database
    database: {
        url: process.env.DATABASE_URL,
        pool: {
            max: parseInt(process.env.DB_POOL_MAX || '20', 10),
            idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
            connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10)
        }
    },
    // Supabase
    supabase: {
        url: ("TURBOPACK compile-time value", "https://ckctyvebrkcemcgllpbc.supabase.co"),
        anonKey: ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrY3R5dmVicWtjZW1jZ2xscGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDYzMzksImV4cCI6MjA3ODkyMjMzOX0.kGyjcR9D8vLD5xYsEvHA5qAQ08OvoOC4mgajSmnh0jM"),
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    // Stripe
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: ("TURBOPACK compile-time value", "pk_test_51SUZp0AYkkHFHNFuDK9bY1iN8xNUFPeBVZTSLgTBq5SxSo7bBeyaMYSTaaLfJ2g5oxOCXOO1bAAefqa5I9StJwF9001XRLRFQf"),
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        productId: process.env.STRIPE_PRODUCT_ID || 'prod_TTkHuBeh8iAAht'
    },
    // Cloudinary
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    // OpenAI
    openai: {
        apiKey: process.env.OPENAI_API_KEY
    },
    // File upload
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10),
        allowedMimeTypes: {
            image: [
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/gif',
                'image/svg+xml'
            ],
            document: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ],
            video: [
                'video/mp4',
                'video/webm',
                'video/ogg'
            ],
            audio: [
                'audio/mpeg',
                'audio/wav',
                'audio/ogg'
            ]
        },
        tempDir: process.env.TEMP_DIR || '/tmp'
    },
    // Session
    session: {
        cookieName: 'megapixelai_session',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secret: process.env.SESSION_SECRET || 'change-me-in-production'
    },
    // Security
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10),
            max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
        }
    },
    // Analytics
    analytics: {
        gaTrackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID
    },
    // OAuth
    oauth: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        },
        facebook: {
            appId: process.env.FACEBOOK_APP_ID,
            appSecret: process.env.FACEBOOK_APP_SECRET
        },
        // Use production domain for OAuth in production, localhost/VERCEL_URL elsewhere
        redirectBaseUrl: (()=>{
            // In production environment, use explicit APP_URL or fallback to production domain
            if (process.env.VERCEL_ENV === 'production') {
                return process.env.APP_URL || 'https://megapixelsuite.com';
            }
            // In preview/development, prefer APP_URL, else use VERCEL_URL or localhost
            return process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        })()
    }
};
function validateConfig() {
    const required = [
        {
            key: 'database.url',
            value: config.database.url
        },
        {
            key: 'supabase.url',
            value: config.supabase.url
        },
        {
            key: 'supabase.anonKey',
            value: config.supabase.anonKey
        }
    ];
    const missing = required.filter(({ value })=>!value);
    if (missing.length > 0) {
        throw new Error(`Missing required configuration: ${missing.map(({ key })=>key).join(', ')}`);
    }
}
// Validate on import in production, but do not crash the app.
// Use STRICT_CONFIG=true to enforce hard failures.
if (config.app.env === 'production') {
    const strict = process.env.STRICT_CONFIG === 'true';
    try {
        validateConfig();
    } catch (e) {
        if (strict) {
            throw e;
        } else {
            // Log a clear warning and continue running to avoid site-wide downtime
            console.error('[Config Warning] Missing required configuration:', e.message);
        }
    }
}
}),
"[externals]/bcryptjs [external] (bcryptjs, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("bcryptjs");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/pg [external] (pg, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/lib/db.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

// Neon Database Connection (using standard pg driver)
__turbopack_context__.s([
    "addUserHistory",
    ()=>addUserHistory,
    "createOAuthUser",
    ()=>createOAuthUser,
    "createSession",
    ()=>createSession,
    "createUser",
    ()=>createUser,
    "deleteSession",
    ()=>deleteSession,
    "getSession",
    ()=>getSession,
    "getUser",
    ()=>getUser,
    "getUserByProvider",
    ()=>getUserByProvider,
    "getUserByStripeCustomerId",
    ()=>getUserByStripeCustomerId,
    "getUserHistory",
    ()=>getUserHistory,
    "query",
    ()=>query,
    "updateUserProvider",
    ()=>updateUserProvider,
    "updateUserStats",
    ()=>updateUserStats,
    "updateUserStripeCustomer",
    ()=>updateUserStripeCustomer,
    "updateUserSubscription",
    ()=>updateUserSubscription
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/index.js [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const { Pool } = __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["default"];
if (!__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["config"].database.url) {
    throw new Error('DATABASE_URL environment variable is not set');
}
// Create optimized connection pool
const pool = new Pool({
    connectionString: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["config"].database.url,
    ssl: {
        rejectUnauthorized: false
    },
    max: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["config"].database.pool.max,
    idleTimeoutMillis: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["config"].database.pool.idleTimeout,
    connectionTimeoutMillis: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["config"].database.pool.connectionTimeout,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
});
// Error handler for pool
pool.on('error', (err)=>{
    console.error('Unexpected database pool error', err);
});
async function query(text, params = []) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        if (duration > 1000) {
            console.warn(`Slow query (${duration}ms): ${text.substring(0, 100)}`);
        }
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
async function getUser(email) {
    const result = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [
        email
    ]);
    return result[0];
}
async function createUser(email, name, passwordHash) {
    const result = await query(`INSERT INTO users (email, name, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at, images_processed, tools_used, has_discount, plan`, [
        email,
        name,
        passwordHash
    ]);
    return result[0];
}
async function getUserByProvider(provider, providerId) {
    const result = await query('SELECT * FROM users WHERE auth_provider = $1 AND provider_id = $2 LIMIT 1', [
        provider,
        providerId
    ]);
    return result[0];
}
async function createOAuthUser({ email, name, provider, providerId, providerEmail, avatarUrl }) {
    try {
        const result = await query(`INSERT INTO users (email, name, auth_provider, provider_id, provider_email, avatar_url, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, NULL)
       RETURNING id, email, name, created_at, images_processed, tools_used, has_discount, plan, auth_provider, avatar_url`, [
            email,
            name,
            provider,
            providerId,
            providerEmail || email,
            avatarUrl
        ]);
        if (!result || result.length === 0) {
            throw new Error('Failed to create OAuth user: no data returned');
        }
        return result[0];
    } catch (error) {
        console.error('Error creating OAuth user:', {
            error: error.message,
            code: error.code,
            detail: error.detail,
            email,
            provider
        });
        // Check if it's a database schema error (missing columns)
        if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
            throw new Error('Database schema error: OAuth fields missing. Please run the migration: migrations/add-oauth-fields.sql');
        }
        throw error;
    }
}
async function updateUserProvider(userId, { provider, providerId, providerEmail, avatarUrl }) {
    const result = await query(`UPDATE users
     SET auth_provider = $2,
         provider_id = $3,
         provider_email = $4,
         avatar_url = COALESCE($5, avatar_url),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, name, created_at, images_processed, tools_used, has_discount, plan, auth_provider, avatar_url`, [
        userId,
        provider,
        providerId,
        providerEmail,
        avatarUrl
    ]);
    return result[0];
}
async function createSession(userId, sessionToken, expiresAt) {
    const result = await query(`INSERT INTO user_sessions (user_id, session_token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`, [
        userId,
        sessionToken,
        expiresAt
    ]);
    return result[0];
}
async function getSession(sessionToken) {
    const result = await query(`SELECT s.*, u.email, u.name, u.images_processed, u.tools_used, u.has_discount, u.plan
     FROM user_sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.session_token = $1
     AND s.expires_at > NOW()
     LIMIT 1`, [
        sessionToken
    ]);
    return result[0];
}
async function deleteSession(sessionToken) {
    await query('DELETE FROM user_sessions WHERE session_token = $1', [
        sessionToken
    ]);
}
async function updateUserStats(userId, imagesProcessed, toolsUsed) {
    const result = await query(`UPDATE users
     SET images_processed = $2,
         tools_used = $3,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`, [
        userId,
        imagesProcessed,
        JSON.stringify(toolsUsed)
    ]);
    return result[0];
}
async function addUserHistory(userId, toolName, thumbnail, metadata) {
    const result = await query(`INSERT INTO user_history (user_id, tool_name, thumbnail, metadata)
     VALUES ($1, $2, $3, $4)
     RETURNING *`, [
        userId,
        toolName,
        thumbnail,
        JSON.stringify(metadata)
    ]);
    return result[0];
}
async function getUserHistory(userId, limit = 20) {
    const result = await query(`SELECT * FROM user_history
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`, [
        userId,
        limit
    ]);
    return result;
}
async function updateUserStripeCustomer(userId, stripeCustomerId) {
    const result = await query(`UPDATE users
     SET stripe_customer_id = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`, [
        userId,
        stripeCustomerId
    ]);
    return result[0];
}
async function updateUserSubscription(userId, subscriptionId, status, expiresAt) {
    const result = await query(`UPDATE users
     SET stripe_subscription_id = $2,
         stripe_subscription_status = $3,
         subscription_expires_at = $4,
         plan = CASE WHEN $3 = 'active' THEN 'pro' ELSE 'free' END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`, [
        userId,
        subscriptionId,
        status,
        expiresAt
    ]);
    return result[0];
}
async function getUserByStripeCustomerId(stripeCustomerId) {
    const result = await query('SELECT * FROM users WHERE stripe_customer_id = $1 LIMIT 1', [
        stripeCustomerId
    ]);
    return result[0];
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/errors/index.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized error handling
 * Provides consistent error responses and error classes
 */ __turbopack_context__.s([
    "AppError",
    ()=>AppError,
    "AuthenticationError",
    ()=>AuthenticationError,
    "AuthorizationError",
    ()=>AuthorizationError,
    "ConflictError",
    ()=>ConflictError,
    "DatabaseError",
    ()=>DatabaseError,
    "FileSystemError",
    ()=>FileSystemError,
    "FileTooLargeError",
    ()=>FileTooLargeError,
    "InvalidFileTypeError",
    ()=>InvalidFileTypeError,
    "NetworkError",
    ()=>NetworkError,
    "NotFoundError",
    ()=>NotFoundError,
    "ProcessingError",
    ()=>ProcessingError,
    "RateLimitError",
    ()=>RateLimitError,
    "TimeoutError",
    ()=>TimeoutError,
    "ValidationError",
    ()=>ValidationError,
    "asyncHandler",
    ()=>asyncHandler,
    "formatErrorResponse",
    ()=>formatErrorResponse,
    "handleApiError",
    ()=>handleApiError,
    "retryOperation",
    ()=>retryOperation
]);
class AppError extends Error {
    constructor(message, statusCode = 500, code = null, details = null, originalError = null){
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
        this.requestId = null; // Can be set by middleware
        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error().stack;
        }
    }
    /**
   * Convert error to plain object for logging
   */ toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            code: this.code,
            details: this.details,
            timestamp: this.timestamp,
            requestId: this.requestId,
            stack: this.stack
        };
    }
}
class ValidationError extends AppError {
    constructor(message, details = null){
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}
class AuthenticationError extends AppError {
    constructor(message = 'Authentication required'){
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}
class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions'){
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}
class NotFoundError extends AppError {
    constructor(resource = 'Resource'){
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}
class ConflictError extends AppError {
    constructor(message){
        super(message, 409, 'CONFLICT');
    }
}
class RateLimitError extends AppError {
    constructor(message = 'Too many requests', retryAfter = null){
        super(message, 429, 'RATE_LIMIT_EXCEEDED', retryAfter ? {
            retryAfter
        } : null);
    }
}
class DatabaseError extends AppError {
    constructor(message, originalError = null){
        super(message, 500, 'DATABASE_ERROR', null, originalError);
    }
}
class FileSystemError extends AppError {
    constructor(message, originalError = null){
        super(message, 500, 'FILE_SYSTEM_ERROR', null, originalError);
    }
}
class NetworkError extends AppError {
    constructor(message, originalError = null){
        super(message, 503, 'NETWORK_ERROR', null, originalError);
    }
}
class TimeoutError extends AppError {
    constructor(message = 'Request timeout', timeoutMs = null){
        super(message, 408, 'TIMEOUT_ERROR', timeoutMs ? {
            timeoutMs
        } : null);
    }
}
class FileTooLargeError extends AppError {
    constructor(maxSize, actualSize = null){
        const message = `File too large. Maximum size is ${formatFileSize(maxSize)}`;
        super(message, 413, 'FILE_TOO_LARGE', {
            maxSize,
            actualSize
        });
    }
}
class InvalidFileTypeError extends AppError {
    constructor(allowedTypes = null){
        const message = allowedTypes ? `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` : 'Invalid file type';
        super(message, 400, 'INVALID_FILE_TYPE', {
            allowedTypes
        });
    }
}
class ProcessingError extends AppError {
    constructor(message, originalError = null){
        super(message, 500, 'PROCESSING_ERROR', null, originalError);
    }
}
/**
 * Format file size for human-readable display
 */ function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = [
        'Bytes',
        'KB',
        'MB',
        'GB'
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
/**
 * Enhanced error logger with advanced tracking
 */ async function logError(error, context = {}) {
    const errorInfo = {
        timestamp: new Date().toISOString(),
        error: error instanceof AppError ? error.toJSON() : {
            name: error.name,
            message: error.message,
            stack: error.stack
        },
        context,
        environment: ("TURBOPACK compile-time value", "development")
    };
    // Log to console with appropriate level
    if (error instanceof AppError && error.statusCode < 500) {
        // Client errors (4xx) - log as warning
        console.warn('Client Error:', JSON.stringify(errorInfo, null, 2));
    } else {
        // Server errors (5xx) - log as error
        console.error('Server Error:', JSON.stringify(errorInfo, null, 2));
    }
    // Track error with advanced error tracker
    try {
        const { default: errorTracker } = await __turbopack_context__.A("[project]/lib/errorTracker.js [api] (ecmascript, async loader)");
        const { log } = await __turbopack_context__.A("[project]/lib/logger.js [api] (ecmascript, async loader)");
        await errorTracker.trackError(error, context);
        log.error('Error logged', error, context);
    } catch (importError) {
        // Error tracker not available, continue with basic logging
        console.warn('Error tracker not available:', importError.message);
    }
    // In production, you might want to send to error tracking service
    // Example: Sentry, LogRocket, etc.
    if (("TURBOPACK compile-time value", "development") === 'production' && process.env.ERROR_TRACKING_ENABLED === 'true') {
    // TODO: Integrate with error tracking service
    // trackError(errorInfo);
    }
    return errorInfo;
}
function formatErrorResponse(error, includeStack = false, includeDetails = true) {
    const isDevelopment = ("TURBOPACK compile-time value", "development") === 'development';
    const response = {
        error: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_ERROR'
    };
    // Include details if available and allowed
    if (includeDetails && error.details) {
        response.details = error.details;
    }
    // Include stack trace only in development
    if ("TURBOPACK compile-time truthy", 1) {
        response.stack = error.stack;
    }
    // Include request ID if available
    if (error.requestId) {
        response.requestId = error.requestId;
    }
    // Include timestamp
    if (error.timestamp) {
        response.timestamp = error.timestamp;
    }
    return response;
}
async function handleApiError(error, res, context = {}) {
    // Log the error with context
    await logError(error, context);
    // If response already sent, just log
    if (res.headersSent) {
        return;
    }
    // Handle known error types
    if (error instanceof AppError) {
        return res.status(error.statusCode).json(formatErrorResponse(error, false, true));
    }
    // Handle specific error types from libraries and Node.js
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json(formatErrorResponse(new ValidationError(error.message, error.errors), false));
    }
    // Handle database connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return res.status(503).json(formatErrorResponse(new NetworkError('Database connection failed', error), false));
    }
    // Handle file system errors
    if (error.code === 'ENOENT' || error.code === 'EACCES' || error.code === 'EMFILE') {
        return res.status(500).json(formatErrorResponse(new FileSystemError('File system operation failed', error), false));
    }
    // Handle timeout errors
    if (error.message && (error.message.includes('timeout') || error.message.includes('ETIMEDOUT'))) {
        return res.status(408).json(formatErrorResponse(new TimeoutError('Request timeout', error.timeout), false));
    }
    // Handle file size errors
    if (error.code === 'LIMIT_FILE_SIZE' || error.message?.includes('too large')) {
        return res.status(413).json(formatErrorResponse(new FileTooLargeError(), false));
    }
    // Default to 500 with safe error message
    const isDevelopment = ("TURBOPACK compile-time value", "development") === 'development';
    const safeMessage = ("TURBOPACK compile-time truthy", 1) ? error.message || 'Internal server error' : "TURBOPACK unreachable";
    res.status(500).json(formatErrorResponse(new AppError(safeMessage, 500, 'INTERNAL_ERROR', null, error), isDevelopment));
}
function asyncHandler(handler) {
    return async (req, res, next)=>{
        try {
            await handler(req, res, next);
        } catch (error) {
            handleApiError(error, res, {
                method: req.method,
                url: req.url,
                path: req.path,
                query: req.query,
                user: req.user?.id
            });
        }
    };
}
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    for(let attempt = 1; attempt <= maxRetries; attempt++){
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            // Don't retry on certain errors
            if (error instanceof ValidationError || error instanceof AuthenticationError || error instanceof AuthorizationError) {
                throw error;
            }
            // If last attempt, throw error
            if (attempt === maxRetries) {
                break;
            }
            // Wait before retrying (exponential backoff)
            const waitTime = delay * Math.pow(2, attempt - 1);
            await new Promise((resolve)=>setTimeout(resolve, waitTime));
        }
    }
    throw lastError;
}
}),
"[project]/validators/index.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized validation functions
 * Reusable validators for common data types
 */ __turbopack_context__.s([
    "sanitizeString",
    ()=>sanitizeString,
    "validateEmail",
    ()=>validateEmail,
    "validateFile",
    ()=>validateFile,
    "validateName",
    ()=>validateName,
    "validatePagination",
    ()=>validatePagination,
    "validatePassword",
    ()=>validatePassword,
    "validateRequired",
    ()=>validateRequired,
    "validateUUID",
    ()=>validateUUID
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/errors/index.js [api] (ecmascript)");
;
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"]('Email is required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"]('Invalid email format');
    }
    return email.toLowerCase().trim();
}
function validatePassword(password, minLength = 6) {
    if (!password || typeof password !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"]('Password is required');
    }
    if (password.length < minLength) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"](`Password must be at least ${minLength} characters`);
    }
    return password;
}
function validateName(name, fieldName = 'Name') {
    if (!name || typeof name !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"](`${fieldName} is required`);
    }
    const trimmed = name.trim();
    if (trimmed.length < 2) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"](`${fieldName} must be at least 2 characters`);
    }
    if (trimmed.length > 100) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"](`${fieldName} must be less than 100 characters`);
    }
    return trimmed;
}
function validateFile(file, options = {}) {
    const { maxSize = 50 * 1024 * 1024, allowedMimeTypes = null, required = true } = options;
    if (!file) {
        if (required) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"]('File is required');
        }
        return null;
    }
    // Check file size
    if (file.size > maxSize) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"](`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
    }
    // Check mime type
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"](`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }
    return file;
}
function validatePagination(page, limit, maxLimit = 100) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    if (pageNum < 1) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"]('Page must be greater than 0');
    }
    if (limitNum < 1) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"]('Limit must be greater than 0');
    }
    if (limitNum > maxLimit) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"](`Limit cannot exceed ${maxLimit}`);
    }
    return {
        page: pageNum,
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
    };
}
function validateUUID(uuid, fieldName = 'ID') {
    if (!uuid || typeof uuid !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"](`${fieldName} is required`);
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"](`Invalid ${fieldName} format`);
    }
    return uuid;
}
function validateRequired(data, fields) {
    const missing = fields.filter((field)=>{
        const value = data[field];
        return value === undefined || value === null || value === '';
    });
    if (missing.length > 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"](`Missing required fields: ${missing.join(', ')}`);
    }
}
function sanitizeString(str, maxLength = null) {
    if (typeof str !== 'string') {
        return '';
    }
    let sanitized = str.trim();
    if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    return sanitized;
}
}),
"[project]/services/auth/index.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

/**
 * Authentication Service
 * Centralized authentication logic
 */ __turbopack_context__.s([
    "authenticateUser",
    ()=>authenticateUser,
    "createUserSession",
    ()=>createUserSession,
    "getUserFromSession",
    ()=>getUserFromSession,
    "logoutUser",
    ()=>logoutUser,
    "registerOrLoginOAuthUser",
    ()=>registerOrLoginOAuthUser,
    "registerUser",
    ()=>registerUser
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/bcryptjs [external] (bcryptjs, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/errors/index.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$validators$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/validators/index.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/index.js [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
async function registerUser({ name, email, password }) {
    // Validate input
    const validatedName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$validators$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["validateName"])(name);
    const validatedEmail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$validators$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["validateEmail"])(email);
    const validatedPassword = (0, __TURBOPACK__imported__module__$5b$project$5d2f$validators$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["validatePassword"])(password, 6);
    // Check if user already exists
    const existingUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$api$5d$__$28$ecmascript$29$__["getUser"])(validatedEmail);
    if (existingUser) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ConflictError"]('Email already registered');
    }
    // Hash password
    const passwordHash = await __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__esm_import$29$__["default"].hash(validatedPassword, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["config"].security.bcryptRounds);
    // Create user
    const newUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$api$5d$__$28$ecmascript$29$__["createUser"])(validatedEmail, validatedName, passwordHash);
    // Create session
    const { sessionToken, expiresAt } = await createUserSession(newUser.id);
    return {
        user: sanitizeUser(newUser),
        sessionToken,
        expiresAt
    };
}
async function authenticateUser({ email, password }) {
    // Validate input
    const validatedEmail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$validators$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["validateEmail"])(email);
    if (!password) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"]('Password is required');
    }
    // Find user
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$api$5d$__$28$ecmascript$29$__["getUser"])(validatedEmail);
    if (!user) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["AuthenticationError"]('Invalid email or password');
    }
    // Verify password
    const isPasswordValid = await __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__esm_import$29$__["default"].compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["AuthenticationError"]('Invalid email or password');
    }
    // Create session
    const { sessionToken, expiresAt } = await createUserSession(user.id);
    return {
        user: sanitizeUser(user),
        sessionToken,
        expiresAt
    };
}
async function createUserSession(userId) {
    const sessionToken = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["config"].session.maxAge);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$api$5d$__$28$ecmascript$29$__["createSession"])(userId, sessionToken, expiresAt);
    return {
        sessionToken,
        expiresAt
    };
}
async function logoutUser(sessionToken) {
    if (sessionToken) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$api$5d$__$28$ecmascript$29$__["deleteSession"])(sessionToken);
    }
}
async function getUserFromSession(sessionToken) {
    if (!sessionToken) {
        return null;
    }
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$api$5d$__$28$ecmascript$29$__["getSession"])(sessionToken);
    if (!session) {
        return null;
    }
    return {
        id: session.user_id,
        email: session.email,
        name: session.name,
        images_processed: session.images_processed,
        tools_used: session.tools_used,
        has_discount: session.has_discount,
        plan: session.plan
    };
}
async function registerOrLoginOAuthUser({ provider, providerId, email, name, avatarUrl }) {
    // Validate input
    const validatedEmail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$validators$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["validateEmail"])(email);
    // For OAuth, use a more permissive name validation - fallback to email username if name is invalid
    let validatedName;
    try {
        validatedName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$validators$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["validateName"])(name || email.split('@')[0]);
    } catch (nameError) {
        // If name validation fails, use email username as fallback
        const emailUsername = email.split('@')[0];
        validatedName = emailUsername.length >= 2 ? emailUsername : `user_${Date.now()}`;
        console.warn('Name validation failed for OAuth user, using fallback:', validatedName);
    }
    // Check if user exists with this provider+providerId
    const existingOAuthUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$api$5d$__$28$ecmascript$29$__["getUserByProvider"])(provider, providerId);
    if (existingOAuthUser) {
        // User already exists with this OAuth account, create session
        const { sessionToken, expiresAt } = await createUserSession(existingOAuthUser.id);
        return {
            user: sanitizeUser(existingOAuthUser),
            sessionToken,
            expiresAt
        };
    }
    // Check if user exists with same email
    const existingEmailUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$api$5d$__$28$ecmascript$29$__["getUser"])(validatedEmail);
    if (existingEmailUser) {
        // Link OAuth account to existing user
        const updatedUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$api$5d$__$28$ecmascript$29$__["updateUserProvider"])(existingEmailUser.id, {
            provider,
            providerId,
            providerEmail: validatedEmail,
            avatarUrl
        });
        const { sessionToken, expiresAt } = await createUserSession(updatedUser.id);
        return {
            user: sanitizeUser(updatedUser),
            sessionToken,
            expiresAt
        };
    }
    // Create new OAuth user
    const newUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$api$5d$__$28$ecmascript$29$__["createOAuthUser"])({
        email: validatedEmail,
        name: validatedName,
        provider,
        providerId,
        providerEmail: validatedEmail,
        avatarUrl
    });
    // Create session
    const { sessionToken, expiresAt } = await createUserSession(newUser.id);
    return {
        user: sanitizeUser(newUser),
        sessionToken,
        expiresAt
    };
}
/**
 * Sanitize user object (remove sensitive data)
 */ function sanitizeUser(user) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/pages/api/auth/oauth/google/callback.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>googleCallbackHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/index.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$auth$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/auth/index.js [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$auth$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$services$2f$auth$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function googleCallbackHandler(req, res) {
    // Only allow GET requests (OAuth callbacks are GET)
    if (req.method !== 'GET') {
        return res.status(405).redirect(`/login?error=${encodeURIComponent('Method not allowed')}`);
    }
    try {
        const { code, state, error } = req.query;
        // Check for errors from Google
        if (error) {
            console.error('Google OAuth error:', error);
            return res.redirect(`/login?error=${encodeURIComponent('OAuth authentication failed')}`);
        }
        if (!code || !state) {
            console.error('Missing code or state in OAuth callback');
            return res.redirect(`/login?error=${encodeURIComponent('Invalid OAuth response')}`);
        }
        // Verify state token (CSRF protection)
        // Parse cookies from header
        const cookies = req.headers.cookie?.split(';').reduce((acc, cookie)=>{
            const [key, value] = cookie.trim().split('=');
            acc[key] = decodeURIComponent(value || '');
            return acc;
        }, {}) || {};
        const cookieState = cookies.oauth_state;
        if (!cookieState || cookieState !== state) {
            console.error('Invalid state token:', {
                cookieState,
                state
            });
            return res.redirect(`/login?error=${encodeURIComponent('Invalid state token')}`);
        }
        // Clear state cookie
        res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
        // Check OAuth configuration
        const { clientId, clientSecret } = __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["config"].oauth.google || {};
        if (!clientId || !clientSecret) {
            console.error('Google OAuth not configured');
            return res.redirect(`/login?error=${encodeURIComponent('OAuth not configured')}`);
        }
        const redirectUri = `${__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["config"].oauth.redirectBaseUrl}/api/auth/oauth/google/callback`;
        // Exchange authorization code for access token
        let tokenResponse;
        try {
            tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code'
                })
            });
        } catch (fetchError) {
            console.error('Failed to fetch token from Google:', fetchError);
            return res.redirect(`/login?error=${encodeURIComponent('Failed to connect to Google')}`);
        }
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json().catch(()=>({
                    error: 'Unknown error'
                }));
            console.error('Google token exchange error:', errorData);
            return res.redirect(`/login?error=${encodeURIComponent('Failed to exchange token')}`);
        }
        const tokenData = await tokenResponse.json();
        const { access_token } = tokenData;
        if (!access_token) {
            console.error('No access token in response:', tokenData);
            return res.redirect(`/login?error=${encodeURIComponent('No access token received')}`);
        }
        // Get user info from Google
        let userInfoResponse;
        try {
            userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
        } catch (fetchError) {
            console.error('Failed to fetch user info from Google:', fetchError);
            return res.redirect(`/login?error=${encodeURIComponent('Failed to get user info')}`);
        }
        if (!userInfoResponse.ok) {
            const errorText = await userInfoResponse.text();
            console.error('Google user info error:', errorText);
            return res.redirect(`/login?error=${encodeURIComponent('Failed to get user info')}`);
        }
        const userInfo = await userInfoResponse.json();
        const { id: providerId, email, name, picture: avatarUrl } = userInfo;
        if (!email) {
            console.error('No email in user info:', userInfo);
            return res.redirect(`/login?error=${encodeURIComponent('Email not provided by Google')}`);
        }
        if (!providerId) {
            console.error('No provider ID in user info:', userInfo);
            return res.redirect(`/login?error=${encodeURIComponent('User ID not provided by Google')}`);
        }
        // Register or login user
        let result;
        try {
            console.log('Attempting to register/login OAuth user:', {
                provider: 'google',
                providerId: String(providerId),
                email,
                name: name || email.split('@')[0]
            });
            result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$auth$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["registerOrLoginOAuthUser"])({
                provider: 'google',
                providerId: String(providerId),
                email,
                name: name || email.split('@')[0],
                avatarUrl: avatarUrl || null
            });
            console.log('registerOrLoginOAuthUser result:', {
                hasUser: !!result?.user,
                userId: result?.user?.id,
                hasSessionToken: !!result?.sessionToken
            });
        } catch (authError) {
            console.error('Error in registerOrLoginOAuthUser:', {
                error: authError.message,
                stack: authError.stack,
                name: authError.name
            });
            return res.redirect(`/login?error=${encodeURIComponent(`Failed to create user: ${authError.message || 'Unknown error'}`)}`);
        }
        if (!result || !result.user) {
            console.error('Invalid result from registerOrLoginOAuthUser:', result);
            return res.redirect(`/login?error=${encodeURIComponent('Failed to authenticate')}`);
        }
        // Use session token from registerOrLoginOAuthUser (it already creates the session)
        let sessionToken = result.sessionToken;
        if (!sessionToken) {
            console.error('No session token in result, creating manually:', result);
            // Try to create session manually as fallback
            try {
                const sessionResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$auth$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["createUserSession"])(result.user.id);
                sessionToken = sessionResult.sessionToken;
                console.log('Created session manually:', !!sessionToken);
            } catch (sessionError) {
                console.error('Error creating session manually:', sessionError);
                return res.redirect(`/login?error=${encodeURIComponent('Failed to create session')}`);
            }
        }
        if (!sessionToken) {
            console.error('No session token available after all attempts');
            return res.redirect(`/login?error=${encodeURIComponent('Failed to create session')}`);
        }
        // Save session token in cookie and redirect
        const cookieMaxAge = 7 * 24 * 60 * 60; // 7 days
        res.setHeader('Set-Cookie', `megapixelai_session=${sessionToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${cookieMaxAge}`);
        // Redirect to dashboard with success
        return res.redirect('/dashboard?welcome=true');
    } catch (error) {
        console.error('Google OAuth callback unexpected error:', error);
        return res.redirect(`/login?error=${encodeURIComponent('Authentication error')}`);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f6bff3db._.js.map