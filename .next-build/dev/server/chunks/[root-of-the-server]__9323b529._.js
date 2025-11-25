module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/pages/api/health.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
(()=>{
    const e = new Error("Cannot find module '../../../config'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
function handler(req, res) {
    const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: config.app.env,
        services: {
            database: !!config.database.url,
            supabase: !!(config.supabase.url && config.supabase.anonKey),
            stripe: !!(config.stripe.secretKey && config.stripe.publishableKey),
            openai: !!config.openai.apiKey,
            cloudinary: !!(config.cloudinary.cloudName && config.cloudinary.apiKey),
            oauth_google: !!(config.oauth.google.clientId && config.oauth.google.clientSecret),
            oauth_facebook: !!(config.oauth.facebook.appId && config.oauth.facebook.appSecret)
        },
        endpoints: {
            signup: '/api/auth/signup',
            login: '/api/auth/login',
            google_oauth: '/api/auth/oauth/google',
            google_callback: '/api/auth/oauth/google/callback'
        },
        app_url: config.oauth.redirectBaseUrl
    };
    res.status(200).json(diagnostics);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9323b529._.js.map