module.exports = [
"[externals]/winston [external] (winston, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("winston", () => require("winston"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[project]/lib/logger.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Advanced Structured Logging System
 * Provides comprehensive logging with different levels, transports, and error tracking
 */ __turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "log",
    ()=>log
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/winston [external] (winston, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/url [external] (url, cjs)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("lib/logger.js")}`;
    }
};
;
;
;
const __filename = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["fileURLToPath"])(__TURBOPACK__import$2e$meta__.url);
const __dirname = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(__filename);
// Custom log format
const logFormat = __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].format.combine(__TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].format.errors({
    stack: true
}), __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].format.splat(), __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].format.json());
// Console format for development
const consoleFormat = __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].format.combine(__TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].format.colorize(), __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].format.timestamp({
    format: 'HH:mm:ss'
}), __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].format.printf(({ timestamp, level, message, ...meta })=>{
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0 && meta.stack) {
        msg += `\n${meta.stack}`;
    } else if (Object.keys(meta).length > 0) {
        msg += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
}));
// Create logs directory if it doesn't exist
const logsDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'logs');
// Create Winston logger instance
const logger = __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].createLogger({
    level: process.env.LOG_LEVEL || (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 'debug'),
    format: logFormat,
    defaultMeta: {
        service: 'upscaler-ai',
        environment: ("TURBOPACK compile-time value", "development") || 'development'
    },
    transports: [
        // Console transport
        new __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].transports.Console({
            format: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : consoleFormat,
            handleExceptions: true,
            handleRejections: true
        }),
        // Error log file
        new __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].transports.File({
            filename: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
            format: logFormat
        }),
        // Combined log file
        new __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].transports.File({
            filename: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(logsDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5,
            format: logFormat
        })
    ],
    exceptionHandlers: [
        new __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].transports.File({
            filename: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(logsDir, 'exceptions.log'),
            maxsize: 5242880,
            maxFiles: 3
        })
    ],
    rejectionHandlers: [
        new __TURBOPACK__imported__module__$5b$externals$5d2f$winston__$5b$external$5d$__$28$winston$2c$__cjs$29$__["default"].transports.File({
            filename: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(logsDir, 'rejections.log'),
            maxsize: 5242880,
            maxFiles: 3
        })
    ]
});
const log = {
    /**
   * Log error with full context
   */ error: (message, error = null, context = {})=>{
        const logData = {
            message,
            ...context
        };
        if (error) {
            logData.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
                statusCode: error.statusCode,
                details: error.details
            };
        }
        logger.error(message, logData);
        return logData;
    },
    /**
   * Log warning
   */ warn: (message, context = {})=>{
        logger.warn(message, context);
    },
    /**
   * Log info
   */ info: (message, context = {})=>{
        logger.info(message, context);
    },
    /**
   * Log debug (only in development)
   */ debug: (message, context = {})=>{
        if ("TURBOPACK compile-time truthy", 1) {
            logger.debug(message, context);
        }
    },
    /**
   * Log API request
   */ api: (req, res, responseTime = null)=>{
        const logData = {
            method: req.method,
            url: req.url,
            path: req.path,
            statusCode: res.statusCode,
            userAgent: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress
        };
        if (responseTime) {
            logData.responseTime = `${responseTime}ms`;
        }
        if (res.statusCode >= 400) {
            logger.warn('API Request', logData);
        } else {
            logger.info('API Request', logData);
        }
    },
    /**
   * Log database operation
   */ database: (operation, query = null, duration = null, error = null)=>{
        const logData = {
            operation,
            duration: duration ? `${duration}ms` : null
        };
        if (query) {
            logData.query = typeof query === 'string' ? query : JSON.stringify(query);
        }
        if (error) {
            logger.error('Database Operation Failed', {
                ...logData,
                error
            });
        } else {
            logger.debug('Database Operation', logData);
        }
    },
    /**
   * Log file operation
   */ file: (operation, filePath, size = null, error = null)=>{
        const logData = {
            operation,
            filePath,
            size: size ? `${(size / 1024).toFixed(2)}KB` : null
        };
        if (error) {
            logger.error('File Operation Failed', {
                ...logData,
                error
            });
        } else {
            logger.debug('File Operation', logData);
        }
    },
    /**
   * Log performance metric
   */ performance: (operation, duration, context = {})=>{
        logger.info('Performance Metric', {
            operation,
            duration: `${duration}ms`,
            ...context
        });
    }
};
const __TURBOPACK__default__export__ = logger;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5b4cbf41._.js.map