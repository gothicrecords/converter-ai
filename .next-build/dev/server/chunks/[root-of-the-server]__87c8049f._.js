module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/stripe [external] (stripe, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("stripe");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/lib/stripe.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$stripe__$5b$external$5d$__$28$stripe$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/stripe [external] (stripe, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$stripe__$5b$external$5d$__$28$stripe$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$stripe__$5b$external$5d$__$28$stripe$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// Inizializza Stripe con la chiave segreta
const stripe = new __TURBOPACK__imported__module__$5b$externals$5d2f$stripe__$5b$external$5d$__$28$stripe$2c$__esm_import$29$__["default"](process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});
const __TURBOPACK__default__export__ = stripe;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/pages/api/stripe/create-checkout-session.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stripe$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/stripe.js [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stripe$2e$js__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stripe$2e$js__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function handler(req, res) {
    console.log('[Stripe Checkout] Request received:', {
        method: req.method,
        url: req.url,
        path: req.url,
        hasBody: !!req.body
    });
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        console.log('[Stripe Checkout] Method not allowed:', req.method);
        return res.status(405).json({
            success: false,
            error: 'Method not allowed',
            code: 'METHOD_NOT_ALLOWED'
        });
    }
    try {
        // Verifica che Stripe sia configurato
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stripe$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"]) {
            console.error('Stripe non inizializzato');
            return res.status(500).json({
                success: false,
                error: 'Stripe non configurato correttamente',
                code: 'STRIPE_NOT_CONFIGURED'
            });
        }
        const { priceId, userId, userEmail } = req.body;
        // Validazione input
        if (!priceId) {
            return res.status(400).json({
                success: false,
                error: 'priceId è richiesto',
                code: 'MISSING_PRICE_ID'
            });
        }
        if (!userEmail) {
            return res.status(400).json({
                success: false,
                error: 'userEmail è richiesto',
                code: 'MISSING_EMAIL'
            });
        }
        // Verifica che NEXT_PUBLIC_URL sia configurato
        const baseUrl = ("TURBOPACK compile-time value", "http://localhost:3000") || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        // Verifica che il price ID esista in Stripe
        let price;
        try {
            price = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stripe$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"].prices.retrieve(priceId);
            console.log('[Stripe Checkout] Price retrieved:', {
                id: price.id,
                active: price.active,
                product: price.product
            });
            if (!price.active) {
                throw new Error(`Il price ID ${priceId} non è attivo in Stripe`);
            }
        } catch (priceError) {
            console.error('[Stripe Checkout] Price retrieval error:', priceError);
            if (priceError.type === 'StripeInvalidRequestError' && priceError.code === 'resource_missing') {
                return res.status(400).json({
                    success: false,
                    error: `Price ID non valido: ${priceId}. Verifica che il price ID sia corretto e attivo nel tuo account Stripe.`,
                    code: 'INVALID_PRICE_ID',
                    details: ("TURBOPACK compile-time truthy", 1) ? priceError.message : "TURBOPACK unreachable"
                });
            }
            throw priceError;
        }
        // Crea la sessione di checkout Stripe
        const session = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stripe$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"].checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: [
                'card'
            ],
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/pricing?canceled=true`,
            customer_email: userEmail,
            metadata: {
                userId: userId || 'unknown'
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            subscription_data: {
                metadata: {
                    userId: userId || 'unknown'
                }
            }
        });
        if (!session || !session.url) {
            throw new Error('Stripe non ha restituito un URL di checkout valido');
        }
        res.status(200).json({
            success: true,
            url: session.url
        });
    } catch (error) {
        console.error('[Stripe Checkout] Error:', {
            message: error.message,
            type: error.type,
            code: error.code,
            statusCode: error.statusCode
        });
        // Gestione errori specifici di Stripe
        if (error.type === 'StripeInvalidRequestError') {
            if (error.code === 'resource_missing') {
                return res.status(400).json({
                    success: false,
                    error: `Risorsa Stripe non trovata: ${error.message}`,
                    code: 'STRIPE_RESOURCE_MISSING',
                    details: ("TURBOPACK compile-time truthy", 1) ? {
                        message: error.message,
                        code: error.code,
                        param: error.param
                    } : "TURBOPACK unreachable"
                });
            }
            return res.status(400).json({
                success: false,
                error: `Errore nella richiesta a Stripe: ${error.message}`,
                code: 'STRIPE_INVALID_REQUEST',
                details: ("TURBOPACK compile-time truthy", 1) ? {
                    message: error.message,
                    code: error.code,
                    param: error.param
                } : "TURBOPACK unreachable"
            });
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Errore durante la creazione della sessione di checkout',
            code: 'CHECKOUT_ERROR',
            details: ("TURBOPACK compile-time truthy", 1) ? {
                message: error.message,
                stack: error.stack,
                type: error.type,
                code: error.code
            } : "TURBOPACK unreachable"
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__87c8049f._.js.map