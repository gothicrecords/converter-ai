(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__140a91e5._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/middleware.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
function middleware(request) {
    // Allow disabling middleware via environment variable
    if (process.env.DISABLE_REDIRECT_MIDDLEWARE === 'true') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    const url = request.nextUrl.clone();
    const host = request.headers.get('host') || '';
    const hostLower = host.toLowerCase();
    // Only run in Vercel production environment
    const vercelEnv = process.env.VERCEL_ENV;
    if (vercelEnv !== 'production') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Determine primary domain from env
    let envUrl = ("TURBOPACK compile-time value", "http://localhost:3000") || process.env.APP_URL || '';
    let primaryHost = '';
    try {
        if (envUrl) {
            // Normalize to HTTPS in production (Vercel always uses HTTPS)
            if (envUrl.startsWith('http://')) {
                envUrl = envUrl.replace('http://', 'https://');
            } else if (!envUrl.startsWith('https://') && !envUrl.startsWith('http://')) {
                // If no protocol specified, assume HTTPS
                envUrl = `https://${envUrl}`;
            }
            const parsedUrl = new URL(envUrl);
            primaryHost = parsedUrl.host.toLowerCase();
            // Remove www. from primaryHost if present to avoid loops
            if (primaryHost.startsWith('www.')) {
                primaryHost = primaryHost.substring(4);
            }
        }
    } catch (e) {
        // Invalid URL, skip redirect
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // If no primary host configured, skip redirect
    if (!primaryHost) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Normalize current host (remove www. if present for comparison)
    let currentHostNormalized = hostLower;
    if (currentHostNormalized.startsWith('www.')) {
        currentHostNormalized = currentHostNormalized.substring(4);
    }
    // Safety check: prevent redirect loops by checking if we're already on the target
    if (currentHostNormalized === primaryHost) {
        // If current host has www. but target doesn't, redirect to remove www
        if (hostLower.startsWith('www.')) {
            url.host = primaryHost;
            url.protocol = 'https:';
            // Double check to prevent loop - ensure we're not redirecting to the same host
            const targetHost = url.host.toLowerCase();
            if (targetHost !== hostLower && targetHost === primaryHost) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url, 308);
            }
        }
        // Already on correct domain, no redirect needed
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Redirect www to apex (non-www) - only if different
    if (hostLower === `www.${primaryHost}`) {
        url.host = primaryHost;
        url.protocol = 'https:';
        // Final safety check - ensure target is different from current
        const targetHost = url.host.toLowerCase();
        if (targetHost !== hostLower && targetHost === primaryHost) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url, 308);
        }
    }
    // Redirect vercel.app preview URLs to primary domain (only if different)
    const isVercelHost = hostLower.endsWith('.vercel.app');
    if (isVercelHost && currentHostNormalized !== primaryHost) {
        url.host = primaryHost;
        url.protocol = 'https:';
        // Final safety check - ensure target is different from current
        const targetHost = url.host.toLowerCase();
        if (targetHost !== hostLower && targetHost === primaryHost) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url, 308);
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        // Run on all routes except Next internals and static assets
        '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|jpg|jpeg|png|gif|webp|ico|css|js)$).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__140a91e5._.js.map