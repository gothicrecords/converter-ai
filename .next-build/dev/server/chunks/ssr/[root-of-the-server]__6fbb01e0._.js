module.exports = [
"[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-dev-runtime", () => require("react/jsx-dev-runtime"));

module.exports = mod;
}),
"[externals]/react/jsx-runtime [external] (react/jsx-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-runtime", () => require("react/jsx-runtime"));

module.exports = mod;
}),
"[externals]/react [external] (react, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react", () => require("react"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/react-dom [external] (react-dom, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react-dom", () => require("react-dom"));

module.exports = mod;
}),
"[externals]/@vercel/speed-insights/next [external] (@vercel/speed-insights/next, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("@vercel/speed-insights/next");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/@vercel/analytics/react [external] (@vercel/analytics/react, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("@vercel/analytics/react");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/lib/i18n.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LanguageProvider",
    ()=>LanguageProvider,
    "useTranslation",
    ()=>useTranslation
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
;
;
;
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["createContext"])();
// Cache per le traduzioni per evitare re-fetching
const translationsCache = {};
function LanguageProvider({ children, initialTranslations = {} }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [locale, setLocale] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(router.locale || 'en');
    const [translations, setTranslations] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(initialTranslations);
    // Funzione di traduzione memoizzata
    const t = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((key)=>{
        if (!key || typeof key !== 'string') return key;
        const keys = key.split('.');
        let value = translations;
        for (const k of keys){
            value = value?.[k];
            if (value === undefined) return key;
        }
        return value || key;
    }, [
        translations
    ]);
    // Caricamento traduzioni ottimizzato con cache
    const loadTranslations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(async (lang)=>{
        // Controllo cache prima
        if (translationsCache[lang]) {
            setTranslations(translationsCache[lang]);
            setLocale(lang);
            return;
        }
        try {
            // Solo lato client
            if ("TURBOPACK compile-time truthy", 1) {
                return;
            }
            //TURBOPACK unreachable
            ;
            const response = undefined;
            const data = undefined;
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to English solo se non siamo già su English
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        // Ricarica traduzioni quando cambia la locale del router
        if (router.locale && router.locale !== locale) {
            loadTranslations(router.locale);
        }
    }, [
        router.locale,
        locale,
        loadTranslations
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        // Load translations for current locale se non già caricate
        const currentLocale = router.locale || 'en';
        if (!initialTranslations || Object.keys(initialTranslations).length === 0) {
            // Solo se non in cache
            if (!translationsCache[currentLocale]) {
                loadTranslations(currentLocale);
            }
        } else {
            // Popola la cache con le traduzioni iniziali
            if (!translationsCache[currentLocale]) {
                translationsCache[currentLocale] = initialTranslations;
            }
        }
    }, [
        router.locale,
        loadTranslations,
        initialTranslations
    ]);
    // Memoizza il valore del context per evitare re-render
    const contextValue = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>({
            locale,
            translations,
            t
        }), [
        locale,
        translations,
        t
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(LanguageContext.Provider, {
        value: contextValue,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/i18n.js",
        lineNumber: 89,
        columnNumber: 5
    }, this);
}
function useTranslation() {
    const context = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useContext"])(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within LanguageProvider');
    }
    return context;
}
}),
"[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("styled-jsx/style.js", () => require("styled-jsx/style.js"));

module.exports = mod;
}),
"[project]/components/Toast.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ToastContainer,
    "showToast",
    ()=>showToast,
    "updateToast",
    ()=>updateToast
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [ssr] (ecmascript)");
;
;
;
;
let toastId = 0;
const toastListeners = new Set();
const showToast = (message, type = 'success', duration = 4000, options = {})=>{
    const id = toastId++;
    const toast = {
        id,
        message,
        type,
        duration,
        timestamp: new Date(),
        progress: options.progress,
        details: options.details,
        technical: options.technical,
        action: options.action
    };
    toastListeners.forEach((listener)=>listener(toast));
    return id;
};
const updateToast = (id, updates)=>{
    toastListeners.forEach((listener)=>{
        if (typeof listener === 'function') {
            listener({
                id,
                ...updates,
                update: true
            });
        }
    });
};
function ToastContainer() {
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const progressIntervals = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])({});
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const listener = (toast)=>{
            if (toast.update) {
                setToasts((prev)=>prev.map((t)=>t.id === toast.id ? {
                            ...t,
                            ...toast
                        } : t));
            } else {
                setToasts((prev)=>[
                        ...prev,
                        toast
                    ]);
                if (toast.duration > 0 && toast.type !== 'loading' && toast.type !== 'progress') {
                    setTimeout(()=>{
                        setToasts((prev)=>prev.filter((t)=>t.id !== toast.id));
                    }, toast.duration);
                }
            }
        };
        toastListeners.add(listener);
        return ()=>toastListeners.delete(listener);
    }, []);
    const removeToast = (id)=>{
        if (progressIntervals.current[id]) {
            clearInterval(progressIntervals.current[id]);
            delete progressIntervals.current[id];
        }
        setToasts((prev)=>prev.filter((t)=>t.id !== id));
    };
    const formatTime = (date)=>{
        return date.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };
    const getIcon = (type)=>{
        const iconStyle = {
            ...styles.icon,
            ...styles.iconPulse
        };
        switch(type){
            case 'success':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiCheckCircle"], {
                    style: iconStyle
                }, void 0, false, {
                    fileName: "[project]/components/Toast.js",
                    lineNumber: 79,
                    columnNumber: 36
                }, this);
            case 'error':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiXCircle"], {
                    style: iconStyle
                }, void 0, false, {
                    fileName: "[project]/components/Toast.js",
                    lineNumber: 80,
                    columnNumber: 34
                }, this);
            case 'info':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiInformationCircle"], {
                    style: iconStyle
                }, void 0, false, {
                    fileName: "[project]/components/Toast.js",
                    lineNumber: 81,
                    columnNumber: 33
                }, this);
            case 'warning':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiExclamation"], {
                    style: iconStyle
                }, void 0, false, {
                    fileName: "[project]/components/Toast.js",
                    lineNumber: 82,
                    columnNumber: 36
                }, this);
            case 'loading':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiCog"], {
                    style: {
                        ...iconStyle,
                        animation: 'spin 1s linear infinite'
                    }
                }, void 0, false, {
                    fileName: "[project]/components/Toast.js",
                    lineNumber: 83,
                    columnNumber: 36
                }, this);
            case 'progress':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiLightningBolt"], {
                    style: iconStyle
                }, void 0, false, {
                    fileName: "[project]/components/Toast.js",
                    lineNumber: 84,
                    columnNumber: 37
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiInformationCircle"], {
                    style: iconStyle
                }, void 0, false, {
                    fileName: "[project]/components/Toast.js",
                    lineNumber: 85,
                    columnNumber: 29
                }, this);
        }
    };
    const getColors = (type)=>{
        switch(type){
            case 'success':
                return {
                    bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
                    border: 'rgba(16, 185, 129, 1)',
                    glow: 'rgba(16, 185, 129, 0.4)',
                    progress: 'rgba(255, 255, 255, 0.3)'
                };
            case 'error':
                return {
                    bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
                    border: 'rgba(239, 68, 68, 1)',
                    glow: 'rgba(239, 68, 68, 0.4)',
                    progress: 'rgba(255, 255, 255, 0.3)'
                };
            case 'info':
                return {
                    bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)',
                    border: 'rgba(59, 130, 246, 1)',
                    glow: 'rgba(59, 130, 246, 0.4)',
                    progress: 'rgba(255, 255, 255, 0.3)'
                };
            case 'warning':
                return {
                    bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%)',
                    border: 'rgba(245, 158, 11, 1)',
                    glow: 'rgba(245, 158, 11, 0.4)',
                    progress: 'rgba(255, 255, 255, 0.3)'
                };
            case 'loading':
            case 'progress':
                return {
                    bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%)',
                    border: 'rgba(139, 92, 246, 1)',
                    glow: 'rgba(139, 92, 246, 0.4)',
                    progress: 'rgba(255, 255, 255, 0.4)'
                };
            default:
                return {
                    bg: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(79, 70, 229, 0.95) 100%)',
                    border: 'rgba(102, 126, 234, 1)',
                    glow: 'rgba(102, 126, 234, 0.4)',
                    progress: 'rgba(255, 255, 255, 0.3)'
                };
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: styles.container,
        className: "jsx-86a39a103f6c4f52",
        children: [
            toasts.map((toast, index)=>{
                const colors = getColors(toast.type);
                const progress = toast.progress !== undefined ? Math.min(100, Math.max(0, toast.progress)) : null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        ...styles.toast,
                        background: colors.bg,
                        borderColor: colors.border,
                        boxShadow: `0 8px 32px ${colors.glow}, 0 0 0 1px ${colors.border}`,
                        transform: `translateY(${index * 8}px)`,
                        zIndex: 9999 - index,
                        animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1), fadeOut 0.3s ease-in ' + (toast.duration - 300) + 'ms forwards'
                    },
                    className: "jsx-86a39a103f6c4f52",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.toastContent,
                            className: "jsx-86a39a103f6c4f52",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.iconContainer,
                                    className: "jsx-86a39a103f6c4f52",
                                    children: getIcon(toast.type)
                                }, void 0, false, {
                                    fileName: "[project]/components/Toast.js",
                                    lineNumber: 157,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.messageContainer,
                                    className: "jsx-86a39a103f6c4f52",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.messageHeader,
                                            className: "jsx-86a39a103f6c4f52",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    style: styles.message,
                                                    className: "jsx-86a39a103f6c4f52",
                                                    children: toast.message
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Toast.js",
                                                    lineNumber: 163,
                                                    columnNumber: 37
                                                }, this),
                                                toast.timestamp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    style: styles.timestamp,
                                                    className: "jsx-86a39a103f6c4f52",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiClock"], {
                                                            style: {
                                                                width: 12,
                                                                height: 12,
                                                                marginRight: 4
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/Toast.js",
                                                            lineNumber: 166,
                                                            columnNumber: 45
                                                        }, this),
                                                        formatTime(toast.timestamp)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/Toast.js",
                                                    lineNumber: 165,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Toast.js",
                                            lineNumber: 162,
                                            columnNumber: 33
                                        }, this),
                                        toast.details && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.details,
                                            className: "jsx-86a39a103f6c4f52",
                                            children: toast.details
                                        }, void 0, false, {
                                            fileName: "[project]/components/Toast.js",
                                            lineNumber: 173,
                                            columnNumber: 37
                                        }, this),
                                        toast.technical && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.technical,
                                            className: "jsx-86a39a103f6c4f52",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("code", {
                                                style: styles.technicalCode,
                                                className: "jsx-86a39a103f6c4f52",
                                                children: toast.technical
                                            }, void 0, false, {
                                                fileName: "[project]/components/Toast.js",
                                                lineNumber: 180,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/Toast.js",
                                            lineNumber: 179,
                                            columnNumber: 37
                                        }, this),
                                        (progress !== null || toast.type === 'loading' || toast.type === 'progress') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.progressContainer,
                                            className: "jsx-86a39a103f6c4f52",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: styles.progressBar,
                                                    className: "jsx-86a39a103f6c4f52",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            ...styles.progressFill,
                                                            width: progress !== null ? `${progress}%` : '100%',
                                                            background: colors.progress,
                                                            animation: progress === null ? 'pulse 1.5s ease-in-out infinite' : 'none'
                                                        },
                                                        className: "jsx-86a39a103f6c4f52"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/Toast.js",
                                                        lineNumber: 189,
                                                        columnNumber: 45
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Toast.js",
                                                    lineNumber: 188,
                                                    columnNumber: 41
                                                }, this),
                                                progress !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    style: styles.progressText,
                                                    className: "jsx-86a39a103f6c4f52",
                                                    children: [
                                                        progress,
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/Toast.js",
                                                    lineNumber: 199,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Toast.js",
                                            lineNumber: 187,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Toast.js",
                                    lineNumber: 161,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: ()=>removeToast(toast.id),
                                    style: styles.closeBtn,
                                    "aria-label": "Chiudi notifica",
                                    onMouseEnter: (e)=>{
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                                    },
                                    onMouseLeave: (e)=>{
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                    },
                                    className: "jsx-86a39a103f6c4f52",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiX"], {
                                        style: {
                                            width: 16,
                                            height: 16
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/Toast.js",
                                        lineNumber: 216,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/Toast.js",
                                    lineNumber: 205,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Toast.js",
                            lineNumber: 156,
                            columnNumber: 25
                        }, this),
                        toast.action && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.actionContainer,
                            className: "jsx-86a39a103f6c4f52",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    toast.action.onClick();
                                    if (toast.action.closeOnClick) {
                                        removeToast(toast.id);
                                    }
                                },
                                style: styles.actionButton,
                                onMouseEnter: (e)=>{
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                },
                                className: "jsx-86a39a103f6c4f52",
                                children: toast.action.label
                            }, void 0, false, {
                                fileName: "[project]/components/Toast.js",
                                lineNumber: 222,
                                columnNumber: 33
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/Toast.js",
                            lineNumber: 221,
                            columnNumber: 29
                        }, this)
                    ]
                }, toast.id, true, {
                    fileName: "[project]/components/Toast.js",
                    lineNumber: 144,
                    columnNumber: 21
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__["default"], {
                id: "86a39a103f6c4f52",
                children: "@keyframes slideInRight{0%{opacity:0;transform:translate(450px)scale(.9)}to{opacity:1;transform:translate(0)scale(1)}}@keyframes fadeOut{0%{opacity:1;transform:translate(0)scale(1)}to{opacity:0;transform:translate(120px)scale(.9)}}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes pulse{0%,to{opacity:.6}50%{opacity:1}}@keyframes shimmer{0%{background-position:-1000px 0}to{background-position:1000px 0}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Toast.js",
        lineNumber: 138,
        columnNumber: 9
    }, this);
}
const styles = {
    container: {
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        pointerEvents: 'none',
        maxWidth: '420px',
        width: '100%'
    },
    toast: {
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        minWidth: '320px',
        maxWidth: '420px',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1.5px solid',
        borderRadius: '16px',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '500',
        pointerEvents: 'auto',
        cursor: 'default',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
    },
    toastContent: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px 18px'
    },
    iconContainer: {
        flexShrink: 0,
        marginTop: '2px'
    },
    icon: {
        width: 26,
        height: 26,
        flexShrink: 0,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
    },
    iconPulse: {
        animation: 'pulse 2s ease-in-out infinite'
    },
    messageContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: 0
    },
    messageHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap'
    },
    message: {
        flex: 1,
        lineHeight: '1.5',
        fontWeight: '600',
        fontSize: '15px',
        letterSpacing: '-0.01em'
    },
    timestamp: {
        fontSize: '11px',
        opacity: 0.85,
        display: 'flex',
        alignItems: 'center',
        fontWeight: '400',
        whiteSpace: 'nowrap',
        fontFamily: 'monospace',
        letterSpacing: '0.5px'
    },
    details: {
        fontSize: '13px',
        opacity: 0.9,
        lineHeight: '1.5',
        marginTop: '2px',
        fontWeight: '400'
    },
    technical: {
        marginTop: '4px',
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '12px',
        fontFamily: 'monospace',
        overflowX: 'auto'
    },
    technicalCode: {
        color: '#ffffff',
        opacity: 0.95,
        fontWeight: '500',
        letterSpacing: '0.3px'
    },
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: '6px'
    },
    progressBar: {
        flex: 1,
        height: '6px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative'
    },
    progressFill: {
        height: '100%',
        borderRadius: '10px',
        transition: 'width 0.3s ease-out',
        position: 'relative',
        overflow: 'hidden'
    },
    progressText: {
        fontSize: '11px',
        fontWeight: '600',
        opacity: 0.9,
        minWidth: '35px',
        textAlign: 'right',
        fontFamily: 'monospace',
        letterSpacing: '0.5px'
    },
    closeBtn: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        borderRadius: '8px',
        padding: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        transition: 'all 0.2s ease',
        flexShrink: 0,
        width: '28px',
        height: '28px',
        marginTop: '-2px'
    },
    actionContainer: {
        padding: '0 18px 16px 18px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: '8px',
        paddingTop: '12px'
    },
    actionButton: {
        width: '100%',
        padding: '10px 16px',
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '10px',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(10px)'
    }
};
}),
"[project]/lib/performance.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Performance optimization utilities
 * Helps with Core Web Vitals and overall site performance
 */ // Debounce function for performance
