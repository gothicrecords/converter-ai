module.exports = [
"[project]/lib/i18n-server.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadTranslationsSSR",
    ()=>loadTranslationsSSR
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
function stripBOM(content) {
    if (!content) return content;
    // Remove UTF-8 BOM if present
    return content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content.replace(/^\uFEFF/, '');
}
async function loadTranslationsSSR(locale = 'en') {
    try {
        const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'public', 'locales', locale, 'common.json');
        const fileContents = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath, 'utf8');
        const clean = stripBOM(fileContents);
        return JSON.parse(clean);
    } catch (error) {
        console.error('Error loading translations SSR:', error);
        // Fallback to English
        if (locale !== 'en') {
            return loadTranslationsSSR('en');
        }
        return {};
    }
}
}),
];

//# sourceMappingURL=lib_i18n-server_edb26081.js.map