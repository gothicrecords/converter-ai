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
        url: process.env.APP_URL || 'http://localhost:3000'
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
        redirectBaseUrl: process.env.APP_URL || 'http://localhost:3000'
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
// Validate on import in production
if (config.app.env === 'production') {
    validateConfig();
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/pages/api/auth/oauth/google.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>googleOAuthHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/index.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
;
async function googleOAuthHandler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).redirect(`/login?error=${encodeURIComponent('Method not allowed')}`);
    }
    try {
        // Check OAuth configuration
        const { clientId, redirectBaseUrl } = __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["config"].oauth?.google || {};
        if (!clientId) {
            console.error('Google OAuth not configured: missing clientId');
            return res.redirect(`/login?error=${encodeURIComponent('OAuth not configured')}`);
        }
        if (!redirectBaseUrl) {
            console.error('Google OAuth not configured: missing redirectBaseUrl');
            return res.redirect(`/login?error=${encodeURIComponent('OAuth not configured')}`);
        }
        // Generate state token for CSRF protection
        const state = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
        // Store state in session/cookie (simplified - in production use secure session)
        res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`);
        // Google OAuth 2.0 authorization URL
        const redirectUri = `${redirectBaseUrl}/api/auth/oauth/google/callback`;
        const scope = 'openid email profile';
        const responseType = 'code';
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + `client_id=${encodeURIComponent(clientId)}&` + `redirect_uri=${encodeURIComponent(redirectUri)}&` + `response_type=${responseType}&` + `scope=${encodeURIComponent(scope)}&` + `state=${state}&` + `access_type=offline&` + `prompt=consent`;
        // Redirect to Google
        return res.redirect(authUrl);
    } catch (error) {
        console.error('Google OAuth initiation error:', error);
        return res.redirect(`/login?error=${encodeURIComponent('Failed to initiate OAuth')}`);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6c3108b0._.js.map