__turbopack_context__.s([
    "batchDOMUpdates",
    ()=>batchDOMUpdates,
    "cancelIdleCallback",
    ()=>cancelIdleCallback,
    "createIntersectionObserver",
    ()=>createIntersectionObserver,
    "createVirtualScrollConfig",
    ()=>createVirtualScrollConfig,
    "debounce",
    ()=>debounce,
    "measurePerformance",
    ()=>measurePerformance,
    "measureWebVitals",
    ()=>measureWebVitals,
    "optimizeAnimations",
    ()=>optimizeAnimations,
    "optimizeCoreWebVitals",
    ()=>optimizeCoreWebVitals,
    "optimizeMobilePerformance",
    ()=>optimizeMobilePerformance,
    "prefetchRoute",
    ()=>prefetchRoute,
    "preloadResource",
    ()=>preloadResource,
    "requestIdleCallback",
    ()=>requestIdleCallback,
    "setupLazyImages",
    ()=>setupLazyImages,
    "throttle",
    ()=>throttle
]);
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = ()=>{
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(()=>inThrottle = false, limit);
        }
    };
}
function createIntersectionObserver(callback, options = {}) {
    if (("TURBOPACK compile-time value", "undefined") === 'undefined' || !('IntersectionObserver' in window)) {
        return null;
    }
    //TURBOPACK unreachable
    ;
    const defaultOptions = undefined;
}
function preloadResource(href, as, crossorigin = false) {
    if (typeof document === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) {
        link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
}
function prefetchRoute(href) {
    if (typeof document === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
}
function setupLazyImages() {
    if ("TURBOPACK compile-time truthy", 1) {
        return;
    }
    //TURBOPACK unreachable
    ;
}
function initLazyImages() {
    const imageObserver = createIntersectionObserver((entries)=>{
        entries.forEach((entry)=>{
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img && img.dataset && img.dataset.src) {
                    // Load image with priority hint
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    img.src = img.dataset.src;
                    img.loading = 'lazy';
                    img.removeAttribute('data-src');
                    img.removeAttribute('data-srcset');
                    // Add fade-in animation
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease-in';
                    img.onload = ()=>{
                        img.style.opacity = '1';
                    };
                    if (imageObserver) {
                        imageObserver.unobserve(img);
                    }
                }
            }
        });
    }, {
        rootMargin: '50px',
        threshold: 0.01
    });
    if (!imageObserver) {
        return;
    }
    // Observe all images with data-src (native lazy loading fallback)
    try {
        const images = document.querySelectorAll('img[data-src]:not([loading="eager"])');
        images.forEach((img)=>{
            // Set width and height if available to prevent layout shift
            if (img.dataset.width && img.dataset.height) {
                img.style.aspectRatio = `${img.dataset.width} / ${img.dataset.height}`;
            }
            if (img && imageObserver) {
                imageObserver.observe(img);
            }
        });
    } catch (error) {
        if ("TURBOPACK compile-time truthy", 1) {
            console.warn('Error setting up lazy images:', error);
        }
    }
}
function optimizeCoreWebVitals() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    // Prevent layout shift for images with aspect ratio
    const images = undefined;
}
function preloadCriticalResources() {
    if (typeof document === 'undefined') return;
    // Preload critical CSS (if any)
    const criticalStyles = document.querySelectorAll('link[rel="stylesheet"]:not([media])');
    criticalStyles.forEach((link)=>{
        if (link.href && !link.href.startsWith('data:')) {
            link.rel = 'preload';
            link.as = 'style';
        }
    });
    // Preload above-the-fold images
    const aboveFoldImages = document.querySelectorAll('img[data-above-fold="true"]');
    aboveFoldImages.forEach((img)=>{
        if (img.src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.src;
            if (img.srcset) {
                link.imagesrcset = img.srcset;
            }
            document.head.appendChild(link);
        }
    });
}
function requestIdleCallback(callback, options = {}) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    // Fallback
    const timeout = undefined;
}
function cancelIdleCallback(id) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function measurePerformance(name, fn) {
    if (("TURBOPACK compile-time value", "undefined") === 'undefined' || !('performance' in window)) {
        return fn();
    }
    //TURBOPACK unreachable
    ;
    const start = undefined;
    const result = undefined;
    const end = undefined;
}
function batchDOMUpdates(updates) {
    if (("TURBOPACK compile-time value", "undefined") === 'undefined' || !('requestAnimationFrame' in window)) {
        updates.forEach((update)=>update());
        return;
    }
    //TURBOPACK unreachable
    ;
}
function measureWebVitals() {
    if ("TURBOPACK compile-time truthy", 1) {
        return;
    }
    //TURBOPACK unreachable
    ;
}
function optimizeAnimations() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    // Use CSS will-change for animated elements
    const animatedElements = undefined;
}
function optimizeMobilePerformance() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    // Detect mobile device
    const isMobile = undefined;
    // Reduce animation complexity on mobile
    const prefersReducedMotion = undefined;
    // Optimize touch events
    let touchStartTime;
    // Prevent double-tap zoom on buttons
    let lastTouchEnd;
    // Optimize scroll performance
    let ticking;
    const optimizeScroll = undefined;
}
function createVirtualScrollConfig(items, itemHeight, containerHeight, scrollTop) {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;
    const endIndex = Math.min(startIndex + visibleCount, items.length);
    const visibleItems = items.slice(startIndex, endIndex);
    const offsetY = startIndex * itemHeight;
    return {
        visibleItems,
        startIndex,
        endIndex,
        offsetY,
        totalHeight: items.length * itemHeight
    };
}
}),
"[project]/lib/downloadManager.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Download Manager - Gestione coda download, riprendi download interrotti, cronologia
__turbopack_context__.s([
    "formatFileSize",
    ()=>formatFileSize,
    "formatSpeed",
    ()=>formatSpeed,
    "formatTimeRemaining",
    ()=>formatTimeRemaining,
    "getDownloadManager",
    ()=>getDownloadManager
]);
class DownloadManager {
    constructor(){
        this.queue = [];
        this.activeDownloads = new Map();
        this.history = [];
        this.maxConcurrent = 3; // Max download simultanei
        this.listeners = new Set();
        // Carica cronologia da localStorage
        this.loadHistory();
        // Carica coda da sessionStorage (persiste durante la sessione)
        this.loadQueue();
        // Riprendi download interrotti al caricamento
        this.resumeInterruptedDownloads();
    }
    // Carica cronologia da localStorage
    loadHistory() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }
    // Salva cronologia in localStorage
    saveHistory() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }
    // Carica coda da sessionStorage
    loadQueue() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }
    // Salva coda in sessionStorage
    saveQueue() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }
    // Aggiungi listener per aggiornamenti
    addListener(callback) {
        this.listeners.add(callback);
        return ()=>this.listeners.delete(callback);
    }
    // Notifica tutti i listener
    notify() {
        this.listeners.forEach((callback)=>{
            try {
                callback({
                    queue: [
                        ...this.queue
                    ],
                    activeDownloads: Array.from(this.activeDownloads.values()),
                    history: [
                        ...this.history
                    ]
                });
            } catch (error) {
                console.error('Error in download manager listener:', error);
            }
        });
    }
    // Aggiungi download alla coda
    addDownload({ url, filename, tool, metadata = {} }) {
        const downloadId = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const downloadItem = {
            id: downloadId,
            url,
            filename: filename || `download_${Date.now()}`,
            tool: tool || 'Unknown',
            metadata,
            status: 'pending',
            progress: 0,
            speed: 0,
            size: 0,
            downloaded: 0,
            startTime: null,
            endTime: null,
            error: null,
            urlType: url.startsWith('blob:') ? 'blob' : 'url',
            createdAt: new Date().toISOString()
        };
        this.queue.push(downloadItem);
        this.saveQueue();
        this.notify();
        // Avvia download se c'è spazio
        this.processQueue();
        return downloadId;
    }
    // Processa la coda download
    async processQueue() {
        // Conta download attivi
        const activeCount = Array.from(this.activeDownloads.values()).filter((d)=>d.status === 'downloading').length;
        if (activeCount >= this.maxConcurrent) {
            return;
        }
        // Trova prossimo download pending
        const nextDownload = this.queue.find((item)=>item.status === 'pending');
        if (!nextDownload) {
            return;
        }
        // Avvia download
        this.startDownload(nextDownload.id);
    }
    // Avvia un download
    async startDownload(downloadId) {
        const downloadItem = this.queue.find((item)=>item.id === downloadId);
        if (!downloadItem || downloadItem.status !== 'pending') {
            return;
        }
        downloadItem.status = 'downloading';
        downloadItem.startTime = new Date().toISOString();
        this.activeDownloads.set(downloadId, downloadItem);
        this.saveQueue();
        this.notify();
        try {
            // Se è un blob URL, scarica direttamente
            if (downloadItem.urlType === 'blob') {
                await this.downloadBlob(downloadItem);
            } else {
                // Download da URL con progress tracking
                await this.downloadFromUrl(downloadItem);
            }
        } catch (error) {
            downloadItem.status = 'failed';
            downloadItem.error = error.message;
            downloadItem.endTime = new Date().toISOString();
            this.saveQueue();
            this.notify();
            // Rimuovi da active dopo 5 secondi
            setTimeout(()=>{
                this.activeDownloads.delete(downloadId);
                this.notify();
            }, 5000);
        }
    }
    // Download da blob URL
    async downloadBlob(downloadItem) {
        try {
            const response = await fetch(downloadItem.url);
            const blob = await response.blob();
            // Crea link e scarica
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadItem.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Cleanup dopo un delay
            setTimeout(()=>URL.revokeObjectURL(url), 1000);
            // Aggiorna stato
            downloadItem.status = 'completed';
            downloadItem.progress = 100;
            downloadItem.size = blob.size;
            downloadItem.downloaded = blob.size;
            downloadItem.endTime = new Date().toISOString();
            // Aggiungi a cronologia
            this.addToHistory(downloadItem);
            // Rimuovi da coda e active
            this.queue = this.queue.filter((item)=>item.id !== downloadItem.id);
            this.activeDownloads.delete(downloadItem.id);
            this.saveQueue();
            this.notify();
            // Processa prossimo download
            this.processQueue();
        } catch (error) {
            throw new Error(`Download failed: ${error.message}`);
        }
    }
    // Download da URL con progress tracking
    async downloadFromUrl(downloadItem) {
        return new Promise((resolve, reject)=>{
            const xhr = new XMLHttpRequest();
            xhr.addEventListener('progress', (e)=>{
                if (e.lengthComputable) {
                    const progress = e.loaded / e.total * 100;
                    downloadItem.progress = Math.round(progress);
                    downloadItem.size = e.total;
                    downloadItem.downloaded = e.loaded;
                    // Calcola velocità
                    if (downloadItem.startTime) {
                        const elapsed = (Date.now() - new Date(downloadItem.startTime).getTime()) / 1000;
                        downloadItem.speed = e.loaded / elapsed;
                    }
                    this.notify();
                }
            });
            xhr.addEventListener('load', ()=>{
                if (xhr.status === 200) {
                    const blob = new Blob([
                        xhr.response
                    ]);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = downloadItem.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(()=>URL.revokeObjectURL(url), 1000);
                    downloadItem.status = 'completed';
                    downloadItem.progress = 100;
                    downloadItem.endTime = new Date().toISOString();
                    this.addToHistory(downloadItem);
                    this.queue = this.queue.filter((item)=>item.id !== downloadItem.id);
                    this.activeDownloads.delete(downloadItem.id);
                    this.saveQueue();
                    this.notify();
                    this.processQueue();
                    resolve();
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            });
            xhr.addEventListener('error', ()=>{
                reject(new Error('Network error'));
            });
            xhr.addEventListener('abort', ()=>{
                reject(new Error('Download cancelled'));
            });
            xhr.open('GET', downloadItem.url);
            xhr.responseType = 'blob';
            xhr.send();
            // Salva xhr per poterlo cancellare
            downloadItem._xhr = xhr;
        });
    }
    // Riprendi download interrotto
    resumeDownload(downloadId) {
        const downloadItem = this.queue.find((item)=>item.id === downloadId);
        if (!downloadItem) {
            // Cerca nella cronologia
            const historyItem = this.history.find((item)=>item.id === downloadId);
            if (historyItem && historyItem.status === 'failed') {
                // Ricrea download dalla cronologia
                const newDownload = {
                    ...historyItem,
                    id: `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    status: 'pending',
                    progress: 0,
                    error: null,
                    startTime: null,
                    endTime: null
                };
                this.queue.push(newDownload);
                this.saveQueue();
                this.notify();
                this.processQueue();
                return newDownload.id;
            }
            return null;
        }
        if (downloadItem.status === 'failed' || downloadItem.status === 'paused') {
            downloadItem.status = 'pending';
            downloadItem.error = null;
            this.saveQueue();
            this.notify();
            this.processQueue();
            return downloadId;
        }
        return null;
    }
    // Pausa download (solo per URL, non blob)
    pauseDownload(downloadId) {
        const downloadItem = this.activeDownloads.get(downloadId);
        if (downloadItem && downloadItem._xhr) {
            downloadItem._xhr.abort();
            downloadItem.status = 'paused';
            downloadItem._xhr = null;
            this.activeDownloads.delete(downloadId);
            this.saveQueue();
            this.notify();
            this.processQueue();
            return true;
        }
        return false;
    }
    // Cancella download
    cancelDownload(downloadId) {
        // Se è in corso, fermalo
        const activeItem = this.activeDownloads.get(downloadId);
        if (activeItem && activeItem._xhr) {
            activeItem._xhr.abort();
            activeItem._xhr = null;
        }
        // Rimuovi da coda
        this.queue = this.queue.filter((item)=>item.id !== downloadId);
        this.activeDownloads.delete(downloadId);
        this.saveQueue();
        this.notify();
        // Processa prossimo download
        this.processQueue();
    }
    // Aggiungi a cronologia
    addToHistory(downloadItem) {
        const historyEntry = {
            id: downloadItem.id,
            filename: downloadItem.filename,
            tool: downloadItem.tool,
            metadata: downloadItem.metadata,
            status: downloadItem.status,
            size: downloadItem.size,
            createdAt: downloadItem.createdAt,
            completedAt: downloadItem.endTime || new Date().toISOString(),
            error: downloadItem.error
        };
        this.history.unshift(historyEntry);
        // Mantieni solo ultimi 100
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }
        this.saveHistory();
    }
    // Riprendi download interrotti al caricamento
    resumeInterruptedDownloads() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        // Cerca download con status 'downloading' nella coda
        const interrupted = undefined;
    }
    // Ottieni stato corrente
    getState() {
        return {
            queue: [
                ...this.queue
            ],
            activeDownloads: Array.from(this.activeDownloads.values()),
            history: [
                ...this.history
            ],
            stats: {
                pending: this.queue.filter((item)=>item.status === 'pending').length,
                downloading: Array.from(this.activeDownloads.values()).filter((item)=>item.status === 'downloading').length,
                completed: this.history.filter((item)=>item.status === 'completed').length,
                failed: this.history.filter((item)=>item.status === 'failed').length
            }
        };
    }
    // Pulisci cronologia
    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.notify();
    }
    // Rimuovi elemento dalla cronologia
    removeFromHistory(downloadId) {
        this.history = this.history.filter((item)=>item.id !== downloadId);
        this.saveHistory();
        this.notify();
    }
}
// Singleton instance
let downloadManagerInstance = null;
function getDownloadManager() {
    if ("TURBOPACK compile-time truthy", 1) {
        // Server-side: ritorna mock object
        return {
            addDownload: ()=>{},
            resumeDownload: ()=>{},
            pauseDownload: ()=>{},
            cancelDownload: ()=>{},
            addListener: ()=>()=>{},
            getState: ()=>({
                    queue: [],
                    activeDownloads: [],
                    history: [],
                    stats: {}
                }),
            clearHistory: ()=>{},
            removeFromHistory: ()=>{}
        };
    }
    //TURBOPACK unreachable
    ;
}
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = [
        'B',
        'KB',
        'MB',
        'GB'
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
function formatSpeed(bytesPerSecond) {
    if (!bytesPerSecond) return '0 B/s';
    return formatFileSize(bytesPerSecond) + '/s';
}
function formatTimeRemaining(downloaded, total, speed) {
    if (!speed || speed === 0 || !total) return '--';
    const remaining = total - downloaded;
    const seconds = Math.ceil(remaining / speed);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    return `${hours}h ${minutes}m`;
}
}),
"[project]/lib/useDownloadManager.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDownloadManager",
    ()=>useDownloadManager
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/downloadManager.js [ssr] (ecmascript)");
;
;
function useDownloadManager() {
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(()=>{
        const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getDownloadManager"])();
        return manager.getState();
    });
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getDownloadManager"])();
        const unsubscribe = manager.addListener((newState)=>{
            setState(manager.getState());
        });
        // Aggiorna stato iniziale
        setState(manager.getState());
        return unsubscribe;
    }, []);
    const addDownload = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((options)=>{
        const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getDownloadManager"])();
        return manager.addDownload(options);
    }, []);
    const resumeDownload = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((downloadId)=>{
        const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getDownloadManager"])();
        return manager.resumeDownload(downloadId);
    }, []);
    const pauseDownload = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((downloadId)=>{
        const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getDownloadManager"])();
        return manager.pauseDownload(downloadId);
    }, []);
    const cancelDownload = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((downloadId)=>{
        const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getDownloadManager"])();
        manager.cancelDownload(downloadId);
    }, []);
    const clearHistory = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(()=>{
        const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getDownloadManager"])();
        manager.clearHistory();
    }, []);
    const removeFromHistory = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((downloadId)=>{
        const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getDownloadManager"])();
        manager.removeFromHistory(downloadId);
    }, []);
    return {
        ...state,
        addDownload,
        resumeDownload,
        pauseDownload,
        cancelDownload,
        clearHistory,
        removeFromHistory
    };
}
}),
"[project]/components/DownloadManager.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DownloadManager
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useDownloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/useDownloadManager.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/downloadManager.js [ssr] (ecmascript)");
;
;
;
;
;
function DownloadManager() {
    const { queue, activeDownloads, history, stats, resumeDownload, pauseDownload, cancelDownload, clearHistory, removeFromHistory } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useDownloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useDownloadManager"])();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('queue'); // 'queue' | 'history'
    const [expandedItems, setExpandedItems] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(new Set());
    // Combina coda e download attivi
    const allActive = [
        ...queue.filter((item)=>item.status === 'pending'),
        ...Array.from(activeDownloads.values())
    ];
    const toggleExpanded = (id)=>{
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };
    const getStatusIcon = (status)=>{
        switch(status){
            case 'completed':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiCheckCircle"], {
                    style: {
                        width: 18,
                        height: 18,
                        color: '#10b981'
                    }
                }, void 0, false, {
                    fileName: "[project]/components/DownloadManager.js",
                    lineNumber: 45,
                    columnNumber: 16
                }, this);
            case 'failed':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiExclamationCircle"], {
                    style: {
                        width: 18,
                        height: 18,
                        color: '#ef4444'
                    }
                }, void 0, false, {
                    fileName: "[project]/components/DownloadManager.js",
                    lineNumber: 47,
                    columnNumber: 16
                }, this);
            case 'downloading':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.spinner
                }, void 0, false, {
                    fileName: "[project]/components/DownloadManager.js",
                    lineNumber: 49,
                    columnNumber: 16
                }, this);
            case 'paused':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiPause"], {
                    style: {
                        width: 18,
                        height: 18,
                        color: '#f59e0b'
                    }
                }, void 0, false, {
                    fileName: "[project]/components/DownloadManager.js",
                    lineNumber: 51,
                    columnNumber: 16
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiClock"], {
                    style: {
                        width: 18,
                        height: 18,
                        color: '#94a3b8'
                    }
                }, void 0, false, {
                    fileName: "[project]/components/DownloadManager.js",
                    lineNumber: 53,
                    columnNumber: 16
                }, this);
        }
    };
    const getStatusText = (status)=>{
        switch(status){
            case 'completed':
                return 'Completato';
            case 'failed':
                return 'Fallito';
            case 'downloading':
                return 'In download...';
            case 'paused':
                return 'In pausa';
            case 'pending':
                return 'In attesa';
            default:
                return status;
        }
    };
    // Conta download attivi per badge
    const activeCount = allActive.length;
    if (!isOpen && activeCount === 0) {
        return null; // Non mostrare nulla se non ci sono download
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            activeCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(true),
                style: styles.floatingButton,
                "aria-label": "Download Manager",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiDownload"], {
                        style: {
                            width: 20,
                            height: 20
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/DownloadManager.js",
                        lineNumber: 90,
                        columnNumber: 11
                    }, this),
                    activeCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                        style: styles.badge,
                        children: activeCount
                    }, void 0, false, {
                        fileName: "[project]/components/DownloadManager.js",
                        lineNumber: 92,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DownloadManager.js",
                lineNumber: 85,
                columnNumber: 9
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.overlay,
                onClick: ()=>setIsOpen(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.panel,
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.header,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.headerLeft,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiDownload"], {
                                            style: {
                                                width: 24,
                                                height: 24
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/DownloadManager.js",
                                            lineNumber: 104,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                            style: styles.title,
                                            children: "Download Manager"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DownloadManager.js",
                                            lineNumber: 105,
                                            columnNumber: 17
                                        }, this),
                                        stats.downloading > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                            style: styles.activeBadge,
                                            children: [
                                                stats.downloading,
                                                " attivo",
                                                stats.downloading > 1 ? 'i' : ''
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/DownloadManager.js",
                                            lineNumber: 107,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DownloadManager.js",
                                    lineNumber: 103,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsOpen(false),
                                    style: styles.closeButton,
                                    "aria-label": "Chiudi",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiX"], {
                                        style: {
                                            width: 20,
                                            height: 20
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/DownloadManager.js",
                                        lineNumber: 117,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/DownloadManager.js",
                                    lineNumber: 112,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DownloadManager.js",
                            lineNumber: 102,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.tabs,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab('queue'),
                                    style: {
                                        ...styles.tab,
                                        ...activeTab === 'queue' ? styles.tabActive : {}
                                    },
                                    children: [
                                        "Coda (",
                                        allActive.length,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DownloadManager.js",
                                    lineNumber: 123,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab('history'),
                                    style: {
                                        ...styles.tab,
                                        ...activeTab === 'history' ? styles.tabActive : {}
                                    },
                                    children: [
                                        "Cronologia (",
                                        history.length,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DownloadManager.js",
                                    lineNumber: 132,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DownloadManager.js",
                            lineNumber: 122,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.content,
                            children: activeTab === 'queue' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.queueContainer,
                                children: allActive.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.emptyState,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiCheckCircle"], {
                                            style: {
                                                width: 48,
                                                height: 48,
                                                color: '#94a3b8',
                                                marginBottom: '16px'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/DownloadManager.js",
                                            lineNumber: 149,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            style: styles.emptyText,
                                            children: "Nessun download in corso"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DownloadManager.js",
                                            lineNumber: 150,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DownloadManager.js",
                                    lineNumber: 148,
                                    columnNumber: 21
                                }, this) : allActive.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.downloadItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.downloadHeader,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.downloadInfo,
                                                        children: [
                                                            getStatusIcon(item.status),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: styles.downloadDetails,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: styles.filename,
                                                                        children: item.filename
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/DownloadManager.js",
                                                                        lineNumber: 159,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: styles.meta,
                                                                        children: [
                                                                            item.tool && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                style: styles.toolTag,
                                                                                children: item.tool
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/components/DownloadManager.js",
                                                                                lineNumber: 162,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            item.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                style: styles.size,
                                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["formatFileSize"])(item.size)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/components/DownloadManager.js",
                                                                                lineNumber: 165,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                style: styles.status,
                                                                                children: getStatusText(item.status)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/components/DownloadManager.js",
                                                                                lineNumber: 167,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/DownloadManager.js",
                                                                        lineNumber: 160,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 158,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DownloadManager.js",
                                                        lineNumber: 156,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.downloadActions,
                                                        children: [
                                                            item.status === 'downloading' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>pauseDownload(item.id),
                                                                style: styles.actionButton,
                                                                title: "Pausa",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiPause"], {
                                                                    style: {
                                                                        width: 16,
                                                                        height: 16
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/DownloadManager.js",
                                                                    lineNumber: 178,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 173,
                                                                columnNumber: 31
                                                            }, this),
                                                            (item.status === 'paused' || item.status === 'failed') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>resumeDownload(item.id),
                                                                style: styles.actionButton,
                                                                title: "Riprendi",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiPlay"], {
                                                                    style: {
                                                                        width: 16,
                                                                        height: 16
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/DownloadManager.js",
                                                                    lineNumber: 187,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 182,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>cancelDownload(item.id),
                                                                style: styles.actionButton,
                                                                title: "Cancella",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiX"], {
                                                                    style: {
                                                                        width: 16,
                                                                        height: 16
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/DownloadManager.js",
                                                                    lineNumber: 195,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 190,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>toggleExpanded(item.id),
                                                                style: styles.actionButton,
                                                                title: "Dettagli",
                                                                children: expandedItems.has(item.id) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiChevronUp"], {
                                                                    style: {
                                                                        width: 16,
                                                                        height: 16
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/DownloadManager.js",
                                                                    lineNumber: 203,
                                                                    columnNumber: 33
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiChevronDown"], {
                                                                    style: {
                                                                        width: 16,
                                                                        height: 16
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/DownloadManager.js",
                                                                    lineNumber: 205,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 197,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DownloadManager.js",
                                                        lineNumber: 171,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DownloadManager.js",
                                                lineNumber: 155,
                                                columnNumber: 25
                                            }, this),
                                            item.status === 'downloading' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.progressContainer,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.progressBar,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                ...styles.progressFill,
                                                                width: `${item.progress || 0}%`
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/DownloadManager.js",
                                                            lineNumber: 215,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DownloadManager.js",
                                                        lineNumber: 214,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.progressInfo,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    item.progress || 0,
                                                                    "%"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 223,
                                                                columnNumber: 31
                                                            }, this),
                                                            item.speed > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["formatSpeed"])(item.speed)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 225,
                                                                columnNumber: 33
                                                            }, this),
                                                            item.size > 0 && item.downloaded > 0 && item.speed > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["formatTimeRemaining"])(item.downloaded, item.size, item.speed),
                                                                    " rimanenti"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 228,
                                                                columnNumber: 33
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DownloadManager.js",
                                                        lineNumber: 222,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DownloadManager.js",
                                                lineNumber: 213,
                                                columnNumber: 27
                                            }, this),
                                            expandedItems.has(item.id) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.expandedDetails,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.detailRow,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: styles.detailLabel,
                                                                children: "ID:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 240,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: styles.detailValue,
                                                                children: item.id
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 241,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DownloadManager.js",
                                                        lineNumber: 239,
                                                        columnNumber: 29
                                                    }, this),
                                                    item.metadata && Object.keys(item.metadata).length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.detailRow,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: styles.detailLabel,
                                                                children: "Metadata:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 245,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: styles.detailValue,
                                                                children: JSON.stringify(item.metadata, null, 2)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 246,
                                                                columnNumber: 33
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DownloadManager.js",
                                                        lineNumber: 244,
                                                        columnNumber: 31
                                                    }, this),
                                                    item.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.detailRow,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: styles.detailLabel,
                                                                children: "Errore:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 253,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    ...styles.detailValue,
                                                                    color: '#ef4444'
                                                                },
                                                                children: item.error
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 254,
                                                                columnNumber: 33
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DownloadManager.js",
                                                        lineNumber: 252,
                                                        columnNumber: 31
                                                    }, this),
                                                    item.createdAt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.detailRow,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: styles.detailLabel,
                                                                children: "Creato:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 261,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: styles.detailValue,
                                                                children: new Date(item.createdAt).toLocaleString('it-IT')
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 262,
                                                                columnNumber: 33
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DownloadManager.js",
                                                        lineNumber: 260,
                                                        columnNumber: 31
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DownloadManager.js",
                                                lineNumber: 238,
                                                columnNumber: 27
                                            }, this)
                                        ]
                                    }, item.id, true, {
                                        fileName: "[project]/components/DownloadManager.js",
                                        lineNumber: 154,
                                        columnNumber: 23
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/DownloadManager.js",
                                lineNumber: 146,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.historyContainer,
                                children: history.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.emptyState,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiClock"], {
                                            style: {
                                                width: 48,
                                                height: 48,
                                                color: '#94a3b8',
                                                marginBottom: '16px'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/DownloadManager.js",
                                            lineNumber: 277,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            style: styles.emptyText,
                                            children: "Nessun download nella cronologia"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DownloadManager.js",
                                            lineNumber: 278,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DownloadManager.js",
                                    lineNumber: 276,
                                    columnNumber: 21
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.historyHeader,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: clearHistory,
                                                style: styles.clearButton,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiTrash"], {
                                                        style: {
                                                            width: 16,
                                                            height: 16
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DownloadManager.js",
                                                        lineNumber: 287,
                                                        columnNumber: 27
                                                    }, this),
                                                    "Pulisci cronologia"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DownloadManager.js",
                                                lineNumber: 283,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/DownloadManager.js",
                                            lineNumber: 282,
                                            columnNumber: 23
                                        }, this),
                                        history.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.historyItem,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.historyHeaderItem,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: styles.historyInfo,
                                                                children: [
                                                                    getStatusIcon(item.status),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: styles.historyDetails,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                style: styles.filename,
                                                                                children: item.filename
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/components/DownloadManager.js",
                                                                                lineNumber: 297,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                style: styles.meta,
                                                                                children: [
                                                                                    item.tool && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                        style: styles.toolTag,
                                                                                        children: item.tool
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/components/DownloadManager.js",
                                                                                        lineNumber: 300,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    item.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                        style: styles.size,
                                                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$downloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["formatFileSize"])(item.size)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/components/DownloadManager.js",
                                                                                        lineNumber: 303,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                        style: styles.status,
                                                                                        children: getStatusText(item.status)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/components/DownloadManager.js",
                                                                                        lineNumber: 305,
                                                                                        columnNumber: 35
                                                                                    }, this),
                                                                                    item.completedAt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                        style: styles.date,
                                                                                        children: new Date(item.completedAt).toLocaleString('it-IT')
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/components/DownloadManager.js",
                                                                                        lineNumber: 307,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/components/DownloadManager.js",
                                                                                lineNumber: 298,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/DownloadManager.js",
                                                                        lineNumber: 296,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 294,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>removeFromHistory(item.id),
                                                                style: styles.actionButton,
                                                                title: "Rimuovi",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiTrash"], {
                                                                    style: {
                                                                        width: 16,
                                                                        height: 16
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/DownloadManager.js",
                                                                    lineNumber: 319,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 314,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DownloadManager.js",
                                                        lineNumber: 293,
                                                        columnNumber: 27
                                                    }, this),
                                                    item.status === 'failed' && item.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.errorMessage,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiExclamationCircle"], {
                                                                style: {
                                                                    width: 16,
                                                                    height: 16
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 324,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                children: item.error
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 325,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DownloadManager.js",
                                                        lineNumber: 323,
                                                        columnNumber: 29
                                                    }, this),
                                                    item.status === 'failed' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>resumeDownload(item.id),
                                                        style: styles.resumeButton,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiPlay"], {
                                                                style: {
                                                                    width: 16,
                                                                    height: 16
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DownloadManager.js",
                                                                lineNumber: 333,
                                                                columnNumber: 31
                                                            }, this),
                                                            "Riprendi download"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DownloadManager.js",
                                                        lineNumber: 329,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, item.id, true, {
                                                fileName: "[project]/components/DownloadManager.js",
                                                lineNumber: 292,
                                                columnNumber: 25
                                            }, this))
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/components/DownloadManager.js",
                                lineNumber: 274,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/DownloadManager.js",
                            lineNumber: 144,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.footer,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.stats,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        children: [
                                            "Completati: ",
                                            stats.completed || 0
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DownloadManager.js",
                                        lineNumber: 348,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        children: [
                                            "Falliti: ",
                                            stats.failed || 0
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DownloadManager.js",
                                        lineNumber: 349,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        children: [
                                            "In attesa: ",
                                            stats.pending || 0
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DownloadManager.js",
                                        lineNumber: 350,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DownloadManager.js",
                                lineNumber: 347,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/DownloadManager.js",
                            lineNumber: 346,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DownloadManager.js",
                    lineNumber: 100,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/DownloadManager.js",
                lineNumber: 99,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
    },
    panel: {
        background: 'rgba(15, 23, 42, 0.98)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '16px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    title: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '700',
        color: '#e2e8f0'
    },
    activeBadge: {
        padding: '4px 10px',
        background: 'rgba(16, 185, 129, 0.2)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#10b981'
    },
    closeButton: {
        background: 'rgba(102, 126, 234, 0.1)',
        border: 'none',
        borderRadius: '8px',
        padding: '8px',
        cursor: 'pointer',
        color: '#cbd5e1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s'
    },
    tabs: {
        display: 'flex',
        borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
    },
    tab: {
        flex: 1,
        padding: '12px 20px',
        background: 'transparent',
        border: 'none',
        borderBottom: '2px solid transparent',
        color: '#94a3b8',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    tabActive: {
        color: '#667eea',
        borderBottomColor: '#667eea'
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        padding: '20px'
    },
    queueContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    historyContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    historyHeader: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '8px'
    },
    clearButton: {
        padding: '8px 16px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        color: '#ef4444',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s'
    },
    downloadItem: {
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '12px',
        padding: '16px',
        transition: 'all 0.2s'
    },
    historyItem: {
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '12px',
        padding: '16px',
        transition: 'all 0.2s'
    },
    downloadHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
    },
    historyHeaderItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
    },
    downloadInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1,
        minWidth: 0
    },
    historyInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1,
        minWidth: 0
    },
    downloadDetails: {
        flex: 1,
        minWidth: 0
    },
    historyDetails: {
        flex: 1,
        minWidth: 0
    },
    filename: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#e2e8f0',
        marginBottom: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    meta: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        fontSize: '12px',
        color: '#94a3b8'
    },
    toolTag: {
        padding: '2px 8px',
        background: 'rgba(102, 126, 234, 0.2)',
        borderRadius: '6px',
        color: '#a78bfa',
        fontWeight: '500'
    },
    size: {
        color: '#94a3b8'
    },
    status: {
        color: '#94a3b8'
    },
    date: {
        color: '#64748b',
        fontSize: '11px'
    },
    downloadActions: {
        display: 'flex',
        gap: '6px'
    },
    actionButton: {
        padding: '6px',
        background: 'rgba(102, 126, 234, 0.1)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '6px',
        color: '#cbd5e1',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
    },
    progressContainer: {
        marginTop: '12px'
    },
    progressBar: {
        width: '100%',
        height: '6px',
        background: 'rgba(102, 126, 234, 0.2)',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '8px'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        transition: 'width 0.3s ease',
        borderRadius: '3px'
    },
    progressInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#94a3b8',
        gap: '12px'
    },
    expandedDetails: {
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(102, 126, 234, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    detailRow: {
        display: 'flex',
        gap: '8px',
        fontSize: '12px'
    },
    detailLabel: {
        fontWeight: '600',
        color: '#94a3b8',
        minWidth: '80px'
    },
    detailValue: {
        color: '#cbd5e1',
        wordBreak: 'break-word'
    },
    errorMessage: {
        marginTop: '8px',
        padding: '8px 12px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '6px',
        color: '#ef4444',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    resumeButton: {
        marginTop: '8px',
        padding: '8px 16px',
        background: 'rgba(102, 126, 234, 0.2)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '8px',
        color: '#a78bfa',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s'
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center'
    },
    emptyText: {
        fontSize: '14px',
        color: '#94a3b8',
        margin: 0
    },
    footer: {
        padding: '16px 24px',
        borderTop: '1px solid rgba(102, 126, 234, 0.2)'
    },
    stats: {
        display: 'flex',
        justifyContent: 'space-around',
        fontSize: '12px',
        color: '#94a3b8',
        gap: '16px'
    },
    floatingButton: {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        color: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
        zIndex: 9999,
        transition: 'all 0.3s',
        position: 'relative'
    },
    badge: {
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        background: '#ef4444',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: '700',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    spinner: {
        width: '18px',
        height: '18px',
        border: '2px solid rgba(102, 126, 234, 0.3)',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    }
};
// Aggiungi animazione spinner
if (typeof document !== 'undefined') {
    const styleId = 'download-manager-spinner';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
        document.head.appendChild(style);
    }
}
}),
"[project]/lib/supportKnowledgeBase.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Base di conoscenza per il supporto - FAQ e risposte intelligenti
__turbopack_context__.s([
    "faqDatabase",
    ()=>faqDatabase,
    "getFAQsByCategory",
    ()=>getFAQsByCategory,
    "getRelatedFAQs",
    ()=>getRelatedFAQs,
    "getSuggestions",
    ()=>getSuggestions,
    "searchKnowledgeBase",
    ()=>searchKnowledgeBase,
    "supportCategories",
    ()=>supportCategories
]);
const supportCategories = {
    general: 'Generale',
    tools: 'Strumenti',
    account: 'Account',
    billing: 'Fatturazione',
    technical: 'Tecnico',
    features: 'Funzionalità'
};
const faqDatabase = [
    // Generale
    {
        id: 'faq-1',
        category: 'general',
        question: 'Cos\'è MegaPixelAI?',
        answer: 'MegaPixelAI è una piattaforma completa di strumenti AI per immagini, documenti, video e audio. Offriamo upscaling immagini, rimozione sfondo, OCR avanzato, conversione file, e molto altro.',
        keywords: [
            'cosa',
            'cos\'è',
            'megapixel',
            'piattaforma',
            'strumenti'
        ],
        relatedTools: [
            'upscaler',
            'background-remover',
            'ocr'
        ]
    },
    {
        id: 'faq-2',
        category: 'general',
        question: 'Come funziona?',
        answer: 'È semplice! Carica il tuo file, scegli lo strumento che preferisci, e ottieni il risultato in pochi secondi. Tutti i processi avvengono in modo sicuro e privato.',
        keywords: [
            'come',
            'funziona',
            'usare',
            'utilizzare',
            'processo'
        ],
        relatedTools: []
    },
    {
        id: 'faq-3',
        category: 'general',
        question: 'È gratuito?',
        answer: 'Offriamo un piano gratuito con funzionalità base. Per funzionalità avanzate e maggiore velocità, puoi passare a un piano Pro. Visita la pagina Pricing per maggiori dettagli.',
        keywords: [
            'gratuito',
            'prezzo',
            'costo',
            'piano',
            'abbonamento',
            'free'
        ],
        relatedTools: []
    },
    // Strumenti
    {
        id: 'faq-4',
        category: 'tools',
        question: 'Quali formati di file sono supportati?',
        answer: 'Supportiamo un\'ampia gamma di formati:\n\n**Immagini:** JPG, PNG, WEBP, GIF, BMP, TIFF\n**Documenti:** PDF, DOCX, DOC, TXT, RTF\n**Fogli di calcolo:** XLSX, XLS, CSV\n**Presentazioni:** PPTX, PPT\n**Video:** MP4, AVI, MOV, MKV\n**Audio:** MP3, WAV, OGG, FLAC\n**Archivi:** ZIP, RAR, 7Z, TAR',
        keywords: [
            'formati',
            'formato',
            'supportati',
            'file',
            'tipi',
            'estensioni'
        ],
        relatedTools: [
            'pdf-converter',
            'generic-converter'
        ]
    },
    {
        id: 'faq-5',
        category: 'tools',
        question: 'Come funziona l\'upscaling delle immagini?',
        answer: 'Il nostro upscaler AI utilizza algoritmi avanzati di deep learning per aumentare la risoluzione delle immagini fino a 4x mantenendo la qualità. Basta caricare l\'immagine e scegliere il fattore di upscaling desiderato.',
        keywords: [
            'upscale',
            'upscaling',
            'risoluzione',
            'immagine',
            'qualità',
            'ingrandire'
        ],
        relatedTools: [
            'upscaler'
        ]
    },
    {
        id: 'faq-6',
        category: 'tools',
        question: 'Posso rimuovere lo sfondo da qualsiasi immagine?',
        answer: 'Sì! Il nostro strumento di rimozione sfondo AI funziona con qualsiasi immagine. Funziona meglio con immagini che hanno un soggetto chiaro e uno sfondo contrastante.',
        keywords: [
            'sfondo',
            'rimuovere',
            'background',
            'remove',
            'trasparente'
        ],
        relatedTools: [
            'rimozione-sfondo-ai'
        ]
    },
    {
        id: 'faq-7',
        category: 'tools',
        question: 'Come funziona l\'OCR?',
        answer: 'L\'OCR (Optical Character Recognition) avanzato estrae testo da immagini, PDF scansionati e documenti. Supporta più di 100 lingue e mantiene la formattazione quando possibile.',
        keywords: [
            'ocr',
            'testo',
            'estrarre',
            'immagine',
            'pdf',
            'scansionato'
        ],
        relatedTools: [
            'ocr-avanzato-ai'
        ]
    },
    {
        id: 'faq-8',
        category: 'tools',
        question: 'Posso convertire più file contemporaneamente?',
        answer: 'Sì! Molti strumenti supportano il batch processing. Puoi caricare più file e processarli tutti in una volta. I risultati verranno forniti come download singoli o in un archivio ZIP.',
        keywords: [
            'batch',
            'multipli',
            'più file',
            'contemporaneamente',
            'bulk'
        ],
        relatedTools: [
            'combina-splitta-pdf',
            'generic-converter'
        ]
    },
    // Account
    {
        id: 'faq-9',
        category: 'account',
        question: 'Come creo un account?',
        answer: 'Clicca su "Registrati" in alto a destra, inserisci nome, email e password. Riceverai un\'email di conferma. Una volta confermato, avrai accesso a tutte le funzionalità.',
        keywords: [
            'account',
            'registrarsi',
            'signup',
            'iscriversi',
            'creare'
        ],
        relatedTools: []
    },
    {
        id: 'faq-10',
        category: 'account',
        question: 'Ho dimenticato la password',
        answer: 'Vai alla pagina di login e clicca su "Password dimenticata". Inserisci la tua email e riceverai un link per reimpostare la password.',
        keywords: [
            'password',
            'dimenticata',
            'reset',
            'recuperare',
            'forgot'
        ],
        relatedTools: []
    },
    {
        id: 'faq-11',
        category: 'account',
        question: 'Come elimino il mio account?',
        answer: 'Vai alla Dashboard, sezione Impostazioni, e clicca su "Elimina Account". Conferma l\'operazione. Nota: questa azione è irreversibile.',
        keywords: [
            'eliminare',
            'cancellare',
            'account',
            'delete',
            'rimuovere'
        ],
        relatedTools: []
    },
    // Fatturazione
    {
        id: 'faq-12',
        category: 'billing',
        question: 'Come funziona la fatturazione?',
        answer: 'I piani Pro sono fatturati mensilmente o annualmente. Puoi cancellare in qualsiasi momento dalla Dashboard. Non ci sono costi nascosti o commissioni.',
        keywords: [
            'fatturazione',
            'billing',
            'pagamento',
            'piano',
            'pro'
        ],
        relatedTools: []
    },
    {
        id: 'faq-13',
        category: 'billing',
        question: 'Posso cambiare piano?',
        answer: 'Sì! Puoi aggiornare o downgrade il tuo piano in qualsiasi momento dalla Dashboard. Le modifiche entrano in vigore immediatamente.',
        keywords: [
            'cambiare',
            'piano',
            'upgrade',
            'downgrade',
            'modificare'
        ],
        relatedTools: []
    },
    {
        id: 'faq-14',
        category: 'billing',
        question: 'Cosa succede se supero i limiti del piano?',
        answer: 'Riceverai una notifica quando ti avvicini ai limiti. Puoi aggiornare il piano o attendere il reset mensile. Alcune funzionalità potrebbero essere temporaneamente limitate.',
        keywords: [
            'limiti',
            'superare',
            'quota',
            'limite',
            'esaurito'
        ],
        relatedTools: []
    },
    // Tecnico
    {
        id: 'faq-15',
        category: 'technical',
        question: 'I miei file sono sicuri?',
        answer: 'Assolutamente sì! Tutti i file vengono processati in modo sicuro e vengono eliminati automaticamente dopo 24 ore. Non condividiamo mai i tuoi file con terze parti.',
        keywords: [
            'sicurezza',
            'privacy',
            'sicuro',
            'dati',
            'protezione'
        ],
        relatedTools: []
    },
    {
        id: 'faq-16',
        category: 'technical',
        question: 'Qual è la dimensione massima del file?',
        answer: 'Il limite dipende dal piano:\n- **Gratuito:** 10 MB per file\n- **Pro:** 100 MB per file\n- **Enterprise:** 500 MB per file\n\nPer file più grandi, contattaci per soluzioni personalizzate.',
        keywords: [
            'dimensione',
            'dimensione massima',
            'limite',
            'size',
            'mb'
        ],
        relatedTools: []
    },
    {
        id: 'faq-17',
        category: 'technical',
        question: 'Il processo è veloce?',
        answer: 'Sì! La maggior parte dei processi viene completata in pochi secondi. I tempi dipendono dalla dimensione del file e dalla complessità dell\'operazione. I piani Pro hanno priorità più alta.',
        keywords: [
            'velocità',
            'veloce',
            'tempo',
            'quanto',
            'lento'
        ],
        relatedTools: []
    },
    {
        id: 'faq-18',
        category: 'technical',
        question: 'Cosa succede se il processo fallisce?',
        answer: 'Se un processo fallisce, riceverai un messaggio di errore con dettagli. Puoi riprovare gratuitamente. Se il problema persiste, contatta il supporto con i dettagli dell\'errore.',
        keywords: [
            'errore',
            'fallito',
            'problema',
            'non funziona',
            'bug'
        ],
        relatedTools: []
    },
    // Funzionalità
    {
        id: 'faq-19',
        category: 'features',
        question: 'Cosa sono i crediti?',
        answer: 'I crediti sono unità di consumo per le operazioni AI. Ogni operazione consuma un certo numero di crediti in base alla complessità. I crediti si ricaricano mensilmente o puoi acquistarli.',
        keywords: [
            'crediti',
            'credits',
            'consumo',
            'unità'
        ],
        relatedTools: []
    },
    {
        id: 'faq-20',
        category: 'features',
        question: 'Posso usare l\'API?',
        answer: 'Sì! Offriamo un\'API pubblica per sviluppatori. Visita la sezione API nella Dashboard per ottenere la tua API key e la documentazione completa.',
        keywords: [
            'api',
            'sviluppatori',
            'developer',
            'integrazione'
        ],
        relatedTools: []
    },
    {
        id: 'faq-21',
        category: 'features',
        question: 'C\'è un\'app mobile?',
        answer: 'Attualmente siamo disponibili solo come applicazione web responsive. Stiamo lavorando su app native iOS e Android. Iscriviti alla newsletter per essere aggiornato!',
        keywords: [
            'mobile',
            'app',
            'ios',
            'android',
            'telefono'
        ],
        relatedTools: []
    }
];
function searchKnowledgeBase(query) {
    if (!query || query.trim().length < 2) {
        return [];
    }
    const lowerQuery = query.toLowerCase().trim();
    const words = lowerQuery.split(/\s+/);
    // Calcola score per ogni FAQ
    const scoredFAQs = faqDatabase.map((faq)=>{
        let score = 0;
        const lowerQuestion = faq.question.toLowerCase();
        const lowerAnswer = faq.answer.toLowerCase();
        const lowerKeywords = faq.keywords.map((k)=>k.toLowerCase());
        // Match esatto nella domanda (peso alto)
        if (lowerQuestion.includes(lowerQuery)) {
            score += 10;
        }
        // Match parziale nella domanda
        words.forEach((word)=>{
            if (lowerQuestion.includes(word)) {
                score += 5;
            }
        });
        // Match nelle keywords (peso medio)
        words.forEach((word)=>{
            if (lowerKeywords.some((k)=>k.includes(word) || lowerKeywords.includes(word))) {
                score += 3;
            }
        });
        // Match nella risposta (peso basso)
        words.forEach((word)=>{
            if (lowerAnswer.includes(word)) {
                score += 1;
            }
        });
        return {
            ...faq,
            score
        };
    });
    // Ordina per score e filtra
    return scoredFAQs.filter((faq)=>faq.score > 0).sort((a, b)=>b.score - a.score).slice(0, 5); // Top 5 risultati
}
function getFAQsByCategory(category) {
    return faqDatabase.filter((faq)=>faq.category === category);
}
function getSuggestions(query) {
    if (!query || query.trim().length < 2) {
        // Suggerimenti di default
        return [
            'Come funziona l\'upscaling?',
            'Quali formati sono supportati?',
            'Come creo un account?',
            'I miei file sono sicuri?',
            'Quanto costa?'
        ];
    }
    const results = searchKnowledgeBase(query);
    return results.map((faq)=>faq.question);
}
function getRelatedFAQs(faqId, limit = 3) {
    const faq = faqDatabase.find((f)=>f.id === faqId);
    if (!faq) return [];
    // Cerca FAQ con stessa categoria o strumenti correlati
    return faqDatabase.filter((f)=>f.id !== faqId && (f.category === faq.category || f.relatedTools.some((tool)=>faq.relatedTools.includes(tool)))).slice(0, limit);
}
}),
"[project]/components/ChatSupport.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatSupport
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supportKnowledgeBase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supportKnowledgeBase.js [ssr] (ecmascript)");
;
;
;
;
function ChatSupport() {
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [inputValue, setInputValue] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [showSuggestions, setShowSuggestions] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [expandedFAQ, setExpandedFAQ] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [searchResults, setSearchResults] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('chat'); // 'chat' | 'faq'
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    // Safe client-side mobile detection
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const checkMobile = ()=>setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return ()=>window.removeEventListener('resize', checkMobile);
    }, []);
    // Messaggio iniziale
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (isOpen && messages.length === 0) {
            const welcomeMessage = {
                id: 'welcome',
                role: 'assistant',
                content: 'Ciao! 👋 Sono il tuo assistente virtuale. Posso aiutarti con:\n\n• Domande su strumenti e funzionalità\n• Problemi tecnici\n• Informazioni su account e fatturazione\n• Suggerimenti e best practices\n\nCome posso aiutarti oggi?',
                timestamp: new Date().toISOString(),
                type: 'text'
            };
            setMessages([
                welcomeMessage
            ]);
        }
    }, [
        isOpen
    ]);
    // Scroll automatico
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    }, [
        messages
    ]);
    // Suggerimenti iniziali
    const initialSuggestions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supportKnowledgeBase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getSuggestions"])('');
    // Cerca nella base di conoscenza
    const handleSearch = (query)=>{
        setSearchQuery(query);
        if (query.trim().length >= 2) {
            const results = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supportKnowledgeBase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["searchKnowledgeBase"])(query);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };
    // Invia messaggio
    const handleSendMessage = async ()=>{
        if (!inputValue.trim() || isLoading) return;
        const userMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date().toISOString(),
            type: 'text'
        };
        setMessages((prev)=>[
                ...prev,
                userMessage
            ]);
        setInputValue('');
        setShowSuggestions(false);
        setIsLoading(true);
        try {
            // Cerca nella base di conoscenza
            const kbResults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supportKnowledgeBase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["searchKnowledgeBase"])(inputValue.trim());
            // Chiama API supporto AI
            const { getApiUrl } = await __turbopack_context__.A("[project]/utils/getApiUrl.js [ssr] (ecmascript, async loader)");
            const response = await fetch(getApiUrl('/api/support/chat'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: inputValue.trim(),
                    context: kbResults.slice(0, 3).map((r)=>({
                            question: r.question,
                            answer: r.answer
                        })),
                    conversationHistory: messages.slice(-5).map((m)=>({
                            role: m.role,
                            content: m.content
                        }))
                })
            });
            if (!response.ok) {
                throw new Error('Errore nella risposta del supporto');
            }
            const text = await response.text();
            const data = text && text.trim() ? JSON.parse(text) : {};
            const assistantMessage = {
                id: `msg-${Date.now()}-ai`,
                role: 'assistant',
                content: data.response,
                timestamp: new Date().toISOString(),
                type: 'text',
                relatedFAQs: data.relatedFAQs || [],
                suggestions: data.suggestions || []
            };
            setMessages((prev)=>[
                    ...prev,
                    assistantMessage
                ]);
            // Se ci sono FAQ correlate, mostra suggerimenti
            if (data.relatedFAQs && data.relatedFAQs.length > 0) {
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Support chat error:', error);
            // Fallback: usa risultati base di conoscenza
            const kbResults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supportKnowledgeBase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["searchKnowledgeBase"])(inputValue.trim());
            let fallbackResponse = 'Mi dispiace, non sono riuscito a trovare una risposta precisa. ';
            if (kbResults.length > 0) {
                fallbackResponse += `Ecco alcune informazioni che potrebbero aiutarti:\n\n**${kbResults[0].question}**\n${kbResults[0].answer}`;
            } else {
                fallbackResponse += 'Potresti riformulare la domanda o contattare il supporto diretto?';
            }
            const assistantMessage = {
                id: `msg-${Date.now()}-fallback`,
                role: 'assistant',
                content: fallbackResponse,
                timestamp: new Date().toISOString(),
                type: 'text',
                relatedFAQs: kbResults.slice(0, 3)
            };
            setMessages((prev)=>[
                    ...prev,
                    assistantMessage
                ]);
        } finally{
            setIsLoading(false);
        }
    };
    // Click su suggerimento
    const handleSuggestionClick = (suggestion)=>{
        setInputValue(suggestion);
        inputRef.current?.focus();
    };
    // Click su FAQ
    const handleFAQClick = (faq)=>{
        const message = {
            id: `faq-${Date.now()}`,
            role: 'assistant',
            content: `**${faq.question}**\n\n${faq.answer}`,
            timestamp: new Date().toISOString(),
            type: 'faq',
            faqId: faq.id
        };
        setMessages((prev)=>[
                ...prev,
                message
            ]);
        setExpandedFAQ(faq.id);
        // Mostra FAQ correlate
        const related = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supportKnowledgeBase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getRelatedFAQs"])(faq.id);
        if (related.length > 0) {
            setTimeout(()=>{
                const relatedMessage = {
                    id: `related-${Date.now()}`,
                    role: 'assistant',
                    content: `**FAQ correlate:**\n\n${related.map((f)=>`• ${f.question}`).join('\n')}`,
                    timestamp: new Date().toISOString(),
                    type: 'suggestions'
                };
                setMessages((prev)=>[
                        ...prev,
                        relatedMessage
                    ]);
            }, 500);
        }
    };
    // Tasto Enter
    const handleKeyPress = (e)=>{
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(true),
                style: styles.floatingButton,
                "aria-label": "Supporto Chat",
                title: "Supporto Chat",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiChat"], {
                    style: {
                        width: 24,
                        height: 24
                    }
                }, void 0, false, {
                    fileName: "[project]/components/ChatSupport.js",
                    lineNumber: 209,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ChatSupport.js",
                lineNumber: 203,
                columnNumber: 7
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.overlay,
                onClick: ()=>setIsOpen(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.panel,
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.header,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.headerLeft,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.headerIcon,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiSparkles"], {
                                                style: {
                                                    width: 20,
                                                    height: 20
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/ChatSupport.js",
                                                lineNumber: 220,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatSupport.js",
                                            lineNumber: 219,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                    style: styles.headerTitle,
                                                    children: "Supporto AI"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ChatSupport.js",
                                                    lineNumber: 223,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                    style: styles.headerSubtitle,
                                                    children: "Assistente virtuale intelligente"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ChatSupport.js",
                                                    lineNumber: 224,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ChatSupport.js",
                                            lineNumber: 222,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ChatSupport.js",
                                    lineNumber: 218,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsOpen(false),
                                    style: styles.closeButton,
                                    "aria-label": "Chiudi",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiX"], {
                                        style: {
                                            width: 20,
                                            height: 20
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatSupport.js",
                                        lineNumber: 232,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatSupport.js",
                                    lineNumber: 227,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ChatSupport.js",
                            lineNumber: 217,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.tabs,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab('chat'),
                                    style: {
                                        ...styles.tab,
                                        ...activeTab === 'chat' ? styles.tabActive : {}
                                    },
                                    children: "Chat"
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatSupport.js",
                                    lineNumber: 238,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab('faq'),
                                    style: {
                                        ...styles.tab,
                                        ...activeTab === 'faq' ? styles.tabActive : {}
                                    },
                                    children: "FAQ"
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatSupport.js",
                                    lineNumber: 247,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ChatSupport.js",
                            lineNumber: 237,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.content,
                            children: activeTab === 'chat' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.messagesContainer,
                                        children: [
                                            messages.map((message)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        ...styles.message,
                                                        ...message.role === 'user' ? styles.userMessage : styles.assistantMessage
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.messageContent,
                                                        children: [
                                                            message.type === 'text' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: styles.textContent,
                                                                children: message.content.split('\n').map((line, i)=>{
                                                                    // Formattazione markdown semplice
                                                                    if (line.startsWith('**') && line.endsWith('**')) {
                                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                                                            style: styles.boldText,
                                                                            children: line.replace(/\*\*/g, '')
                                                                        }, i, false, {
                                                                            fileName: "[project]/components/ChatSupport.js",
                                                                            lineNumber: 279,
                                                                            columnNumber: 37
                                                                        }, this);
                                                                    }
                                                                    if (line.trim() === '') {
                                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("br", {}, i, false, {
                                                                            fileName: "[project]/components/ChatSupport.js",
                                                                            lineNumber: 285,
                                                                            columnNumber: 42
                                                                        }, this);
                                                                    }
                                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                        style: styles.paragraph,
                                                                        children: line
                                                                    }, i, false, {
                                                                        fileName: "[project]/components/ChatSupport.js",
                                                                        lineNumber: 287,
                                                                        columnNumber: 40
                                                                    }, this);
                                                                })
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ChatSupport.js",
                                                                lineNumber: 274,
                                                                columnNumber: 29
                                                            }, this),
                                                            message.relatedFAQs && message.relatedFAQs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: styles.relatedFAQs,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: styles.relatedTitle,
                                                                        children: "Potrebbe interessarti:"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/ChatSupport.js",
                                                                        lineNumber: 295,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    message.relatedFAQs.map((faq)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>handleFAQClick(faq),
                                                                            style: styles.faqButton,
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiQuestionMarkCircle"], {
                                                                                    style: {
                                                                                        width: 16,
                                                                                        height: 16
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/ChatSupport.js",
                                                                                    lineNumber: 302,
                                                                                    columnNumber: 35
                                                                                }, this),
                                                                                faq.question
                                                                            ]
                                                                        }, faq.id, true, {
                                                                            fileName: "[project]/components/ChatSupport.js",
                                                                            lineNumber: 297,
                                                                            columnNumber: 33
                                                                        }, this))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/ChatSupport.js",
                                                                lineNumber: 294,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: styles.timestamp,
                                                                children: new Date(message.timestamp).toLocaleTimeString('it-IT', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ChatSupport.js",
                                                                lineNumber: 310,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ChatSupport.js",
                                                        lineNumber: 272,
                                                        columnNumber: 25
                                                    }, this)
                                                }, message.id, false, {
                                                    fileName: "[project]/components/ChatSupport.js",
                                                    lineNumber: 265,
                                                    columnNumber: 23
                                                }, this)),
                                            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.loadingMessage,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: styles.typingIndicator,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {}, void 0, false, {
                                                            fileName: "[project]/components/ChatSupport.js",
                                                            lineNumber: 323,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {}, void 0, false, {
                                                            fileName: "[project]/components/ChatSupport.js",
                                                            lineNumber: 324,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {}, void 0, false, {
                                                            fileName: "[project]/components/ChatSupport.js",
                                                            lineNumber: 325,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/ChatSupport.js",
                                                    lineNumber: 322,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/ChatSupport.js",
                                                lineNumber: 321,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                ref: messagesEndRef
                                            }, void 0, false, {
                                                fileName: "[project]/components/ChatSupport.js",
                                                lineNumber: 330,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ChatSupport.js",
                                        lineNumber: 263,
                                        columnNumber: 19
                                    }, this),
                                    showSuggestions && messages.length <= 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.suggestionsContainer,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.suggestionsTitle,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiLightBulb"], {
                                                        style: {
                                                            width: 16,
                                                            height: 16
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ChatSupport.js",
                                                        lineNumber: 337,
                                                        columnNumber: 25
                                                    }, this),
                                                    "Suggerimenti"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ChatSupport.js",
                                                lineNumber: 336,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.suggestionsGrid,
                                                children: initialSuggestions.slice(0, 4).map((suggestion, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleSuggestionClick(suggestion),
                                                        style: styles.suggestionButton,
                                                        children: suggestion
                                                    }, i, false, {
                                                        fileName: "[project]/components/ChatSupport.js",
                                                        lineNumber: 342,
                                                        columnNumber: 27
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/components/ChatSupport.js",
                                                lineNumber: 340,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ChatSupport.js",
                                        lineNumber: 335,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.inputContainer,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.inputWrapper,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                    ref: inputRef,
                                                    type: "text",
                                                    value: inputValue,
                                                    onChange: (e)=>setInputValue(e.target.value),
                                                    onKeyPress: handleKeyPress,
                                                    placeholder: "Scrivi la tua domanda...",
                                                    style: styles.input,
                                                    disabled: isLoading
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ChatSupport.js",
                                                    lineNumber: 357,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                    onClick: handleSendMessage,
                                                    disabled: !inputValue.trim() || isLoading,
                                                    style: {
                                                        ...styles.sendButton,
                                                        ...(!inputValue.trim() || isLoading) && styles.sendButtonDisabled
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiPaperAirplane"], {
                                                        style: {
                                                            width: 18,
                                                            height: 18
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ChatSupport.js",
                                                        lineNumber: 375,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ChatSupport.js",
                                                    lineNumber: 367,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ChatSupport.js",
                                            lineNumber: 356,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatSupport.js",
                                        lineNumber: 355,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.faqContainer,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.searchContainer,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiSearch"], {
                                                style: {
                                                    width: 20,
                                                    height: 20,
                                                    color: '#94a3b8'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/ChatSupport.js",
                                                lineNumber: 384,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: searchQuery,
                                                onChange: (e)=>handleSearch(e.target.value),
                                                placeholder: "Cerca nelle FAQ...",
                                                style: styles.searchInput
                                            }, void 0, false, {
                                                fileName: "[project]/components/ChatSupport.js",
                                                lineNumber: 385,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ChatSupport.js",
                                        lineNumber: 383,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.faqResults,
                                        children: searchResults.length > 0 ? searchResults.map((faq)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.faqItem,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id);
                                                            handleFAQClick(faq);
                                                        },
                                                        style: styles.faqQuestion,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                children: faq.question
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ChatSupport.js",
                                                                lineNumber: 406,
                                                                columnNumber: 29
                                                            }, this),
                                                            expandedFAQ === faq.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiChevronUp"], {
                                                                style: {
                                                                    width: 20,
                                                                    height: 20
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ChatSupport.js",
                                                                lineNumber: 408,
                                                                columnNumber: 31
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiChevronDown"], {
                                                                style: {
                                                                    width: 20,
                                                                    height: 20
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ChatSupport.js",
                                                                lineNumber: 410,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ChatSupport.js",
                                                        lineNumber: 399,
                                                        columnNumber: 27
                                                    }, this),
                                                    expandedFAQ === faq.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.faqAnswer,
                                                        children: faq.answer.split('\n').map((line, i)=>{
                                                            if (line.startsWith('**') && line.endsWith('**')) {
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                                                    style: styles.boldText,
                                                                    children: line.replace(/\*\*/g, '')
                                                                }, i, false, {
                                                                    fileName: "[project]/components/ChatSupport.js",
                                                                    lineNumber: 418,
                                                                    columnNumber: 37
                                                                }, this);
                                                            }
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                style: styles.paragraph,
                                                                children: line
                                                            }, i, false, {
                                                                fileName: "[project]/components/ChatSupport.js",
                                                                lineNumber: 423,
                                                                columnNumber: 40
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ChatSupport.js",
                                                        lineNumber: 414,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, faq.id, true, {
                                                fileName: "[project]/components/ChatSupport.js",
                                                lineNumber: 398,
                                                columnNumber: 25
                                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.emptyState,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiQuestionMarkCircle"], {
                                                    style: {
                                                        width: 48,
                                                        height: 48,
                                                        color: '#94a3b8',
                                                        marginBottom: '16px'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ChatSupport.js",
                                                    lineNumber: 431,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                    style: styles.emptyText,
                                                    children: searchQuery ? 'Nessun risultato trovato' : 'Cerca nelle FAQ o passa alla chat'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ChatSupport.js",
                                                    lineNumber: 432,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ChatSupport.js",
                                            lineNumber: 430,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatSupport.js",
                                        lineNumber: 395,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ChatSupport.js",
                                lineNumber: 381,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/ChatSupport.js",
                            lineNumber: 259,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ChatSupport.js",
                    lineNumber: 215,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ChatSupport.js",
                lineNumber: 214,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
const styles = {
    floatingButton: {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        color: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
        zIndex: 9998,
        transition: 'all 0.3s',
        WebkitTapHighlightColor: 'transparent'
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
    },
    panel: {
        background: 'rgba(15, 23, 42, 0.98)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    headerIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#a78bfa'
    },
    headerTitle: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '700',
        color: '#e2e8f0'
    },
    headerSubtitle: {
        margin: 0,
        fontSize: '12px',
        color: '#94a3b8'
    },
    closeButton: {
        background: 'rgba(102, 126, 234, 0.1)',
        border: 'none',
        borderRadius: '8px',
        padding: '8px',
        cursor: 'pointer',
        color: '#cbd5e1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s'
    },
    tabs: {
        display: 'flex',
        borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
    },
    tab: {
        flex: 1,
        padding: '12px 20px',
        background: 'transparent',
        border: 'none',
        borderBottom: '2px solid transparent',
        color: '#94a3b8',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    tabActive: {
        color: '#667eea',
        borderBottomColor: '#667eea'
    },
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    messagesContainer: {
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    message: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '85%',
        animation: 'fadeIn 0.3s ease-in'
    },
    userMessage: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end'
    },
    assistantMessage: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start'
    },
    messageContent: {
        padding: '12px 16px',
        borderRadius: '12px',
        background: 'rgba(102, 126, 234, 0.1)',
        border: '1px solid rgba(102, 126, 234, 0.2)'
    },
    textContent: {
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#e2e8f0'
    },
    paragraph: {
        margin: '4px 0',
        color: '#e2e8f0'
    },
    boldText: {
        fontWeight: '700',
        color: '#a78bfa',
        display: 'block',
        margin: '8px 0'
    },
    relatedFAQs: {
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(102, 126, 234, 0.2)'
    },
    relatedTitle: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: '8px'
    },
    faqButton: {
        width: '100%',
        padding: '8px 12px',
        marginBottom: '6px',
        background: 'rgba(102, 126, 234, 0.1)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '8px',
        color: '#a78bfa',
        fontSize: '13px',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s'
    },
    timestamp: {
        fontSize: '11px',
        color: '#64748b',
        marginTop: '8px'
    },
    loadingMessage: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: 'rgba(102, 126, 234, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        maxWidth: '85px'
    },
    typingIndicator: {
        display: 'flex',
        gap: '4px'
    },
    suggestionsContainer: {
        padding: '16px 20px',
        borderTop: '1px solid rgba(102, 126, 234, 0.2)',
        background: 'rgba(102, 126, 234, 0.05)'
    },
    suggestionsTitle: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    suggestionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px'
    },
    suggestionButton: {
        padding: '10px 14px',
        background: 'rgba(102, 126, 234, 0.1)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '8px',
        color: '#a78bfa',
        fontSize: '13px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    inputContainer: {
        padding: '16px 20px',
        borderTop: '1px solid rgba(102, 126, 234, 0.2)',
        background: 'rgba(15, 23, 42, 0.8)'
    },
    inputWrapper: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '12px',
        color: '#e2e8f0',
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.2s'
    },
    sendButton: {
        padding: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px',
        color: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
    },
    sendButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    faqContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    searchContainer: {
        padding: '16px 20px',
        borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(102, 126, 234, 0.05)'
    },
    searchInput: {
        flex: 1,
        padding: '10px 12px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '8px',
        color: '#e2e8f0',
        fontSize: '14px',
        outline: 'none'
    },
    faqResults: {
        flex: 1,
        overflowY: 'auto',
        padding: '20px'
    },
    faqItem: {
        marginBottom: '12px',
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '12px',
        overflow: 'hidden'
    },
    faqQuestion: {
        width: '100%',
        padding: '16px',
        background: 'transparent',
        border: 'none',
        color: '#e2e8f0',
        fontSize: '14px',
        fontWeight: '600',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        transition: 'background 0.2s'
    },
    faqAnswer: {
        padding: '0 16px 16px',
        fontSize: '13px',
        lineHeight: '1.6',
        color: '#cbd5e1'
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center'
    },
    emptyText: {
        fontSize: '14px',
        color: '#94a3b8',
        margin: 0
    }
};
// Aggiungi animazioni
if (typeof document !== 'undefined') {
    const styleId = 'chat-support-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes typing {
        0%, 60%, 100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-10px);
        }
      }
    `;
        document.head.appendChild(style);
    }
}
}),
"[project]/lib/analytics.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================
// COMPREHENSIVE ANALYTICS SYSTEM
// ============================================
// Google Analytics 4, Google Tag Manager, Vercel Analytics
// Web Vitals, Custom Events, Error Tracking
// ============================================
// CONFIGURATION
// ============================================
__turbopack_context__.s([
    "BING_WEBMASTER_ID",
    ()=>BING_WEBMASTER_ID,
    "ENABLE_ANALYTICS",
    ()=>ENABLE_ANALYTICS,
    "GA_TRACKING_ID",
    ()=>GA_TRACKING_ID,
    "GTM_ID",
    ()=>GTM_ID,
    "META_PIXEL_ID",
    ()=>META_PIXEL_ID,
    "event",
    ()=>event,
    "isBingWebmasterEnabled",
    ()=>isBingWebmasterEnabled,
    "isGAEnabled",
    ()=>isGAEnabled,
    "isGTMEnabled",
    ()=>isGTMEnabled,
    "isMetaPixelEnabled",
    ()=>isMetaPixelEnabled,
    "pageview",
    ()=>pageview,
    "setUserId",
    ()=>setUserId,
    "setUserProperty",
    ()=>setUserProperty,
    "trackAPIError",
    ()=>trackAPIError,
    "trackAddToCart",
    ()=>trackAddToCart,
    "trackBeginCheckout",
    ()=>trackBeginCheckout,
    "trackButtonClick",
    ()=>trackButtonClick,
    "trackConversion",
    ()=>trackConversion,
    "trackDownload",
    ()=>trackDownload,
    "trackError",
    ()=>trackError,
    "trackFileUpload",
    ()=>trackFileUpload,
    "trackLogin",
    ()=>trackLogin,
    "trackLogout",
    ()=>trackLogout,
    "trackPerformance",
    ()=>trackPerformance,
    "trackSearch",
    ()=>trackSearch,
    "trackSessionEnd",
    ()=>trackSessionEnd,
    "trackSessionStart",
    ()=>trackSessionStart,
    "trackSignup",
    ()=>trackSignup,
    "trackTimeOnPage",
    ()=>trackTimeOnPage,
    "trackToolComplete",
    ()=>trackToolComplete,
    "trackToolStart",
    ()=>trackToolStart,
    "trackToolUsage",
    ()=>trackToolUsage,
    "trackUpgrade",
    ()=>trackUpgrade,
    "trackVideoPlay",
    ()=>trackVideoPlay,
    "trackWebVital",
    ()=>trackWebVital
]);
const GA_TRACKING_ID = ("TURBOPACK compile-time value", "G-XXXXXXXXXX") || 'G-XXXXXXXXXX';
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX';
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || null;
const BING_WEBMASTER_ID = process.env.NEXT_PUBLIC_BING_WEBMASTER_ID || null;
const ENABLE_ANALYTICS = ("TURBOPACK compile-time value", "development") === 'production';
const isGAEnabled = ()=>{
    return ("TURBOPACK compile-time value", "undefined") !== 'undefined' && window.gtag && GA_TRACKING_ID !== 'G-XXXXXXXXXX' && ENABLE_ANALYTICS;
};
const isGTMEnabled = ()=>{
    return ("TURBOPACK compile-time value", "undefined") !== 'undefined' && window.dataLayer && GTM_ID !== 'GTM-XXXXXXX' && ENABLE_ANALYTICS;
};
const isMetaPixelEnabled = ()=>{
    return ("TURBOPACK compile-time value", "undefined") !== 'undefined' && META_PIXEL_ID && META_PIXEL_ID !== '' && ENABLE_ANALYTICS;
};
const isBingWebmasterEnabled = ()=>{
    return ("TURBOPACK compile-time value", "undefined") !== 'undefined' && BING_WEBMASTER_ID && BING_WEBMASTER_ID !== '' && ENABLE_ANALYTICS;
};
// Get user properties for enhanced tracking
const getUserProperties = ()=>{
    if ("TURBOPACK compile-time truthy", 1) return {};
    //TURBOPACK unreachable
    ;
};
const pageview = (url)=>{
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    const fullUrl = undefined;
};
const event = ({ action, category, label, value, items = [], currency = 'EUR', custom_parameters = {} })=>{
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    const eventData = undefined;
};
const trackToolUsage = (toolName, action = 'use', metadata = {})=>{
    event({
        action: action,
        category: 'Tool Usage',
        label: toolName,
        custom_parameters: {
            tool_name: toolName,
            tool_action: action,
            ...metadata
        }
    });
};
const trackToolStart = (toolName, fileType = null, fileSize = null)=>{
    trackToolUsage(toolName, 'tool_start', {
        file_type: fileType,
        file_size: fileSize
    });
};
const trackToolComplete = (toolName, duration = null, success = true)=>{
    trackToolUsage(toolName, success ? 'tool_complete' : 'tool_failed', {
        duration_ms: duration,
        success: success
    });
};
const trackFileUpload = (fileType, fileSize, toolName = null)=>{
    event({
        action: 'file_upload',
        category: 'File Operations',
        label: `${toolName || 'general'} - ${fileType}`,
        value: Math.round(fileSize / 1024),
        custom_parameters: {
            file_type: fileType,
            file_size: fileSize,
            file_size_kb: Math.round(fileSize / 1024),
            file_size_mb: Math.round(fileSize / 1024 / 1024 * 100) / 100,
            tool_name: toolName
        }
    });
};
const trackConversion = (conversionType, fromFormat, toFormat, fileSize = 0, duration = null)=>{
    event({
        action: 'conversion',
        category: 'Conversion',
        label: `${fromFormat} to ${toFormat}`,
        value: Math.round(fileSize / 1024),
        custom_parameters: {
            conversion_type: conversionType,
            from_format: fromFormat,
            to_format: toFormat,
            file_size: fileSize,
            duration_ms: duration
        }
    });
    // Track as conversion event for GA4
    if (isGAEnabled()) //TURBOPACK unreachable
    ;
};
const trackDownload = (fileType, toolName, fileSize = null)=>{
    event({
        action: 'file_download',
        category: 'Engagement',
        label: `${toolName} - ${fileType}`,
        value: fileSize ? Math.round(fileSize / 1024) : undefined,
        custom_parameters: {
            file_type: fileType,
            tool_name: toolName,
            file_size: fileSize
        }
    });
};
const trackSignup = (method = 'email', plan = 'free')=>{
    event({
        action: 'sign_up',
        category: 'User',
        label: method,
        custom_parameters: {
            signup_method: method,
            plan: plan
        }
    });
    // GA4 conversion event
    if (isGAEnabled()) //TURBOPACK unreachable
    ;
};
const trackLogin = (method = 'email')=>{
    event({
        action: 'login',
        category: 'User',
        label: method,
        custom_parameters: {
            login_method: method
        }
    });
};
const trackLogout = ()=>{
    event({
        action: 'logout',
        category: 'User'
    });
};
const trackUpgrade = (plan = 'pro', price = 19)=>{
    event({
        action: 'purchase',
        category: 'Revenue',
        label: plan,
        value: price,
        currency: 'EUR',
        custom_parameters: {
            plan: plan,
            price: price
        }
    });
    // GA4 ecommerce event
    if (isGAEnabled()) //TURBOPACK unreachable
    ;
};
const trackButtonClick = (buttonName, location)=>{
    event({
        action: 'button_click',
        category: 'Engagement',
        label: buttonName,
        custom_parameters: {
            button_name: buttonName,
            location: location
        }
    });
};
const trackSearch = (searchTerm, resultsCount = null)=>{
    event({
        action: 'search',
        category: 'Engagement',
        label: searchTerm,
        value: resultsCount,
        custom_parameters: {
            search_term: searchTerm,
            results_count: resultsCount
        }
    });
};
const trackVideoPlay = (videoName, duration = null)=>{
    event({
        action: 'video_play',
        category: 'Engagement',
        label: videoName,
        value: duration,
        custom_parameters: {
            video_name: videoName,
            video_duration: duration
        }
    });
};
const trackTimeOnPage = (pageName, timeSpent)=>{
    event({
        action: 'time_on_page',
        category: 'Engagement',
        label: pageName,
        value: Math.round(timeSpent),
        custom_parameters: {
            page_name: pageName,
            time_spent_seconds: Math.round(timeSpent)
        }
    });
};
const trackError = (errorMessage, errorLocation, errorType = 'general', errorCode = null)=>{
    event({
        action: 'error',
        category: 'Error',
        label: `${errorLocation}: ${errorMessage}`,
        custom_parameters: {
            error_message: errorMessage,
            error_location: errorLocation,
            error_type: errorType,
            error_code: errorCode
        }
    });
    // Send to GA4 as exception
    if (isGAEnabled()) //TURBOPACK unreachable
    ;
};
const trackAPIError = (endpoint, statusCode, errorMessage)=>{
    trackError(errorMessage || `API Error: ${statusCode}`, endpoint, 'api_error', statusCode);
};
const trackPerformance = (metric, value, unit = 'ms')=>{
    event({
        action: 'performance',
        category: 'Performance',
        label: metric,
        value: Math.round(value),
        custom_parameters: {
            metric_name: metric,
            metric_value: value,
            metric_unit: unit
        }
    });
};
const trackWebVital = (metric)=>{
    const { name, value, id, delta } = metric;
    if (isGAEnabled()) //TURBOPACK unreachable
    ;
    trackPerformance(name, value, name === 'CLS' ? 'score' : 'ms');
};
const trackAddToCart = (itemId, itemName, price, quantity = 1)=>{
    event({
        action: 'add_to_cart',
        category: 'Ecommerce',
        label: itemName,
        value: price * quantity,
        currency: 'EUR',
        items: [
            {
                item_id: itemId,
                item_name: itemName,
                price: price,
                quantity: quantity
            }
        ]
    });
    if (isGAEnabled()) //TURBOPACK unreachable
    ;
};
const trackBeginCheckout = (value, items = [])=>{
    event({
        action: 'begin_checkout',
        category: 'Ecommerce',
        value: value,
        currency: 'EUR',
        items: items
    });
    if (isGAEnabled()) //TURBOPACK unreachable
    ;
};
const trackSessionStart = ()=>{
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    event({
        action: 'session_start',
        category: 'Session',
        custom_parameters: {
            session_id: sessionId
        }
    });
};
const trackSessionEnd = (duration = null)=>{
    const sessionId = sessionStorage?.getItem('analytics_session_id');
    event({
        action: 'session_end',
        category: 'Session',
        value: duration ? Math.round(duration) : undefined,
        custom_parameters: {
            session_id: sessionId,
            session_duration: duration
        }
    });
};
const setUserProperty = (propertyName, propertyValue)=>{
    if (isGAEnabled()) //TURBOPACK unreachable
    ;
    if (isGTMEnabled()) //TURBOPACK unreachable
    ;
};
const setUserId = (userId)=>{
    if (isGAEnabled()) //TURBOPACK unreachable
    ;
    setUserProperty('user_id', userId);
};
}),
"[project]/utils/history.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// LocalStorage history manager
__turbopack_context__.s([
    "cleanupHistory",
    ()=>cleanupHistory,
    "clearHistory",
    ()=>clearHistory,
    "formatTimestamp",
    ()=>formatTimestamp,
    "getHistory",
    ()=>getHistory,
    "removeHistoryItem",
    ()=>removeHistoryItem,
    "saveToHistory",
    ()=>saveToHistory
]);
const HISTORY_KEY = 'megapixelai_history';
const MAX_HISTORY_ITEMS = 3; // Ridotto per evitare problemi di quota
const MAX_THUMBNAIL_SIZE = 50000; // Max 50KB per thumbnail (circa 200x200px)
const MAX_TOTAL_SIZE = 2 * 1024 * 1024; // Max 2MB totali per localStorage
// Funzione per ridurre la dimensione di un'immagine base64
const compressThumbnail = (base64String, maxSize = MAX_THUMBNAIL_SIZE)=>{
    if (!base64String || typeof base64String !== 'string') return null;
    // Se è già piccolo, restituiscilo così com'è
    const currentSize = new Blob([
        base64String
    ]).size;
    if (currentSize <= maxSize) return base64String;
    // Se è troppo grande, restituisci null (non salvare)
    // In alternativa, potresti implementare una compressione più avanzata
    return null;
};
// Controlla la dimensione totale della history
const checkStorageSize = ()=>{
    try {
        const history = getHistory();
        const totalSize = new Blob([
            JSON.stringify(history)
        ]).size;
        return totalSize;
    } catch (error) {
        return 0;
    }
};
const saveToHistory = (item)=>{
    try {
        // Controlla se abbiamo spazio disponibile
        const currentSize = checkStorageSize();
        if (currentSize > MAX_TOTAL_SIZE) {
            console.warn('History storage limit reached, clearing old items');
            // Rimuovi gli elementi più vecchi fino a quando non c'è spazio
            const history = getHistory();
            while(checkStorageSize() > MAX_TOTAL_SIZE * 0.7 && history.length > 0){
                history.pop(); // Rimuovi l'elemento più vecchio
                try {
                    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
                } catch (e) {
                    // Se ancora non c'è spazio, svuota tutto
                    clearHistory();
                    break;
                }
            }
        }
        const history = getHistory();
        // Comprimi il thumbnail se presente
        const compressedThumbnail = item.thumbnail ? compressThumbnail(item.thumbnail) : null;
        // Non salvare il result se è troppo grande (solo URL o null)
        let result = item.result;
        if (result && typeof result === 'string' && result.startsWith('data:')) {
            // Se è un data URL e troppo grande, non salvarlo
            const resultSize = new Blob([
                result
            ]).size;
            if (resultSize > 500000) {
                result = null;
            }
        }
        const newItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            tool: item.tool,
            filename: item.filename,
            thumbnail: compressedThumbnail,
            params: item.params,
            result: result // URL o null (non salvare immagini base64 grandi)
        };
        // Add to beginning and limit to MAX_HISTORY_ITEMS
        const updatedHistory = [
            newItem,
            ...history
        ].slice(0, MAX_HISTORY_ITEMS);
        // Prova a salvare, se fallisce per quota, rimuovi elementi più vecchi
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        } catch (quotaError) {
            console.warn('Quota exceeded, trying to free space');
            // Rimuovi metà degli elementi più vecchi
            const reducedHistory = updatedHistory.slice(0, Math.floor(MAX_HISTORY_ITEMS / 2));
            try {
                localStorage.setItem(HISTORY_KEY, JSON.stringify(reducedHistory));
            } catch (e) {
                // Se ancora non funziona, svuota tutto
                clearHistory();
                console.error('Could not save to history, storage full');
                return null;
            }
        }
        return newItem.id;
    } catch (error) {
        console.error('Error saving to history:', error);
        // Se è un errore di quota, prova a pulire
        if (error.name === 'QuotaExceededError') {
            clearHistory();
            console.warn('History cleared due to quota exceeded');
        }
        return null;
    }
};
const getHistory = ()=>{
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error reading history:', error);
        return [];
    }
};
const clearHistory = ()=>{
    try {
        localStorage.removeItem(HISTORY_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing history:', error);
        return false;
    }
};
const cleanupHistory = ()=>{
    try {
        const history = getHistory();
        const currentSize = checkStorageSize();
        if (currentSize > MAX_TOTAL_SIZE || history.length > MAX_HISTORY_ITEMS) {
            // Mantieni solo gli elementi più recenti
            const cleanedHistory = history.slice(0, MAX_HISTORY_ITEMS).map((item)=>({
                    ...item,
                    // Rimuovi result se troppo grande
                    result: item.result && typeof item.result === 'string' && item.result.startsWith('data:') && new Blob([
                        item.result
                    ]).size > 500000 ? null : item.result,
                    // Comprimi thumbnail se troppo grande
                    thumbnail: item.thumbnail ? compressThumbnail(item.thumbnail) : null
                }));
            localStorage.setItem(HISTORY_KEY, JSON.stringify(cleanedHistory));
            console.log('History cleaned up');
        }
    } catch (error) {
        console.error('Error cleaning up history:', error);
        // Se c'è ancora un errore, svuota tutto
        if (error.name === 'QuotaExceededError') {
            clearHistory();
        }
    }
};
const removeHistoryItem = (id)=>{
    try {
        const history = getHistory();
        const updatedHistory = history.filter((item)=>item.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        return true;
    } catch (error) {
        console.error('Error removing history item:', error);
        return false;
    }
};
const formatTimestamp = (timestamp)=>{
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Ora';
    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short'
    });
};
}),
"[project]/pages/_app.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/head.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/script.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$speed$2d$insights$2f$next__$5b$external$5d$__$2840$vercel$2f$speed$2d$insights$2f$next$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/@vercel/speed-insights/next [external] (@vercel/speed-insights/next, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$analytics$2f$react__$5b$external$5d$__$2840$vercel$2f$analytics$2f$react$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/@vercel/analytics/react [external] (@vercel/analytics/react, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Toast.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$performance$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/performance.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DownloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DownloadManager.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ChatSupport$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ChatSupport.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/analytics.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$history$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/history.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$speed$2d$insights$2f$next__$5b$external$5d$__$2840$vercel$2f$speed$2d$insights$2f$next$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$analytics$2f$react__$5b$external$5d$__$2840$vercel$2f$analytics$2f$react$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$speed$2d$insights$2f$next__$5b$external$5d$__$2840$vercel$2f$speed$2d$insights$2f$next$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$analytics$2f$react__$5b$external$5d$__$2840$vercel$2f$analytics$2f$react$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
;
;
;
;
;
;
;
;
// Error Boundary Component
class ErrorBoundary extends __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["Component"] {
    constructor(props){
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        console.error('Error stack:', error.stack);
        console.error('Component stack:', errorInfo.componentStack);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    render() {
        if (this.state.hasError) {
            const error = this.state.error;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                        style: {
                            fontSize: '24px',
                            marginBottom: '16px',
                            color: '#333'
                        },
                        children: "Something went wrong"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.js",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        style: {
                            marginBottom: '8px',
                            color: '#666',
                            fontSize: '14px'
                        },
                        children: error?.message || 'An unexpected error occurred'
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.js",
                        lineNumber: 64,
                        columnNumber: 11
                    }, this),
                    error?.stack && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("details", {
                        style: {
                            marginTop: '16px',
                            textAlign: 'left',
                            maxWidth: '600px',
                            fontSize: '12px',
                            color: '#999'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("summary", {
                                style: {
                                    cursor: 'pointer',
                                    marginBottom: '8px'
                                },
                                children: "Error Details"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 69,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("pre", {
                                style: {
                                    background: '#f5f5f5',
                                    padding: '12px',
                                    borderRadius: '4px',
                                    overflow: 'auto',
                                    maxHeight: '200px'
                                },
                                children: error.stack
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 70,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/_app.js",
                        lineNumber: 68,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                            ;
                        },
                        style: {
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#0070f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        },
                        children: "Reload Page"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.js",
                        lineNumber: 81,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/_app.js",
                lineNumber: 53,
                columnNumber: 9
            }, this);
        }
        return this.props.children;
    }
}
// Create React Query client with optimized settings
const queryClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["QueryClient"]({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1
        }
    }
});
function MyApp({ Component, pageProps }) {
    // Suppress Stripe tracking prevention warnings (browser privacy feature, not errors)
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }, []);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        setMounted(true);
        // Pulisci la history se è troppo grande
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }, []);
    // Applica classe per abilitare animazioni solo lato client
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!mounted) return;
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, [
        mounted
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        // Previeni scroll orizzontale (solo client-side)
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Intelligent prefetching after page load for better performance
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Track pageviews con Google Analytics e GTM
        const handleRouteChange = (url)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.pageview(url);
        };
        router.events.on('routeChangeComplete', handleRouteChange);
        // Track initial pageview
        if (router.asPath) {
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.pageview(router.asPath);
        }
        return ()=>{
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [
        router
    ]);
    // Register Service Worker for performance
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (("TURBOPACK compile-time value", "undefined") !== 'undefined' && 'serviceWorker' in navigator && ("TURBOPACK compile-time value", "development") === 'production') //TURBOPACK unreachable
        ;
    }, []);
    // Web Vitals Tracking
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        // Global error tracking
        const handleError = undefined;
        const handleUnhandledRejection = undefined;
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ErrorBoundary, {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
            client: queryClient,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["LanguageProvider"], {
                initialTranslations: pageProps.translations || {},
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                                name: "viewport",
                                content: "width=device-width, initial-scale=1.0, viewport-fit=cover"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 357,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                                name: "mobile-web-app-capable",
                                content: "yes"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 358,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                                name: "apple-mobile-web-app-capable",
                                content: "yes"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 359,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                                name: "apple-mobile-web-app-status-bar-style",
                                content: "black-translucent"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 360,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                                name: "apple-mobile-web-app-title",
                                content: "MegaPixelAI ToolSuite"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 361,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                                name: "theme-color",
                                content: "#0a0e1a"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 362,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                                name: "msapplication-TileColor",
                                content: "#0a0e1a"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 363,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                                name: "msapplication-navbutton-color",
                                content: "#0a0e1a"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 364,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "icon",
                                href: "/favicon.svg",
                                type: "image/svg+xml"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 365,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "alternate icon",
                                href: "/logo.svg",
                                type: "image/svg+xml"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 366,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "apple-touch-icon",
                                href: "/logo-with-text.jpg"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 367,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "preconnect",
                                href: "https://www.googletagmanager.com",
                                crossOrigin: "anonymous"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 370,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "preconnect",
                                href: "https://www.google-analytics.com",
                                crossOrigin: "anonymous"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 371,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "preconnect",
                                href: "https://connect.facebook.net",
                                crossOrigin: "anonymous"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 372,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "preconnect",
                                href: "https://www.clarity.ms",
                                crossOrigin: "anonymous"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 373,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "preconnect",
                                href: "https://fonts.googleapis.com",
                                crossOrigin: "anonymous"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 374,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "preconnect",
                                href: "https://fonts.gstatic.com",
                                crossOrigin: "anonymous"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 375,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "dns-prefetch",
                                href: "https://www.googletagmanager.com"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 378,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "dns-prefetch",
                                href: "https://www.google-analytics.com"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 379,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "dns-prefetch",
                                href: "https://connect.facebook.net"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 380,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "dns-prefetch",
                                href: "https://www.clarity.ms"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 381,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "dns-prefetch",
                                href: "https://fonts.googleapis.com"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 382,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "dns-prefetch",
                                href: "https://fonts.gstatic.com"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 383,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "dns-prefetch",
                                href: "https://fonts.googleapis.com"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 388,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                rel: "dns-prefetch",
                                href: "https://fonts.gstatic.com"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 389,
                                columnNumber: 11
                            }, this),
                            ("TURBOPACK compile-time value", "development") === 'production' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                        rel: "prefetch",
                                        href: "/tools",
                                        as: "document"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/_app.js",
                                        lineNumber: 394,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                        rel: "prefetch",
                                        href: "/upscaler",
                                        as: "document"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/_app.js",
                                        lineNumber: 395,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                                        rel: "prefetch",
                                        href: "/pdf",
                                        as: "document"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/_app.js",
                                        lineNumber: 396,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("title", {
                                children: "Tool Suite - Upscaler AI & PDF Converter"
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 400,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("style", {
                                children: `
            html {
              overflow-y: scroll;
              overflow-x: hidden;
              width: 100%;
              max-width: 100%;
            }
            body {
              overflow-x: hidden;
              max-width: 100%;
              width: 100%;
              position: relative;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            * {
              box-sizing: border-box;
            }
            /* Force scrollbar to always show to prevent layout shift */
            :root {
              overflow-y: scroll;
              overflow-x: hidden;
              scrollbar-gutter: stable;
              width: 100%;
              max-width: 100%;
            }
            /* Prevent horizontal scroll */
            #__next {
              overflow-x: hidden;
              max-width: 100%;
              width: 100%;
            }
            /* Ottimizzazioni performance */
            * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              -webkit-tap-highlight-color: transparent;
            }
            /* GPU acceleration per animazioni */
            [style*="transform"], [style*="opacity"] {
              will-change: transform, opacity;
            }
            /* Smooth scrolling - disabilitato su mobile per performance */
            @media (prefers-reduced-motion: no-preference) {
              html {
                scroll-behavior: smooth;
              }
            }
            /* Ottimizzazione rendering */
            img, video {
              content-visibility: auto;
            }
            /* Mobile optimizations */
            @media (max-width: 768px) {
              * {
                -webkit-tap-highlight-color: rgba(102, 126, 234, 0.2);
                touch-action: manipulation;
              }
              button, a, [role="button"] {
                -webkit-tap-highlight-color: rgba(102, 126, 234, 0.3);
                touch-action: manipulation;
                -webkit-user-select: none;
                user-select: none;
              }
              /* Prevent text selection on buttons */
              input, textarea {
                -webkit-user-select: text;
                user-select: text;
              }
              /* iOS Safari specific fixes */
              @supports (-webkit-touch-callout: none) {
                body {
                  -webkit-overflow-scrolling: touch;
                }
              }
            }
            /* Android Chrome optimizations */
            @media (max-width: 768px) and (-webkit-min-device-pixel-ratio: 2) {
              * {
                -webkit-font-smoothing: antialiased;
              }
            }
          `
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 401,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/_app.js",
                        lineNumber: 356,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        id: "google-analytics",
                        strategy: "afterInteractive",
                        src: "https://www.googletagmanager.com/gtag/js?id=G-34NK4NEB9B"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.js",
                        lineNumber: 488,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        id: "google-analytics-init",
                        strategy: "afterInteractive",
                        dangerouslySetInnerHTML: {
                            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-34NK4NEB9B', {
              page_path: window.location.pathname,
              page_location: window.location.href,
              page_title: document.title,
              send_page_view: true,
            });
          `
                        }
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.js",
                        lineNumber: 493,
                        columnNumber: 7
                    }, this),
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.GTM_ID && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.GTM_ID !== 'GTM-XXXXXXX' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                id: "gtm-script",
                                strategy: "afterInteractive",
                                dangerouslySetInnerHTML: {
                                    __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.GTM_ID}');
              `
                                }
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 514,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("noscript", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("iframe", {
                                    src: `https://www.googletagmanager.com/ns.html?id=${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.GTM_ID}`,
                                    height: "0",
                                    width: "0",
                                    style: {
                                        display: 'none',
                                        visibility: 'hidden'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/pages/_app.js",
                                    lineNumber: 528,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 527,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true),
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.ENABLE_ANALYTICS && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.GA_TRACKING_ID !== 'G-XXXXXXXXXX' && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.GA_TRACKING_ID !== 'G-34NK4NEB9B' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                strategy: "afterInteractive",
                                src: `https://www.googletagmanager.com/gtag/js?id=${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.GA_TRACKING_ID}`
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 541,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                id: "gtag-init",
                                strategy: "afterInteractive",
                                dangerouslySetInnerHTML: {
                                    __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                  page_location: window.location.href,
                  page_title: document.title,
                  send_page_view: true,
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure',
                });
              `
                                }
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 545,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true),
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.isMetaPixelEnabled && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.isMetaPixelEnabled() && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                id: "meta-pixel",
                                strategy: "afterInteractive",
                                dangerouslySetInnerHTML: {
                                    __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.META_PIXEL_ID}');
                fbq('track', 'PageView');
              `
                                }
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 570,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("noscript", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
                                    height: "1",
                                    width: "1",
                                    style: {
                                        display: 'none'
                                    },
                                    src: `https://www.facebook.com/tr?id=${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.META_PIXEL_ID}&ev=PageView&noscript=1`,
                                    alt: ""
                                }, void 0, false, {
                                    fileName: "[project]/pages/_app.js",
                                    lineNumber: 589,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 588,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true),
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.isBingWebmasterEnabled && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.isBingWebmasterEnabled() && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        id: "bing-webmaster",
                        strategy: "afterInteractive",
                        dangerouslySetInnerHTML: {
                            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__.BING_WEBMASTER_ID}");
            `
                        }
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.js",
                        lineNumber: 602,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/pages/_app.js",
                        lineNumber: 617,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Component, {
                        ...pageProps
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.js",
                        lineNumber: 618,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DownloadManager$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/pages/_app.js",
                        lineNumber: 619,
                        columnNumber: 9
                    }, this),
                    mounted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ChatSupport$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/pages/_app.js",
                        lineNumber: 620,
                        columnNumber: 21
                    }, this),
                    ("TURBOPACK compile-time value", "development") === 'production' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$speed$2d$insights$2f$next__$5b$external$5d$__$2840$vercel$2f$speed$2d$insights$2f$next$2c$__esm_import$29$__["SpeedInsights"], {}, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 623,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$analytics$2f$react__$5b$external$5d$__$2840$vercel$2f$analytics$2f$react$2c$__esm_import$29$__["Analytics"], {}, void 0, false, {
                                fileName: "[project]/pages/_app.js",
                                lineNumber: 624,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/_app.js",
                lineNumber: 355,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/pages/_app.js",
            lineNumber: 354,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/pages/_app.js",
        lineNumber: 353,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = MyApp;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6fbb01e0._.js.map