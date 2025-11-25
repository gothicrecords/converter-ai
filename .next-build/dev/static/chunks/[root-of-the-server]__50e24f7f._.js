(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/lib/tools.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "tools",
    ()=>tools
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/bs/index.mjs [client] (ecmascript)");
;
const tools = [
    {
        title: 'Rimozione Sfondo AI',
        description: 'Rimuovi lo sfondo da qualsiasi immagine con un click.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsImage"],
        href: '/tools/rimozione-sfondo-ai',
        category: 'Immagini',
        pro: true
    },
    {
        title: 'Clean Noise AI',
        description: 'Rimuovi rumore di fondo e migliora la qualità dei tuoi audio.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsSoundwave"],
        href: '/tools/clean-noise-ai',
        category: 'Audio',
        pro: true
    },
    {
        title: 'Generazione Immagini AI',
        description: 'Crea immagini uniche da una descrizione testuale.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsStars"],
        href: '/tools/generazione-immagini-ai',
        category: 'Immagini',
        pro: true
    },
    {
        title: 'Trascrizione Audio',
        description: 'Converti file audio e vocali in testo modificabile.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsSoundwave"],
        href: '/tools/trascrizione-audio',
        category: 'Audio'
    },
    {
        title: 'OCR Avanzato AI',
        description: 'Estrai testo da immagini, PDF e documenti scansionati.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsJournalCode"],
        href: '/tools/ocr-avanzato-ai',
        category: 'Testo',
        pro: true
    },
    {
        title: 'Traduzione Documenti AI',
        description: 'Traduci interi documenti mantenendo la formattazione.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsTranslate"],
        href: '/tools/traduzione-documenti-ai',
        category: 'Testo',
        pro: true
    },
    {
        title: 'Riassunto Testo',
        description: 'Sintetizza testi lunghi in riassunti chiari e concisi.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsTextParagraph"],
        href: '/tools/riassunto-testo',
        category: 'Testo'
    },
    {
        title: 'Traduci Testo',
        description: 'Traduzioni multilingua istantanee per testi e frasi.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsTranslate"],
        href: '/tools/traduci-testo',
        category: 'Testo'
    },
    {
        title: 'Correttore Grammaticale',
        description: 'Correggi errori grammaticali e migliora lo stile del tuo testo.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsSpellcheck"],
        href: '/tools/correttore-grammaticale',
        category: 'Testo'
    },
    {
        title: 'Elabora e Riassumi',
        description: 'Analisi e sintesi avanzata di documenti e articoli.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsTextareaT"],
        href: '/tools/elabora-e-riassumi',
        category: 'Testo',
        pro: true
    },
    {
        title: 'Combina/Splitta PDF',
        description: 'Unisci più PDF in un unico file o dividi un PDF in più parti.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsFileZip"],
        href: '/tools/combina-splitta-pdf',
        category: 'PDF'
    },
    {
        title: 'Thumbnail Generator',
        description: 'Crea miniature accattivanti per video e social media.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsCardImage"],
        href: '/tools/thumbnail-generator',
        category: 'Immagini',
        pro: true
    },
    {
        title: 'Compressione Video',
        description: 'Riduci le dimensioni dei tuoi file video senza perdere qualità.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsCameraVideo"],
        href: '/tools/compressione-video',
        category: 'Video',
        pro: true
    },
    {
        title: 'Upscaler AI',
        description: 'Migliora la risoluzione delle tue immagini fino a 4x.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsArrowsAngleContract"],
        href: '/tools/upscaler-ai',
        category: 'Immagini',
        pro: true
    },
    {
        title: 'Convertitore PDF',
        description: 'Converti facilmente file da e verso PDF: JPG, DOCX e altri formati.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsFileEarmarkPdf"],
        href: '/pdf',
        category: 'PDF'
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/conversionRegistry.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Registry of conversion tool pages for SEO.
// Each entry defines a slug (URL under /tools/), title, description, category, and targetFormat.
// Initially many formats will fallback to placeholder conversion until native implementation is added.
__turbopack_context__.s([
    "conversionTools",
    ()=>conversionTools,
    "getAllCategories",
    ()=>getAllCategories,
    "getAllConversionTools",
    ()=>getAllConversionTools,
    "getConversionTool",
    ()=>getConversionTool,
    "getToolsByCategory",
    ()=>getToolsByCategory,
    "listConversionSlugs",
    ()=>listConversionSlugs
]);
const conversionTools = [
    // Full Image list from request (slugs normalized)
    {
        slug: '3fr-converter',
        title: '3FR Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Hasselblad 3FR RAW images to JPG/PNG.'
    },
    {
        slug: 'arw-converter',
        title: 'ARW Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Sony ARW RAW images to JPG/PNG.'
    },
    {
        slug: 'avif-converter',
        title: 'AVIF Converter',
        category: 'Image',
        targetFormat: 'avif',
        description: 'Convert images to AVIF or from AVIF to JPG/PNG (if supported by sharp).'
    },
    {
        slug: 'cr2-converter',
        title: 'CR2 Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Canon CR2 RAW images to JPG/PNG.'
    },
    {
        slug: 'cr3-converter',
        title: 'CR3 Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Canon CR3 RAW images to JPG/PNG.'
    },
    {
        slug: 'crw-converter',
        title: 'CRW Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Canon CRW RAW images to JPG/PNG.'
    },
    {
        slug: 'dcr-converter',
        title: 'DCR Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Kodak DCR RAW images to JPG/PNG.'
    },
    {
        slug: 'dng-converter',
        title: 'DNG Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Adobe DNG RAW images to JPG/PNG.'
    },
    {
        slug: 'eps-converter',
        title: 'EPS Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti file EPS in PDF o PNG mantenendo la qualità vettoriale.'
    },
    {
        slug: 'erf-converter',
        title: 'ERF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Epson ERF RAW images to JPG/PNG.'
    },
    {
        slug: 'heif-converter',
        title: 'HEIF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert HEIF to JPG/PNG (support depends on libvips build).'
    },
    {
        slug: 'icns-converter',
        title: 'ICNS Converter',
        category: 'Image',
        targetFormat: 'png',
        description: 'Convert Apple ICNS icons to PNG.'
    },
    {
        slug: 'ico-converter',
        title: 'ICO Converter',
        category: 'Image',
        targetFormat: 'png',
        description: 'Convert Windows ICO icons to PNG.'
    },
    {
        slug: 'jfif-converter',
        title: 'JFIF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert JFIF images to JPG/PNG.'
    },
    {
        slug: 'mos-converter',
        title: 'MOS Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Leaf MOS RAW images to JPG/PNG.'
    },
    {
        slug: 'mrw-converter',
        title: 'MRW Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Minolta MRW RAW images to JPG/PNG.'
    },
    {
        slug: 'nef-converter',
        title: 'NEF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Nikon NEF RAW images to JPG/PNG.'
    },
    {
        slug: 'odd-converter',
        title: 'ODD Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti template di disegno OpenDocument (ODD) in PDF o PNG.'
    },
    {
        slug: 'odg-converter',
        title: 'ODG Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti disegni ODG in PDF o PNG preservando gli elementi grafici.'
    },
    {
        slug: 'orf-converter',
        title: 'ORF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Olympus ORF RAW images to JPG/PNG.'
    },
    {
        slug: 'pef-converter',
        title: 'PEF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Pentax PEF RAW images to JPG/PNG.'
    },
    {
        slug: 'ppm-converter',
        title: 'PPM Converter',
        category: 'Image',
        targetFormat: 'png',
        description: 'Convert PPM images to PNG/JPG.'
    },
    {
        slug: 'ps-converter',
        title: 'PS Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti file PostScript (PS) in PDF o PNG ad alta risoluzione.'
    },
    {
        slug: 'psd-converter',
        title: 'PSD Converter',
        category: 'Image',
        targetFormat: 'png',
        description: 'Convert Adobe PSD to PNG/JPG (flatten).'
    },
    {
        slug: 'pub-converter',
        title: 'PUB Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti Microsoft Publisher (PUB) in PDF preservando layout e grafica.'
    },
    {
        slug: 'raf-converter',
        title: 'RAF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Fuji RAF RAW to JPG/PNG.'
    },
    {
        slug: 'raw-converter',
        title: 'RAW Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert various RAW formats to JPG/PNG (best-effort).'
    },
    {
        slug: 'rw2-converter',
        title: 'RW2 Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Panasonic RW2 RAW to JPG/PNG.'
    },
    {
        slug: 'tif-converter',
        title: 'TIF Converter',
        category: 'Image',
        targetFormat: 'tiff',
        description: 'Convert TIF/TIFF images to PNG/JPG or viceversa.'
    },
    {
        slug: 'x3f-converter',
        title: 'X3F Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Sigma X3F RAW to JPG/PNG.'
    },
    {
        slug: 'xcf-converter',
        title: 'XCF Converter',
        category: 'Image',
        targetFormat: 'png',
        description: 'Convert GIMP XCF to PNG/JPG (flatten).'
    },
    {
        slug: 'xps-converter',
        title: 'XPS Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti XPS in PDF mantenendo formattazione e immagini.'
    },
    // Vector additions
    {
        slug: 'ai-converter',
        title: 'AI Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti file Adobe Illustrator (AI) in PDF o PNG ad alta qualità.'
    },
    {
        slug: 'cdr-converter',
        title: 'CDR Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti disegni CorelDRAW (CDR) in PDF o PNG preservando i vettori.'
    },
    {
        slug: 'cgm-converter',
        title: 'CGM Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti grafici CGM in PDF o PNG mantenendo la qualità vettoriale.'
    },
    {
        slug: 'emf-converter',
        title: 'EMF Converter',
        category: 'Vector',
        targetFormat: 'png',
        description: 'Converti file EMF (Enhanced Metafile) in PNG o PDF.'
    },
    {
        slug: 'sk-converter',
        title: 'SK Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti file SK in PDF o PNG preservando gli elementi grafici.'
    },
    {
        slug: 'sk1-converter',
        title: 'SK1 Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti file SK1 in PDF o PNG ad alta risoluzione.'
    },
    {
        slug: 'svgz-converter',
        title: 'SVGZ Converter',
        category: 'Vector',
        targetFormat: 'svg',
        description: 'Convert SVGZ (compressed SVG) to SVG/PNG.'
    },
    {
        slug: 'vsd-converter',
        title: 'VSD Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti diagrammi Microsoft Visio (VSD) in PDF o PNG.'
    },
    {
        slug: 'wmf-converter',
        title: 'WMF Converter',
        category: 'Vector',
        targetFormat: 'png',
        description: 'Converti file WMF (Windows Metafile) in PNG o PDF.'
    },
    // Video list (map to common targets)
    {
        slug: '3g2-converter',
        title: '3G2 Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert 3G2 videos to MP4 or WEBM.'
    },
    {
        slug: '3gp-converter',
        title: '3GP Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert 3GP videos to MP4 or WEBM.'
    },
    {
        slug: '3gpp-converter',
        title: '3GPP Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert 3GPP videos to MP4 or WEBM.'
    },
    {
        slug: 'cavs-converter',
        title: 'CAVS Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert CAVS to MP4 (best-effort).'
    },
    {
        slug: 'dv-converter',
        title: 'DV Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert DV to MP4.'
    },
    {
        slug: 'dvr-converter',
        title: 'DVR Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert DVR MS to MP4 (best-effort).'
    },
    {
        slug: 'flv-converter',
        title: 'FLV Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert FLV to MP4 or WEBM.'
    },
    {
        slug: 'm2ts-converter',
        title: 'M2TS Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert M2TS to MP4.'
    },
    {
        slug: 'm4v-converter',
        title: 'M4V Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert M4V to MP4.'
    },
    {
        slug: 'mkv-converter',
        title: 'MKV Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MKV to MP4 or WEBM.'
    },
    {
        slug: 'mod-converter',
        title: 'MOD Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MOD to MP4 (best-effort).'
    },
    {
        slug: 'mov-converter',
        title: 'MOV Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MOV to MP4 or WEBM.'
    },
    {
        slug: 'mpeg-converter',
        title: 'MPEG Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MPEG to MP4.'
    },
    {
        slug: 'mpg-converter',
        title: 'MPG Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MPG to MP4.'
    },
    {
        slug: 'mts-converter',
        title: 'MTS Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MTS to MP4.'
    },
    {
        slug: 'mxf-converter',
        title: 'MXF Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MXF to MP4 (best-effort).'
    },
    {
        slug: 'ogg-converter',
        title: 'OGG Converter',
        category: 'Video',
        targetFormat: 'webm',
        description: 'Convert OGG videos to WEBM (or audio OGG to OGG).'
    },
    {
        slug: 'rm-converter',
        title: 'RM Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert RealMedia RM to MP4 (best-effort).'
    },
    {
        slug: 'rmvb-converter',
        title: 'RMVB Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert RMVB to MP4 (best-effort).'
    },
    {
        slug: 'swf-converter',
        title: 'SWF Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert SWF to MP4 (best-effort).'
    },
    {
        slug: 'ts-converter',
        title: 'TS Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert TS transport streams to MP4.'
    },
    {
        slug: 'vob-converter',
        title: 'VOB Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert VOB (DVD) to MP4.'
    },
    {
        slug: 'wmv-converter',
        title: 'WMV Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert WMV to MP4.'
    },
    {
        slug: 'wtv-converter',
        title: 'WTV Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert WTV to MP4 (best-effort).'
    },
    // Archive list (creation-focused)
    {
        slug: '7z-converter',
        title: '7Z Converter',
        category: 'Archive',
        targetFormat: '7z',
        description: 'Crea o estrai archivi 7Z compressi ad alta efficienza.'
    },
    {
        slug: 'ace-converter',
        title: 'ACE Converter',
        category: 'Archive',
        targetFormat: 'ace',
        description: 'Gestisci archivi ACE: crea o estrai file compressi.'
    },
    {
        slug: 'alz-converter',
        title: 'ALZ Converter',
        category: 'Archive',
        targetFormat: 'alz',
        description: 'Converti o estrai archivi ALZ compressi.'
    },
    {
        slug: 'arc-converter',
        title: 'ARC Converter',
        category: 'Archive',
        targetFormat: 'arc',
        description: 'Gestisci archivi ARC: crea o estrai contenuti.'
    },
    {
        slug: 'arj-converter',
        title: 'ARJ Converter',
        category: 'Archive',
        targetFormat: 'arj',
        description: 'Crea o estrai archivi ARJ compressi.'
    },
    {
        slug: 'bz-converter',
        title: 'BZ Converter',
        category: 'Archive',
        targetFormat: 'bz',
        description: 'Comprimi file usando l\'algoritmo Bzip.'
    },
    {
        slug: 'bz2-converter',
        title: 'BZ2 Converter',
        category: 'Archive',
        targetFormat: 'bz2',
        description: 'Comprimi file con Bzip2 per massima compressione.'
    },
    {
        slug: 'cab-converter',
        title: 'CAB Converter',
        category: 'Archive',
        targetFormat: 'cab',
        description: 'Gestisci archivi CAB di Windows: crea o estrai.'
    },
    {
        slug: 'cpio-converter',
        title: 'CPIO Converter',
        category: 'Archive',
        targetFormat: 'cpio',
        description: 'Crea o estrai archivi CPIO Unix/Linux.'
    },
    {
        slug: 'deb-converter',
        title: 'DEB Converter',
        category: 'Archive',
        targetFormat: 'deb',
        description: 'Gestisci pacchetti DEB Debian: estrai o crea.'
    },
    {
        slug: 'dmg-converter',
        title: 'DMG Converter',
        category: 'Archive',
        targetFormat: 'dmg',
        description: 'Gestisci immagini disco DMG di macOS.'
    },
    {
        slug: 'img-converter',
        title: 'IMG Converter',
        category: 'Archive',
        targetFormat: 'img',
        description: 'Gestisci immagini disco IMG: estrai o crea.'
    },
    {
        slug: 'iso-converter',
        title: 'ISO Converter',
        category: 'Archive',
        targetFormat: 'iso',
        description: 'Gestisci immagini ISO: estrai contenuti o crea nuove immagini.'
    },
    {
        slug: 'jar-converter',
        title: 'JAR Converter',
        category: 'Archive',
        targetFormat: 'jar',
        description: 'JAR archive creation (zip-based).'
    },
    {
        slug: 'lha-converter',
        title: 'LHA Converter',
        category: 'Archive',
        targetFormat: 'lha',
        description: 'Gestisci archivi LHA: crea o estrai file compressi.'
    },
    {
        slug: 'lz-converter',
        title: 'LZ Converter',
        category: 'Archive',
        targetFormat: 'lz',
        description: 'Comprimi file usando l\'algoritmo LZ.'
    },
    {
        slug: 'lzma-converter',
        title: 'LZMA Converter',
        category: 'Archive',
        targetFormat: 'lzma',
        description: 'Comprimi file con LZMA per alta compressione.'
    },
    {
        slug: 'lzo-converter',
        title: 'LZO Converter',
        category: 'Archive',
        targetFormat: 'lzo',
        description: 'Comprimi file con LZO per compressione veloce.'
    },
    {
        slug: 'rar-converter',
        title: 'RAR Converter',
        category: 'Archive',
        targetFormat: 'rar',
        description: 'Gestisci archivi RAR: estrai contenuti compressi.'
    },
    {
        slug: 'rpm-converter',
        title: 'RPM Converter',
        category: 'Archive',
        targetFormat: 'rpm',
        description: 'Gestisci pacchetti RPM: estrai o crea pacchetti.'
    },
    {
        slug: 'rz-converter',
        title: 'RZ Converter',
        category: 'Archive',
        targetFormat: 'rz',
        description: 'Comprimi file usando l\'algoritmo Rzip.'
    },
    {
        slug: 'tar-7z-converter',
        title: 'TAR.7Z Converter',
        category: 'Archive',
        targetFormat: '7z',
        description: 'Crea archivi .tar.7z combinando TAR e compressione 7Z.'
    },
    {
        slug: 'tar-bz-converter',
        title: 'TAR.BZ Converter',
        category: 'Archive',
        targetFormat: 'tar.bz',
        description: 'Crea archivi .tar.bz combinando TAR e Bzip.'
    },
    {
        slug: 'tar-bz2-converter',
        title: 'TAR.BZ2 Converter',
        category: 'Archive',
        targetFormat: 'tar.bz2',
        description: 'Crea archivi .tar.bz2 combinando TAR e Bzip2.'
    },
    {
        slug: 'tar-gz-converter',
        title: 'TAR.GZ Converter',
        category: 'Archive',
        targetFormat: 'tgz',
        description: 'Create .tar.gz (tgz) archives from files.'
    },
    {
        slug: 'tar-lzo-converter',
        title: 'TAR.LZO Converter',
        category: 'Archive',
        targetFormat: 'tar.lzo',
        description: 'Crea archivi .tar.lzo combinando TAR e LZO.'
    },
    {
        slug: 'tar-xz-converter',
        title: 'TAR.XZ Converter',
        category: 'Archive',
        targetFormat: 'tar.xz',
        description: 'Crea archivi .tar.xz combinando TAR e XZ.'
    },
    {
        slug: 'tar-z-converter',
        title: 'TAR.Z Converter',
        category: 'Archive',
        targetFormat: 'tar.z',
        description: 'Crea archivi .tar.Z combinando TAR e compress Unix.'
    },
    {
        slug: 'tbz-converter',
        title: 'TBZ Converter',
        category: 'Archive',
        targetFormat: 'tbz',
        description: 'Comprimi file in formato TBZ (TAR + Bzip).'
    },
    {
        slug: 'tbz2-converter',
        title: 'TBZ2 Converter',
        category: 'Archive',
        targetFormat: 'tbz2',
        description: 'Comprimi file in formato TBZ2 (TAR + Bzip2).'
    },
    {
        slug: 'tgz-converter',
        title: 'TGZ Converter',
        category: 'Archive',
        targetFormat: 'tgz',
        description: 'Create TGZ archives (tar.gz) from files.'
    },
    {
        slug: 'tz-converter',
        title: 'TZ Converter',
        category: 'Archive',
        targetFormat: 'tz',
        description: 'Comprimi file in formato TZ compresso.'
    },
    {
        slug: 'tzo-converter',
        title: 'TZO Converter',
        category: 'Archive',
        targetFormat: 'tzo',
        description: 'Comprimi file in formato TZO compresso.'
    },
    {
        slug: 'xz-converter',
        title: 'XZ Converter',
        category: 'Archive',
        targetFormat: 'xz',
        description: 'Comprimi file con XZ per massima compressione.'
    },
    {
        slug: 'z-converter',
        title: 'Z Converter',
        category: 'Archive',
        targetFormat: 'z',
        description: 'Comprimi file in formato Unix .Z compresso.'
    },
    // Audio list
    {
        slug: 'aac-converter',
        title: 'AAC Converter',
        category: 'Audio',
        targetFormat: 'aac',
        description: 'Convert audio to AAC/M4A (best-effort).'
    },
    {
        slug: 'ac3-converter',
        title: 'AC3 Converter',
        category: 'Audio',
        targetFormat: 'mp3',
        description: 'Convert AC3 to MP3/WAV.'
    },
    {
        slug: 'aif-converter',
        title: 'AIF Converter',
        category: 'Audio',
        targetFormat: 'wav',
        description: 'Convert AIF to WAV/MP3.'
    },
    {
        slug: 'aifc-converter',
        title: 'AIFC Converter',
        category: 'Audio',
        targetFormat: 'wav',
        description: 'Convert AIFC to WAV/MP3.'
    },
    {
        slug: 'aiff-converter',
        title: 'AIFF Converter',
        category: 'Audio',
        targetFormat: 'wav',
        description: 'Convert AIFF to WAV/MP3.'
    },
    {
        slug: 'amr-converter',
        title: 'AMR Converter',
        category: 'Audio',
        targetFormat: 'mp3',
        description: 'Convert AMR to MP3/WAV.'
    },
    {
        slug: 'au-converter',
        title: 'AU Converter',
        category: 'Audio',
        targetFormat: 'wav',
        description: 'Convert AU to WAV/MP3.'
    },
    {
        slug: 'caf-converter',
        title: 'CAF Converter',
        category: 'Audio',
        targetFormat: 'wav',
        description: 'Convert CAF to WAV/MP3.'
    },
    {
        slug: 'dss-converter',
        title: 'DSS Converter',
        category: 'Audio',
        targetFormat: 'mp3',
        description: 'Convert DSS to MP3/WAV (best-effort).'
    },
    {
        slug: 'flac-converter',
        title: 'FLAC Converter',
        category: 'Audio',
        targetFormat: 'flac',
        description: 'Convert audio to/from FLAC.'
    },
    {
        slug: 'm4a-converter',
        title: 'M4A Converter',
        category: 'Audio',
        targetFormat: 'm4a',
        description: 'Convert audio to M4A (AAC).'
    },
    {
        slug: 'm4b-converter',
        title: 'M4B Converter',
        category: 'Audio',
        targetFormat: 'm4b',
        description: 'Converti audiolibri in formato M4B con capitoli e segnalibri.'
    },
    {
        slug: 'mp3-converter',
        title: 'MP3 Converter',
        category: 'Audio',
        targetFormat: 'mp3',
        description: 'Convert audio to MP3 (bitrate configurabile).'
    },
    {
        slug: 'oga-converter',
        title: 'OGA Converter',
        category: 'Audio',
        targetFormat: 'ogg',
        description: 'Convert audio to OGG (Opus).'
    },
    {
        slug: 'voc-converter',
        title: 'VOC Converter',
        category: 'Audio',
        targetFormat: 'wav',
        description: 'Convert VOC to WAV (best-effort).'
    },
    {
        slug: 'weba-converter',
        title: 'WEBA Converter',
        category: 'Audio',
        targetFormat: 'weba',
        description: 'Convert audio to WEBA (OGG/Opus).'
    },
    {
        slug: 'wma-converter',
        title: 'WMA Converter',
        category: 'Audio',
        targetFormat: 'mp3',
        description: 'Convert WMA to MP3/WAV.'
    },
    // Document additions
    {
        slug: 'abw-converter',
        title: 'ABW Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti AbiWord (ABW) in PDF preservando formattazione e layout.'
    },
    {
        slug: 'djvu-converter',
        title: 'DJVU Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti file DJVU in PDF mantenendo immagini e testo ad alta qualità.'
    },
    {
        slug: 'doc-converter',
        title: 'DOC Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti Word legacy (DOC) in PDF moderni.'
    },
    {
        slug: 'docm-converter',
        title: 'DOCM Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti DOCM in PDF (le macro vengono rimosse per sicurezza).'
    },
    {
        slug: 'dot-converter',
        title: 'DOT Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti template Word (DOT) in PDF preservando lo stile.'
    },
    {
        slug: 'dotx-converter',
        title: 'DOTX Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti template Word moderni (DOTX) in PDF.'
    },
    {
        slug: 'html-converter',
        title: 'HTML Converter',
        category: 'Document',
        targetFormat: 'html',
        description: 'Converti tra HTML/MD/TXT/PDF.'
    },
    {
        slug: 'hwp-converter',
        title: 'HWP Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti HWP (Hancom Word) in PDF preservando formattazione.'
    },
    {
        slug: 'lwp-converter',
        title: 'LWP Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti LWP in PDF mantenendo layout e stili.'
    },
    {
        slug: 'md-converter',
        title: 'MD Converter',
        category: 'Document',
        targetFormat: 'md',
        description: 'Converti documenti tra Markdown, HTML e PDF.'
    },
    {
        slug: 'odt-converter',
        title: 'ODT Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti OpenDocument (ODT) in PDF ad alta qualità.'
    },
    {
        slug: 'pages-converter',
        title: 'PAGES Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti Apple Pages in PDF preservando design e formattazione.'
    },
    {
        slug: 'rst-converter',
        title: 'RST Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti file reStructuredText in PDF per documentazione professionale.'
    },
    {
        slug: 'rtf-converter',
        title: 'RTF Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti RTF (Rich Text Format) in PDF mantenendo formattazione.'
    },
    {
        slug: 'tex-converter',
        title: 'TEX Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti LaTeX (TEX) in PDF preservando formule e layout.'
    },
    {
        slug: 'wpd-converter',
        title: 'WPD Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti WordPerfect (WPD) in PDF moderni.'
    },
    {
        slug: 'wps-converter',
        title: 'WPS Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti WPS in PDF preservando contenuto e formattazione.'
    },
    {
        slug: 'zabw-converter',
        title: 'ZABW Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti archivi compressi ABW (ZABW) in PDF.'
    },
    // Ebook
    {
        slug: 'azw-converter',
        title: 'AZW Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook Kindle (AZW) in formato EPUB universale.'
    },
    {
        slug: 'azw3-converter',
        title: 'AZW3 Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook AZW3 di Amazon in EPUB per lettura su qualsiasi dispositivo.'
    },
    {
        slug: 'azw4-converter',
        title: 'AZW4 Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook AZW4 in formato EPUB standard.'
    },
    {
        slug: 'cbc-converter',
        title: 'CBC Converter',
        category: 'Ebook',
        targetFormat: 'cbz',
        description: 'Converti fumetti CBC in formato CBZ compresso.'
    },
    {
        slug: 'cbr-converter',
        title: 'CBR Converter',
        category: 'Ebook',
        targetFormat: 'cbz',
        description: 'Converti fumetti CBR (RAR) in formato CBZ (ZIP) universale.'
    },
    {
        slug: 'cbz-converter',
        title: 'CBZ Converter',
        category: 'Ebook',
        targetFormat: 'cbz',
        description: 'Crea archivi CBZ per fumetti da immagini.'
    },
    {
        slug: 'chm-converter',
        title: 'CHM Converter',
        category: 'Ebook',
        targetFormat: 'pdf',
        description: 'Converti file CHM (help di Windows) in PDF per lettura universale.'
    },
    {
        slug: 'epub-converter',
        title: 'EPUB Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Gestisci ebook EPUB: converti da e verso altri formati ebook.'
    },
    {
        slug: 'fb2-converter',
        title: 'FB2 Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook FictionBook (FB2) in formato EPUB.'
    },
    {
        slug: 'htm-converter',
        title: 'HTM Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti pagine HTML/HTM in ebook EPUB strutturati.'
    },
    {
        slug: 'htmlz-converter',
        title: 'HTMLZ Converter',
        category: 'Ebook',
        targetFormat: 'htmlz',
        description: 'Crea archivi HTMLZ (HTML compresso) per ebook.'
    },
    {
        slug: 'lit-converter',
        title: 'LIT Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook Microsoft LIT in formato EPUB moderno.'
    },
    {
        slug: 'lrf-converter',
        title: 'LRF Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook Sony LRF in formato EPUB universale.'
    },
    {
        slug: 'mobi-converter',
        title: 'MOBI Converter',
        category: 'Ebook',
        targetFormat: 'mobi',
        description: 'Converti ebook EPUB in formato MOBI per Kindle.'
    },
    {
        slug: 'pdb-converter',
        title: 'PDB Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook Palm (PDB) in formato EPUB.'
    },
    {
        slug: 'pml-converter',
        title: 'PML Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook PML in formato EPUB standard.'
    },
    {
        slug: 'prc-converter',
        title: 'PRC Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook PRC in formato EPUB universale.'
    },
    {
        slug: 'rb-converter',
        title: 'RB Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook RocketBook (RB) in formato EPUB.'
    },
    {
        slug: 'snb-converter',
        title: 'SNB Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook SNB in formato EPUB standard.'
    },
    {
        slug: 'tcr-converter',
        title: 'TCR Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook TCR in formato EPUB universale.'
    },
    {
        slug: 'txtz-converter',
        title: 'TXTZ Converter',
        category: 'Ebook',
        targetFormat: 'txtz',
        description: 'Crea archivi TXTZ (testo compresso) per ebook.'
    },
    // Presentation
    {
        slug: 'dps-converter',
        title: 'DPS Converter',
        category: 'Presentation',
        targetFormat: 'dps',
        description: 'Convert DPS presentation files to and from PPTX, PPT, PDF easily online.'
    },
    {
        slug: 'key-converter',
        title: 'KEY Converter',
        category: 'Presentation',
        targetFormat: 'key',
        description: 'Convert Apple Keynote KEY files to PPTX or PDF preserving layout.'
    },
    {
        slug: 'odp-converter',
        title: 'ODP Converter',
        category: 'Presentation',
        targetFormat: 'odp',
        description: 'Transform OpenDocument presentations (ODP) into PPTX, PDF and vice versa.'
    },
    {
        slug: 'pot-converter',
        title: 'POT Converter',
        category: 'Presentation',
        targetFormat: 'pot',
        description: 'Convert legacy PowerPoint template POT files to modern PPTX or PDF.'
    },
    {
        slug: 'potx-converter',
        title: 'POTX Converter',
        category: 'Presentation',
        targetFormat: 'potx',
        description: 'Convert POTX templates to PPTX presentations or PDF handouts.'
    },
    {
        slug: 'pps-converter',
        title: 'PPS Converter',
        category: 'Presentation',
        targetFormat: 'pps',
        description: 'Convert PPS show files to editable PPTX or PDF.'
    },
    {
        slug: 'ppsx-converter',
        title: 'PPSX Converter',
        category: 'Presentation',
        targetFormat: 'ppsx',
        description: 'Convert PPSX slide shows to PPTX or PDF quickly.'
    },
    {
        slug: 'ppt-converter',
        title: 'PPT Converter',
        category: 'Presentation',
        targetFormat: 'ppt',
        description: 'Convert legacy PPT files to PPTX or PDF retaining content.'
    },
    {
        slug: 'pptm-converter',
        title: 'PPTM Converter',
        category: 'Presentation',
        targetFormat: 'pptm',
        description: 'Convert PPTM macro-enabled presentations to PPTX or PDF (macros excluded).'
    },
    {
        slug: 'pptx-converter',
        title: 'PPTX Converter',
        category: 'Presentation',
        targetFormat: 'pptx',
        description: 'Convert PPTX presentations to PDF, or other formats (initial support: PDF).'
    },
    // Spreadsheet
    {
        slug: 'csv-converter',
        title: 'CSV Converter',
        category: 'Spreadsheet',
        targetFormat: 'csv',
        description: 'Convert CSV data to XLSX or PDF tables and back.'
    },
    {
        slug: 'et-converter',
        title: 'ET Converter',
        category: 'Spreadsheet',
        targetFormat: 'et',
        description: 'Convert Kingsoft ET spreadsheet files to XLSX or PDF.'
    },
    {
        slug: 'numbers-converter',
        title: 'NUMBERS Converter',
        category: 'Spreadsheet',
        targetFormat: 'numbers',
        description: 'Convert Apple Numbers documents to XLSX or PDF.'
    },
    {
        slug: 'ods-converter',
        title: 'ODS Converter',
        category: 'Spreadsheet',
        targetFormat: 'ods',
        description: 'Convert OpenDocument spreadsheets (ODS) to XLSX or PDF.'
    },
    {
        slug: 'xls-converter',
        title: 'XLS Converter',
        category: 'Spreadsheet',
        targetFormat: 'xls',
        description: 'Convert legacy Excel XLS files to modern XLSX or PDF.'
    },
    {
        slug: 'xlsm-converter',
        title: 'XLSM Converter',
        category: 'Spreadsheet',
        targetFormat: 'xlsm',
        description: 'Convert XLSM macro-enabled workbooks to XLSX or PDF (macros excluded).'
    },
    {
        slug: 'xlsx-converter',
        title: 'XLSX Converter',
        category: 'Spreadsheet',
        targetFormat: 'xlsx',
        description: 'Convert XLSX spreadsheets to PDF or CSV (initial support: PDF, CSV).'
    },
    // Image (subset initially supported; raw formats)
    {
        slug: 'png-converter',
        title: 'PNG Converter',
        category: 'Image',
        targetFormat: 'png',
        description: 'Converti immagini in PNG ottimizzato o da PNG a JPG, WEBP.'
    },
    {
        slug: 'jpg-converter',
        title: 'JPG Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Converti immagini in JPG con qualità regolabile per file più leggeri.'
    },
    {
        slug: 'jpeg-converter',
        title: 'JPEG Converter',
        category: 'Image',
        targetFormat: 'jpeg',
        description: 'Converti immagini in formato JPEG controllando qualità e dimensione.'
    },
    {
        slug: 'webp-converter',
        title: 'WEBP Converter',
        category: 'Image',
        targetFormat: 'webp',
        description: 'Converti immagini in formato WEBP moderno per ottimizzazione web.'
    },
    {
        slug: 'gif-converter',
        title: 'GIF Converter',
        category: 'Image',
        targetFormat: 'gif',
        description: 'Converti immagini statiche in GIF (supporto animazioni in arrivo).'
    },
    {
        slug: 'heic-converter',
        title: 'HEIC Converter',
        category: 'Image',
        targetFormat: 'heic',
        description: 'Converti foto HEIC (iPhone) in JPG o PNG per compatibilità universale.'
    },
    {
        slug: 'tiff-converter',
        title: 'TIFF Converter',
        category: 'Image',
        targetFormat: 'tiff',
        description: 'Converti immagini TIFF ad alta qualità in PNG, JPG o PDF.'
    },
    {
        slug: 'bmp-converter',
        title: 'BMP Converter',
        category: 'Image',
        targetFormat: 'bmp',
        description: 'Converti immagini BMP in PNG o JPG compressi per risparmiare spazio.'
    },
    {
        slug: 'raw-converter',
        title: 'RAW Converter',
        category: 'Image',
        targetFormat: 'raw',
        description: 'Converti formati RAW delle fotocamere in JPG o PNG processati.'
    },
    // Vector - duplicati rimossi, già presenti sopra
    // Video (initial support limited to container remux via ffmpeg if available)
    {
        slug: 'mp4-converter',
        title: 'MP4 Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Converti video in MP4 (H.264/AAC) con risoluzione e qualità regolabili.'
    },
    {
        slug: 'webm-converter',
        title: 'WEBM Converter',
        category: 'Video',
        targetFormat: 'webm',
        description: 'Converti video in WEBM (VP9/Opus) ottimizzato per web.'
    },
    {
        slug: 'avi-converter',
        title: 'AVI Converter',
        category: 'Video',
        targetFormat: 'avi',
        description: 'Converti video in formato AVI legacy per compatibilità.'
    },
    // Archive (initial: zip create/extract) - duplicati rimossi, già presenti sopra
    // Audio (initial conversion using ffmpeg if available) - duplicati rimossi, già presenti sopra
    // Document conversions
    {
        slug: 'docx-converter',
        title: 'DOCX Converter',
        category: 'Document',
        targetFormat: 'docx',
        description: 'Converti documenti in formato DOCX (Word) preservando formattazione e stili.'
    },
    {
        slug: 'txt-converter',
        title: 'TXT Converter',
        category: 'Document',
        targetFormat: 'txt',
        description: 'Converti documenti in testo semplice (TXT) estraendo solo il contenuto testuale.'
    },
    {
        slug: 'md-converter',
        title: 'MD Converter',
        category: 'Document',
        targetFormat: 'md',
        description: 'Converti documenti o HTML in formato Markdown per documentazione e note.'
    },
    {
        slug: 'html-converter',
        title: 'HTML Converter',
        category: 'Document',
        targetFormat: 'html',
        description: 'Converti Markdown o testo in pagine HTML con formattazione completa.'
    },
    // Ebook (duplicati rimossi - già presenti sopra)
    {
        slug: 'cbz-converter',
        title: 'CBZ Converter',
        category: 'Ebook',
        targetFormat: 'cbz',
        description: 'Create comic book CBZ archive from images.'
    },
    // Font (initial: ttf/otf -> woff/woff2 if library available)
    {
        slug: 'ttf-converter',
        title: 'TTF Converter',
        category: 'Font',
        targetFormat: 'ttf',
        description: 'Converti font TTF in WOFF/WOFF2 per web o viceversa.'
    },
    {
        slug: 'otf-converter',
        title: 'OTF Converter',
        category: 'Font',
        targetFormat: 'otf',
        description: 'Converti font OTF in TTF o WOFF per compatibilità web.'
    },
    {
        slug: 'woff-converter',
        title: 'WOFF Converter',
        category: 'Font',
        targetFormat: 'woff',
        description: 'Convert fonts to web-optimized WOFF format.'
    },
    {
        slug: 'woff2-converter',
        title: 'WOFF2 Converter',
        category: 'Font',
        targetFormat: 'woff2',
        description: 'Convert fonts to modern compressed WOFF2 format.'
    },
    {
        slug: 'eot-converter',
        title: 'EOT Converter',
        category: 'Font',
        targetFormat: 'eot',
        description: 'Convert fonts to legacy EOT format for older browsers.'
    },
    // PDF Tools - Convertitori specifici per PDF
    {
        slug: 'pdf-to-powerpoint',
        title: 'PDF to PowerPoint',
        category: 'PDF',
        targetFormat: 'pptx',
        description: 'Converti documenti PDF in presentazioni PowerPoint modificabili (PPTX).'
    },
    {
        slug: 'pdf-to-excel',
        title: 'PDF to Excel',
        category: 'PDF',
        targetFormat: 'xlsx',
        description: 'Estrai tabelle da PDF e convertile in fogli Excel modificabili (XLSX).'
    },
    {
        slug: 'pdf-to-pdfa',
        title: 'PDF to PDF/A',
        category: 'PDF',
        targetFormat: 'pdfa',
        description: 'Converti PDF in formato PDF/A conforme per archiviazione a lungo termine.'
    },
    {
        slug: 'pdf-to-docx',
        title: 'PDF to Word',
        category: 'PDF',
        targetFormat: 'docx',
        description: 'Converti PDF in documenti Word modificabili (DOCX) preservando la formattazione.'
    },
    {
        slug: 'pdf-to-jpg',
        title: 'PDF to JPG',
        category: 'PDF',
        targetFormat: 'jpg',
        description: 'Estrai immagini da PDF e convertile in file JPG ad alta qualità.'
    },
    {
        slug: 'pdf-to-png',
        title: 'PDF to PNG',
        category: 'PDF',
        targetFormat: 'png',
        description: 'Converti pagine PDF in immagini PNG mantenendo la qualità originale.'
    },
    {
        slug: 'pdf-to-txt',
        title: 'PDF to TXT',
        category: 'PDF',
        targetFormat: 'txt',
        description: 'Estrai il testo da PDF e convertilo in file di testo semplice (TXT).'
    },
    {
        slug: 'pdf-to-html',
        title: 'PDF to HTML',
        category: 'PDF',
        targetFormat: 'html',
        description: 'Converti PDF in pagine HTML preservando layout e formattazione.'
    },
    // Specific conversion tools (bidirectional) - Da altri formati a PDF
    {
        slug: 'powerpoint-to-pdf',
        title: 'PowerPoint to PDF',
        category: 'Presentation',
        targetFormat: 'pdf',
        description: 'Converti presentazioni PowerPoint (PPT, PPTX) in PDF ad alta qualità.'
    },
    {
        slug: 'excel-to-pdf',
        title: 'Excel to PDF',
        category: 'Spreadsheet',
        targetFormat: 'pdf',
        description: 'Converti fogli Excel (XLS, XLSX) in PDF preservando formattazione e tabelle.'
    },
    {
        slug: 'html-to-pdf',
        title: 'HTML to PDF',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti pagine web HTML in documenti PDF con stili completi.'
    }
];
function getConversionTool(slug) {
    return conversionTools.find((t)=>t.slug === slug);
}
function listConversionSlugs() {
    return conversionTools.map((t)=>t.slug);
}
function getToolsByCategory() {
    const categorized = {};
    const seenSlugs = new Set(); // Per evitare duplicati
    conversionTools.forEach((tool)=>{
        // Salta se abbiamo già visto questo slug
        if (seenSlugs.has(tool.slug)) {
            return;
        }
        seenSlugs.add(tool.slug);
        if (!categorized[tool.category]) {
            categorized[tool.category] = [];
        }
        categorized[tool.category].push({
            title: tool.title,
            description: tool.description,
            href: `/tools/${tool.slug}`,
            category: tool.category,
            targetFormat: tool.targetFormat,
            slug: tool.slug // Aggiungi anche lo slug per facilitare il confronto
        });
    });
    return categorized;
}
function getAllCategories() {
    return [
        ...new Set(conversionTools.map((t)=>t.category))
    ];
}
function getAllConversionTools() {
    return conversionTools.map((tool)=>({
            title: tool.title,
            description: tool.description,
            href: `/tools/${tool.slug}`,
            category: tool.category,
            targetFormat: tool.targetFormat,
            icon: null // Will use fallback icon in ToolCard
        }));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/analytics.js [client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
const GA_TRACKING_ID = ("TURBOPACK compile-time value", "G-XXXXXXXXXX") || 'G-XXXXXXXXXX';
const GTM_ID = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX';
const META_PIXEL_ID = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_META_PIXEL_ID || null;
const BING_WEBMASTER_ID = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BING_WEBMASTER_ID || null;
const ENABLE_ANALYTICS = ("TURBOPACK compile-time value", "development") === 'production';
const isGAEnabled = ()=>{
    return ("TURBOPACK compile-time value", "object") !== 'undefined' && window.gtag && GA_TRACKING_ID !== 'G-XXXXXXXXXX' && ENABLE_ANALYTICS;
};
const isGTMEnabled = ()=>{
    return ("TURBOPACK compile-time value", "object") !== 'undefined' && window.dataLayer && GTM_ID !== 'GTM-XXXXXXX' && ENABLE_ANALYTICS;
};
const isMetaPixelEnabled = ()=>{
    return ("TURBOPACK compile-time value", "object") !== 'undefined' && META_PIXEL_ID && META_PIXEL_ID !== '' && ENABLE_ANALYTICS;
};
const isBingWebmasterEnabled = ()=>{
    return ("TURBOPACK compile-time value", "object") !== 'undefined' && BING_WEBMASTER_ID && BING_WEBMASTER_ID !== '' && ENABLE_ANALYTICS;
};
// Get user properties for enhanced tracking
const getUserProperties = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return {
        screen_resolution: `${window.screen?.width}x${window.screen?.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        user_agent: navigator.userAgent,
        language: navigator.language || 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer || 'direct',
        page_url: window.location.href,
        page_path: window.location.pathname,
        page_title: document.title
    };
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
    if ("TURBOPACK compile-time truthy", 1) {
        sessionStorage.setItem('analytics_session_id', sessionId);
    }
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Toast.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ToastContainer,
    "showToast",
    ()=>showToast,
    "updateToast",
    ()=>updateToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
    _s();
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const progressIntervals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ToastContainer.useEffect": ()=>{
            const listener = {
                "ToastContainer.useEffect.listener": (toast)=>{
                    if (toast.update) {
                        setToasts({
                            "ToastContainer.useEffect.listener": (prev)=>prev.map({
                                    "ToastContainer.useEffect.listener": (t)=>t.id === toast.id ? {
                                            ...t,
                                            ...toast
                                        } : t
                                }["ToastContainer.useEffect.listener"])
                        }["ToastContainer.useEffect.listener"]);
                    } else {
                        setToasts({
                            "ToastContainer.useEffect.listener": (prev)=>[
                                    ...prev,
                                    toast
                                ]
                        }["ToastContainer.useEffect.listener"]);
                        if (toast.duration > 0 && toast.type !== 'loading' && toast.type !== 'progress') {
                            setTimeout({
                                "ToastContainer.useEffect.listener": ()=>{
                                    setToasts({
                                        "ToastContainer.useEffect.listener": (prev)=>prev.filter({
                                                "ToastContainer.useEffect.listener": (t)=>t.id !== toast.id
                                            }["ToastContainer.useEffect.listener"])
                                    }["ToastContainer.useEffect.listener"]);
                                }
                            }["ToastContainer.useEffect.listener"], toast.duration);
                        }
                    }
                }
            }["ToastContainer.useEffect.listener"];
            toastListeners.add(listener);
            return ({
                "ToastContainer.useEffect": ()=>toastListeners.delete(listener)
            })["ToastContainer.useEffect"];
        }
    }["ToastContainer.useEffect"], []);
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
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiCheckCircle"], {
                    style: iconStyle
                }, void 0, false, {
                    fileName: "[project]/components/Toast.js",
                    lineNumber: 79,
                    columnNumber: 36
                }, this);
            case 'error':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiXCircle"], {
                    style: iconStyle
                }, void 0, false, {
                    fileName: "[project]/components/Toast.js",
                    lineNumber: 80,
                    columnNumber: 34
                }, this);
            case 'info':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiInformationCircle"], {
                    style: iconStyle
                }, void 0, false, {
                    fileName: "[project]/components/Toast.js",
                    lineNumber: 81,
                    columnNumber: 33
                }, this);
            case 'warning':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiExclamation"], {
                    style: iconStyle
                }, void 0, false, {
                    fileName: "[project]/components/Toast.js",
                    lineNumber: 82,
                    columnNumber: 36
                }, this);
            case 'loading':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiCog"], {
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
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiLightningBolt"], {
                    style: iconStyle
                }, void 0, false, {
                    fileName: "[project]/components/Toast.js",
                    lineNumber: 84,
                    columnNumber: 37
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiInformationCircle"], {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        className: "jsx-86a39a103f6c4f52",
        children: [
            toasts.map((toast, index)=>{
                const colors = getColors(toast.type);
                const progress = toast.progress !== undefined ? Math.min(100, Math.max(0, toast.progress)) : null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.toastContent,
                            className: "jsx-86a39a103f6c4f52",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.iconContainer,
                                    className: "jsx-86a39a103f6c4f52",
                                    children: getIcon(toast.type)
                                }, void 0, false, {
                                    fileName: "[project]/components/Toast.js",
                                    lineNumber: 157,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.messageContainer,
                                    className: "jsx-86a39a103f6c4f52",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: styles.messageHeader,
                                            className: "jsx-86a39a103f6c4f52",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: styles.message,
                                                    className: "jsx-86a39a103f6c4f52",
                                                    children: toast.message
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Toast.js",
                                                    lineNumber: 163,
                                                    columnNumber: 37
                                                }, this),
                                                toast.timestamp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: styles.timestamp,
                                                    className: "jsx-86a39a103f6c4f52",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiClock"], {
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
                                        toast.details && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: styles.details,
                                            className: "jsx-86a39a103f6c4f52",
                                            children: toast.details
                                        }, void 0, false, {
                                            fileName: "[project]/components/Toast.js",
                                            lineNumber: 173,
                                            columnNumber: 37
                                        }, this),
                                        toast.technical && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: styles.technical,
                                            className: "jsx-86a39a103f6c4f52",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
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
                                        (progress !== null || toast.type === 'loading' || toast.type === 'progress') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: styles.progressContainer,
                                            className: "jsx-86a39a103f6c4f52",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: styles.progressBar,
                                                    className: "jsx-86a39a103f6c4f52",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                progress !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiX"], {
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
                        toast.action && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.actionContainer,
                            className: "jsx-86a39a103f6c4f52",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
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
_s(ToastContainer, "Is7sabi+q9QMcRWpfxIcPzssRP8=");
_c = ToastContainer;
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
var _c;
__turbopack_context__.k.register(_c, "ToastContainer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/errorHandler.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Frontend Error Handler Utility
 * Provides consistent error handling and user-friendly error messages
 */ __turbopack_context__.s([
    "fetchWithErrorHandling",
    ()=>fetchWithErrorHandling,
    "getErrorDetails",
    ()=>getErrorDetails,
    "getErrorMessage",
    ()=>getErrorMessage,
    "handleApiErrorResponse",
    ()=>handleApiErrorResponse,
    "handleError",
    ()=>handleError,
    "retryOperation",
    ()=>retryOperation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Toast.js [client] (ecmascript)");
;
/**
 * Error code to user-friendly message mapping
 */ const ERROR_MESSAGES = {
    // Validation errors
    VALIDATION_ERROR: 'I dati inseriti non sono validi',
    INVALID_FILE_TYPE: 'Tipo di file non supportato',
    FILE_TOO_LARGE: 'Il file è troppo grande',
    // Authentication errors
    AUTHENTICATION_ERROR: 'Autenticazione richiesta',
    AUTHORIZATION_ERROR: 'Non hai i permessi necessari',
    // Resource errors
    NOT_FOUND: 'Risorsa non trovata',
    CONFLICT: 'Conflitto: la risorsa esiste già',
    // Rate limiting
    RATE_LIMIT_EXCEEDED: 'Troppe richieste. Riprova più tardi',
    // System errors
    DATABASE_ERROR: 'Errore del database. Riprova più tardi',
    FILE_SYSTEM_ERROR: 'Errore nel sistema di file',
    NETWORK_ERROR: 'Errore di connessione. Controlla la tua connessione internet',
    TIMEOUT_ERROR: 'Timeout: l\'operazione ha richiesto troppo tempo',
    PROCESSING_ERROR: 'Errore durante l\'elaborazione',
    INTERNAL_ERROR: 'Errore interno del server. Riprova più tardi',
    // Method errors
    METHOD_NOT_ALLOWED: 'Metodo non consentito'
};
function getErrorMessage(error, defaultMessage = 'Si è verificato un errore') {
    // If error is already a string, return it
    if (typeof error === 'string') {
        return error;
    }
    // If error has a message property
    if (error?.message) {
        return error.message;
    }
    // If error has a code, try to map it
    if (error?.code && ERROR_MESSAGES[error.code]) {
        return ERROR_MESSAGES[error.code];
    }
    // If error has an error property (from API response)
    if (error?.error) {
        return error.error;
    }
    return defaultMessage;
}
function getErrorDetails(error) {
    const details = [];
    if (error?.details) {
        if (typeof error.details === 'object') {
            details.push(JSON.stringify(error.details, null, 2));
        } else {
            details.push(String(error.details));
        }
    }
    if (error?.stack && ("TURBOPACK compile-time value", "development") === 'development') {
        details.push(error.stack);
    }
    return details.length > 0 ? details.join('\n\n') : null;
}
async function handleApiErrorResponse(response) {
    let errorData;
    try {
        errorData = await response.json();
    } catch (e) {
        // If response is not JSON, create a generic error
        errorData = {
            error: `Errore ${response.status}: ${response.statusText}`,
            code: 'UNKNOWN_ERROR'
        };
    }
    // Extract error information
    const errorMessage = getErrorMessage(errorData);
    const errorCode = errorData.code || 'UNKNOWN_ERROR';
    const errorDetails = getErrorDetails(errorData);
    // Determine error type based on status code
    let errorType = 'error';
    if (response.status >= 400 && response.status < 500) {
        // Client errors - show as warning
        errorType = response.status === 401 || response.status === 403 ? 'error' : 'warning';
    }
    // Show toast notification
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])(errorMessage, errorType, 6000, {
        details: errorData.details ? typeof errorData.details === 'string' ? errorData.details : JSON.stringify(errorData.details, null, 2) : null,
        technical: errorDetails
    });
    // Return error object for further handling
    return {
        message: errorMessage,
        code: errorCode,
        status: response.status,
        details: errorData.details,
        original: errorData
    };
}
async function fetchWithErrorHandling(url, options = {}) {
    try {
        // Don't set Content-Type for FormData - browser will set it with boundary
        const isFormData = options.body instanceof FormData;
        const headers = isFormData ? {
            ...options.headers
        } : {
            'Content-Type': 'application/json',
            ...options.headers
        };
        const response = await fetch(url, {
            ...options,
            headers
        });
        if (!response.ok) {
            const error = await handleApiErrorResponse(response);
            throw error;
        }
        return await response.json();
    } catch (error) {
        // If it's already our formatted error, rethrow it
        if (error.message && error.code) {
            throw error;
        }
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            const networkError = {
                message: 'Errore di connessione. Controlla la tua connessione internet',
                code: 'NETWORK_ERROR',
                status: 0,
                original: error
            };
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])(networkError.message, 'error', 6000, {
                technical: ("TURBOPACK compile-time truthy", 1) ? error.stack : "TURBOPACK unreachable"
            });
            throw networkError;
        }
        // Handle abort/timeout errors
        if (error.name === 'AbortError') {
            const timeoutError = {
                message: 'Timeout: l\'operazione ha richiesto troppo tempo',
                code: 'TIMEOUT_ERROR',
                status: 408,
                original: error
            };
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])(timeoutError.message, 'error', 6000);
            throw timeoutError;
        }
        // Unknown error
        const unknownError = {
            message: error.message || 'Si è verificato un errore sconosciuto',
            code: 'UNKNOWN_ERROR',
            status: 500,
            original: error
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])(unknownError.message, 'error', 6000, {
            technical: ("TURBOPACK compile-time truthy", 1) ? error.stack : "TURBOPACK unreachable"
        });
        throw unknownError;
    }
}
function handleError(error, customMessage = null) {
    const errorMessage = customMessage || getErrorMessage(error);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])(errorMessage, 'error', 6000, {
        details: error?.details ? typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2) : null,
        technical: ("TURBOPACK compile-time value", "development") === 'development' && error?.stack ? error.stack : null
    });
    // Log error in development
    if ("TURBOPACK compile-time truthy", 1) {
        console.error('Error handled:', error);
    }
    return {
        message: errorMessage,
        code: error?.code || 'UNKNOWN_ERROR',
        original: error
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
            if (error.code === 'VALIDATION_ERROR' || error.code === 'AUTHENTICATION_ERROR' || error.code === 'AUTHORIZATION_ERROR' || error.status === 400 || error.status === 401 || error.status === 403) {
                throw error;
            }
            // If last attempt, throw error
            if (attempt === maxRetries) {
                break;
            }
            // Wait before retrying (exponential backoff)
            const waitTime = delay * Math.pow(2, attempt - 1);
            await new Promise((resolve)=>setTimeout(resolve, waitTime));
            // Show retry notification
            if (attempt < maxRetries) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])(`Tentativo ${attempt + 1} di ${maxRetries}...`, 'info', 2000);
            }
        }
    }
    throw lastError;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ConverterCards.jsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConverterCards
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$conversionRegistry$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/conversionRegistry.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function ConverterCards({ currentTool, currentSlug }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const categories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ConverterCards.useMemo[categories]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$conversionRegistry$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getToolsByCategory"])()
    }["ConverterCards.useMemo[categories]"], []);
    // Ottieni i tool della stessa categoria del tool corrente
    const sameCategoryTools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ConverterCards.useMemo[sameCategoryTools]": ()=>{
            if (!currentTool?.category) return [];
            const categoryTools = categories[currentTool.category] || [];
            // Rimuovi duplicati basati sull'href
            const uniqueTools = [];
            const seenHrefs = new Set();
            categoryTools.forEach({
                "ConverterCards.useMemo[sameCategoryTools]": (tool)=>{
                    if (!seenHrefs.has(tool.href)) {
                        seenHrefs.add(tool.href);
                        uniqueTools.push(tool);
                    }
                }
            }["ConverterCards.useMemo[sameCategoryTools]"]);
            return uniqueTools;
        }
    }["ConverterCards.useMemo[sameCategoryTools]"], [
        currentTool,
        categories
    ]);
    // Se ci sono meno di 2 tool nella categoria, non mostrare le card
    if (sameCategoryTools.length < 2) return null;
    // Determina lo slug corrente in modo più robusto
    const activeSlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ConverterCards.useMemo[activeSlug]": ()=>{
            if (currentSlug) return String(currentSlug);
            if (currentTool?.slug) return String(currentTool.slug);
            if (router.query.slug) return String(router.query.slug);
            // Estrai dall'href se disponibile
            if (currentTool?.href) {
                const match = currentTool.href.match(/\/tools\/(.+)$/);
                if (match) return match[1];
            }
            return null;
        }
    }["ConverterCards.useMemo[activeSlug]"], [
        currentSlug,
        currentTool,
        router.query.slug
    ]);
    // Colori per le card (simili a quelli del PDF converter)
    const colors = [
        '#f093fb',
        '#43e97b',
        '#ff9f43',
        '#10b981',
        '#60a5fa',
        '#4facfe',
        '#fa709a',
        '#f97316',
        '#22c55e',
        '#a78bfa',
        '#8b5cf6',
        '#ec4899',
        '#14b8a6',
        '#f59e0b',
        '#3b82f6'
    ];
    const handleCardClick = (href)=>{
        router.push(href);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.cardsContainer,
                className: "jsx-ffe9b3403bf006f6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        style: styles.cardsTitle,
                        className: "jsx-ffe9b3403bf006f6",
                        children: [
                            "Altri convertitori ",
                            currentTool?.category || ''
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ConverterCards.jsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.cardsGrid,
                        className: "jsx-ffe9b3403bf006f6",
                        children: sameCategoryTools.map((tool, index)=>{
                            // Estrai lo slug dal tool in modo più robusto
                            const toolSlug = tool.slug || (tool.href ? tool.href.replace('/tools/', '') : null);
                            // Confronta gli slug in modo case-insensitive e normalizzato
                            const normalizedToolSlug = toolSlug ? String(toolSlug).toLowerCase().trim() : null;
                            const normalizedActiveSlug = activeSlug ? String(activeSlug).toLowerCase().trim() : null;
                            const isActive = normalizedToolSlug === normalizedActiveSlug;
                            const color = colors[index % colors.length];
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>!isActive && handleCardClick(tool.href),
                                style: {
                                    ...styles.card,
                                    ...isActive ? {
                                        borderColor: color,
                                        background: `${color}15`,
                                        boxShadow: `0 4px 12px ${color}40`,
                                        color: '#fff'
                                    } : {
                                        background: '#0f172a',
                                        borderColor: 'rgba(148,163,184,0.24)',
                                        color: '#cfe0ff'
                                    }
                                },
                                className: "jsx-ffe9b3403bf006f6" + " " + ((isActive ? 'converter-card active' : 'converter-card') || ""),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: styles.cardLabel,
                                    className: "jsx-ffe9b3403bf006f6",
                                    children: tool.title
                                }, void 0, false, {
                                    fileName: "[project]/components/ConverterCards.jsx",
                                    lineNumber: 85,
                                    columnNumber: 17
                                }, this)
                            }, tool.href || tool.slug || index, false, {
                                fileName: "[project]/components/ConverterCards.jsx",
                                lineNumber: 67,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/ConverterCards.jsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ConverterCards.jsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                id: "ffe9b3403bf006f6",
                children: ".converter-card.jsx-ffe9b3403bf006f6{cursor:pointer;transition:all .3s}.converter-card.jsx-ffe9b3403bf006f6:hover:not(.active){border-color:#94a3b85c;transform:translateY(-2px)}.converter-card.active.jsx-ffe9b3403bf006f6{cursor:default}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true);
}
_s(ConverterCards, "lblgiP1/XLod0pF9LSLzCvgpBSg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ConverterCards;
const styles = {
    cardsContainer: {
        marginTop: '32px',
        marginBottom: '24px'
    },
    cardsTitle: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#e6eef8',
        marginBottom: '16px',
        textAlign: 'center'
    },
    cardsGrid: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    card: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: '#0f172a',
        color: '#cfe0ff',
        border: '2px solid rgba(148,163,184,0.24)',
        borderRadius: '12px',
        padding: '12px 18px',
        fontWeight: 600,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 6px 14px rgba(0,0,0,0.25)',
        fontSize: '14px',
        minWidth: '120px',
        justifyContent: 'center',
        textAlign: 'center'
    },
    cardLabel: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
};
var _c;
__turbopack_context__.k.register(_c, "ConverterCards");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/GenericConverter.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-dropzone/dist/es/index.js [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/analytics.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$errorHandler$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/errorHandler.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ConverterCards$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ConverterCards.jsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
// Generic converter UI: upload a file, select output (currently limited), perform placeholder conversion.
function GenericConverter({ tool }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    // Estrai lo slug dall'URL o dal tool
    const currentSlug = router.query.slug || tool?.slug || (tool?.href ? tool.href.replace('/tools/', '') : null);
    // Formati disponibili per categoria
    const FORMAT_OPTIONS = {
        Audio: [
            'mp3',
            'wav',
            'aac',
            'flac',
            'ogg',
            'm4a',
            'weba'
        ],
        Video: [
            'mp4',
            'avi',
            'mov',
            'mkv',
            'webm',
            'flv'
        ]
    };
    // Determina il formato di output iniziale
    const getInitialFormat = ()=>{
        if (tool.category === 'Audio') {
            return FORMAT_OPTIONS.Audio[0]; // mp3
        }
        if (tool.category === 'Video') {
            return FORMAT_OPTIONS.Video[0]; // mp4
        }
        return tool.targetFormat;
    };
    const [file, setFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [preview, setPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [outputFormat, setOutputFormat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(getInitialFormat());
    const [resultName, setResultName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [resultDataUrl, setResultDataUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [progressMessage, setProgressMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [width, setWidth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [height, setHeight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [quality, setQuality] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('80');
    const [vWidth, setVWidth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [vHeight, setVHeight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [vBitrate, setVBitrate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('2500k');
    const [aBitrate, setABitrate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('192k');
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('0');
    const [isDragActive, setIsDragActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Aggiorna il formato quando cambia il tool
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GenericConverter.useEffect": ()=>{
            setOutputFormat(getInitialFormat());
        }
    }["GenericConverter.useEffect"], [
        tool.slug,
        tool.category
    ]);
    // Rimuovi duplicati dall'array degli output disponibili
    const availableOutputs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "GenericConverter.useMemo[availableOutputs]": ()=>{
            // Se è un convertitore Audio o Video, usa i formati specifici
            if (tool.category === 'Audio') {
                return FORMAT_OPTIONS.Audio;
            }
            if (tool.category === 'Video') {
                return FORMAT_OPTIONS.Video;
            }
            // Altrimenti usa il formato target del tool + formati comuni
            const outputs = [
                tool.targetFormat,
                'pdf',
                'txt',
                'jpg',
                'png'
            ];
            // Rimuovi duplicati mantenendo l'ordine
            return [
                ...new Set(outputs)
            ];
        }
    }["GenericConverter.useMemo[availableOutputs]"], [
        tool.targetFormat,
        tool.category
    ]);
    // Drag and drop handler
    const onDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GenericConverter.useCallback[onDrop]": (acceptedFiles)=>{
            const selectedFile = acceptedFiles[0];
            if (selectedFile) {
                setFile(selectedFile);
                setError(null);
                // Track file upload
                const fileType = selectedFile.type || selectedFile.name.split('.').pop();
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$client$5d$__$28$ecmascript$29$__["trackFileUpload"](fileType, selectedFile.size, tool?.title || tool?.name);
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$client$5d$__$28$ecmascript$29$__["trackToolStart"](tool?.title || tool?.name, fileType, selectedFile.size);
                // Generate preview for images
                if (selectedFile.type.startsWith('image/')) {
                    setPreview(URL.createObjectURL(selectedFile));
                } else {
                    setPreview(null);
                }
            }
        }
    }["GenericConverter.useCallback[onDrop]"], [
        tool
    ]);
    const { getRootProps, getInputProps } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"])({
        onDrop,
        accept: {
            'image/*': [
                '.png',
                '.jpg',
                '.jpeg',
                '.webp',
                '.gif'
            ],
            'application/pdf': [
                '.pdf'
            ],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
                '.docx'
            ],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
                '.xlsx'
            ],
            'application/vnd.ms-excel': [
                '.xls'
            ],
            'text/plain': [
                '.txt'
            ],
            'video/*': [
                '.mp4',
                '.avi',
                '.mov',
                '.mkv',
                '.webm'
            ],
            'audio/*': [
                '.mp3',
                '.wav',
                '.m4a',
                '.flac',
                '.ogg'
            ]
        },
        maxFiles: 1,
        onDragEnter: {
            "GenericConverter.useDropzone": ()=>setIsDragActive(true)
        }["GenericConverter.useDropzone"],
        onDragLeave: {
            "GenericConverter.useDropzone": ()=>setIsDragActive(false)
        }["GenericConverter.useDropzone"],
        onDropAccepted: {
            "GenericConverter.useDropzone": ()=>setIsDragActive(false)
        }["GenericConverter.useDropzone"],
        onDropRejected: {
            "GenericConverter.useDropzone": ()=>{
                setIsDragActive(false);
                setError('File non supportato. Controlla il formato.');
            }
        }["GenericConverter.useDropzone"]
    });
    const handleConvert = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GenericConverter.useCallback[handleConvert]": async ()=>{
            if (!file) {
                setError('Seleziona un file prima di convertire.');
                return;
            }
            // Valida che il file non sia vuoto
            if (file.size === 0) {
                setError('Il file è vuoto. Carica un file valido.');
                return;
            }
            setLoading(true);
            setProgress(0);
            setProgressMessage('Preparazione...');
            setError(null);
            setResultDataUrl(null);
            setResultName(null);
            const startTime = Date.now();
            const fromFormat = file.name.split('.').pop() || file.type;
            // Simulatore di progresso per l'upload
            const progressInterval = setInterval({
                "GenericConverter.useCallback[handleConvert].progressInterval": ()=>{
                    setProgress({
                        "GenericConverter.useCallback[handleConvert].progressInterval": (prev)=>{
                            if (prev >= 95) return prev;
                            const increment = Math.random() * 15;
                            return Math.min(95, prev + increment);
                        }
                    }["GenericConverter.useCallback[handleConvert].progressInterval"]);
                }
            }["GenericConverter.useCallback[handleConvert].progressInterval"], 500);
            try {
                // Verifica che il file esista e abbia una dimensione valida
                if (!file || file.size === 0) {
                    throw new Error('Il file è vuoto o non valido. Carica un file valido.');
                }
                setProgressMessage('Caricamento file...');
                const form = new FormData();
                form.append('file', file);
                form.append('target', outputFormat);
                if (width) form.append('width', width);
                if (height) form.append('height', height);
                if (quality) form.append('quality', quality);
                if (vWidth) form.append('vwidth', vWidth);
                if (vHeight) form.append('vheight', vHeight);
                if (vBitrate) form.append('vbitrate', vBitrate);
                if (aBitrate) form.append('abitrate', aBitrate);
                if (page) form.append('page', page);
                // Determina quale API chiamare in base allo slug del tool
                let apiUrl = `/api/convert/${outputFormat}`;
                const toolSlug = tool?.slug || currentSlug;
                // Mappa dei convertitori PDF agli endpoint dedicati
                const pdfConverterMap = {
                    'pdf-to-docx': '/api/pdf/pdf-to-docx',
                    'pdf-to-pptx': '/api/pdf/pdf-to-pptx',
                    'pdf-to-powerpoint': '/api/pdf/pdf-to-pptx',
                    'pdf-to-xlsx': '/api/pdf/pdf-to-xlsx',
                    'pdf-to-excel': '/api/pdf/pdf-to-xlsx',
                    'pdf-to-jpg': '/api/pdf/pdf-to-jpg',
                    'pdf-to-png': '/api/pdf/pdf-to-jpg',
                    'pdf-to-txt': '/api/pdf/pdf-to-txt',
                    'pdf-to-html': '/api/pdf/pdf-to-html',
                    'pdf-to-pdfa': '/api/pdf/pdf-to-pdfa',
                    'docx-to-pdf': '/api/pdf/docx-to-pdf',
                    'powerpoint-to-pdf': '/api/pdf/ppt-to-pdf',
                    'excel-to-pdf': '/api/pdf/xls-to-pdf',
                    'html-to-pdf': '/api/pdf/html-to-pdf'
                };
                // Se è un convertitore PDF, usa l'endpoint dedicato
                if (toolSlug && pdfConverterMap[toolSlug]) {
                    apiUrl = pdfConverterMap[toolSlug];
                }
                // Verifica che l'URL sia valido
                if (!apiUrl || !apiUrl.startsWith('/')) {
                    throw new Error(`URL API non valido: ${apiUrl}`);
                }
                // Crea un AbortController per gestire timeout
                const controller = new AbortController();
                let timeoutId1;
                let response;
                try {
                    timeoutId1 = setTimeout({
                        "GenericConverter.useCallback[handleConvert]": ()=>{
                            controller.abort();
                        }
                    }["GenericConverter.useCallback[handleConvert]"], 300000); // 5 minuti
                    setProgress(30);
                    setProgressMessage('Conversione in corso...');
                    // Use improved error handling
                    response = await fetch(apiUrl, {
                        method: 'POST',
                        body: form,
                        headers: {},
                        signal: controller.signal
                    });
                    setProgress(80);
                    setProgressMessage('Finalizzazione...');
                    // Pulisci il timeout se la richiesta è completata
                    clearTimeout(timeoutId1);
                    // Se la richiesta è stata abortita, esci
                    if (controller.signal.aborted) {
                        throw new Error('Operazione annullata per timeout');
                    }
                } catch (fetchError) {
                    // Pulisci sempre il timeout in caso di errore
                    clearTimeout(timeoutId1);
                    // Gestisci errori di rete
                    if (fetchError.name === 'AbortError') {
                        throw new Error('Timeout: l\'operazione ha richiesto troppo tempo. Riprova con un file più piccolo.');
                    }
                    if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
                        throw new Error('Errore di connessione. Controlla la tua connessione internet e riprova.');
                    }
                    // Rilancia altri errori
                    throw new Error(`Errore durante la richiesta: ${fetchError.message || 'Errore sconosciuto'}`);
                }
                if (!response.ok) {
                    let errorMessage = `Errore HTTP ${response.status}`;
                    try {
                        const errorData = await response.json();
                        // Gestisci diversi formati di errore
                        if (errorData.error) {
                            errorMessage = errorData.error;
                            // Se c'è un hint, aggiungilo al messaggio
                            if (errorData.hint) {
                                errorMessage += `. ${errorData.hint}`;
                            }
                        } else if (errorData.details) {
                            errorMessage = errorData.details;
                        } else if (errorData.message) {
                            errorMessage = errorData.message;
                        }
                    } catch (e) {
                        // Se la risposta non è JSON, usa il messaggio di default
                        errorMessage = `Errore durante l'upload: il file potrebbe essere vuoto o non valido`;
                    }
                    // Messaggi di errore più specifici per errori comuni
                    if (response.status === 400) {
                        errorMessage = errorMessage.includes('vuoto') || errorMessage.includes('empty') ? errorMessage : 'File non valido o formato non supportato. ' + (errorMessage !== `Errore HTTP ${response.status}` ? errorMessage : '');
                    } else if (response.status === 413) {
                        errorMessage = 'File troppo grande. Dimensione massima: 500MB per file video/audio, 50MB per altri formati';
                    } else if (response.status === 500) {
                        errorMessage = errorMessage !== `Errore HTTP ${response.status}` ? errorMessage : 'Errore del server durante la conversione';
                    }
                    throw new Error(errorMessage);
                }
                // Verifica che la risposta sia JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    // Prova a leggere come testo per vedere cosa c'è
                    const text = await response.text();
                    console.error('Risposta non JSON ricevuta:', text.substring(0, 200));
                    throw new Error('Il server ha restituito una risposta non valida. Riprova più tardi.');
                }
                // Parsing della risposta JSON con gestione errori
                let data;
                try {
                    const text = await response.text();
                    if (!text || text.trim().length === 0) {
                        throw new Error('Risposta vuota dal server');
                    }
                    data = JSON.parse(text);
                } catch (parseError) {
                    console.error('Errore parsing JSON:', parseError);
                    throw new Error('Errore nel parsing della risposta dal server. La conversione potrebbe essere fallita.');
                }
                const duration = Date.now() - startTime;
                // Verifica che i dati siano validi
                if (!data || typeof data !== 'object') {
                    throw new Error('Formato risposta non valido dal server');
                }
                // Gestisci due tipi di risposta:
                // 1. { name, dataUrl } - da /api/convert/[target]
                // 2. { url } - da /api/pdf/pdf-to-* (ConvertAPI o altro)
                let resultName = null;
                let resultDataUrl = null;
                if (data.dataUrl) {
                    // Formato standard { name, dataUrl }
                    if (typeof data.dataUrl !== 'string' || data.dataUrl.trim().length === 0) {
                        throw new Error('Data URL non valido nella risposta');
                    }
                    resultName = data.name || `converted.${outputFormat}`;
                    resultDataUrl = data.dataUrl;
                } else if (data.url) {
                    // Formato PDF converter { url, name? }
                    if (typeof data.url !== 'string' || data.url.trim().length === 0) {
                        throw new Error('URL non valido nella risposta');
                    }
                    // Gestisci diversi tipi di URL:
                    // 1. Data URL già presente (es. pdf-to-pptx, pdf-to-xlsx)
                    // 2. URL esterno (es. ConvertAPI per pdf-to-docx)
                    if (data.url.startsWith('data:')) {
                        // Data URL già presente - usa direttamente
                        resultDataUrl = data.url;
                    } else if (data.url.startsWith('http://') || data.url.startsWith('https://')) {
                        // URL esterno (es. ConvertAPI) - scarica il file e convertilo in data URL
                        try {
                            const fileResponse = await fetch(data.url, {
                                signal: controller.signal
                            });
                            if (!fileResponse.ok) {
                                throw new Error(`Errore nel download del file convertito: HTTP ${fileResponse.status}`);
                            }
                            const blob = await fileResponse.blob();
                            if (!blob || blob.size === 0) {
                                throw new Error('File scaricato è vuoto');
                            }
                            const reader = new FileReader();
                            resultDataUrl = await new Promise({
                                "GenericConverter.useCallback[handleConvert]": (resolve, reject)=>{
                                    reader.onloadend = ({
                                        "GenericConverter.useCallback[handleConvert]": ()=>{
                                            if (reader.result) {
                                                resolve(reader.result);
                                            } else {
                                                reject(new Error('Errore nella lettura del file'));
                                            }
                                        }
                                    })["GenericConverter.useCallback[handleConvert]"];
                                    reader.onerror = ({
                                        "GenericConverter.useCallback[handleConvert]": ()=>reject(new Error('Errore nella lettura del file'))
                                    })["GenericConverter.useCallback[handleConvert]"];
                                    reader.readAsDataURL(blob);
                                }
                            }["GenericConverter.useCallback[handleConvert]"]);
                        } catch (downloadError) {
                            console.error('Errore download file:', downloadError);
                            throw new Error(`Errore nel download del file convertito: ${downloadError.message}`);
                        }
                    } else {
                        // Altro formato - prova a usarlo come data URL
                        resultDataUrl = data.url;
                    }
                    resultName = data.name || file.name.replace(/\.[^.]+$/, `.${outputFormat}`);
                } else {
                    console.error('Risposta non riconosciuta:', data);
                    throw new Error('Formato risposta non riconosciuto dal server. Risposta: ' + JSON.stringify(data).substring(0, 100));
                }
                // Track successful conversion
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$client$5d$__$28$ecmascript$29$__["trackConversion"]('file_conversion', fromFormat, outputFormat, file.size, duration);
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$client$5d$__$28$ecmascript$29$__["trackToolComplete"](tool?.title || tool?.name, duration, true);
                clearInterval(progressInterval);
                setProgress(100);
                setProgressMessage('Completato!');
                setResultName(resultName);
                setResultDataUrl(resultDataUrl);
            } catch (e) {
                const duration = Date.now() - startTime;
                clearInterval(progressInterval);
                // Track failed conversion
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$client$5d$__$28$ecmascript$29$__["trackToolComplete"](tool?.title || tool?.name, duration, false);
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$client$5d$__$28$ecmascript$29$__["trackError"](e.message || 'Conversion failed', 'GenericConverter', 'conversion_error');
                // Error handling
                const handledError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$errorHandler$2e$js__$5b$client$5d$__$28$ecmascript$29$__["handleError"])(e);
                setError(handledError.message);
                console.error('Errore conversione:', e);
            } finally{
                // Assicurati che il timeout venga sempre pulito
                if (typeof timeoutId !== 'undefined') {
                    clearTimeout(timeoutId);
                }
                clearInterval(progressInterval);
                setLoading(false);
                // Reset progress dopo 2 secondi se c'è stato successo
                if (!error) {
                    setTimeout({
                        "GenericConverter.useCallback[handleConvert]": ()=>{
                            setProgress(0);
                            setProgressMessage('');
                        }
                    }["GenericConverter.useCallback[handleConvert]"], 2000);
                }
            }
        }
    }["GenericConverter.useCallback[handleConvert]"], [
        file,
        outputFormat,
        width,
        height,
        quality,
        vWidth,
        vHeight,
        vBitrate,
        aBitrate,
        page,
        tool,
        currentSlug
    ]);
    const handleFileSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GenericConverter.useCallback[handleFileSelect]": (e)=>{
            const selectedFile = e.target.files[0];
            if (selectedFile) {
                setFile(selectedFile);
                setError(null);
                if (selectedFile.type.startsWith('image/')) {
                    setPreview(URL.createObjectURL(selectedFile));
                } else {
                    setPreview(null);
                }
            }
        }
    }["GenericConverter.useCallback[handleFileSelect]"], []);
    const handleRemoveFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GenericConverter.useCallback[handleRemoveFile]": ()=>{
            setFile(null);
            setPreview(null);
            setResultDataUrl(null);
            setResultName(null);
            setError(null);
        }
    }["GenericConverter.useCallback[handleRemoveFile]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.wrap,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ConverterCards$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                currentTool: tool,
                currentSlug: currentSlug
            }, void 0, false, {
                fileName: "[project]/components/GenericConverter.js",
                lineNumber: 449,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.panel,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: styles.title,
                        children: [
                            "Converti ",
                            tool.title
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 452,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: styles.desc,
                        children: tool.description
                    }, void 0, false, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 453,
                        columnNumber: 9
                    }, this),
                    !file ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ...getRootProps(),
                        style: {
                            ...styles.dropzone,
                            ...isDragActive ? styles.dropzoneActive : {}
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ...getInputProps(),
                                onChange: handleFileSelect
                            }, void 0, false, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 464,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiUpload"], {
                                style: styles.uploadIcon
                            }, void 0, false, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 465,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: styles.dropzoneTitle,
                                children: isDragActive ? 'Rilascia qui il file' : 'Trascina il file qui o clicca per selezionare'
                            }, void 0, false, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 466,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.dropzoneSubtitle,
                                children: "Supportati: Immagini, PDF, Documenti, Video, Audio"
                            }, void 0, false, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 469,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 457,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.filePreviewContainer,
                        children: [
                            preview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.imagePreview,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: preview,
                                    alt: "Preview",
                                    style: styles.previewImg
                                }, void 0, false, {
                                    fileName: "[project]/components/GenericConverter.js",
                                    lineNumber: 477,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 476,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.fileInfo,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.fileName,
                                        children: file.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 481,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.fileSize,
                                        children: [
                                            (file.size / 1024).toFixed(2),
                                            " KB"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 482,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 480,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleRemoveFile,
                                style: styles.removeBtn,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiX"], {
                                    style: {
                                        width: 20,
                                        height: 20
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/GenericConverter.js",
                                    lineNumber: 485,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 484,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 474,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        style: styles.label,
                        children: "Formato di destinazione"
                    }, void 0, false, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 489,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: outputFormat,
                        onChange: (e)=>setOutputFormat(e.target.value),
                        style: styles.select,
                        disabled: loading,
                        children: availableOutputs.map((fmt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: fmt,
                                children: fmt.toUpperCase()
                            }, fmt, false, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 496,
                                columnNumber: 40
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 490,
                        columnNumber: 9
                    }, this),
                    (outputFormat === 'jpg' || outputFormat === 'jpeg' || outputFormat === 'webp' || outputFormat === 'png') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.optionsRow,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.optionField,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: styles.label,
                                        children: "Larghezza (px)"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 501,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: width,
                                        onChange: (e)=>setWidth(e.target.value),
                                        placeholder: "es. 1920",
                                        style: styles.input
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 502,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 500,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.optionField,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: styles.label,
                                        children: "Altezza (px)"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 505,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: height,
                                        onChange: (e)=>setHeight(e.target.value),
                                        placeholder: "es. 1080",
                                        style: styles.input
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 506,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 504,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.optionField,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: styles.label,
                                        children: "Qualità"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 509,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: quality,
                                        onChange: (e)=>setQuality(e.target.value),
                                        placeholder: "1-100",
                                        style: styles.input
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 510,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 508,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.optionField,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: styles.label,
                                        children: "Pagina (PDF)"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 513,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: page,
                                        onChange: (e)=>setPage(e.target.value),
                                        placeholder: "0 = prima pagina",
                                        style: styles.input
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 514,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 512,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 499,
                        columnNumber: 11
                    }, this),
                    [
                        'mp4',
                        'webm',
                        'avi',
                        'mkv',
                        'mov',
                        'flv'
                    ].includes(outputFormat) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.optionsRow,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.optionField,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: styles.label,
                                        children: "Video larghezza"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 521,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: vWidth,
                                        onChange: (e)=>setVWidth(e.target.value),
                                        placeholder: "es. 1280",
                                        style: styles.input
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 522,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 520,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.optionField,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: styles.label,
                                        children: "Video altezza"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 525,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: vHeight,
                                        onChange: (e)=>setVHeight(e.target.value),
                                        placeholder: "es. 720",
                                        style: styles.input
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 526,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 524,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.optionField,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: styles.label,
                                        children: "Bitrate video"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 529,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: vBitrate,
                                        onChange: (e)=>setVBitrate(e.target.value),
                                        placeholder: "es. 2500k",
                                        style: styles.input
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 530,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 528,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.optionField,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: styles.label,
                                        children: "Bitrate audio"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 533,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: aBitrate,
                                        onChange: (e)=>setABitrate(e.target.value),
                                        placeholder: "es. 192k",
                                        style: styles.input
                                    }, void 0, false, {
                                        fileName: "[project]/components/GenericConverter.js",
                                        lineNumber: 534,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 532,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 519,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleConvert,
                        disabled: !file || loading,
                        style: {
                            ...styles.btn,
                            ...loading ? styles.btnLoading : {},
                            ...!file ? styles.btnDisabled : {}
                        },
                        children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: styles.spinner
                                }, void 0, false, {
                                    fileName: "[project]/components/GenericConverter.js",
                                    lineNumber: 549,
                                    columnNumber: 15
                                }, this),
                                "Conversione..."
                            ]
                        }, void 0, true) : 'Converti'
                    }, void 0, false, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 538,
                        columnNumber: 9
                    }, this),
                    loading && progress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.progressContainer,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.progressBar,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        ...styles.progressFill,
                                        width: `${progress}%`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/GenericConverter.js",
                                    lineNumber: 560,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 559,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.progressText,
                                children: [
                                    progressMessage,
                                    " ",
                                    Math.round(progress),
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 562,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 558,
                        columnNumber: 11
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.error,
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 568,
                        columnNumber: 19
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/GenericConverter.js",
                lineNumber: 451,
                columnNumber: 7
            }, this),
            resultDataUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.result,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        style: styles.resultTitle,
                        children: "✓ Conversione completata!"
                    }, void 0, false, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 572,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: styles.resultName,
                        children: resultName
                    }, void 0, false, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 573,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: resultDataUrl,
                        download: resultName,
                        style: styles.downloadBtn,
                        onClick: ()=>{
                            const fileType = resultName.split('.').pop() || 'unknown';
                            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$client$5d$__$28$ecmascript$29$__["trackDownload"](fileType, tool?.title || tool?.name, file?.size);
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiDownload"], {
                                style: {
                                    width: 18,
                                    height: 18,
                                    marginRight: '8px'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/GenericConverter.js",
                                lineNumber: 583,
                                columnNumber: 13
                            }, this),
                            "Scarica file"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 574,
                        columnNumber: 11
                    }, this),
                    resultDataUrl.startsWith('data:image') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.resultPreview,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: resultDataUrl,
                            alt: resultName,
                            style: styles.resultImg
                        }, void 0, false, {
                            fileName: "[project]/components/GenericConverter.js",
                            lineNumber: 588,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 587,
                        columnNumber: 13
                    }, this),
                    resultDataUrl.startsWith('data:text') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        readOnly: true,
                        value: atob(resultDataUrl.split(',')[1]),
                        style: styles.previewText
                    }, void 0, false, {
                        fileName: "[project]/components/GenericConverter.js",
                        lineNumber: 592,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/GenericConverter.js",
                lineNumber: 571,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/GenericConverter.js",
        lineNumber: 447,
        columnNumber: 5
    }, this);
}
_s(GenericConverter, "EPC5CRbLjXmm98aeo9IZJt1Ufxw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"]
    ];
});
_c = GenericConverter;
const __TURBOPACK__default__export__ = /*#__PURE__*/ _c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["memo"])(GenericConverter);
const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        marginTop: '24px',
        animation: 'fadeIn 0.5s ease-out',
        '@media (max-width: 768px)': {
            gap: '24px',
            marginTop: '16px'
        }
    },
    panel: {
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.8) 100%)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        padding: '32px',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease',
        '@media (max-width: 768px)': {
            padding: '20px',
            borderRadius: '12px'
        }
    },
    title: {
        margin: '0 0 8px',
        fontSize: '24px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        '@media (max-width: 768px)': {
            fontSize: '20px'
        }
    },
    desc: {
        margin: '0 0 24px',
        color: '#94a3b8',
        fontSize: '15px',
        lineHeight: '1.6',
        '@media (max-width: 768px)': {
            fontSize: '14px',
            margin: '0 0 20px'
        }
    },
    dropzone: {
        border: '2px dashed rgba(102, 126, 234, 0.3)',
        borderRadius: '16px',
        padding: '48px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: 'rgba(15, 23, 42, 0.4)',
        marginBottom: '24px',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        '@media (max-width: 768px)': {
            padding: '32px 16px',
            borderRadius: '12px',
            marginBottom: '20px'
        }
    },
    dropzoneActive: {
        borderColor: '#667eea',
        background: 'rgba(102, 126, 234, 0.1)',
        transform: 'scale(1.02)',
        '@media (max-width: 768px)': {
            transform: 'scale(1.01)'
        }
    },
    uploadIcon: {
        width: '64px',
        height: '64px',
        margin: '0 auto 16px',
        color: '#667eea',
        '@media (max-width: 768px)': {
            width: '48px',
            height: '48px',
            margin: '0 auto 12px'
        }
    },
    dropzoneTitle: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#e6eef8',
        margin: '0 0 8px',
        '@media (max-width: 768px)': {
            fontSize: '16px'
        }
    },
    dropzoneSubtitle: {
        fontSize: '14px',
        color: '#94a3b8',
        margin: 0,
        '@media (max-width: 768px)': {
            fontSize: '13px',
            padding: '0 8px'
        }
    },
    filePreviewContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        '@media (max-width: 768px)': {
            padding: '12px',
            gap: '12px',
            marginBottom: '20px'
        }
    },
    imagePreview: {
        width: '60px',
        height: '60px',
        borderRadius: '8px',
        overflow: 'hidden',
        flexShrink: 0,
        '@media (max-width: 768px)': {
            width: '50px',
            height: '50px'
        }
    },
    previewImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    fileInfo: {
        flex: 1,
        minWidth: 0
    },
    fileName: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#e6eef8',
        marginBottom: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    fileSize: {
        fontSize: '12px',
        color: '#94a3b8'
    },
    removeBtn: {
        padding: '8px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '#ef4444',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    label: {
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#94a3b8',
        fontWeight: 600,
        marginBottom: '8px',
        display: 'block'
    },
    select: {
        margin: '8px 0 16px',
        padding: '12px',
        borderRadius: '10px',
        background: 'rgba(15, 23, 42, 0.8)',
        color: '#e6eef8',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        width: '100%',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    btn: {
        padding: '14px 28px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
        width: '100%',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        '@media (max-width: 768px)': {
            padding: '12px 24px',
            fontSize: '15px',
            borderRadius: '10px'
        }
    },
    btnLoading: {
        opacity: 0.7,
        cursor: 'not-allowed'
    },
    btnDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        background: 'rgba(102, 126, 234, 0.3)'
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },
    error: {
        marginTop: '16px',
        padding: '12px 16px',
        color: '#ef4444',
        fontSize: '14px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px'
    },
    result: {
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.8) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        padding: '32px',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        animation: 'slideIn 0.5s ease-out'
    },
    resultTitle: {
        margin: '0 0 12px',
        fontSize: '20px',
        fontWeight: 700,
        color: '#10b981'
    },
    resultName: {
        margin: '0 0 20px',
        color: '#94a3b8',
        fontSize: '14px'
    },
    downloadBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
        borderRadius: '12px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
        marginBottom: '20px'
    },
    resultPreview: {
        marginTop: '20px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(102, 126, 234, 0.2)'
    },
    resultImg: {
        width: '100%',
        height: 'auto',
        display: 'block'
    },
    previewText: {
        marginTop: '16px',
        width: '100%',
        minHeight: '160px',
        background: 'rgba(15, 23, 42, 0.8)',
        color: '#e6eef8',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '10px',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '13px',
        lineHeight: '1.6',
        resize: 'vertical'
    },
    optionsRow: {
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '16px'
        }
    },
    optionField: {
        flex: '1 1 200px',
        minWidth: '150px',
        '@media (max-width: 768px)': {
            flex: '1 1 100%',
            minWidth: '100%'
        }
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '10px',
        background: 'rgba(15, 23, 42, 0.8)',
        color: '#e6eef8',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        fontSize: '14px',
        transition: 'all 0.2s',
        boxSizing: 'border-box',
        WebkitTapHighlightColor: 'transparent',
        '@media (max-width: 768px)': {
            padding: '10px',
            fontSize: '16px',
            borderRadius: '8px'
        }
    },
    progressContainer: {
        marginTop: '16px',
        marginBottom: '16px'
    },
    progressBar: {
        width: '100%',
        height: '8px',
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        position: 'relative'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '10px',
        transition: 'width 0.3s ease',
        boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
        animation: 'shimmerProgress 2s infinite'
    },
    progressText: {
        marginTop: '8px',
        fontSize: '13px',
        color: '#94a3b8',
        textAlign: 'center',
        fontWeight: 500
    }
};
// Aggiungi animazioni CSS
if (typeof document !== 'undefined') {
    const styleId = 'generic-converter-animations';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes shimmerProgress {
        0% {
          background-position: -200% center;
        }
        100% {
          background-position: 200% center;
        }
      }
    `;
        document.head.appendChild(style);
    }
}
var _c, _c1;
__turbopack_context__.k.register(_c, "GenericConverter");
__turbopack_context__.k.register(_c1, "%default%");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/i18n.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LanguageProvider",
    ()=>LanguageProvider,
    "useTranslation",
    ()=>useTranslation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])();
// Cache per le traduzioni per evitare re-fetching
const translationsCache = {};
function LanguageProvider({ children, initialTranslations = {} }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [locale, setLocale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(router.locale || 'en');
    const [translations, setTranslations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(initialTranslations);
    // Funzione di traduzione memoizzata
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LanguageProvider.useCallback[t]": (key)=>{
            if (!key || typeof key !== 'string') return key;
            const keys = key.split('.');
            let value = translations;
            for (const k of keys){
                value = value?.[k];
                if (value === undefined) return key;
            }
            return value || key;
        }
    }["LanguageProvider.useCallback[t]"], [
        translations
    ]);
    // Caricamento traduzioni ottimizzato con cache
    const loadTranslations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LanguageProvider.useCallback[loadTranslations]": async (lang)=>{
            // Controllo cache prima
            if (translationsCache[lang]) {
                setTranslations(translationsCache[lang]);
                setLocale(lang);
                return;
            }
            try {
                // Solo lato client
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
                const response = await fetch(`/locales/${lang}/common.json`);
                if (!response.ok) {
                    throw new Error(`Failed to load translations: ${response.status}`);
                }
                const data = await response.json();
                // Cache delle traduzioni
                translationsCache[lang] = data;
                setTranslations(data);
                setLocale(lang);
            } catch (error) {
                console.error('Error loading translations:', error);
                // Fallback to English solo se non siamo già su English
                if (lang !== 'en' && ("TURBOPACK compile-time value", "object") !== 'undefined') {
                    loadTranslations('en');
                }
            }
        }
    }["LanguageProvider.useCallback[loadTranslations]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LanguageProvider.useEffect": ()=>{
            // Ricarica traduzioni quando cambia la locale del router
            if (router.locale && router.locale !== locale) {
                loadTranslations(router.locale);
            }
        }
    }["LanguageProvider.useEffect"], [
        router.locale,
        locale,
        loadTranslations
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LanguageProvider.useEffect": ()=>{
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
        }
    }["LanguageProvider.useEffect"], [
        router.locale,
        loadTranslations,
        initialTranslations
    ]);
    // Memoizza il valore del context per evitare re-render
    const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "LanguageProvider.useMemo[contextValue]": ()=>({
                locale,
                translations,
                t
            })
    }["LanguageProvider.useMemo[contextValue]"], [
        locale,
        translations,
        t
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageContext.Provider, {
        value: contextValue,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/i18n.js",
        lineNumber: 89,
        columnNumber: 5
    }, this);
}
_s(LanguageProvider, "oPckSwOD+eZR/YIhM11VO6ph6Zc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = LanguageProvider;
function useTranslation() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within LanguageProvider');
    }
    return context;
}
_s1(useTranslation, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "LanguageProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/DropdownPortal.jsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DropdownPortal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dom$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-dom/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
const MARGIN = 8;
function DropdownPortal({ anchorEl, open, onClose, children, offset = 8, preferRight = false }) {
    _s();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [container, setContainer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [style, setStyle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({
        visibility: 'hidden',
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        zIndex: 10050
    });
    const elRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Gestisci il mounting lato client per evitare errori di hydration
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DropdownPortal.useEffect": ()=>{
            setMounted(true);
            if (typeof document !== 'undefined') {
                const portalContainer = document.createElement('div');
                setContainer(portalContainer);
                document.body.appendChild(portalContainer);
                return ({
                    "DropdownPortal.useEffect": ()=>{
                        if (document.body.contains(portalContainer)) {
                            document.body.removeChild(portalContainer);
                        }
                    }
                })["DropdownPortal.useEffect"];
            }
        }
    }["DropdownPortal.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DropdownPortal.useEffect": ()=>{
            if (!mounted || ("TURBOPACK compile-time value", "object") === 'undefined') return;
            if (!open) {
                setStyle({
                    visibility: 'hidden',
                    position: 'fixed',
                    top: '-9999px',
                    left: '-9999px',
                    zIndex: 10050
                });
                return;
            }
            if (!anchorEl) return;
            // Renderizza il dropdown fuori schermo ma visibile per poter essere misurato
            setStyle({
                visibility: 'visible',
                position: 'fixed',
                top: '-9999px',
                left: '-9999px',
                zIndex: 10050
            });
            let active = true;
            let rafId = null;
            let retryCount = 0;
            const MAX_RETRIES = 10;
            const updatePosition = {
                "DropdownPortal.useEffect.updatePosition": ()=>{
                    if (!active || !anchorEl || !elRef.current) return;
                    const anchorRect = anchorEl.getBoundingClientRect();
                    const dropdownRect = elRef.current.getBoundingClientRect();
                    // Se anchorRect ha dimensioni 0, l'elemento anchor non è ancora pronto
                    if ((anchorRect.width === 0 || anchorRect.height === 0) && retryCount < MAX_RETRIES) {
                        retryCount++;
                        rafId = window.requestAnimationFrame(updatePosition);
                        return;
                    }
                    // Se il dropdown non ha ancora dimensioni reali, aspetta un frame (ma con limite)
                    if ((dropdownRect.width === 0 || dropdownRect.height === 0) && retryCount < MAX_RETRIES) {
                        retryCount++;
                        rafId = window.requestAnimationFrame(updatePosition);
                        return;
                    }
                    // Usa le dimensioni reali o fallback
                    const computedWidth = dropdownRect.width || 280;
                    const computedHeight = dropdownRect.height || 100;
                    retryCount = 0; // reset retry count quando abbiamo dimensioni valide
                    const spaceBelow = window.innerHeight - anchorRect.bottom;
                    const spaceAbove = anchorRect.top;
                    // Calcola la posizione verticale
                    let top = anchorRect.bottom + offset;
                    if (spaceBelow < computedHeight && spaceAbove > computedHeight) {
                        top = anchorRect.top - computedHeight - offset;
                    }
                    top = Math.min(Math.max(top, MARGIN), Math.max(window.innerHeight - computedHeight - MARGIN, MARGIN));
                    // Calcola la posizione orizzontale
                    let left;
                    if (preferRight) {
                        // Allinea il bordo destro del dropdown al bordo destro del bottone
                        left = anchorRect.right - computedWidth;
                    } else {
                        // Allinea il bordo sinistro del dropdown al bordo sinistro del bottone
                        left = anchorRect.left;
                    }
                    // Se il dropdown esce dallo schermo a destra, spostalo a sinistra
                    if (left + computedWidth > window.innerWidth - MARGIN) {
                        left = window.innerWidth - computedWidth - MARGIN;
                    }
                    // Se il dropdown esce dallo schermo a sinistra, allinealo al margine sinistro
                    if (left < MARGIN) {
                        left = MARGIN;
                    }
                    setStyle({
                        top: `${top}px`,
                        left: `${left}px`,
                        position: 'fixed',
                        zIndex: 10050,
                        visibility: 'visible'
                    });
                }
            }["DropdownPortal.useEffect.updatePosition"];
            // Aspetta un frame per assicurarsi che il DOM sia pronto
            rafId = window.requestAnimationFrame({
                "DropdownPortal.useEffect": ()=>{
                    rafId = window.requestAnimationFrame(updatePosition);
                }
            }["DropdownPortal.useEffect"]);
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);
            return ({
                "DropdownPortal.useEffect": ()=>{
                    active = false;
                    if (rafId) window.cancelAnimationFrame(rafId);
                    window.removeEventListener('resize', updatePosition);
                    window.removeEventListener('scroll', updatePosition, true);
                }
            })["DropdownPortal.useEffect"];
        }
    }["DropdownPortal.useEffect"], [
        open,
        anchorEl,
        offset,
        preferRight,
        mounted
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DropdownPortal.useEffect": ()=>{
            if (typeof document === 'undefined') return;
            const onDocClick = {
                "DropdownPortal.useEffect.onDocClick": (e)=>{
                    if (!open) return;
                    const target = e.target;
                    // Non chiudere se si clicca sull'elemento anchor
                    if (anchorEl && anchorEl.contains(target)) return;
                    // Se si clicca su un link, non fare nulla (lascia che navighi)
                    if (target.closest('a')) return;
                    // Non chiudere se si clicca all'interno del dropdown
                    if (elRef.current && elRef.current.contains(target)) {
                        return;
                    }
                    // Chiudi solo se si clicca fuori
                    onClose && onClose();
                }
            }["DropdownPortal.useEffect.onDocClick"];
            if (open) {
                document.addEventListener('click', onDocClick);
            }
            return ({
                "DropdownPortal.useEffect": ()=>document.removeEventListener('click', onDocClick)
            })["DropdownPortal.useEffect"];
        }
    }["DropdownPortal.useEffect"], [
        open,
        anchorEl,
        onClose
    ]);
    // Non renderizzare nulla durante SSR o se il container non è ancora montato
    if (!mounted || !container || typeof document === 'undefined') {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dom$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: elRef,
        style: style,
        className: "dropdown-portal",
        children: children
    }, void 0, false, {
        fileName: "[project]/components/DropdownPortal.jsx",
        lineNumber: 182,
        columnNumber: 5
    }, this), container);
}
_s(DropdownPortal, "vivwF1+LuuEYrxZ0JneFvcnnrnw=");
_c = DropdownPortal;
var _c;
__turbopack_context__.k.register(_c, "DropdownPortal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/LanguageSwitcher.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DropdownPortal$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DropdownPortal.jsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
const languages = [
    {
        code: 'en',
        name: 'English',
        flag: '🇬🇧'
    },
    {
        code: 'it',
        name: 'Italiano',
        flag: '🇮🇹'
    },
    {
        code: 'es',
        name: 'Español',
        flag: '🇪🇸'
    },
    {
        code: 'fr',
        name: 'Français',
        flag: '🇫🇷'
    },
    {
        code: 'de',
        name: 'Deutsch',
        flag: '🇩🇪'
    },
    {
        code: 'pt',
        name: 'Português',
        flag: '🇵🇹'
    },
    {
        code: 'ru',
        name: 'Русский',
        flag: '🇷🇺'
    },
    {
        code: 'ja',
        name: '日本語',
        flag: '🇯🇵'
    },
    {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳'
    },
    {
        code: 'ar',
        name: 'العربية',
        flag: '🇸🇦'
    },
    {
        code: 'hi',
        name: 'हिन्दी',
        flag: '🇮🇳'
    },
    {
        code: 'ko',
        name: '한국어',
        flag: '🇰🇷'
    }
];
const LanguageSwitcher = /*#__PURE__*/ _s((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["memo"])(_c = _s(function LanguageSwitcher() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hoveredLang, setHoveredLang] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const buttonRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const currentLang = languages.find((lang)=>lang.code === router.locale) || languages[0];
    const changeLanguage = async (locale)=>{
        setIsOpen(false);
        await router.push(router.pathname, router.asPath, {
            locale,
            scroll: false
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                ref: buttonRef,
                onClick: ()=>setIsOpen((prev)=>!prev),
                style: {
                    ...styles.button,
                    background: isOpen ? 'rgba(102, 126, 234, 0.15)' : 'transparent'
                },
                "aria-label": "Change language",
                "aria-expanded": isOpen,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: styles.flag,
                        children: currentLang.flag
                    }, void 0, false, {
                        fileName: "[project]/components/LanguageSwitcher.js",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        style: styles.chevron,
                        width: "10",
                        height: "10",
                        viewBox: "0 0 12 12",
                        fill: "none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M2.5 4.5L6 8L9.5 4.5",
                            stroke: "currentColor",
                            strokeWidth: "1.5",
                            strokeLinecap: "round",
                            strokeLinejoin: "round"
                        }, void 0, false, {
                            fileName: "[project]/components/LanguageSwitcher.js",
                            lineNumber: 46,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/LanguageSwitcher.js",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/LanguageSwitcher.js",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DropdownPortal$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                anchorEl: buttonRef.current,
                open: isOpen,
                onClose: ()=>setIsOpen(false),
                offset: 6,
                preferRight: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.dropdown,
                    className: "language-dropdown",
                    children: languages.map((lang)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>changeLanguage(lang.code),
                            onMouseEnter: ()=>setHoveredLang(lang.code),
                            onMouseLeave: ()=>setHoveredLang(null),
                            style: {
                                ...styles.option,
                                ...lang.code === router.locale ? styles.optionActive : {},
                                background: hoveredLang === lang.code ? 'rgba(102, 126, 234, 0.2)' : 'transparent'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: styles.optionFlag,
                                    children: lang.flag
                                }, void 0, false, {
                                    fileName: "[project]/components/LanguageSwitcher.js",
                                    lineNumber: 70,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: styles.optionName,
                                    children: lang.name
                                }, void 0, false, {
                                    fileName: "[project]/components/LanguageSwitcher.js",
                                    lineNumber: 71,
                                    columnNumber: 15
                                }, this),
                                lang.code === router.locale && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    style: styles.check,
                                    width: "16",
                                    height: "16",
                                    viewBox: "0 0 16 16",
                                    fill: "none",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M13.5 4.5L6 12L2.5 8.5",
                                        stroke: "#667eea",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/components/LanguageSwitcher.js",
                                        lineNumber: 74,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/LanguageSwitcher.js",
                                    lineNumber: 73,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, lang.code, true, {
                            fileName: "[project]/components/LanguageSwitcher.js",
                            lineNumber: 59,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/components/LanguageSwitcher.js",
                    lineNumber: 57,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/LanguageSwitcher.js",
                lineNumber: 50,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/LanguageSwitcher.js",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}, "LqcTLmA5hzKcv04QwAH4In2OHXw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
})), "LqcTLmA5hzKcv04QwAH4In2OHXw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c1 = LanguageSwitcher;
const styles = {
    container: {
        position: 'relative',
        zIndex: 1000
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        background: 'transparent',
        border: 'none',
        borderRadius: '6px',
        color: '#e2e8f0',
        fontSize: '11px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative'
    },
    flag: {
        fontSize: '16px'
    },
    langCode: {
        fontSize: '11px',
        fontWeight: '700'
    },
    chevron: {
        color: '#94a3b8',
        transition: 'transform 0.2s'
    },
    dropdown: {
        minWidth: '200px',
        maxHeight: '360px',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        padding: '8px',
        animation: 'fadeInUp 0.2s ease-out',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
    },
    option: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '10px 12px',
        background: 'transparent',
        border: 'none',
        borderRadius: '8px',
        color: '#cbd5e1',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.15s',
        textAlign: 'left'
    },
    optionActive: {
        background: 'rgba(102, 126, 234, 0.1)',
        color: '#667eea'
    },
    optionFlag: {
        fontSize: '20px'
    },
    optionName: {
        flex: 1
    },
    check: {
        flexShrink: 0
    }
};
const __TURBOPACK__default__export__ = LanguageSwitcher;
var _c, _c1;
__turbopack_context__.k.register(_c, "LanguageSwitcher$memo");
__turbopack_context__.k.register(_c1, "LanguageSwitcher");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/performance.js [client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
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
    if (("TURBOPACK compile-time value", "object") === 'undefined' || !('IntersectionObserver' in window)) {
        return null;
    }
    const defaultOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.01,
        ...options
    };
    return new IntersectionObserver(callback, defaultOptions);
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
    if (("TURBOPACK compile-time value", "object") === 'undefined' || typeof document === 'undefined') {
        return;
    }
    // Use requestIdleCallback for non-critical image loading
    if ('requestIdleCallback' in window) {
        requestIdleCallback(()=>{
            initLazyImages();
        }, {
            timeout: 2000
        });
    } else {
        setTimeout(initLazyImages, 100);
    }
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Prevent layout shift for images with aspect ratio
    const images = document.querySelectorAll('img:not([style*="aspect-ratio"])');
    images.forEach((img)=>{
        if (!img.complete && img.naturalWidth && img.naturalHeight) {
            // Set aspect ratio to prevent layout shift
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            img.style.aspectRatio = `${aspectRatio}`;
            img.style.width = img.style.width || 'auto';
            img.style.height = img.style.height || 'auto';
        }
        // Add loading="lazy" to images that don't have it
        if (!img.hasAttribute('loading') && !img.closest('[data-above-fold]')) {
            img.loading = 'lazy';
        }
    });
    // Optimize font loading with display swap
    if ('fonts' in document) {
        document.fonts.ready.then(()=>{
            document.documentElement.classList.add('fonts-loaded');
        });
    }
    // Preload critical resources
    preloadCriticalResources();
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if ('requestIdleCallback' in window) {
        return window.requestIdleCallback(callback, options);
    }
    // Fallback
    const timeout = options.timeout || 2000;
    return setTimeout(()=>{
        callback({
            didTimeout: false,
            timeRemaining: ()=>5
        });
    }, timeout);
}
function cancelIdleCallback(id) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(id);
    } else {
        clearTimeout(id);
    }
}
function measurePerformance(name, fn) {
    if (("TURBOPACK compile-time value", "object") === 'undefined' || !('performance' in window)) {
        return fn();
    }
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    if ("TURBOPACK compile-time truthy", 1) {
        console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    }
    return result;
}
function batchDOMUpdates(updates) {
    if (("TURBOPACK compile-time value", "object") === 'undefined' || !('requestAnimationFrame' in window)) {
        updates.forEach((update)=>update());
        return;
    }
    requestAnimationFrame(()=>{
        updates.forEach((update)=>update());
    });
}
function measureWebVitals() {
    if ("TURBOPACK compile-time truthy", 1) {
        return;
    }
    //TURBOPACK unreachable
    ;
}
function optimizeAnimations() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Use CSS will-change for animated elements
    const animatedElements = document.querySelectorAll('[class*="animate-"], [class*="transition"]');
    animatedElements.forEach((el)=>{
        if (el && el.style) {
            el.style.willChange = 'transform, opacity';
            // Remove will-change after animation to free resources
            if (el.addEventListener) {
                el.addEventListener('animationend', ()=>{
                    el.style.willChange = 'auto';
                }, {
                    once: true
                });
            }
        }
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Navbar.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/bs/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/tools.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$conversionRegistry$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/conversionRegistry.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LanguageSwitcher$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LanguageSwitcher.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DropdownPortal$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DropdownPortal.jsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$performance$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/performance.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
const Navbar = ()=>{
    _s();
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dropdownOpen, setDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [scrolled, setScrolled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hoveredItem, setHoveredItem] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mobileMenuOpen, setMobileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mobileSecondaryMenuOpen, setMobileSecondaryMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [expandedCategory, setExpandedCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const navRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // refs for dropdown buttons
    const buttonRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])({});
    const closeTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Safe client-side mobile detection
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            const checkMobile = {
                "Navbar.useEffect.checkMobile": ()=>setIsMobile(window.innerWidth <= 768)
            }["Navbar.useEffect.checkMobile"];
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return ({
                "Navbar.useEffect": ()=>window.removeEventListener('resize', checkMobile)
            })["Navbar.useEffect"];
        }
    }["Navbar.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            if (!isMobile) {
                setMobileMenuOpen(false);
                setMobileSecondaryMenuOpen(false);
                setExpandedCategory(null);
            }
        }
    }["Navbar.useEffect"], [
        isMobile
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            if (("TURBOPACK compile-time value", "object") === 'undefined' || typeof document === 'undefined') return;
            // Throttle scroll handler for better performance
            const handleScroll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$performance$2e$js__$5b$client$5d$__$28$ecmascript$29$__["throttle"])({
                "Navbar.useEffect.handleScroll": ()=>{
                    setScrolled(window.scrollY > 50);
                }
            }["Navbar.useEffect.handleScroll"], 100); // Update at most once per 100ms
            const handleClickOutside = {
                "Navbar.useEffect.handleClickOutside": (event)=>{
                    if (navRef.current && !navRef.current.contains(event.target)) {
                        setDropdownOpen(null);
                        setMobileMenuOpen(false);
                        setMobileSecondaryMenuOpen(false);
                    }
                }
            }["Navbar.useEffect.handleClickOutside"];
            window.addEventListener('scroll', handleScroll, {
                passive: true
            });
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "Navbar.useEffect": ()=>{
                    window.removeEventListener('scroll', handleScroll);
                    document.removeEventListener('mousedown', handleClickOutside);
                    if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                    }
                }
            })["Navbar.useEffect"];
        }
    }["Navbar.useEffect"], []);
    // Memoize categories computation per evitare re-calcolo ad ogni render
    const categories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Navbar.useMemo[categories]": ()=>{
            // Combine AI tools and conversion tools - categorizzazione migliorata
            const conversionToolsByCat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$conversionRegistry$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getToolsByCategory"])();
            // Unisco categorie simili per semplificare la navbar
            const pdfAndDocs = [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2e$js__$5b$client$5d$__$28$ecmascript$29$__["tools"].filter({
                    "Navbar.useMemo[categories]": (t)=>t.category === 'PDF' || t.category === 'Testo'
                }["Navbar.useMemo[categories]"]),
                ...conversionToolsByCat['Document'] || [],
                ...conversionToolsByCat['Presentation'] || [],
                ...conversionToolsByCat['Spreadsheet'] || []
            ];
            const mediaTools = [
                ...conversionToolsByCat['Video'] || [],
                ...conversionToolsByCat['Audio'] || []
            ];
            // Categorizzazione semplificata e intuitiva
            const allCategories = {
                'AI & Immagini': [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2e$js__$5b$client$5d$__$28$ecmascript$29$__["tools"].filter({
                        "Navbar.useMemo[categories]": (t)=>t.category === 'Immagini'
                    }["Navbar.useMemo[categories]"]),
                    ...conversionToolsByCat['Image'] || []
                ],
                'Documenti & PDF': pdfAndDocs,
                'Video & Audio': [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2e$js__$5b$client$5d$__$28$ecmascript$29$__["tools"].filter({
                        "Navbar.useMemo[categories]": (t)=>t.category === 'Video' || t.category === 'Audio'
                    }["Navbar.useMemo[categories]"]),
                    ...mediaTools
                ],
                'Grafica': [
                    ...conversionToolsByCat['Vector'] || [],
                    ...conversionToolsByCat['Font'] || []
                ],
                'Archivi & Ebook': [
                    ...conversionToolsByCat['Archive'] || [],
                    ...conversionToolsByCat['Ebook'] || []
                ]
            };
            // Ordina i tool all'interno di ogni categoria: prima AI/Pro, poi gli altri
            Object.keys(allCategories).forEach({
                "Navbar.useMemo[categories]": (cat)=>{
                    allCategories[cat].sort({
                        "Navbar.useMemo[categories]": (a, b)=>{
                            // Prima i tool AI/Pro
                            const aIsPro = a.pro === true || a.href?.includes('ai') || a.href?.includes('upscaler');
                            const bIsPro = b.pro === true || b.href?.includes('ai') || b.href?.includes('upscaler');
                            if (aIsPro && !bIsPro) return -1;
                            if (!aIsPro && bIsPro) return 1;
                            // Poi ordina alfabeticamente
                            return (a.title || '').localeCompare(b.title || '');
                        }
                    }["Navbar.useMemo[categories]"]);
                }
            }["Navbar.useMemo[categories]"]);
            // Filtra categorie vuote
            return Object.fromEntries(Object.entries(allCategories).filter({
                "Navbar.useMemo[categories]": ([_, tools])=>tools && tools.length > 0
            }["Navbar.useMemo[categories]"]));
        }
    }["Navbar.useMemo[categories]"], []);
    const handleDropdownEnter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Navbar.useCallback[handleDropdownEnter]": (catName)=>{
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
            }
            setDropdownOpen(catName);
        }
    }["Navbar.useCallback[handleDropdownEnter]"], []);
    const handleDropdownLeave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Navbar.useCallback[handleDropdownLeave]": ()=>{
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
            closeTimeoutRef.current = setTimeout({
                "Navbar.useCallback[handleDropdownLeave]": ()=>{
                    setDropdownOpen(null);
                }
            }["Navbar.useCallback[handleDropdownLeave]"], 300); // 0.3 secondi di ritardo prima di chiudere
        }
    }["Navbar.useCallback[handleDropdownLeave]"], []);
    const styles = {
        navbar: {
            position: 'sticky',
            top: 0,
            zIndex: 100000,
            background: scrolled ? 'rgba(10, 14, 26, 0.9)' : 'rgba(10, 14, 26, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: scrolled ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid rgba(102, 126, 234, 0.2)',
            padding: scrolled ? '6px 0' : '10px 0',
            boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(102, 126, 234, 0.1)' : '0 2px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden',
            overflowY: 'visible',
            boxSizing: 'border-box'
        },
        navContent: {
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'visible',
            zIndex: 100000,
            boxSizing: 'border-box'
        },
        navLogo: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: scrolled ? '16px' : '18px',
            fontWeight: '700',
            color: '#e2e8f0',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            flexShrink: 0
        },
        logoText: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            lineHeight: '1.2'
        },
        logoMain: {
            fontSize: scrolled ? '16px' : '18px',
            fontWeight: '700',
            color: '#e2e8f0'
        },
        logoSub: {
            fontSize: scrolled ? '9px' : '10px',
            fontWeight: '600',
            color: '#667eea',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginTop: '-2px'
        },
        navMenu: {
            display: isMobile ? 'none' : 'flex',
            gap: '4px',
            alignItems: 'center',
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap',
            flexShrink: 1,
            overflow: 'visible',
            position: 'relative',
            zIndex: 100001
        },
        homeBtn: {
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: isMobile ? 'none' : 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            color: '#cbd5e1',
            textDecoration: 'none',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background 0.2s'
        },
        dropdown: {
            position: 'relative',
            zIndex: 100002
        },
        dropdownBtn: {
            display: 'flex',
            alignItems: 'center',
            padding: '8px 10px',
            background: 'transparent',
            border: 'none',
            fontSize: '13px',
            fontWeight: '600',
            color: '#cbd5e1',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap'
        },
        dropdownMenu: {
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            background: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.6), 0 0 30px rgba(102, 126, 234, 0.2)',
            padding: '12px',
            minWidth: '280px',
            maxWidth: '320px',
            maxHeight: '500px',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 100003,
            animation: 'fadeInUp 0.3s ease-out',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(102, 126, 234, 0.5) rgba(15, 23, 42, 0.3)',
            isolation: 'isolate'
        },
        dropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 1
        },
        signupBtn: {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 20px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '700',
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: '10px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4), 0 0 15px rgba(102, 126, 234, 0.2)',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: '200% 200%',
            backgroundPosition: '0% 0%',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
            overflow: 'hidden',
            willChange: 'transform, box-shadow'
        },
        hamburgerBtn: {
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '24px',
            marginRight: '8px'
        },
        secondaryMenuBtn: {
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '24px',
            marginRight: '12px'
        },
        mobileMenu: {
            position: 'fixed',
            top: 0,
            right: mobileMenuOpen ? 0 : '-100%',
            bottom: 0,
            width: '80%',
            maxWidth: '320px',
            background: 'rgba(10, 14, 26, 0.98)',
            backdropFilter: 'blur(16px)',
            borderLeft: '1px solid rgba(102, 126, 234, 0.2)',
            overflowY: 'auto',
            padding: '20px',
            zIndex: 1002,
            transition: 'right 0.3s ease',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)',
            display: isMobile ? 'block' : 'none'
        },
        mobileSecondaryMenu: {
            position: 'fixed',
            top: 0,
            right: mobileSecondaryMenuOpen ? 0 : '-100%',
            bottom: 0,
            width: '280px',
            background: 'rgba(10, 14, 26, 0.98)',
            backdropFilter: 'blur(16px)',
            borderLeft: '1px solid rgba(102, 126, 234, 0.2)',
            overflowY: 'auto',
            padding: '20px',
            zIndex: 1002,
            transition: 'right 0.3s ease',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)',
            display: isMobile ? 'block' : 'none'
        },
        mobileOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1001,
            backdropFilter: 'blur(4px)'
        },
        mobileMenuHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
        },
        mobileMenuTitle: {
            fontSize: '20px',
            fontWeight: '700',
            color: '#e2e8f0',
            margin: 0
        },
        closeBtn: {
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px'
        },
        mobileMenuItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            marginBottom: '8px',
            cursor: 'pointer'
        },
        mobileCategoryHeader: {
            padding: '12px 16px',
            color: '#667eea',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginTop: '16px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '8px'
        },
        mobileDropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px 10px 32px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            background: 'rgba(15, 23, 42, 0.7)',
            marginBottom: '4px'
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                id: "3b10be881c6611e8",
                children: ".dropdown-menu-scroll.jsx-3b10be881c6611e8::-webkit-scrollbar{width:8px}.dropdown-menu-scroll.jsx-3b10be881c6611e8::-webkit-scrollbar-track{background:#0f172a4d;border-radius:10px}.dropdown-menu-scroll.jsx-3b10be881c6611e8::-webkit-scrollbar-thumb{background:#667eea80;border-radius:10px;transition:background .2s}.dropdown-menu-scroll.jsx-3b10be881c6611e8.jsx-3b10be881c6611e8::-webkit-scrollbar-thumb:hover{background:#667eeab3}"
            }, void 0, false, void 0, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                style: styles.navbar,
                ref: navRef,
                suppressHydrationWarning: true,
                className: "jsx-3b10be881c6611e8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.navContent,
                        className: "jsx-3b10be881c6611e8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/",
                                style: styles.navLogo,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: scrolled ? "28" : "32",
                                        height: scrolled ? "28" : "32",
                                        viewBox: "0 0 40 40",
                                        fill: "none",
                                        style: {
                                            transition: 'all 0.3s'
                                        },
                                        className: "jsx-3b10be881c6611e8",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                                                className: "jsx-3b10be881c6611e8",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                                        id: "logoGradient",
                                                        x1: "0%",
                                                        y1: "0%",
                                                        x2: "100%",
                                                        y2: "100%",
                                                        className: "jsx-3b10be881c6611e8",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                offset: "0%",
                                                                style: {
                                                                    stopColor: '#667eea',
                                                                    stopOpacity: 1
                                                                },
                                                                className: "jsx-3b10be881c6611e8"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/Navbar.js",
                                                                lineNumber: 481,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                offset: "100%",
                                                                style: {
                                                                    stopColor: '#764ba2',
                                                                    stopOpacity: 1
                                                                },
                                                                className: "jsx-3b10be881c6611e8"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/Navbar.js",
                                                                lineNumber: 482,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 480,
                                                        columnNumber: 29
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("filter", {
                                                        id: "glow",
                                                        className: "jsx-3b10be881c6611e8",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feGaussianBlur", {
                                                                stdDeviation: "2",
                                                                result: "coloredBlur",
                                                                className: "jsx-3b10be881c6611e8"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/Navbar.js",
                                                                lineNumber: 485,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feMerge", {
                                                                className: "jsx-3b10be881c6611e8",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feMergeNode", {
                                                                        in: "coloredBlur",
                                                                        className: "jsx-3b10be881c6611e8"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/Navbar.js",
                                                                        lineNumber: 487,
                                                                        columnNumber: 37
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feMergeNode", {
                                                                        in: "SourceGraphic",
                                                                        className: "jsx-3b10be881c6611e8"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/Navbar.js",
                                                                        lineNumber: 488,
                                                                        columnNumber: 37
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/Navbar.js",
                                                                lineNumber: 486,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 484,
                                                        columnNumber: 29
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 479,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M20 2 L34 10 L34 26 L20 34 L6 26 L6 10 Z",
                                                stroke: "url(#logoGradient)",
                                                strokeWidth: "1.5",
                                                fill: "none",
                                                opacity: "0.6",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 494,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "14",
                                                y: "12",
                                                width: "4",
                                                height: "4",
                                                fill: "url(#logoGradient)",
                                                opacity: "0.9",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 501,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "22",
                                                y: "12",
                                                width: "4",
                                                height: "4",
                                                fill: "url(#logoGradient)",
                                                opacity: "0.7",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 502,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "14",
                                                y: "18",
                                                width: "4",
                                                height: "4",
                                                fill: "url(#logoGradient)",
                                                opacity: "0.8",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 503,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "22",
                                                y: "18",
                                                width: "4",
                                                height: "4",
                                                fill: "url(#logoGradient)",
                                                opacity: "1",
                                                filter: "url(#glow)",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 504,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "14",
                                                y: "24",
                                                width: "4",
                                                height: "4",
                                                fill: "url(#logoGradient)",
                                                opacity: "0.7",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 505,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "22",
                                                y: "24",
                                                width: "4",
                                                height: "4",
                                                fill: "url(#logoGradient)",
                                                opacity: "0.6",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 506,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                cx: "10",
                                                cy: "10",
                                                r: "1.5",
                                                fill: "#667eea",
                                                opacity: "0.8",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 509,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                cx: "30",
                                                cy: "10",
                                                r: "1.5",
                                                fill: "#764ba2",
                                                opacity: "0.8",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 510,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                cx: "10",
                                                cy: "30",
                                                r: "1.5",
                                                fill: "#764ba2",
                                                opacity: "0.8",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 511,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                cx: "30",
                                                cy: "30",
                                                r: "1.5",
                                                fill: "#667eea",
                                                opacity: "0.8",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 512,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                x1: "10",
                                                y1: "10",
                                                x2: "18",
                                                y2: "14",
                                                stroke: "#667eea",
                                                strokeWidth: "0.5",
                                                opacity: "0.4",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 515,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                x1: "30",
                                                y1: "10",
                                                x2: "26",
                                                y2: "14",
                                                stroke: "#764ba2",
                                                strokeWidth: "0.5",
                                                opacity: "0.4",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 516,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                x1: "10",
                                                y1: "30",
                                                x2: "18",
                                                y2: "26",
                                                stroke: "#764ba2",
                                                strokeWidth: "0.5",
                                                opacity: "0.4",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 517,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                x1: "30",
                                                y1: "30",
                                                x2: "26",
                                                y2: "26",
                                                stroke: "#667eea",
                                                strokeWidth: "0.5",
                                                opacity: "0.4",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 518,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 477,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.logoText,
                                        className: "jsx-3b10be881c6611e8",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.logoMain,
                                                className: "jsx-3b10be881c6611e8",
                                                children: "MegaPixelAI"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 521,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.logoSub,
                                                className: "jsx-3b10be881c6611e8",
                                                children: "ToolSuite"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 522,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 520,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 476,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.navMenu,
                                className: "jsx-3b10be881c6611e8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/tools",
                                        style: {
                                            ...styles.dropdownBtn,
                                            background: hoveredItem === 'tools' ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                                            textDecoration: 'none'
                                        },
                                        onMouseEnter: ()=>setHoveredItem('tools'),
                                        onMouseLeave: ()=>setHoveredItem(null),
                                        onClick: (e)=>{
                                            e.stopPropagation();
                                            router.push('/tools');
                                        },
                                        children: "Tutti i Tool"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 527,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    Object.keys(categories).map((catName)=>{
                                        const isOpen = dropdownOpen === catName;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: styles.dropdown,
                                            onMouseEnter: ()=>handleDropdownEnter(catName),
                                            onMouseLeave: handleDropdownLeave,
                                            className: "jsx-3b10be881c6611e8",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    style: {
                                                        ...styles.dropdownBtn,
                                                        background: hoveredItem === `cat-${catName}` || isOpen ? 'rgba(102, 126, 234, 0.15)' : 'transparent'
                                                    },
                                                    ref: (el)=>{
                                                        if (el) buttonRefs.current[catName] = el;
                                                    },
                                                    onClick: ()=>setDropdownOpen(isOpen ? null : catName),
                                                    onMouseEnter: ()=>setHoveredItem(`cat-${catName}`),
                                                    onMouseLeave: ()=>setHoveredItem(null),
                                                    className: "jsx-3b10be881c6611e8",
                                                    children: [
                                                        catName,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsChevronDown"], {
                                                            style: {
                                                                marginLeft: '6px',
                                                                width: '14px',
                                                                height: '14px',
                                                                transition: 'transform 0.3s ease',
                                                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                opacity: 0.8
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/Navbar.js",
                                                            lineNumber: 566,
                                                            columnNumber: 33
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/Navbar.js",
                                                    lineNumber: 553,
                                                    columnNumber: 29
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                isOpen && buttonRefs.current[catName] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DropdownPortal$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                    anchorEl: buttonRefs.current[catName],
                                                    open: isOpen,
                                                    onClose: ()=>setDropdownOpen(null),
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            ...styles.dropdownMenu,
                                                            maxWidth: 'calc(100vw - 32px)'
                                                        },
                                                        onWheel: (e)=>{
                                                            e.stopPropagation();
                                                        },
                                                        className: "jsx-3b10be881c6611e8" + " " + "dropdown-menu-scroll",
                                                        children: [
                                                            categories[catName].slice(0, 20).map((tool, index)=>{
                                                                // Aggiungi separatore visivo dopo i tool AI/Pro se necessario
                                                                const isPro = tool.pro === true || tool.href?.includes('ai') || tool.href?.includes('upscaler');
                                                                const nextTool = categories[catName][index + 1];
                                                                const nextIsPro = nextTool && (nextTool.pro === true || nextTool.href?.includes('ai') || nextTool.href?.includes('upscaler'));
                                                                const showSeparator = isPro && !nextIsPro && index < categories[catName].length - 1 && index < 19;
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                ...styles.dropdownItem,
                                                                                background: hoveredItem === `item-${tool.href}` ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                                                                                cursor: 'pointer'
                                                                            },
                                                                            onClick: (e)=>{
                                                                                // Non fermare la propagazione per permettere la navigazione
                                                                                if (closeTimeoutRef.current) {
                                                                                    clearTimeout(closeTimeoutRef.current);
                                                                                }
                                                                                setDropdownOpen(null);
                                                                                setHoveredItem(null);
                                                                                // Naviga usando router.push
                                                                                if (tool.href) {
                                                                                    router.push(tool.href);
                                                                                }
                                                                            },
                                                                            onMouseDown: (e)=>{
                                                                                // Previeni la chiusura del dropdown quando si clicca
                                                                                e.stopPropagation();
                                                                            },
                                                                            onMouseEnter: ()=>setHoveredItem(`item-${tool.href}`),
                                                                            onMouseLeave: ()=>setHoveredItem(null),
                                                                            className: "jsx-3b10be881c6611e8",
                                                                            children: [
                                                                                tool.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(tool.icon, {
                                                                                    style: {
                                                                                        width: 18,
                                                                                        height: 18,
                                                                                        flexShrink: 0
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/Navbar.js",
                                                                                    lineNumber: 625,
                                                                                    columnNumber: 67
                                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    style: {
                                                                                        flex: 1,
                                                                                        minWidth: 0
                                                                                    },
                                                                                    className: "jsx-3b10be881c6611e8",
                                                                                    children: tool.title
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/Navbar.js",
                                                                                    lineNumber: 626,
                                                                                    columnNumber: 53
                                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                                tool.pro && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    style: {
                                                                                        fontSize: '10px',
                                                                                        padding: '2px 6px',
                                                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                                        borderRadius: '4px',
                                                                                        fontWeight: '600',
                                                                                        color: '#fff',
                                                                                        textTransform: 'uppercase',
                                                                                        letterSpacing: '0.5px'
                                                                                    },
                                                                                    className: "jsx-3b10be881c6611e8",
                                                                                    children: "PRO"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/Navbar.js",
                                                                                    lineNumber: 628,
                                                                                    columnNumber: 57
                                                                                }, ("TURBOPACK compile-time value", void 0))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/Navbar.js",
                                                                            lineNumber: 600,
                                                                            columnNumber: 49
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        showSeparator && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                height: '1px',
                                                                                background: 'rgba(102, 126, 234, 0.2)',
                                                                                margin: '8px 0',
                                                                                marginLeft: '16px',
                                                                                marginRight: '16px'
                                                                            },
                                                                            className: "jsx-3b10be881c6611e8"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/Navbar.js",
                                                                            lineNumber: 643,
                                                                            columnNumber: 53
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, tool.href, true, {
                                                                    fileName: "[project]/components/Navbar.js",
                                                                    lineNumber: 599,
                                                                    columnNumber: 45
                                                                }, ("TURBOPACK compile-time value", void 0));
                                                            }),
                                                            categories[catName].length > 20 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                                href: "/tools",
                                                                style: {
                                                                    ...styles.dropdownItem,
                                                                    background: 'rgba(102, 126, 234, 0.1)',
                                                                    fontWeight: '600',
                                                                    justifyContent: 'center',
                                                                    marginTop: '8px',
                                                                    borderTop: '1px solid rgba(102, 126, 234, 0.2)',
                                                                    paddingTop: '16px'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-3b10be881c6611e8",
                                                                        children: [
                                                                            "Vedi tutti (",
                                                                            categories[catName].length,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/Navbar.js",
                                                                        lineNumber: 667,
                                                                        columnNumber: 45
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsChevronRight"], {
                                                                        style: {
                                                                            marginLeft: '8px',
                                                                            width: '14px',
                                                                            height: '14px'
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/Navbar.js",
                                                                        lineNumber: 668,
                                                                        columnNumber: 45
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/Navbar.js",
                                                                lineNumber: 655,
                                                                columnNumber: 41
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 583,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Navbar.js",
                                                    lineNumber: 578,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, catName, true, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 547,
                                            columnNumber: 25
                                        }, ("TURBOPACK compile-time value", void 0));
                                    }),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/pricing",
                                        style: {
                                            ...styles.dropdownBtn,
                                            background: hoveredItem === 'pricing' ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                                            textDecoration: 'none'
                                        },
                                        onMouseEnter: ()=>setHoveredItem('pricing'),
                                        onMouseLeave: ()=>setHoveredItem(null),
                                        children: t('nav.pricing')
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 678,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/faq",
                                        style: {
                                            ...styles.dropdownBtn,
                                            background: 'transparent',
                                            textDecoration: 'none'
                                        },
                                        children: "FAQ"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 691,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/login",
                                        style: {
                                            ...styles.signupBtn,
                                            backgroundImage: hoveredItem === 'login' ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            textDecoration: 'none'
                                        },
                                        onMouseEnter: ()=>setHoveredItem('login'),
                                        onMouseLeave: ()=>setHoveredItem(null),
                                        children: "Accedi"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 702,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LanguageSwitcher$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 715,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 526,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0)),
                            isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                className: "jsx-3b10be881c6611e8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        style: styles.hamburgerBtn,
                                        onClick: ()=>{
                                            setMobileMenuOpen(!mobileMenuOpen);
                                            setMobileSecondaryMenuOpen(false);
                                        },
                                        "aria-label": "Apri menu",
                                        title: "Apri menu",
                                        className: "jsx-3b10be881c6611e8",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiMenu"], {}, void 0, false, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 730,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 721,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        style: styles.secondaryMenuBtn,
                                        onClick: ()=>{
                                            setMobileSecondaryMenuOpen(!mobileSecondaryMenuOpen);
                                            setMobileMenuOpen(false);
                                        },
                                        "aria-label": "Apri menu secondario",
                                        title: "Apri menu secondario",
                                        className: "jsx-3b10be881c6611e8",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiDotsVertical"], {}, void 0, false, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 742,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 733,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 720,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Navbar.js",
                        lineNumber: 474,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    isMobile && (mobileMenuOpen || mobileSecondaryMenuOpen) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.mobileOverlay,
                        onClick: ()=>{
                            setMobileMenuOpen(false);
                            setMobileSecondaryMenuOpen(false);
                        },
                        className: "jsx-3b10be881c6611e8"
                    }, void 0, false, {
                        fileName: "[project]/components/Navbar.js",
                        lineNumber: 750,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.mobileMenu,
                        className: "jsx-3b10be881c6611e8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.mobileMenuHeader,
                                className: "jsx-3b10be881c6611e8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: styles.mobileMenuTitle,
                                        className: "jsx-3b10be881c6611e8",
                                        children: "Menu"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 763,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        style: styles.closeBtn,
                                        onClick: ()=>setMobileMenuOpen(false),
                                        "aria-label": "Chiudi menu",
                                        title: "Chiudi menu",
                                        className: "jsx-3b10be881c6611e8",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiX"], {}, void 0, false, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 770,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 764,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 762,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/tools",
                                style: styles.mobileMenuItem,
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    setMobileMenuOpen(false);
                                    router.push('/tools');
                                },
                                children: "Tutti i Tool"
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 774,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            Object.keys(categories).map((catName)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-3b10be881c6611e8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: styles.mobileCategoryHeader,
                                            onClick: ()=>setExpandedCategory(expandedCategory === catName ? null : catName),
                                            className: "jsx-3b10be881c6611e8",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-3b10be881c6611e8",
                                                    children: catName
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Navbar.js",
                                                    lineNumber: 792,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsChevronRight"], {
                                                    style: {
                                                        width: 16,
                                                        height: 16,
                                                        transform: expandedCategory === catName ? 'rotate(90deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.3s ease'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Navbar.js",
                                                    lineNumber: 793,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 788,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        expandedCategory === catName && categories[catName].slice(0, 15).map((tool)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: tool.href,
                                                style: styles.mobileDropdownItem,
                                                onClick: ()=>setMobileMenuOpen(false),
                                                children: [
                                                    tool.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(tool.icon, {
                                                        style: {
                                                            width: 18,
                                                            height: 18
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 809,
                                                        columnNumber: 51
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-3b10be881c6611e8",
                                                        children: tool.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 810,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, tool.href, true, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 803,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0))),
                                        expandedCategory === catName && categories[catName].length > 15 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/tools",
                                            style: {
                                                ...styles.mobileDropdownItem,
                                                background: 'rgba(102, 126, 234, 0.1)',
                                                fontWeight: '600',
                                                justifyContent: 'center'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-3b10be881c6611e8",
                                                children: [
                                                    "Vedi tutti (",
                                                    categories[catName].length,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 823,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 814,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, catName, true, {
                                    fileName: "[project]/components/Navbar.js",
                                    lineNumber: 787,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Navbar.js",
                        lineNumber: 761,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.mobileSecondaryMenu,
                        className: "jsx-3b10be881c6611e8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.mobileMenuHeader,
                                className: "jsx-3b10be881c6611e8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: styles.mobileMenuTitle,
                                        className: "jsx-3b10be881c6611e8",
                                        children: "Account"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 835,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        style: styles.closeBtn,
                                        onClick: ()=>setMobileSecondaryMenuOpen(false),
                                        className: "jsx-3b10be881c6611e8",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiX"], {}, void 0, false, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 840,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 836,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 834,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/login",
                                style: {
                                    ...styles.mobileMenuItem,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: '#fff'
                                },
                                onClick: ()=>setMobileSecondaryMenuOpen(false),
                                children: "Accedi"
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 844,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/pricing",
                                style: styles.mobileMenuItem,
                                onClick: ()=>setMobileSecondaryMenuOpen(false),
                                children: t('nav.pricing')
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 856,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/faq",
                                style: styles.mobileMenuItem,
                                onClick: ()=>setMobileSecondaryMenuOpen(false),
                                children: "FAQ"
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 864,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '24px',
                                    paddingTop: '24px',
                                    borderTop: '1px solid rgba(102, 126, 234, 0.2)'
                                },
                                className: "jsx-3b10be881c6611e8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginBottom: '12px',
                                            fontSize: '13px',
                                            color: '#667eea',
                                            fontWeight: '600'
                                        },
                                        className: "jsx-3b10be881c6611e8",
                                        children: "Lingua"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 873,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LanguageSwitcher$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 876,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 872,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Navbar.js",
                        lineNumber: 833,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/Navbar.js",
                lineNumber: 473,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
};
_s(Navbar, "m1fhuvCKzFLSAF/K7SzEgc7f2rA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useTranslation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Navbar;
const __TURBOPACK__default__export__ = /*#__PURE__*/ _c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["memo"])(Navbar);
var _c, _c1;
__turbopack_context__.k.register(_c, "Navbar");
__turbopack_context__.k.register(_c1, "%default%");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/animations.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Sistema centralizzato per le animazioni
 * Gestisce animazioni CSS e wrapper SSR-safe per framer-motion
 * 
 * Questo modulo fornisce:
 * - Wrapper SSR-safe per framer-motion (caricamento solo lato client)
 * - Hook per verificare se siamo lato client
 * - Varianti di animazione predefinite
 * - Utility per gestire prefers-reduced-motion
 */ __turbopack_context__.s([
    "AnimatePresence",
    ()=>AnimatePresence,
    "MotionComponent",
    ()=>MotionComponent,
    "SafeAnimatePresence",
    ()=>SafeAnimatePresence,
    "SafeMotionDiv",
    ()=>SafeMotionDiv,
    "fadeIn",
    ()=>fadeIn,
    "fadeInUp",
    ()=>fadeInUp,
    "getAnimationProps",
    ()=>getAnimationProps,
    "prefersReducedMotion",
    ()=>prefersReducedMotion,
    "scaleIn",
    ()=>scaleIn,
    "slideInRight",
    ()=>slideInRight,
    "useIsClient",
    ()=>useIsClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
;
;
// Static imports per evitare require.resolveWeak() in webpack
// Usiamo useIsClient per gestire SSR
const MotionDiv = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div;
const MotionComponent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"];
const AnimatePresence = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["AnimatePresence"];
const useIsClient = ()=>{
    _s();
    const [isClient, setIsClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useIsClient.useEffect": ()=>{
            setIsClient(true);
        }
    }["useIsClient.useEffect"], []);
    return isClient;
};
_s(useIsClient, "k460N28PNzD7zo1YW47Q9UigQis=");
const SafeMotionDiv = ({ children, ...props })=>{
    _s1();
    const isClient = useIsClient();
    if (!isClient) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ...props,
            children: children
        }, void 0, false, {
            fileName: "[project]/lib/animations.js",
            lineNumber: 41,
            columnNumber: 12
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MotionDiv, {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/animations.js",
        lineNumber: 44,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(SafeMotionDiv, "H3pi2coTfRQNw6hMhGyFFQQqraI=", false, function() {
    return [
        useIsClient
    ];
});
_c = SafeMotionDiv;
const SafeAnimatePresence = ({ children, ...props })=>{
    _s2();
    const isClient = useIsClient();
    if (!isClient) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: children
        }, void 0, false);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AnimatePresence, {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/animations.js",
        lineNumber: 57,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_s2(SafeAnimatePresence, "H3pi2coTfRQNw6hMhGyFFQQqraI=", false, function() {
    return [
        useIsClient
    ];
});
_c1 = SafeAnimatePresence;
;
const fadeInUp = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0
    },
    exit: {
        opacity: 0,
        y: -20
    },
    transition: {
        duration: 0.3,
        ease: 'easeOut'
    }
};
const fadeIn = {
    initial: {
        opacity: 0
    },
    animate: {
        opacity: 1
    },
    exit: {
        opacity: 0
    },
    transition: {
        duration: 0.2
    }
};
const scaleIn = {
    initial: {
        opacity: 0,
        scale: 0.9
    },
    animate: {
        opacity: 1,
        scale: 1
    },
    exit: {
        opacity: 0,
        scale: 0.9
    },
    transition: {
        duration: 0.3,
        ease: 'easeOut'
    }
};
const slideInRight = {
    initial: {
        opacity: 0,
        x: 30
    },
    animate: {
        opacity: 1,
        x: 0
    },
    exit: {
        opacity: 0,
        x: 30
    },
    transition: {
        duration: 0.4,
        ease: [
            0.16,
            1,
            0.3,
            1
        ]
    }
};
const prefersReducedMotion = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
        // Fallback se matchMedia non è supportato
        return false;
    }
};
const getAnimationProps = (defaultProps)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (prefersReducedMotion()) {
        return {
            ...defaultProps,
            transition: {
                duration: 0.01
            }
        };
    }
    return defaultProps;
};
var _c, _c1;
__turbopack_context__.k.register(_c, "SafeMotionDiv");
__turbopack_context__.k.register(_c1, "SafeAnimatePresence");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/fileValidation.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// File validation utilities
__turbopack_context__.s([
    "formatFileSize",
    ()=>formatFileSize,
    "generatePreview",
    ()=>generatePreview,
    "getFileExtension",
    ()=>getFileExtension,
    "getFileIcon",
    ()=>getFileIcon,
    "isValidFileSize",
    ()=>isValidFileSize,
    "isValidFileType",
    ()=>isValidFileType,
    "validateFile",
    ()=>validateFile
]);
const ALLOWED_MIME_TYPES = [
    // Documents
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain',
    'text/csv',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp'
];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
function isValidFileType(mimeType) {
    return ALLOWED_MIME_TYPES.includes(mimeType);
}
function isValidFileSize(size) {
    return size <= MAX_FILE_SIZE;
}
function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}
function getFileIcon(fileType) {
    const icons = {
        pdf: '📄',
        docx: '📝',
        xlsx: '📊',
        xls: '📊',
        csv: '📊',
        txt: '📃',
        png: '🖼️',
        jpg: '🖼️',
        jpeg: '🖼️',
        gif: '🖼️',
        webp: '🖼️'
    };
    return icons[fileType] || '📄';
}
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = [
        'B',
        'KB',
        'MB',
        'GB',
        'TB'
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
function validateFile(file) {
    if (!isValidFileType(file.type)) {
        return {
            valid: false,
            error: `File type ${file.type} is not supported. Please upload PDF, DOCX, XLSX, TXT, or image files.`
        };
    }
    if (!isValidFileSize(file.size)) {
        return {
            valid: false,
            error: `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(MAX_FILE_SIZE)}.`
        };
    }
    return {
        valid: true
    };
}
function generatePreview(file) {
    return new Promise((resolve, reject)=>{
        // For images, generate a data URL preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e)=>{
                resolve({
                    type: 'image',
                    url: e.target.result,
                    name: file.name,
                    size: file.size
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        } else {
            // For non-images, return file info without preview
            resolve({
                type: 'file',
                url: null,
                name: file.name,
                size: file.size,
                icon: getFileIcon(getFileExtension(file.name))
            });
        }
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/EnhancedDropzone.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EnhancedDropzone
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-dropzone/dist/es/index.js [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$fileValidation$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/fileValidation.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Toast.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
function EnhancedDropzone({ onFilesAccepted, category = 'image', multiple = false, maxFiles = 1 }) {
    _s();
    const [previews, setPreviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isDragActive, setIsDragActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const onDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "EnhancedDropzone.useCallback[onDrop]": async (acceptedFiles)=>{
            const files = multiple ? acceptedFiles : [
                acceptedFiles[0]
            ];
            // Validate files
            const validFiles = [];
            const startTime = Date.now();
            for (const file of files){
                const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$fileValidation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["validateFile"])(file, category);
                if (!validation.valid) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])(validation.error, 'error', 5000, {
                        details: `Tipo: ${file.type || 'sconosciuto'} • Dimensione: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$fileValidation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["formatFileSize"])(file.size)}`,
                        technical: `File: ${file.name.substring(0, 30)}${file.name.length > 30 ? '...' : ''}`
                    });
                    continue;
                }
                validFiles.push(file);
            }
            if (validFiles.length === 0) return;
            // Generate previews
            const previewPromises = validFiles.map({
                "EnhancedDropzone.useCallback[onDrop].previewPromises": async (file)=>{
                    const preview = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$fileValidation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["generatePreview"])(file);
                    return {
                        file,
                        preview,
                        name: file.name,
                        size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$fileValidation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["formatFileSize"])(file.size)
                    };
                }
            }["EnhancedDropzone.useCallback[onDrop].previewPromises"]);
            const newPreviews = await Promise.all(previewPromises);
            setPreviews(newPreviews);
            onFilesAccepted(validFiles);
            const totalSize = validFiles.reduce({
                "EnhancedDropzone.useCallback[onDrop].totalSize": (sum, f)=>sum + f.size
            }["EnhancedDropzone.useCallback[onDrop].totalSize"], 0);
            const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])(`${validFiles.length} file caricato${validFiles.length > 1 ? 'i' : ''} con successo`, 'success', 4000, {
                details: `Dimensione totale: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$fileValidation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["formatFileSize"])(totalSize)} • Tempo: ${loadTime}s`,
                technical: validFiles.length === 1 ? `${validFiles[0].name} (${validFiles[0].type})` : `${validFiles.length} file processati`
            });
        }
    }["EnhancedDropzone.useCallback[onDrop]"], [
        category,
        multiple,
        onFilesAccepted
    ]);
    const { getRootProps, getInputProps, isDragActive: dropzoneDragActive } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"])({
        onDrop,
        multiple,
        maxFiles,
        accept: category === 'image' ? {
            'image/*': [
                '.png',
                '.jpg',
                '.jpeg',
                '.webp',
                '.gif'
            ]
        } : undefined
    });
    // Paste support
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EnhancedDropzone.useEffect": ()=>{
            const handlePaste = {
                "EnhancedDropzone.useEffect.handlePaste": async (e)=>{
                    const items = e.clipboardData?.items;
                    if (!items) return;
                    const files = [];
                    for (let item of items){
                        if (item.type.startsWith('image/')) {
                            const file = item.getAsFile();
                            if (file) files.push(file);
                        }
                    }
                    if (files.length > 0) {
                        e.preventDefault();
                        onDrop(files);
                        const file = files[0];
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])('Immagine incollata dal clipboard', 'info', 3000, {
                            details: `Dimensione: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$fileValidation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["formatFileSize"])(file.size)} • Tipo: ${file.type || 'sconosciuto'}`,
                            technical: `Source: Clipboard • Method: Paste Event`
                        });
                    }
                }
            }["EnhancedDropzone.useEffect.handlePaste"];
            window.addEventListener('paste', handlePaste);
            return ({
                "EnhancedDropzone.useEffect": ()=>window.removeEventListener('paste', handlePaste)
            })["EnhancedDropzone.useEffect"];
        }
    }["EnhancedDropzone.useEffect"], [
        onDrop
    ]);
    const removePreview = (index)=>{
        setPreviews((prev)=>prev.filter((_, i)=>i !== index));
    };
    const clearAll = ()=>{
        setPreviews([]);
        onFilesAccepted([]);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ...getRootProps(),
                style: {
                    ...styles.dropzone,
                    borderColor: dropzoneDragActive ? '#667eea' : 'rgba(102, 126, 234, 0.3)',
                    background: dropzoneDragActive ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.05)',
                    transform: dropzoneDragActive ? 'scale(1.02)' : 'scale(1)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ...getInputProps(),
                        "aria-label": "Carica file immagine",
                        id: "file-upload-input"
                    }, void 0, false, {
                        fileName: "[project]/components/EnhancedDropzone.js",
                        lineNumber: 118,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.uploadIcon,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiOutlineUpload"], {
                            style: {
                                width: 48,
                                height: 48
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/EnhancedDropzone.js",
                            lineNumber: 124,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/EnhancedDropzone.js",
                        lineNumber: 123,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        style: styles.dropzoneTitle,
                        children: dropzoneDragActive ? 'Rilascia qui!' : 'Trascina file o clicca'
                    }, void 0, false, {
                        fileName: "[project]/components/EnhancedDropzone.js",
                        lineNumber: 126,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: styles.dropzoneHint,
                        children: [
                            multiple ? `Fino a ${maxFiles} file` : 'Un file alla volta',
                            " • Max 10MB",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/components/EnhancedDropzone.js",
                                lineNumber: 131,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: styles.pasteHint,
                                children: "💡 Puoi anche incollare con Ctrl+V"
                            }, void 0, false, {
                                fileName: "[project]/components/EnhancedDropzone.js",
                                lineNumber: 132,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/EnhancedDropzone.js",
                        lineNumber: 129,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/EnhancedDropzone.js",
                lineNumber: 109,
                columnNumber: 13
            }, this),
            previews.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.previewSection,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.previewHeader,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: styles.previewTitle,
                                children: [
                                    "File caricati (",
                                    previews.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/EnhancedDropzone.js",
                                lineNumber: 139,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: clearAll,
                                style: styles.clearBtn,
                                children: "Rimuovi tutti"
                            }, void 0, false, {
                                fileName: "[project]/components/EnhancedDropzone.js",
                                lineNumber: 140,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/EnhancedDropzone.js",
                        lineNumber: 138,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.previewGrid,
                        children: previews.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.previewCard,
                                children: [
                                    item.preview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: item.preview,
                                        alt: item.name,
                                        style: styles.previewImg
                                    }, void 0, false, {
                                        fileName: "[project]/components/EnhancedDropzone.js",
                                        lineNumber: 148,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.previewInfo,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.previewName,
                                                children: item.name
                                            }, void 0, false, {
                                                fileName: "[project]/components/EnhancedDropzone.js",
                                                lineNumber: 151,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.previewSize,
                                                children: item.size
                                            }, void 0, false, {
                                                fileName: "[project]/components/EnhancedDropzone.js",
                                                lineNumber: 152,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/EnhancedDropzone.js",
                                        lineNumber: 150,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>removePreview(index),
                                        style: styles.removeBtn,
                                        "aria-label": "Rimuovi file",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiX"], {
                                            style: {
                                                width: 16,
                                                height: 16
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/EnhancedDropzone.js",
                                            lineNumber: 159,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/EnhancedDropzone.js",
                                        lineNumber: 154,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, index, true, {
                                fileName: "[project]/components/EnhancedDropzone.js",
                                lineNumber: 146,
                                columnNumber: 29
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/EnhancedDropzone.js",
                        lineNumber: 144,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/EnhancedDropzone.js",
                lineNumber: 137,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/EnhancedDropzone.js",
        lineNumber: 108,
        columnNumber: 9
    }, this);
}
_s(EnhancedDropzone, "kbXfs+xnsFfCnqh7ilwDI5X45kw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"]
    ];
});
_c = EnhancedDropzone;
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%'
    },
    dropzone: {
        border: '3px dashed',
        borderRadius: '16px',
        padding: '48px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
    },
    uploadIcon: {
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(102, 126, 234, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#667eea'
    },
    dropzoneTitle: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '700',
        color: '#e2e8f0'
    },
    dropzoneHint: {
        margin: 0,
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: '1.6'
    },
    pasteHint: {
        fontSize: '13px',
        color: '#667eea',
        fontWeight: '500'
    },
    previewSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    previewHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    previewTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#cbd5e1'
    },
    clearBtn: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '6px',
        padding: '6px 12px',
        color: '#ef4444',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    previewGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px'
    },
    previewCard: {
        position: 'relative',
        background: 'rgba(102, 126, 234, 0.05)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '12px',
        overflow: 'hidden',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column'
    },
    previewImg: {
        width: '100%',
        height: '80px',
        objectFit: 'cover'
    },
    previewInfo: {
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1
    },
    previewName: {
        fontSize: '12px',
        color: '#cbd5e1',
        fontWeight: '500',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    previewSize: {
        fontSize: '11px',
        color: '#94a3b8'
    },
    removeBtn: {
        position: 'absolute',
        top: '6px',
        right: '6px',
        background: 'rgba(0, 0, 0, 0.7)',
        border: 'none',
        borderRadius: '6px',
        padding: '4px',
        color: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
    }
};
var _c;
__turbopack_context__.k.register(_c, "EnhancedDropzone");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ExportModal.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ExportModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
function ExportModal({ imageData, filename, onClose }) {
    _s();
    const [format, setFormat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('png');
    const [quality, setQuality] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(90);
    const [isConverting, setIsConverting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleExport = async ()=>{
        setIsConverting(true);
        try {
            // Convert image to selected format
            const img = new Image();
            img.src = imageData;
            await new Promise((resolve)=>{
                img.onload = resolve;
            });
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            // Convert to blob with quality
            const mimeType = format === 'png' ? 'image/png' : format === 'jpg' ? 'image/jpeg' : 'image/webp';
            canvas.toBlob((blob)=>{
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${filename.replace(/\.[^/.]+$/, '')}.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setIsConverting(false);
                onClose();
            }, mimeType, quality / 100);
        } catch (error) {
            console.error('Export error:', error);
            setIsConverting(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.overlay,
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: styles.modal,
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.header,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: styles.title,
                            children: "Esporta Immagine"
                        }, void 0, false, {
                            fileName: "[project]/components/ExportModal.js",
                            lineNumber: 53,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            style: styles.closeBtn,
                            "aria-label": "Chiudi",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiX"], {
                                style: {
                                    width: 20,
                                    height: 20
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/ExportModal.js",
                                lineNumber: 55,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/ExportModal.js",
                            lineNumber: 54,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ExportModal.js",
                    lineNumber: 52,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.content,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.section,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: styles.label,
                                    children: "Formato"
                                }, void 0, false, {
                                    fileName: "[project]/components/ExportModal.js",
                                    lineNumber: 61,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.formatGrid,
                                    children: [
                                        'png',
                                        'jpg',
                                        'webp'
                                    ].map((fmt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setFormat(fmt),
                                            style: {
                                                ...styles.formatBtn,
                                                background: format === fmt ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.1)',
                                                borderColor: format === fmt ? '#667eea' : 'rgba(102, 126, 234, 0.3)'
                                            },
                                            children: fmt.toUpperCase()
                                        }, fmt, false, {
                                            fileName: "[project]/components/ExportModal.js",
                                            lineNumber: 64,
                                            columnNumber: 33
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/ExportModal.js",
                                    lineNumber: 62,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ExportModal.js",
                            lineNumber: 60,
                            columnNumber: 21
                        }, this),
                        format !== 'png' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.section,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: styles.label,
                                    children: [
                                        "Qualità: ",
                                        quality,
                                        "%"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ExportModal.js",
                                    lineNumber: 81,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "range",
                                    min: "60",
                                    max: "100",
                                    value: quality,
                                    onChange: (e)=>setQuality(parseInt(e.target.value)),
                                    style: styles.slider
                                }, void 0, false, {
                                    fileName: "[project]/components/ExportModal.js",
                                    lineNumber: 84,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.qualityHints,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: styles.hint,
                                            children: "Minore dimensione"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ExportModal.js",
                                            lineNumber: 93,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: styles.hint,
                                            children: "Migliore qualità"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ExportModal.js",
                                            lineNumber: 94,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ExportModal.js",
                                    lineNumber: 92,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ExportModal.js",
                            lineNumber: 80,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.info,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.infoText,
                                children: [
                                    format === 'png' && '• PNG: Qualità massima, supporta trasparenza',
                                    format === 'jpg' && '• JPG: File più piccolo, nessuna trasparenza',
                                    format === 'webp' && '• WebP: Miglior compressione, supporta trasparenza'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ExportModal.js",
                                lineNumber: 100,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/ExportModal.js",
                            lineNumber: 99,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ExportModal.js",
                    lineNumber: 59,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.footer,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            style: styles.cancelBtn,
                            children: "Annulla"
                        }, void 0, false, {
                            fileName: "[project]/components/ExportModal.js",
                            lineNumber: 109,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleExport,
                            style: styles.exportBtn,
                            disabled: isConverting,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiDownload"], {
                                    style: {
                                        width: 18,
                                        height: 18
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/ExportModal.js",
                                    lineNumber: 117,
                                    columnNumber: 25
                                }, this),
                                isConverting ? 'Conversione...' : 'Scarica'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ExportModal.js",
                            lineNumber: 112,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ExportModal.js",
                    lineNumber: 108,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ExportModal.js",
            lineNumber: 51,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ExportModal.js",
        lineNumber: 50,
        columnNumber: 9
    }, this);
}
_s(ExportModal, "VL+PeVlTqUxc4Z4VdLcSrWprirw=");
_c = ExportModal;
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
        zIndex: 9999,
        padding: '20px'
    },
    modal: {
        background: 'rgba(15, 23, 42, 0.98)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '16px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
    },
    title: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '700',
        color: '#e2e8f0'
    },
    closeBtn: {
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
    content: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#cbd5e1'
    },
    formatGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
    },
    formatBtn: {
        padding: '12px',
        border: '2px solid',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#e2e8f0',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    slider: {
        width: '100%',
        height: '6px',
        borderRadius: '3px',
        outline: 'none',
        background: 'rgba(102, 126, 234, 0.2)',
        cursor: 'pointer'
    },
    qualityHints: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '-4px'
    },
    hint: {
        fontSize: '12px',
        color: '#94a3b8'
    },
    info: {
        background: 'rgba(102, 126, 234, 0.1)',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(102, 126, 234, 0.2)'
    },
    infoText: {
        margin: 0,
        fontSize: '13px',
        color: '#cbd5e1',
        lineHeight: '1.5'
    },
    footer: {
        display: 'flex',
        gap: '12px',
        padding: '20px 24px',
        borderTop: '1px solid rgba(102, 126, 234, 0.2)'
    },
    cancelBtn: {
        flex: 1,
        padding: '12px',
        background: 'rgba(102, 126, 234, 0.1)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '8px',
        color: '#cbd5e1',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    exportBtn: {
        flex: 1,
        padding: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '8px',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    }
};
var _c;
__turbopack_context__.k.register(_c, "ExportModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Loading.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LoadingOverlay",
    ()=>LoadingOverlay,
    "LoadingSpinner",
    ()=>LoadingSpinner,
    "ProgressBar",
    ()=>ProgressBar,
    "SkeletonLoader",
    ()=>SkeletonLoader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [client] (ecmascript)");
;
;
function LoadingSpinner({ size = 40, color = '#667eea' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            ...styles.spinner,
            width: size,
            height: size,
            borderTopColor: color
        },
        className: "jsx-83d90179b667a652",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
            id: "83d90179b667a652",
            children: "@keyframes spin{to{transform:rotate(360deg)}}"
        }, void 0, false, void 0, this)
    }, void 0, false, {
        fileName: "[project]/components/Loading.js",
        lineNumber: 3,
        columnNumber: 9
    }, this);
}
_c = LoadingSpinner;
function ProgressBar({ progress, showPercentage = true }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.progressContainer,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.progressTrack,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        ...styles.progressFill,
                        width: `${Math.min(100, Math.max(0, progress))}%`
                    }
                }, void 0, false, {
                    fileName: "[project]/components/Loading.js",
                    lineNumber: 17,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/Loading.js",
                lineNumber: 16,
                columnNumber: 13
            }, this),
            showPercentage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: styles.progressText,
                children: [
                    Math.round(progress),
                    "%"
                ]
            }, void 0, true, {
                fileName: "[project]/components/Loading.js",
                lineNumber: 25,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Loading.js",
        lineNumber: 15,
        columnNumber: 9
    }, this);
}
_c1 = ProgressBar;
function SkeletonLoader({ width = '100%', height = 20, borderRadius = 8 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            ...styles.skeleton,
            width,
            height,
            borderRadius
        },
        className: "jsx-3ac319cbd2f80c81",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
            id: "3ac319cbd2f80c81",
            children: "@keyframes shimmer{0%{background-position:-1000px 0}to{background-position:1000px 0}}"
        }, void 0, false, void 0, this)
    }, void 0, false, {
        fileName: "[project]/components/Loading.js",
        lineNumber: 35,
        columnNumber: 9
    }, this);
}
_c2 = SkeletonLoader;
function LoadingOverlay({ message = 'Elaborazione in corso...' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.overlay,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: styles.overlayContent,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingSpinner, {
                    size: 50,
                    color: "#667eea"
                }, void 0, false, {
                    fileName: "[project]/components/Loading.js",
                    lineNumber: 55,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: styles.overlayText,
                    children: message
                }, void 0, false, {
                    fileName: "[project]/components/Loading.js",
                    lineNumber: 56,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/Loading.js",
            lineNumber: 54,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/Loading.js",
        lineNumber: 53,
        columnNumber: 9
    }, this);
}
_c3 = LoadingOverlay;
const styles = {
    spinner: {
        border: '4px solid rgba(102, 126, 234, 0.2)',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%'
    },
    progressTrack: {
        flex: 1,
        height: '8px',
        background: 'rgba(102, 126, 234, 0.15)',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '4px',
        transition: 'width 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
    },
    progressText: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#cbd5e1',
        minWidth: '45px',
        textAlign: 'right'
    },
    skeleton: {
        background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.2) 50%, rgba(102, 126, 234, 0.1) 100%)',
        backgroundSize: '1000px 100%',
        animation: 'shimmer 2s infinite linear'
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 14, 26, 0.9)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998
    },
    overlayContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
    },
    overlayText: {
        color: '#e2e8f0',
        fontSize: '16px',
        fontWeight: '500',
        margin: 0
    }
};
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "LoadingSpinner");
__turbopack_context__.k.register(_c1, "ProgressBar");
__turbopack_context__.k.register(_c2, "SkeletonLoader");
__turbopack_context__.k.register(_c3, "LoadingOverlay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/history.js [client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/tools/BackgroundRemover.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$animations$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/animations.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EnhancedDropzone$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/EnhancedDropzone.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExportModal$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ExportModal.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Loading$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Loading.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Toast.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$history$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/history.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
const PRESETS = {
    portrait: {
        type: 'person',
        quality: 90,
        crop: true,
        cropMargin: 5,
        name: 'Ritratto'
    },
    product: {
        type: 'product',
        quality: 85,
        crop: true,
        cropMargin: 10,
        name: 'Prodotto'
    },
    car: {
        type: 'car',
        quality: 85,
        crop: true,
        cropMargin: 8,
        name: 'Auto'
    },
    document: {
        type: 'auto',
        quality: 70,
        crop: false,
        cropMargin: 0,
        name: 'Documento'
    }
};
const BackgroundRemover = ()=>{
    _s();
    const [files, setFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [processedImage, setProcessedImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [subjectType, setSubjectType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('auto');
    const [quality, setQuality] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(90);
    const [crop, setCrop] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [cropMargin, setCropMargin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(8);
    const [bgPreview, setBgPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('checker');
    const [autoProcess, setAutoProcess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false); // Disabilitato di default - l'utente deve cliccare manualmente
    const [compare, setCompare] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(50);
    const [showExportModal, setShowExportModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const progressIntervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const toastIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const onFilesAccepted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "BackgroundRemover.useCallback[onFilesAccepted]": (acceptedFiles)=>{
            setProcessedImage(null);
            setError(null);
            setFiles(acceptedFiles);
        }
    }["BackgroundRemover.useCallback[onFilesAccepted]"], []);
    const mappedSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BackgroundRemover.useMemo[mappedSize]": ()=>{
            if (quality >= 85) return 'full';
            if (quality >= 60) return 'medium';
            if (quality >= 35) return 'regular';
            if (quality >= 15) return 'small';
            return 'preview';
        }
    }["BackgroundRemover.useMemo[mappedSize]"], [
        quality
    ]);
    const handleProcessImage = async ()=>{
        if (files.length === 0) {
            // Usa setTimeout per evitare chiamate durante il render
            setTimeout(()=>{
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])('Carica prima un\'immagine', 'error', 4000, {
                    details: 'Nessun file selezionato per l\'elaborazione',
                    technical: 'Status: No file provided'
                });
            }, 0);
            return;
        }
        setIsLoading(true);
        setError(null);
        setProcessedImage(null);
        setProgress(0);
        const startTime = Date.now();
        const file = files[0];
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        // Usa setTimeout per evitare chiamate durante il render
        let toastId;
        await new Promise((resolve)=>{
            setTimeout(()=>{
                toastId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])('Elaborazione in corso...', 'progress', 0, {
                    progress: 0,
                    details: `File: ${file.name.substring(0, 25)}${file.name.length > 25 ? '...' : ''} • ${fileSize} MB`,
                    technical: `Type: ${subjectType} • Size: ${mappedSize} • Crop: ${crop ? 'Yes' : 'No'}`
                });
                resolve();
            }, 0);
        });
        // Verifica che il file sia valido prima di inviare
        if (!file || !file.size || file.size === 0) {
            setError('Il file selezionato non è valido o è vuoto.');
            setIsLoading(false);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["updateToast"])(toastId, {
                type: 'error',
                message: 'File non valido',
                details: 'Il file selezionato è vuoto o corrotto.'
            });
            return;
        }
        console.log('Sending file to API:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', subjectType);
        formData.append('size', mappedSize);
        formData.append('crop', crop ? 'true' : 'false');
        if (crop) formData.append('crop_margin', `${cropMargin}%`);
        // Verifica che il file sia nel FormData
        console.log('FormData entries:', Array.from(formData.entries()).map(([key, value])=>[
                key,
                value instanceof File ? {
                    name: value.name,
                    size: value.size,
                    type: value.type
                } : value
            ]));
        // Salva il toastId in un ref per usarlo nel progress interval
        toastIdRef.current = toastId;
        // Simulate progress - usa setTimeout per evitare chiamate durante il render
        progressIntervalRef.current = setInterval(()=>{
            setProgress((prev)=>{
                const newProgress = Math.min(prev + 10, 90);
                // Usa setTimeout per evitare chiamate durante il render
                setTimeout(()=>{
                    if (toastIdRef.current) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["updateToast"])(toastIdRef.current, {
                            progress: newProgress
                        });
                    }
                }, 0);
                return newProgress;
            });
        }, 200);
        try {
            console.log('Sending request to /api/tools/remove-background...');
            const response = await fetch('/api/tools/remove-background', {
                method: 'POST',
                body: formData
            });
            console.log('Response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
            setProgress(95);
            setTimeout(()=>{
                if (toastIdRef.current) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["updateToast"])(toastIdRef.current, {
                        progress: 95,
                        message: 'Finalizzazione...'
                    });
                }
            }, 0);
            if (!response.ok) {
                console.error('Response not OK:', response.status, response.statusText);
                // Prova a leggere come JSON, altrimenti come testo
                let errorMessage = 'Qualcosa è andato storto';
                let errorDetails = '';
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                        errorDetails = errorData.debug ? JSON.stringify(errorData.debug, null, 2) : '';
                        console.error('Error details from server:', errorData);
                    } else {
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                        console.error('Error text from server:', errorText);
                    }
                } catch (e) {
                    console.error('Error reading response:', e);
                    errorMessage = `Errore HTTP ${response.status}: ${response.statusText}`;
                }
                console.error('Full error:', {
                    status: response.status,
                    message: errorMessage,
                    details: errorDetails
                });
                throw new Error(errorMessage);
            }
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setProcessedImage(imageUrl);
            setProgress(100);
            const processTime = ((Date.now() - startTime) / 1000).toFixed(2);
            const outputSize = (blob.size / 1024 / 1024).toFixed(2);
            // Save to history - converti il blob in data URL per renderlo persistente
            if (("TURBOPACK compile-time value", "object") !== 'undefined' && typeof document !== 'undefined') {
                const reader = new FileReader();
                reader.onload = ()=>{
                    const resultDataUrl = reader.result; // Data URL del risultato completo
                    // Crea un thumbnail più piccolo per la history (max 200x200)
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const img = new Image();
                        img.onload = ()=>{
                            const maxSize = 200;
                            let thumbWidth = img.width;
                            let thumbHeight = img.height;
                            if (thumbWidth > maxSize || thumbHeight > maxSize) {
                                const ratio = Math.min(maxSize / thumbWidth, maxSize / thumbHeight);
                                thumbWidth = Math.round(thumbWidth * ratio);
                                thumbHeight = Math.round(thumbHeight * ratio);
                            }
                            canvas.width = thumbWidth;
                            canvas.height = thumbHeight;
                            ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
                            const thumbnail = canvas.toDataURL('image/png', 0.7);
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$history$2e$js__$5b$client$5d$__$28$ecmascript$29$__["saveToHistory"])({
                                tool: 'Rimozione Sfondo AI',
                                filename: file.name,
                                thumbnail: thumbnail,
                                params: {
                                    subjectType,
                                    quality: mappedSize,
                                    crop,
                                    cropMargin
                                },
                                result: resultDataUrl // Data URL persistente invece di blob URL
                            });
                        };
                        img.onerror = ()=>{
                            // Fallback: usa il data URL completo come thumbnail
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$history$2e$js__$5b$client$5d$__$28$ecmascript$29$__["saveToHistory"])({
                                tool: 'Rimozione Sfondo AI',
                                filename: file.name,
                                thumbnail: resultDataUrl,
                                params: {
                                    subjectType,
                                    quality: mappedSize,
                                    crop,
                                    cropMargin
                                },
                                result: resultDataUrl
                            });
                        };
                        img.src = resultDataUrl;
                    } catch (canvasError) {
                        console.warn('Canvas not available, using full data URL:', canvasError);
                        // Fallback: usa il data URL completo
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$history$2e$js__$5b$client$5d$__$28$ecmascript$29$__["saveToHistory"])({
                            tool: 'Rimozione Sfondo AI',
                            filename: file.name,
                            thumbnail: resultDataUrl,
                            params: {
                                subjectType,
                                quality: mappedSize,
                                crop,
                                cropMargin
                            },
                            result: resultDataUrl
                        });
                    }
                };
                reader.onerror = (err)=>{
                    console.error('Failed to read blob for history:', err);
                    // Fallback: salva comunque con il blob URL
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$history$2e$js__$5b$client$5d$__$28$ecmascript$29$__["saveToHistory"])({
                        tool: 'Rimozione Sfondo AI',
                        filename: file.name,
                        thumbnail: null,
                        params: {
                            subjectType,
                            quality: mappedSize,
                            crop,
                            cropMargin
                        },
                        result: imageUrl
                    });
                };
                reader.readAsDataURL(blob);
            } else {
                // Fallback se non siamo in browser
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$history$2e$js__$5b$client$5d$__$28$ecmascript$29$__["saveToHistory"])({
                    tool: 'Rimozione Sfondo AI',
                    filename: file.name,
                    thumbnail: null,
                    params: {
                        subjectType,
                        quality: mappedSize,
                        crop,
                        cropMargin
                    },
                    result: imageUrl
                });
            }
            setTimeout(()=>{
                if (toastIdRef.current) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["updateToast"])(toastIdRef.current, {
                        type: 'success',
                        message: 'Sfondo rimosso con successo!',
                        progress: 100,
                        details: `Tempo elaborazione: ${processTime}s • Output: ${outputSize} MB`,
                        technical: `Algorithm: AI Background Removal • Quality: ${mappedSize} • Compression: ${((1 - blob.size / file.size) * 100).toFixed(1)}%`
                    });
                }
            }, 0);
        } catch (err) {
            setError(err.message);
            setTimeout(()=>{
                if (toastIdRef.current) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["updateToast"])(toastIdRef.current, {
                        type: 'error',
                        message: err.message,
                        details: 'Errore durante l\'elaborazione dell\'immagine',
                        technical: `Error: ${err.message} • File: ${file.name}`
                    });
                }
            }, 0);
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        } finally{
            setIsLoading(false);
            toastIdRef.current = null;
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
            setTimeout(()=>setProgress(0), 1000);
        }
    };
    const applyPreset = (presetKey)=>{
        const preset = PRESETS[presetKey];
        setSubjectType(preset.type);
        setQuality(preset.quality);
        setCrop(preset.crop);
        setCropMargin(preset.cropMargin);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])(`Preset "${preset.name}" applicato`, 'info', 3000, {
            details: `Tipo: ${preset.type} • Qualità: ${preset.quality}% • Ritaglio: ${preset.crop ? 'Sì' : 'No'}`,
            technical: `Preset: ${presetKey} • Crop Margin: ${preset.cropMargin}%`
        });
    };
    const handleRemoveFile = ()=>{
        setFiles([]);
        setProcessedImage(null);
        setError(null);
        setProgress(0);
    };
    // Auto-process when file or main controls change (solo se autoProcess è abilitato)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BackgroundRemover.useEffect": ()=>{
            if (autoProcess && files.length > 0 && !isLoading) {
                const file = files[0];
                // Verifica che il file sia valido e pronto
                if (!file || !file.size || file.size === 0) {
                    console.warn('File not ready for processing:', file);
                    return;
                }
                // Usa setTimeout per evitare chiamate durante il render e dare tempo al file di essere completamente caricato
                const id = setTimeout({
                    "BackgroundRemover.useEffect.id": ()=>{
                        // Verifica di nuovo prima di processare
                        if (files.length > 0 && files[0] && files[0].size > 0 && !isLoading) {
                            handleProcessImage();
                        }
                    }
                }["BackgroundRemover.useEffect.id"], 1000); // Aumentato a 1 secondo per dare più tempo al file di essere completamente caricato
                return ({
                    "BackgroundRemover.useEffect": ()=>clearTimeout(id)
                })["BackgroundRemover.useEffect"];
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["BackgroundRemover.useEffect"], [
        files,
        subjectType,
        quality,
        crop,
        cropMargin,
        autoProcess
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Loading$2e$js__$5b$client$5d$__$28$ecmascript$29$__["LoadingOverlay"], {
                message: `Rimozione sfondo in corso... ${progress}%`
            }, void 0, false, {
                fileName: "[project]/components/tools/BackgroundRemover.js",
                lineNumber: 352,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EnhancedDropzone$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                onFilesAccepted: onFilesAccepted,
                category: "image",
                multiple: false,
                maxFiles: 1
            }, void 0, false, {
                fileName: "[project]/components/tools/BackgroundRemover.js",
                lineNumber: 355,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.presetsRow,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.controlBox,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "subject-type-select",
                                style: styles.label,
                                children: "Tipo soggetto"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                lineNumber: 364,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "subject-type-select",
                                value: subjectType,
                                onChange: (e)=>setSubjectType(e.target.value),
                                style: styles.select,
                                "aria-label": "Seleziona il tipo di soggetto dell'immagine",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "auto",
                                        children: "Auto"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 372,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "person",
                                        children: "Persona"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 373,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "product",
                                        children: "Prodotto"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 374,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "car",
                                        children: "Auto"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 375,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "animal",
                                        children: "Animale"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 376,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                lineNumber: 365,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/BackgroundRemover.js",
                        lineNumber: 363,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.controlBox,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.flexBetween,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "quality-range",
                                        style: styles.label,
                                        children: "Qualità/Dettagli"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 381,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.badge,
                                        children: mappedSize
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 382,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                lineNumber: 380,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "quality-range",
                                type: "range",
                                min: "0",
                                max: "100",
                                value: quality,
                                onChange: (e)=>setQuality(parseInt(e.target.value, 10)),
                                style: styles.slider,
                                "aria-label": `Qualità immagine: ${quality}%`,
                                "aria-valuemin": 0,
                                "aria-valuemax": 100,
                                "aria-valuenow": quality
                            }, void 0, false, {
                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                lineNumber: 384,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/BackgroundRemover.js",
                        lineNumber: 379,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.controlBox,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: styles.label,
                                children: "Ritaglio intelligente"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                lineNumber: 399,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.checkboxRow,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: "crop",
                                        type: "checkbox",
                                        checked: crop,
                                        onChange: (e)=>setCrop(e.target.checked)
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 401,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "crop",
                                        style: styles.checkLabel,
                                        children: "Crop intorno al soggetto"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 402,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                lineNumber: 400,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    ...styles.marginControl,
                                    opacity: crop ? 1 : 0.5,
                                    pointerEvents: crop ? 'auto' : 'none'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.flexBetween,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                htmlFor: "crop-margin-range",
                                                style: styles.label,
                                                children: "Margine"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                                lineNumber: 406,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.badgeSmall,
                                                children: [
                                                    cropMargin,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                                lineNumber: 407,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 405,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: "crop-margin-range",
                                        type: "range",
                                        min: "0",
                                        max: "30",
                                        value: cropMargin,
                                        onChange: (e)=>setCropMargin(parseInt(e.target.value, 10)),
                                        style: styles.slider,
                                        "aria-label": `Margine ritaglio: ${cropMargin}%`,
                                        "aria-valuemin": 0,
                                        "aria-valuemax": 30,
                                        "aria-valuenow": cropMargin,
                                        disabled: !crop
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 409,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                lineNumber: 404,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/BackgroundRemover.js",
                        lineNumber: 398,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.controlBox,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: styles.label,
                                children: "Anteprima sfondo"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                lineNumber: 426,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.bgGrid,
                                children: [
                                    'checker',
                                    'transparent',
                                    'white',
                                    'black'
                                ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setBgPreview(opt),
                                        style: {
                                            ...styles.bgBtn,
                                            ...bgPreview === opt ? styles.bgBtnActive : {},
                                            ...opt === 'checker' ? styles.bgChecker : opt === 'white' ? styles.bgWhite : opt === 'black' ? styles.bgBlack : styles.bgTransparent
                                        },
                                        "aria-label": `Anteprima sfondo: ${opt === 'checker' ? 'Scacchiera' : opt === 'transparent' ? 'Trasparente' : opt === 'white' ? 'Bianco' : 'Nero'}`,
                                        title: opt === 'checker' ? 'Scacchiera' : opt === 'transparent' ? 'Trasparente' : opt === 'white' ? 'Bianco' : 'Nero',
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                position: 'absolute',
                                                width: '1px',
                                                height: '1px',
                                                padding: 0,
                                                margin: '-1px',
                                                overflow: 'hidden',
                                                clip: 'rect(0,0,0,0)',
                                                whiteSpace: 'nowrap',
                                                border: 0
                                            },
                                            children: opt === 'checker' ? 'Scacchiera' : opt === 'transparent' ? 'Trasparente' : opt === 'white' ? 'Bianco' : 'Nero'
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/BackgroundRemover.js",
                                            lineNumber: 436,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, opt, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 429,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                lineNumber: 427,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.checkboxRow,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: "auto",
                                        type: "checkbox",
                                        checked: autoProcess,
                                        onChange: (e)=>setAutoProcess(e.target.checked)
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 443,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "auto",
                                        style: styles.checkLabel,
                                        children: "Elabora automaticamente"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 444,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                lineNumber: 442,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/BackgroundRemover.js",
                        lineNumber: 425,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/BackgroundRemover.js",
                lineNumber: 362,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$animations$2e$js__$5b$client$5d$__$28$ecmascript$29$__["SafeAnimatePresence"], {
                children: files.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$animations$2e$js__$5b$client$5d$__$28$ecmascript$29$__["SafeMotionDiv"], {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$animations$2e$js__$5b$client$5d$__$28$ecmascript$29$__["fadeInUp"],
                    style: styles.filePreview,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.fileRow,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.fileInfo,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: files[0].preview,
                                            alt: "Anteprima",
                                            style: styles.fileThumb
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/BackgroundRemover.js",
                                            lineNumber: 457,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    style: styles.fileName,
                                                    children: files[0].name
                                                }, void 0, false, {
                                                    fileName: "[project]/components/tools/BackgroundRemover.js",
                                                    lineNumber: 459,
                                                    columnNumber: 37
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    style: styles.fileSize,
                                                    children: [
                                                        (files[0].size / 1024).toFixed(2),
                                                        " KB"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/tools/BackgroundRemover.js",
                                                    lineNumber: 460,
                                                    columnNumber: 37
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/tools/BackgroundRemover.js",
                                            lineNumber: 458,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/tools/BackgroundRemover.js",
                                    lineNumber: 456,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleRemoveFile,
                                    style: styles.removeBtn,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiX"], {
                                        style: styles.removeIcon
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                        lineNumber: 464,
                                        columnNumber: 33
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/BackgroundRemover.js",
                                    lineNumber: 463,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/BackgroundRemover.js",
                            lineNumber: 455,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.actionGrid,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleProcessImage,
                                    disabled: isLoading,
                                    style: {
                                        ...styles.processBtn,
                                        ...isLoading ? styles.processBtnDisabled : {}
                                    },
                                    children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                style: styles.spinner,
                                                xmlns: "http://www.w3.org/2000/svg",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                        style: styles.spinnerCircle,
                                                        cx: "12",
                                                        cy: "12",
                                                        r: "10",
                                                        stroke: "currentColor",
                                                        strokeWidth: "4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                                        lineNumber: 476,
                                                        columnNumber: 45
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        style: styles.spinnerPath,
                                                        fill: "currentColor",
                                                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/tools/BackgroundRemover.js",
                                                        lineNumber: 477,
                                                        columnNumber: 45
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                                lineNumber: 475,
                                                columnNumber: 41
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Elaborazione in corso..."
                                        ]
                                    }, void 0, true) : 'Rimuovi Sfondo'
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/BackgroundRemover.js",
                                    lineNumber: 468,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: processedImage || '#',
                                    onClick: (e)=>{
                                        if (!processedImage) e.preventDefault();
                                    },
                                    download: processedImage ? `sfondo-rimosso-${files[0].name}` : undefined,
                                    style: processedImage ? styles.downloadBtn : styles.downloadBtnDisabled,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiDownload"], {
                                            style: styles.downloadIcon
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/BackgroundRemover.js",
                                            lineNumber: 489,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        "Scarica PNG"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/tools/BackgroundRemover.js",
                                    lineNumber: 483,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/BackgroundRemover.js",
                            lineNumber: 467,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/BackgroundRemover.js",
                    lineNumber: 451,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/tools/BackgroundRemover.js",
                lineNumber: 449,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$animations$2e$js__$5b$client$5d$__$28$ecmascript$29$__["SafeMotionDiv"], {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$animations$2e$js__$5b$client$5d$__$28$ecmascript$29$__["scaleIn"],
                style: styles.errorBox,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: "Errore:"
                        }, void 0, false, {
                            fileName: "[project]/components/tools/BackgroundRemover.js",
                            lineNumber: 502,
                            columnNumber: 24
                        }, ("TURBOPACK compile-time value", void 0)),
                        " ",
                        error
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/BackgroundRemover.js",
                    lineNumber: 502,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/tools/BackgroundRemover.js",
                lineNumber: 498,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$animations$2e$js__$5b$client$5d$__$28$ecmascript$29$__["SafeAnimatePresence"], {
                children: processedImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$animations$2e$js__$5b$client$5d$__$28$ecmascript$29$__["SafeMotionDiv"], {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$animations$2e$js__$5b$client$5d$__$28$ecmascript$29$__["scaleIn"],
                    style: styles.compareSection,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: styles.compareTitle,
                            children: "Confronto Prima/Dopo"
                        }, void 0, false, {
                            fileName: "[project]/components/tools/BackgroundRemover.js",
                            lineNumber: 512,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                ...styles.compareBox,
                                background: bgPreview === 'white' ? '#fff' : bgPreview === 'black' ? '#000' : 'transparent'
                            },
                            children: [
                                bgPreview === 'checker' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.checkerBg
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/BackgroundRemover.js",
                                    lineNumber: 515,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.imageContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: files[0]?.preview,
                                            alt: "Prima",
                                            style: styles.beforeImg
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/BackgroundRemover.js",
                                            lineNumber: 518,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: processedImage,
                                            alt: "Dopo",
                                            style: {
                                                ...styles.afterImg,
                                                clipPath: `polygon(0 0, ${compare}% 0, ${compare}% 100%, 0 100%)`
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/BackgroundRemover.js",
                                            lineNumber: 519,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                ...styles.divider,
                                                left: `calc(${compare}% - 1px)`
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: styles.dividerLine
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/BackgroundRemover.js",
                                                lineNumber: 521,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/BackgroundRemover.js",
                                            lineNumber: 520,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/tools/BackgroundRemover.js",
                                    lineNumber: 517,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/BackgroundRemover.js",
                            lineNumber: 513,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.sliderRow,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: styles.sliderLabel,
                                    children: "Prima"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/BackgroundRemover.js",
                                    lineNumber: 526,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "range",
                                    min: "0",
                                    max: "100",
                                    value: compare,
                                    onChange: (e)=>setCompare(parseInt(e.target.value, 10)),
                                    style: styles.compareSlider,
                                    "aria-label": `Confronto prima/dopo: ${compare}%`,
                                    "aria-valuemin": 0,
                                    "aria-valuemax": 100,
                                    "aria-valuenow": compare
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/BackgroundRemover.js",
                                    lineNumber: 527,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: styles.sliderLabel,
                                    children: "Dopo"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/BackgroundRemover.js",
                                    lineNumber: 539,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/BackgroundRemover.js",
                            lineNumber: 525,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/BackgroundRemover.js",
                    lineNumber: 508,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/tools/BackgroundRemover.js",
                lineNumber: 506,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/tools/BackgroundRemover.js",
        lineNumber: 350,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(BackgroundRemover, "deOUwI6WW0eR/am/uladbdnu4H8=");
_c = BackgroundRemover;
const __TURBOPACK__default__export__ = BackgroundRemover;
const styles = {
    container: {
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '24px',
        background: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px'
    },
    dropzone: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '240px',
        padding: '24px',
        border: '2px dashed rgba(148, 163, 184, 0.4)',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    dropzoneActive: {
        borderColor: '#a78bfa',
        background: 'rgba(167, 139, 250, 0.1)'
    },
    uploadIcon: {
        width: '48px',
        height: '48px',
        color: '#94a3b8',
        marginBottom: '16px'
    },
    dropText: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#e2e8f0',
        marginBottom: '8px'
    },
    dropTextActive: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#a78bfa'
    },
    dropHint: {
        fontSize: '14px',
        color: '#94a3b8'
    },
    controlsGrid: {
        marginTop: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
    },
    controlBox: {
        padding: '16px',
        background: 'rgba(51, 65, 85, 0.6)',
        borderRadius: '8px',
        border: '1px solid rgba(148, 163, 184, 0.2)'
    },
    label: {
        display: 'block',
        fontSize: '14px',
        color: '#cbd5e1',
        marginBottom: '8px'
    },
    select: {
        width: '100%',
        background: 'rgba(15, 23, 42, 0.8)',
        color: '#e2e8f0',
        borderRadius: '6px',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        padding: '8px 12px',
        fontSize: '14px'
    },
    flexBetween: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
    },
    badge: {
        fontSize: '11px',
        color: '#94a3b8',
        textTransform: 'uppercase',
        fontWeight: 700
    },
    badgeSmall: {
        fontSize: '11px',
        color: '#94a3b8'
    },
    slider: {
        width: '100%',
        cursor: 'pointer'
    },
    checkboxRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '8px'
    },
    checkLabel: {
        fontSize: '14px',
        color: '#e2e8f0'
    },
    marginControl: {
        marginTop: '12px'
    },
    bgGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '12px'
    },
    bgBtn: {
        height: '40px',
        borderRadius: '6px',
        border: '2px solid rgba(148, 163, 184, 0.3)',
        cursor: 'pointer',
        transition: 'border-color 0.2s'
    },
    bgBtnActive: {
        borderColor: '#a78bfa'
    },
    bgChecker: {
        backgroundImage: 'linear-gradient(45deg, #4a5568 25%, transparent 25%), linear-gradient(-45deg, #4a5568 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4a5568 75%), linear-gradient(-45deg, transparent 75%, #4a5568 75%)',
        backgroundSize: '14px 14px',
        backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0px'
    },
    bgWhite: {
        background: '#fff'
    },
    bgBlack: {
        background: '#000'
    },
    bgTransparent: {
        background: 'transparent'
    },
    filePreview: {
        marginTop: '24px'
    },
    fileRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        background: 'rgba(51, 65, 85, 0.6)',
        borderRadius: '8px'
    },
    fileInfo: {
        display: 'flex',
        alignItems: 'center'
    },
    fileThumb: {
        width: '64px',
        height: '64px',
        objectFit: 'cover',
        borderRadius: '6px',
        marginRight: '16px'
    },
    fileName: {
        fontWeight: 600,
        color: '#fff',
        marginBottom: '4px'
    },
    fileSize: {
        fontSize: '14px',
        color: '#94a3b8'
    },
    removeBtn: {
        padding: '8px',
        color: '#94a3b8',
        background: 'transparent',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    removeIcon: {
        width: '24px',
        height: '24px'
    },
    actionGrid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '12px',
        marginTop: '16px'
    },
    processBtn: {
        padding: '12px 24px',
        background: '#a78bfa',
        color: '#fff',
        fontWeight: 700,
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '15px'
    },
    processBtnDisabled: {
        background: '#6b7280',
        cursor: 'not-allowed'
    },
    spinner: {
        width: '20px',
        height: '20px',
        marginRight: '8px',
        animation: 'spin 1s linear infinite'
    },
    spinnerCircle: {
        opacity: 0.25
    },
    spinnerPath: {
        opacity: 0.75
    },
    downloadBtn: {
        padding: '12px 24px',
        background: '#10b981',
        color: '#fff',
        fontWeight: 700,
        borderRadius: '8px',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
        fontSize: '15px'
    },
    downloadBtnDisabled: {
        padding: '12px 24px',
        background: '#4b5563',
        color: '#9ca3af',
        fontWeight: 700,
        borderRadius: '8px',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'not-allowed',
        fontSize: '15px'
    },
    downloadIcon: {
        width: '20px',
        height: '20px',
        marginRight: '8px'
    },
    errorBox: {
        marginTop: '24px',
        padding: '16px',
        background: 'rgba(153, 27, 27, 0.8)',
        border: '1px solid rgba(220, 38, 38, 0.6)',
        borderRadius: '8px',
        color: '#fecaca',
        textAlign: 'center'
    },
    compareSection: {
        marginTop: '32px',
        width: '100%'
    },
    compareTitle: {
        fontSize: '24px',
        fontWeight: 700,
        color: '#fff',
        textAlign: 'center',
        marginBottom: '24px'
    },
    compareBox: {
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        minHeight: '400px',
        overflow: 'hidden',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkerBg: {
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(45deg, #4a5568 25%, transparent 25%), linear-gradient(-45deg, #4a5568 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4a5568 75%), linear-gradient(-45deg, transparent 75%, #4a5568 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    beforeImg: {
        display: 'block',
        maxWidth: '100%',
        maxHeight: '70vh',
        width: 'auto',
        height: 'auto',
        objectFit: 'contain',
        userSelect: 'none'
    },
    afterImg: {
        position: 'absolute',
        inset: 0,
        maxWidth: '100%',
        maxHeight: '70vh',
        width: 'auto',
        height: 'auto',
        margin: 'auto',
        objectFit: 'contain'
    },
    divider: {
        position: 'absolute',
        top: 0,
        bottom: 0
    },
    dividerLine: {
        width: '2px',
        height: '100%',
        background: '#a78bfa',
        boxShadow: '0 0 8px rgba(167, 139, 250, 0.6)'
    },
    sliderRow: {
        marginTop: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    sliderLabel: {
        fontSize: '12px',
        color: '#94a3b8'
    },
    compareSlider: {
        flex: 1,
        cursor: 'pointer'
    }
};
var _c;
__turbopack_context__.k.register(_c, "BackgroundRemover");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/tools/ImageGenerator.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ImageGenerator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExportModal$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ExportModal.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Loading$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Loading.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Toast.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$history$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/history.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
function ImageGenerator() {
    _s();
    const [prompt, setPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [aspect, setAspect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('1:1');
    const [detail, setDetail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [realism, setRealism] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [showExportModal, setShowExportModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleGenerate = async ()=>{
        if (!prompt.trim()) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])('Inserisci una descrizione', 'error', 4000, {
                details: 'Il campo prompt è obbligatorio per la generazione',
                technical: 'Status: Empty prompt validation failed'
            });
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);
        setProgress(0);
        const startTime = Date.now();
        const promptLength = prompt.length;
        const wordCount = prompt.trim().split(/\s+/).length;
        const toastId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["showToast"])('Generazione immagine AI in corso...', 'progress', 0, {
            progress: 0,
            details: `Prompt: ${wordCount} parole • Rapporto: ${aspect} • Dettaglio: ${detail.toFixed(1)}x`,
            technical: `Model: AI Image Generator • Realism: ${realism ? 'Enabled' : 'Disabled'} • Prompt Length: ${promptLength} chars`
        });
        const progressInterval = setInterval(()=>{
            setProgress((prev)=>{
                const newProgress = Math.min(prev + 8, 90);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["updateToast"])(toastId, {
                    progress: newProgress,
                    message: newProgress < 40 ? 'Elaborazione prompt...' : newProgress < 80 ? 'Generazione immagine...' : 'Finalizzazione...'
                });
                return newProgress;
            });
        }, 150);
        try {
            const response = await fetch('/api/tools/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                    aspect,
                    detail,
                    realism
                })
            });
            clearInterval(progressInterval);
            setProgress(95);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["updateToast"])(toastId, {
                progress: 95,
                message: 'Elaborazione finale...'
            });
            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Errore durante la generazione');
                } else {
                    throw new Error(`Errore HTTP ${response.status}`);
                }
            }
            const blob = await response.blob();
            if (blob.size === 0) {
                throw new Error('Immagine vuota ricevuta');
            }
            const url = URL.createObjectURL(blob);
            setResult(url);
            setProgress(100);
            const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);
            const imageSize = (blob.size / 1024 / 1024).toFixed(2);
            // Save to history
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$history$2e$js__$5b$client$5d$__$28$ecmascript$29$__["saveToHistory"])({
                tool: 'Generazione Immagini AI',
                filename: `generated_${Date.now()}_4k.jpg`,
                thumbnail: url,
                params: {
                    prompt,
                    aspect,
                    detail,
                    realism
                },
                result: url
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["updateToast"])(toastId, {
                type: 'success',
                message: 'Immagine generata con successo!',
                progress: 100,
                details: `Tempo generazione: ${generationTime}s • Dimensione: ${imageSize} MB • Risoluzione: ${aspect}`,
                technical: `AI Model: Image Generation • Quality: 4K • Format: JPEG • Compression: ${(blob.size / (4096 * 4096 * 3) * 100).toFixed(1)}%`
            });
        } catch (err) {
            console.error('Generation error:', err);
            setError(err.message);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toast$2e$js__$5b$client$5d$__$28$ecmascript$29$__["updateToast"])(toastId, {
                type: 'error',
                message: err.message,
                details: 'Errore durante la generazione dell\'immagine',
                technical: `Error: ${err.message} • Status: ${err.message.includes('HTTP') ? 'Network Error' : 'Generation Failed'}`
            });
            clearInterval(progressInterval);
        } finally{
            setLoading(false);
            setTimeout(()=>setProgress(0), 1000);
        }
    };
    const handleDownload = ()=>{
        if (!result) return;
        setShowExportModal(true);
    };
    const handleKeyPress = (e)=>{
        if (e.key === 'Enter' && e.ctrlKey && !loading && prompt.trim()) {
            handleGenerate();
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Loading$2e$js__$5b$client$5d$__$28$ecmascript$29$__["LoadingOverlay"], {
                message: `Generazione in corso... ${Math.round(progress)}%`
            }, void 0, false, {
                fileName: "[project]/components/tools/ImageGenerator.js",
                lineNumber: 134,
                columnNumber: 17
            }, this),
            showExportModal && result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExportModal$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                imageData: result,
                filename: `generated_${Date.now()}_4k`,
                onClose: ()=>setShowExportModal(false)
            }, void 0, false, {
                fileName: "[project]/components/tools/ImageGenerator.js",
                lineNumber: 138,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.card,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.inputSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: styles.label,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiSparkles"], {
                                        style: {
                                            width: 16,
                                            height: 16
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/ImageGenerator.js",
                                        lineNumber: 148,
                                        columnNumber: 25
                                    }, this),
                                    "Descrivi l'immagine che vuoi creare"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/ImageGenerator.js",
                                lineNumber: 147,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                value: prompt,
                                onChange: (e)=>setPrompt(e.target.value),
                                onKeyDown: handleKeyPress,
                                placeholder: "Es: Un paesaggio montano al tramonto con un lago cristallino, stile fotografico realistico...",
                                style: styles.textarea,
                                rows: 4,
                                disabled: loading
                            }, void 0, false, {
                                fileName: "[project]/components/tools/ImageGenerator.js",
                                lineNumber: 151,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.hint,
                                children: "💡 Suggerimento: Sii dettagliato! Specifica colori, stile, atmosfera e dettagli per risultati migliori."
                            }, void 0, false, {
                                fileName: "[project]/components/tools/ImageGenerator.js",
                                lineNumber: 160,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/ImageGenerator.js",
                        lineNumber: 146,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.controlsRow,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.controlGroup,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: styles.smallLabel,
                                        children: "Rapporto"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/ImageGenerator.js",
                                        lineNumber: 167,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: aspect,
                                        onChange: (e)=>setAspect(e.target.value),
                                        style: styles.select,
                                        disabled: loading,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "1:1",
                                                children: "1 : 1 (Quadrato)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/ImageGenerator.js",
                                                lineNumber: 174,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "16:9",
                                                children: "16 : 9 (Wide)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/ImageGenerator.js",
                                                lineNumber: 175,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "9:16",
                                                children: "9 : 16 (Verticale)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/ImageGenerator.js",
                                                lineNumber: 176,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "4:3",
                                                children: "4 : 3 (Classico)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/ImageGenerator.js",
                                                lineNumber: 177,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "3:4",
                                                children: "3 : 4 (Verticale)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/ImageGenerator.js",
                                                lineNumber: 178,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/tools/ImageGenerator.js",
                                        lineNumber: 168,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/ImageGenerator.js",
                                lineNumber: 166,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.controlGroup,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: styles.smallLabel,
                                        children: "Dettaglio"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/ImageGenerator.js",
                                        lineNumber: 183,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "range",
                                        min: 0.6,
                                        max: 1.4,
                                        step: 0.1,
                                        value: detail,
                                        onChange: (e)=>setDetail(Number(e.target.value)),
                                        style: styles.slider,
                                        disabled: loading
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/ImageGenerator.js",
                                        lineNumber: 184,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.sliderMarks,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Basso"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/ImageGenerator.js",
                                                lineNumber: 195,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Alto"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/ImageGenerator.js",
                                                lineNumber: 195,
                                                columnNumber: 47
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/tools/ImageGenerator.js",
                                        lineNumber: 194,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/ImageGenerator.js",
                                lineNumber: 182,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.controlGroupToggle,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: styles.smallLabel,
                                        children: "Realismo"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/ImageGenerator.js",
                                        lineNumber: 200,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setRealism((v)=>!v),
                                        disabled: loading,
                                        style: {
                                            ...styles.toggle,
                                            background: realism ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'rgba(148,163,184,0.2)'
                                        },
                                        children: realism ? 'Attivo' : 'Off'
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/ImageGenerator.js",
                                        lineNumber: 201,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/ImageGenerator.js",
                                lineNumber: 199,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/ImageGenerator.js",
                        lineNumber: 165,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleGenerate,
                        disabled: loading || !prompt.trim(),
                        style: {
                            ...styles.button,
                            ...loading || !prompt.trim() ? styles.buttonDisabled : {}
                        },
                        onMouseEnter: (e)=>{
                            if (!loading && prompt.trim()) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.4)';
                            }
                        },
                        onMouseLeave: (e)=>{
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.3)';
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiSparkles"], {
                                style: {
                                    width: 20,
                                    height: 20
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/tools/ImageGenerator.js",
                                lineNumber: 233,
                                columnNumber: 21
                            }, this),
                            loading ? 'Generazione in corso...' : 'Genera Immagine'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/ImageGenerator.js",
                        lineNumber: 215,
                        columnNumber: 17
                    }, this),
                    loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.loadingContainer,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.spinner
                            }, void 0, false, {
                                fileName: "[project]/components/tools/ImageGenerator.js",
                                lineNumber: 239,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.loadingText,
                                children: [
                                    "Generazione procedurale in corso - Immagine 4K (",
                                    aspect,
                                    ")...",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/components/tools/ImageGenerator.js",
                                        lineNumber: 241,
                                        columnNumber: 89
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '14px',
                                            color: '#64748b'
                                        },
                                        children: "Elaborazione locale avanzata — può richiedere 20-40 secondi"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/ImageGenerator.js",
                                        lineNumber: 242,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/ImageGenerator.js",
                                lineNumber: 240,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/ImageGenerator.js",
                        lineNumber: 238,
                        columnNumber: 21
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.errorBox,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: styles.errorText,
                            children: [
                                "❌ ",
                                error
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/ImageGenerator.js",
                            lineNumber: 249,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/tools/ImageGenerator.js",
                        lineNumber: 248,
                        columnNumber: 21
                    }, this),
                    result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.resultSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: styles.resultTitle,
                                children: "✨ Immagine Generata"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/ImageGenerator.js",
                                lineNumber: 255,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.imageContainer,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: result,
                                    alt: "Generated",
                                    style: styles.image
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/ImageGenerator.js",
                                    lineNumber: 257,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/tools/ImageGenerator.js",
                                lineNumber: 256,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleDownload,
                                style: styles.downloadButton,
                                onMouseEnter: (e)=>{
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(67, 233, 123, 0.4)';
                                },
                                onMouseLeave: (e)=>{
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(67, 233, 123, 0.3)';
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiDownload"], {
                                        style: {
                                            width: 20,
                                            height: 20
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/ImageGenerator.js",
                                        lineNumber: 271,
                                        columnNumber: 29
                                    }, this),
                                    "Scarica Immagine"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/ImageGenerator.js",
                                lineNumber: 259,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/ImageGenerator.js",
                        lineNumber: 254,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/ImageGenerator.js",
                lineNumber: 145,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.examples,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        style: styles.examplesTitle,
                        children: "💡 Esempi di prompt efficaci:"
                    }, void 0, false, {
                        fileName: "[project]/components/tools/ImageGenerator.js",
                        lineNumber: 279,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.exampleGrid,
                        children: [
                            'Un gatto astronauta nello spazio profondo, stile fotorealistico, illuminazione cinematografica',
                            'Paesaggio fantasy con castello medievale su una montagna, tramonto dorato, arte digitale dettagliata',
                            'Ritratto di un robot futuristico, stile cyberpunk, neon blu e viola, altamente dettagliato',
                            'Una città sott\'acqua con architettura moderna, raggi di luce dall\'alto, atmosfera serena'
                        ].map((example, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setPrompt(example),
                                style: styles.exampleButton,
                                onMouseEnter: (e)=>{
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                                },
                                onMouseLeave: (e)=>{
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                },
                                disabled: loading,
                                children: example
                            }, idx, false, {
                                fileName: "[project]/components/tools/ImageGenerator.js",
                                lineNumber: 287,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/tools/ImageGenerator.js",
                        lineNumber: 280,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/ImageGenerator.js",
                lineNumber: 278,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/tools/ImageGenerator.js",
        lineNumber: 132,
        columnNumber: 9
    }, this);
}
_s(ImageGenerator, "tbONgKgdZe+KQUCse7FlWR2573I=");
_c = ImageGenerator;
const styles = {
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '24px'
    },
    card: {
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        marginBottom: '32px'
    },
    inputSection: {
        marginBottom: '24px'
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#cbd5e1',
        marginBottom: '12px'
    },
    textarea: {
        width: '100%',
        padding: '16px',
        background: 'rgba(10, 14, 26, 0.6)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '12px',
        color: '#e2e8f0',
        fontSize: '15px',
        fontFamily: 'inherit',
        resize: 'vertical',
        outline: 'none',
        transition: 'border-color 0.2s, background 0.2s',
        lineHeight: '1.6'
    },
    hint: {
        fontSize: '13px',
        color: '#64748b',
        marginTop: '8px',
        marginBottom: 0
    },
    button: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none !important',
        boxShadow: 'none !important'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '32px',
        marginTop: '24px',
        background: 'rgba(102, 126, 234, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(102, 126, 234, 0.2)'
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '4px solid rgba(102, 126, 234, 0.2)',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    loadingText: {
        color: '#cbd5e1',
        textAlign: 'center',
        margin: 0,
        fontSize: '16px',
        fontWeight: '500'
    },
    errorBox: {
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px'
    },
    errorText: {
        color: '#f87171',
        margin: 0,
        fontSize: '14px'
    },
    resultSection: {
        marginTop: '32px',
        animation: 'fadeIn 0.5s ease-out'
    },
    resultTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#e2e8f0',
        marginBottom: '16px',
        textAlign: 'center'
    },
    imageContainer: {
        border: '2px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '20px',
        background: '#000'
    },
    image: {
        width: '100%',
        display: 'block',
        height: 'auto'
    },
    downloadButton: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        border: 'none',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 8px 16px rgba(67, 233, 123, 0.3)'
    },
    examples: {
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(102, 126, 234, 0.15)',
        borderRadius: '16px',
        padding: '24px'
    },
    controlsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
    },
    controlGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'rgba(10, 14, 26, 0.5)',
        border: '1px solid rgba(102, 126, 234, 0.15)',
        borderRadius: '12px',
        padding: '12px'
    },
    controlGroupToggle: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '8px',
        background: 'rgba(10, 14, 26, 0.5)',
        border: '1px solid rgba(102, 126, 234, 0.15)',
        borderRadius: '12px',
        padding: '12px'
    },
    smallLabel: {
        fontSize: '12px',
        color: '#94a3b8',
        fontWeight: 600
    },
    select: {
        background: 'rgba(15, 23, 42, 0.7)',
        color: '#e2e8f0',
        border: '1px solid rgba(102, 126, 234, 0.25)',
        borderRadius: '10px',
        padding: '10px 12px',
        fontSize: '14px',
        outline: 'none'
    },
    slider: {
        WebkitAppearance: 'none',
        width: '100%'
    },
    sliderMarks: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#64748b'
    },
    toggle: {
        border: 'none',
        color: '#0b1220',
        fontWeight: 700,
        borderRadius: '10px',
        padding: '10px 12px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 6px 14px rgba(56, 249, 215, 0.25)'
    },
    examplesTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#cbd5e1',
        marginBottom: '16px',
        marginTop: 0
    },
    exampleGrid: {
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
    },
    exampleButton: {
        padding: '14px 16px',
        background: 'rgba(102, 126, 234, 0.08)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '10px',
        color: '#94a3b8',
        fontSize: '13px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.2s',
        lineHeight: '1.5'
    }
};
var _c;
__turbopack_context__.k.register(_c, "ImageGenerator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/tools/CleanNoise.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CleanNoise
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-dropzone/dist/es/index.js [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/bs/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function CleanNoise() {
    _s();
    const [audio, setAudio] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [noiseLevel, setNoiseLevel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('medium');
    const onDrop = async (acceptedFiles)=>{
        const file = acceptedFiles[0];
        if (!file) return;
        setAudio(file);
        setResult(null);
        setError(null);
    };
    const { getRootProps, getInputProps, isDragActive } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"])({
        onDrop,
        accept: {
            'audio/*': [
                '.mp3',
                '.wav',
                '.ogg',
                '.m4a',
                '.flac',
                '.aac'
            ]
        },
        maxFiles: 1
    });
    const handleProcess = async ()=>{
        if (!audio) return;
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('audio', audio);
            formData.append('noiseLevel', noiseLevel);
            const response = await fetch('/api/tools/clean-noise', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante l\'elaborazione');
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setResult(url);
        } catch (err) {
            setError(err.message);
        } finally{
            setLoading(false);
        }
    };
    const handleDownload = ()=>{
        if (!result) return;
        const a = document.createElement('a');
        a.href = result;
        a.download = `cleaned_${audio.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    const handleReset = ()=>{
        setAudio(null);
        setResult(null);
        setError(null);
    };
    const styles = {
        container: {
            maxWidth: '900px',
            margin: '0 auto',
            padding: '20px'
        },
        dropzone: {
            border: '3px dashed #ccc',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: '#fafafa'
        },
        dropzoneActive: {
            borderColor: '#667eea',
            background: '#f0f4ff'
        },
        uploadIcon: {
            fontSize: '64px',
            color: '#667eea',
            marginBottom: '20px'
        },
        dropzoneTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '10px'
        },
        dropzoneText: {
            fontSize: '14px',
            color: '#666'
        },
        audioInfo: {
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '20px'
        },
        audioIcon: {
            fontSize: '48px',
            color: '#667eea',
            marginBottom: '15px'
        },
        fileName: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '5px'
        },
        fileSize: {
            fontSize: '14px',
            color: '#666'
        },
        noiseLevelSection: {
            marginBottom: '25px'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '12px'
        },
        levelGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px'
        },
        levelBtn: {
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: 'white',
            color: '#333'
        },
        levelBtnActive: {
            borderColor: '#667eea',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
        },
        button: {
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        buttonDisabled: {
            opacity: 0.6,
            cursor: 'not-allowed'
        },
        downloadBtn: {
            background: '#10b981'
        },
        resetBtn: {
            background: '#6b7280',
            padding: '12px'
        },
        buttonGroup: {
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '10px',
            marginTop: '20px'
        },
        error: {
            padding: '15px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '20px',
            fontSize: '14px'
        },
        result: {
            marginTop: '30px',
            padding: '25px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center'
        },
        successIcon: {
            fontSize: '48px',
            color: '#10b981',
            marginBottom: '15px'
        },
        resultTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '15px'
        },
        audioPlayer: {
            width: '100%',
            marginBottom: '20px',
            borderRadius: '8px'
        },
        hint: {
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '8px',
            fontStyle: 'italic'
        }
    };
    const formatFileSize = (bytes)=>{
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
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: !audio ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ...getRootProps(),
            style: {
                ...styles.dropzone,
                ...isDragActive ? styles.dropzoneActive : {}
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    ...getInputProps()
                }, void 0, false, {
                    fileName: "[project]/components/tools/CleanNoise.js",
                    lineNumber: 257,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsCloudUpload"], {
                    style: styles.uploadIcon
                }, void 0, false, {
                    fileName: "[project]/components/tools/CleanNoise.js",
                    lineNumber: 258,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: styles.dropzoneTitle,
                    children: isDragActive ? 'Rilascia qui il file audio...' : 'Trascina qui un file audio o clicca per selezionare'
                }, void 0, false, {
                    fileName: "[project]/components/tools/CleanNoise.js",
                    lineNumber: 259,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: styles.dropzoneText,
                    children: "Supporta MP3, WAV, OGG, M4A, FLAC, AAC"
                }, void 0, false, {
                    fileName: "[project]/components/tools/CleanNoise.js",
                    lineNumber: 262,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/tools/CleanNoise.js",
            lineNumber: 250,
            columnNumber: 17
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.audioInfo,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsSoundwave"], {
                            style: styles.audioIcon
                        }, void 0, false, {
                            fileName: "[project]/components/tools/CleanNoise.js",
                            lineNumber: 269,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.fileName,
                            children: audio.name
                        }, void 0, false, {
                            fileName: "[project]/components/tools/CleanNoise.js",
                            lineNumber: 270,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.fileSize,
                            children: formatFileSize(audio.size)
                        }, void 0, false, {
                            fileName: "[project]/components/tools/CleanNoise.js",
                            lineNumber: 271,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/CleanNoise.js",
                    lineNumber: 268,
                    columnNumber: 21
                }, this),
                !result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.noiseLevelSection,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: styles.label,
                                    children: "Livello di riduzione rumore"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/CleanNoise.js",
                                    lineNumber: 277,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.levelGrid,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setNoiseLevel('light'),
                                            style: {
                                                ...styles.levelBtn,
                                                ...noiseLevel === 'light' ? styles.levelBtnActive : {}
                                            },
                                            children: "Leggero"
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/CleanNoise.js",
                                            lineNumber: 281,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setNoiseLevel('medium'),
                                            style: {
                                                ...styles.levelBtn,
                                                ...noiseLevel === 'medium' ? styles.levelBtnActive : {}
                                            },
                                            children: "Medio"
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/CleanNoise.js",
                                            lineNumber: 290,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setNoiseLevel('strong'),
                                            style: {
                                                ...styles.levelBtn,
                                                ...noiseLevel === 'strong' ? styles.levelBtnActive : {}
                                            },
                                            children: "Forte"
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/CleanNoise.js",
                                            lineNumber: 299,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/tools/CleanNoise.js",
                                    lineNumber: 280,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: styles.hint,
                                    children: "Livelli più alti riducono più rumore ma potrebbero alterare la qualità audio"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/CleanNoise.js",
                                    lineNumber: 309,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/CleanNoise.js",
                            lineNumber: 276,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleProcess,
                            disabled: loading,
                            style: {
                                ...styles.button,
                                ...loading ? styles.buttonDisabled : {}
                            },
                            onMouseEnter: (e)=>{
                                if (!loading) e.target.style.transform = 'translateY(-2px)';
                            },
                            onMouseLeave: (e)=>{
                                e.target.style.transform = 'translateY(0)';
                            },
                            children: loading ? 'Elaborazione in corso...' : 'Riduci Rumore'
                        }, void 0, false, {
                            fileName: "[project]/components/tools/CleanNoise.js",
                            lineNumber: 314,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.error,
                    children: error
                }, void 0, false, {
                    fileName: "[project]/components/tools/CleanNoise.js",
                    lineNumber: 334,
                    columnNumber: 25
                }, this),
                result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.result,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiCheckCircle"], {
                            style: styles.successIcon
                        }, void 0, false, {
                            fileName: "[project]/components/tools/CleanNoise.js",
                            lineNumber: 341,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: styles.resultTitle,
                            children: "Audio Pulito con Successo!"
                        }, void 0, false, {
                            fileName: "[project]/components/tools/CleanNoise.js",
                            lineNumber: 342,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                            controls: true,
                            style: styles.audioPlayer,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                                    src: result,
                                    type: "audio/mpeg"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/CleanNoise.js",
                                    lineNumber: 345,
                                    columnNumber: 33
                                }, this),
                                "Il tuo browser non supporta l'elemento audio."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/CleanNoise.js",
                            lineNumber: 344,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.buttonGroup,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleDownload,
                                    style: {
                                        ...styles.button,
                                        ...styles.downloadBtn
                                    },
                                    onMouseEnter: (e)=>{
                                        e.target.style.transform = 'translateY(-2px)';
                                    },
                                    onMouseLeave: (e)=>{
                                        e.target.style.transform = 'translateY(0)';
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsDownload"], {
                                            style: {
                                                fontSize: '20px'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/CleanNoise.js",
                                            lineNumber: 363,
                                            columnNumber: 37
                                        }, this),
                                        "Scarica Audio"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/tools/CleanNoise.js",
                                    lineNumber: 350,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleReset,
                                    style: {
                                        ...styles.button,
                                        ...styles.resetBtn
                                    },
                                    onMouseEnter: (e)=>{
                                        e.target.style.background = '#4b5563';
                                    },
                                    onMouseLeave: (e)=>{
                                        e.target.style.background = '#6b7280';
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsX"], {
                                        style: {
                                            fontSize: '24px'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/CleanNoise.js",
                                        lineNumber: 379,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/CleanNoise.js",
                                    lineNumber: 366,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/CleanNoise.js",
                            lineNumber: 349,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/CleanNoise.js",
                    lineNumber: 340,
                    columnNumber: 25
                }, this),
                !result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleReset,
                    style: {
                        ...styles.button,
                        ...styles.resetBtn
                    },
                    onMouseEnter: (e)=>{
                        e.target.style.background = '#4b5563';
                    },
                    onMouseLeave: (e)=>{
                        e.target.style.background = '#6b7280';
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsX"], {
                            style: {
                                fontSize: '24px'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/tools/CleanNoise.js",
                            lineNumber: 399,
                            columnNumber: 29
                        }, this),
                        "Cambia File"
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/CleanNoise.js",
                    lineNumber: 386,
                    columnNumber: 25
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/tools/CleanNoise.js",
            lineNumber: 267,
            columnNumber: 17
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/tools/CleanNoise.js",
        lineNumber: 248,
        columnNumber: 9
    }, this);
}
_s(CleanNoise, "+RQpByPdD90rV8VfUarh/Fr+6No=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"]
    ];
});
_c = CleanNoise;
var _c;
__turbopack_context__.k.register(_c, "CleanNoise");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/tools/AudioTranscription.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AudioTranscription
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-dropzone/dist/es/index.js [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
function AudioTranscription() {
    _s();
    const [audio, setAudio] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const onDrop = async (acceptedFiles)=>{
        const file = acceptedFiles[0];
        if (!file) return;
        setAudio(file);
        setResult('');
        setError(null);
    };
    const { getRootProps, getInputProps, isDragActive } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"])({
        onDrop,
        accept: {
            'audio/*': [
                '.mp3',
                '.wav',
                '.m4a',
                '.ogg'
            ]
        },
        maxFiles: 1
    });
    const handleTranscribe = async ()=>{
        if (!audio) return;
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('audio', audio);
            const response = await fetch('/api/tools/transcribe-audio', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante la trascrizione');
            }
            const data = await response.json();
            setResult(data.text);
        } catch (err) {
            setError(err.message);
        } finally{
            setLoading(false);
        }
    };
    const handleCopy = ()=>{
        navigator.clipboard.writeText(result);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: !audio ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ...getRootProps(),
            className: `border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500'}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    ...getInputProps()
                }, void 0, false, {
                    fileName: "[project]/components/tools/AudioTranscription.js",
                    lineNumber: 70,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiUpload"], {
                    className: "w-16 h-16 mx-auto mb-4 text-gray-400"
                }, void 0, false, {
                    fileName: "[project]/components/tools/AudioTranscription.js",
                    lineNumber: 71,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-lg font-medium mb-2",
                    children: isDragActive ? 'Rilascia qui...' : 'Carica un file audio'
                }, void 0, false, {
                    fileName: "[project]/components/tools/AudioTranscription.js",
                    lineNumber: 72,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-gray-400",
                    children: "MP3, WAV, M4A o OGG"
                }, void 0, false, {
                    fileName: "[project]/components/tools/AudioTranscription.js",
                    lineNumber: 75,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/tools/AudioTranscription.js",
            lineNumber: 62,
            columnNumber: 17
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-800 border border-gray-700 rounded-lg p-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-400",
                            children: "File caricato:"
                        }, void 0, false, {
                            fileName: "[project]/components/tools/AudioTranscription.js",
                            lineNumber: 80,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "font-medium",
                            children: audio.name
                        }, void 0, false, {
                            fileName: "[project]/components/tools/AudioTranscription.js",
                            lineNumber: 81,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/AudioTranscription.js",
                    lineNumber: 79,
                    columnNumber: 21
                }, this),
                !result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleTranscribe,
                    disabled: loading,
                    className: "w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors",
                    children: loading ? 'Trascrizione in corso...' : 'Trascrivi Audio'
                }, void 0, false, {
                    fileName: "[project]/components/tools/AudioTranscription.js",
                    lineNumber: 85,
                    columnNumber: 25
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-red-500/10 border border-red-500 rounded-lg p-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-red-500",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/components/tools/AudioTranscription.js",
                        lineNumber: 96,
                        columnNumber: 29
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/tools/AudioTranscription.js",
                    lineNumber: 95,
                    columnNumber: 25
                }, this),
                result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between items-center mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-sm font-medium text-gray-400",
                                            children: "Trascrizione"
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/AudioTranscription.js",
                                            lineNumber: 104,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleCopy,
                                            className: "px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiClipboard"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/tools/AudioTranscription.js",
                                                    lineNumber: 109,
                                                    columnNumber: 41
                                                }, this),
                                                "Copia"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/tools/AudioTranscription.js",
                                            lineNumber: 105,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/tools/AudioTranscription.js",
                                    lineNumber: 103,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: result,
                                    readOnly: true,
                                    className: "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none resize-none",
                                    rows: 10
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/AudioTranscription.js",
                                    lineNumber: 113,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/AudioTranscription.js",
                            lineNumber: 102,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                setAudio(null);
                                setResult('');
                            },
                            className: "w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors",
                            children: "Carica Nuovo File"
                        }, void 0, false, {
                            fileName: "[project]/components/tools/AudioTranscription.js",
                            lineNumber: 120,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/AudioTranscription.js",
                    lineNumber: 101,
                    columnNumber: 25
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/tools/AudioTranscription.js",
            lineNumber: 78,
            columnNumber: 17
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/tools/AudioTranscription.js",
        lineNumber: 60,
        columnNumber: 9
    }, this);
}
_s(AudioTranscription, "RM14Wceq+goVvC/+WNEQIkuL/PI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"]
    ];
});
_c = AudioTranscription;
var _c;
__turbopack_context__.k.register(_c, "AudioTranscription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ProBadge.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Componente badge PRO riutilizzabile
__turbopack_context__.s([
    "default",
    ()=>ProBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
function ProBadge({ style = {}, size = 'small' }) {
    const sizes = {
        small: {
            fontSize: '10px',
            padding: '3px 8px'
        },
        medium: {
            fontSize: '12px',
            padding: '4px 10px'
        },
        large: {
            fontSize: '14px',
            padding: '6px 12px'
        }
    };
    const sizeStyle = sizes[size] || sizes.small;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            fontWeight: '700',
            borderRadius: '12px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
            ...sizeStyle,
            ...style
        },
        children: "PRO"
    }, void 0, false, {
        fileName: "[project]/components/ProBadge.js",
        lineNumber: 21,
        columnNumber: 9
    }, this);
}
_c = ProBadge;
var _c;
__turbopack_context__.k.register(_c, "ProBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/tools/OCRAdvanced.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OCRAdvanced
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-dropzone/dist/es/index.js [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/bs/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProBadge$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ProBadge.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
function OCRAdvanced() {
    _s();
    const [file, setFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const onDrop = async (acceptedFiles)=>{
        const uploadedFile = acceptedFiles[0];
        if (!uploadedFile) return;
        setFile(uploadedFile);
        setResult('');
        setError(null);
    };
    const { getRootProps, getInputProps, isDragActive } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"])({
        onDrop,
        accept: {
            'image/*': [
                '.png',
                '.jpg',
                '.jpeg'
            ],
            'application/pdf': [
                '.pdf'
            ]
        },
        maxFiles: 1
    });
    const handleExtract = async ()=>{
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/tools/ocr-advanced', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante l\'estrazione');
            }
            const data = await response.json();
            setResult(data.text);
        } catch (err) {
            setError(err.message);
        } finally{
            setLoading(false);
        }
    };
    const handleCopy = ()=>{
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(()=>setCopied(false), 2000);
    };
    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px'
        },
        proInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap'
        },
        proInfoText: {
            fontSize: '13px',
            color: '#cbd5e1',
            margin: 0,
            flex: 1,
            lineHeight: '1.6'
        },
        proLink: {
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '600',
            marginLeft: '8px',
            transition: 'color 0.2s'
        },
        dropzone: {
            border: '3px dashed #ccc',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: '#fafafa'
        },
        dropzoneActive: {
            borderColor: '#667eea',
            background: '#f0f4ff'
        },
        uploadIcon: {
            fontSize: '64px',
            color: '#667eea',
            marginBottom: '20px'
        },
        dropzoneTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '10px'
        },
        dropzoneText: {
            fontSize: '14px',
            color: '#666'
        },
        fileInfo: {
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '20px'
        },
        fileLabel: {
            fontSize: '12px',
            color: '#666',
            marginBottom: '8px',
            display: 'block'
        },
        fileName: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        fileIcon: {
            fontSize: '24px',
            color: '#667eea'
        },
        button: {
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            marginBottom: '20px'
        },
        buttonDisabled: {
            opacity: 0.6,
            cursor: 'not-allowed'
        },
        error: {
            padding: '15px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '20px',
            fontSize: '14px'
        },
        resultSection: {
            marginTop: '20px'
        },
        resultHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
        },
        resultTitle: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#333'
        },
        copyBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: copied ? '#10b981' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background 0.2s'
        },
        textarea: {
            width: '100%',
            padding: '15px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.6',
            resize: 'vertical',
            minHeight: '300px',
            maxHeight: '500px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            background: 'white'
        },
        resetBtn: {
            width: '100%',
            padding: '12px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '15px',
            transition: 'background 0.2s'
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.proInfo,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProBadge$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                        size: "medium"
                    }, void 0, false, {
                        fileName: "[project]/components/tools/OCRAdvanced.js",
                        lineNumber: 236,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: styles.proInfoText,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Piano Gratuito:"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/OCRAdvanced.js",
                                lineNumber: 238,
                                columnNumber: 21
                            }, this),
                            " 5 documenti/giorno •",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/pricing",
                                style: styles.proLink,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "Passa a PRO"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/OCRAdvanced.js",
                                    lineNumber: 240,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/tools/OCRAdvanced.js",
                                lineNumber: 239,
                                columnNumber: 21
                            }, this),
                            " per utilizzi illimitati"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/OCRAdvanced.js",
                        lineNumber: 237,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/OCRAdvanced.js",
                lineNumber: 235,
                columnNumber: 13
            }, this),
            !file ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ...getRootProps(),
                style: {
                    ...styles.dropzone,
                    ...isDragActive ? styles.dropzoneActive : {}
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ...getInputProps()
                    }, void 0, false, {
                        fileName: "[project]/components/tools/OCRAdvanced.js",
                        lineNumber: 253,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsCloudUpload"], {
                        style: styles.uploadIcon
                    }, void 0, false, {
                        fileName: "[project]/components/tools/OCRAdvanced.js",
                        lineNumber: 254,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: styles.dropzoneTitle,
                        children: isDragActive ? 'Rilascia qui il file...' : 'Trascina qui un file o clicca per selezionare'
                    }, void 0, false, {
                        fileName: "[project]/components/tools/OCRAdvanced.js",
                        lineNumber: 255,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: styles.dropzoneText,
                        children: "Supporta immagini (PNG, JPG, JPEG) e PDF"
                    }, void 0, false, {
                        fileName: "[project]/components/tools/OCRAdvanced.js",
                        lineNumber: 258,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/OCRAdvanced.js",
                lineNumber: 246,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.fileInfo,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: styles.fileLabel,
                                children: "File caricato:"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/OCRAdvanced.js",
                                lineNumber: 263,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.fileName,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsFileEarmarkText"], {
                                        style: styles.fileIcon
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/OCRAdvanced.js",
                                        lineNumber: 265,
                                        columnNumber: 29
                                    }, this),
                                    file.name
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/OCRAdvanced.js",
                                lineNumber: 264,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/OCRAdvanced.js",
                        lineNumber: 262,
                        columnNumber: 21
                    }, this),
                    !result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleExtract,
                        disabled: loading,
                        style: {
                            ...styles.button,
                            ...loading ? styles.buttonDisabled : {}
                        },
                        onMouseEnter: (e)=>{
                            if (!loading) e.target.style.transform = 'translateY(-2px)';
                        },
                        onMouseLeave: (e)=>{
                            e.target.style.transform = 'translateY(0)';
                        },
                        children: loading ? 'Estrazione in corso...' : 'Estrai Testo'
                    }, void 0, false, {
                        fileName: "[project]/components/tools/OCRAdvanced.js",
                        lineNumber: 271,
                        columnNumber: 25
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.error,
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/components/tools/OCRAdvanced.js",
                        lineNumber: 290,
                        columnNumber: 25
                    }, this),
                    result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.resultSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.resultHeader,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: styles.resultTitle,
                                        children: "Testo estratto"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/OCRAdvanced.js",
                                        lineNumber: 298,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleCopy,
                                        style: styles.copyBtn,
                                        children: copied ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiCheckCircle"], {
                                                    style: {
                                                        fontSize: '18px'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/tools/OCRAdvanced.js",
                                                    lineNumber: 305,
                                                    columnNumber: 45
                                                }, this),
                                                "Copiato!"
                                            ]
                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiClipboard"], {
                                                    style: {
                                                        fontSize: '18px'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/tools/OCRAdvanced.js",
                                                    lineNumber: 310,
                                                    columnNumber: 45
                                                }, this),
                                                "Copia"
                                            ]
                                        }, void 0, true)
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/OCRAdvanced.js",
                                        lineNumber: 299,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/OCRAdvanced.js",
                                lineNumber: 297,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                value: result,
                                readOnly: true,
                                style: styles.textarea
                            }, void 0, false, {
                                fileName: "[project]/components/tools/OCRAdvanced.js",
                                lineNumber: 316,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setFile(null);
                                    setResult('');
                                    setError(null);
                                },
                                style: styles.resetBtn,
                                onMouseEnter: (e)=>{
                                    e.target.style.background = '#4b5563';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.background = '#6b7280';
                                },
                                children: "Carica Nuovo File"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/OCRAdvanced.js",
                                lineNumber: 321,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/OCRAdvanced.js",
                        lineNumber: 296,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/OCRAdvanced.js",
                lineNumber: 261,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/tools/OCRAdvanced.js",
        lineNumber: 233,
        columnNumber: 9
    }, this);
}
_s(OCRAdvanced, "X3WofJWAUVErHn0NJRRIQGMEAZE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"]
    ];
});
_c = OCRAdvanced;
var _c;
__turbopack_context__.k.register(_c, "OCRAdvanced");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/tools/TextSummarizer.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TextSummarizer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
function TextSummarizer() {
    _s();
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSummarize = async ()=>{
        if (!text.trim()) {
            setError('Inserisci del testo da riassumere');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/tools/text-summarizer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante il riassunto');
            }
            const data = await response.json();
            setResult(data.summary);
        } catch (err) {
            setError(err.message);
        } finally{
            setLoading(false);
        }
    };
    const handleCopy = ()=>{
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(()=>setCopied(false), 2000);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.inputSection,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        style: styles.label,
                        children: "Inserisci il testo da riassumere"
                    }, void 0, false, {
                        fileName: "[project]/components/tools/TextSummarizer.js",
                        lineNumber: 50,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        value: text,
                        onChange: (e)=>setText(e.target.value),
                        placeholder: "Incolla qui il testo lungo che vuoi riassumere...",
                        style: styles.textarea,
                        rows: 10
                    }, void 0, false, {
                        fileName: "[project]/components/tools/TextSummarizer.js",
                        lineNumber: 53,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleSummarize,
                        disabled: loading || !text.trim(),
                        style: {
                            ...styles.button,
                            ...loading || !text.trim() ? styles.buttonDisabled : {}
                        },
                        children: loading ? 'Elaborazione...' : 'Riassumi Testo'
                    }, void 0, false, {
                        fileName: "[project]/components/tools/TextSummarizer.js",
                        lineNumber: 61,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/TextSummarizer.js",
                lineNumber: 49,
                columnNumber: 13
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.errorBox,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: styles.errorText,
                    children: error
                }, void 0, false, {
                    fileName: "[project]/components/tools/TextSummarizer.js",
                    lineNumber: 75,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/tools/TextSummarizer.js",
                lineNumber: 74,
                columnNumber: 17
            }, this),
            result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.resultSection,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.resultHeader,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: styles.resultTitle,
                                children: "Riassunto"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/TextSummarizer.js",
                                lineNumber: 82,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleCopy,
                                style: styles.copyButton,
                                children: [
                                    copied ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiCheckCircle"], {
                                        style: {
                                            width: 16,
                                            height: 16
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/TextSummarizer.js",
                                        lineNumber: 87,
                                        columnNumber: 39
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiClipboard"], {
                                        style: {
                                            width: 16,
                                            height: 16
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/TextSummarizer.js",
                                        lineNumber: 87,
                                        columnNumber: 91
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: copied ? 'Copiato!' : 'Copia'
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/TextSummarizer.js",
                                        lineNumber: 88,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/TextSummarizer.js",
                                lineNumber: 83,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/TextSummarizer.js",
                        lineNumber: 81,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.resultBox,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: styles.resultText,
                            children: result
                        }, void 0, false, {
                            fileName: "[project]/components/tools/TextSummarizer.js",
                            lineNumber: 92,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/tools/TextSummarizer.js",
                        lineNumber: 91,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/TextSummarizer.js",
                lineNumber: 80,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/tools/TextSummarizer.js",
        lineNumber: 48,
        columnNumber: 9
    }, this);
}
_s(TextSummarizer, "qbU5v+qN1zZXAs3BD4tAsMrM0HE=");
_c = TextSummarizer;
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    inputSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    label: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#94a3b8',
        marginBottom: '8px'
    },
    textarea: {
        width: '100%',
        padding: '16px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '2px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        color: '#e6eef8',
        fontSize: '15px',
        lineHeight: 1.6,
        resize: 'vertical',
        outline: 'none',
        transition: 'border-color 0.2s',
        fontFamily: 'inherit'
    },
    button: {
        width: '100%',
        padding: '14px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none'
    },
    errorBox: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '2px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '16px'
    },
    errorText: {
        color: '#ef4444',
        margin: 0
    },
    resultSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    resultHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    resultTitle: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#94a3b8',
        margin: 0
    },
    copyButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(51, 65, 85, 0.8)',
        border: 'none',
        borderRadius: '8px',
        color: '#cbd5e1',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    resultBox: {
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '2px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        maxHeight: '400px',
        overflowY: 'auto'
    },
    resultText: {
        color: '#e6eef8',
        fontSize: '15px',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        margin: 0
    }
};
var _c;
__turbopack_context__.k.register(_c, "TextSummarizer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/tools/GrammarChecker.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GrammarChecker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
function GrammarChecker() {
    _s();
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [corrections, setCorrections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleCheck = async ()=>{
        if (!text.trim()) {
            setError('Inserisci del testo da correggere');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/tools/grammar-checker', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante la correzione');
            }
            const data = await response.json();
            setResult(data.corrected);
            setCorrections(data.corrections || []);
        } catch (err) {
            setError(err.message);
        } finally{
            setLoading(false);
        }
    };
    const handleCopy = ()=>{
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(()=>setCopied(false), 2000);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.inputSection,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        style: styles.label,
                        children: "Inserisci il testo da correggere"
                    }, void 0, false, {
                        fileName: "[project]/components/tools/GrammarChecker.js",
                        lineNumber: 52,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        value: text,
                        onChange: (e)=>setText(e.target.value),
                        placeholder: "Scrivi o incolla il testo qui...",
                        style: styles.textarea,
                        rows: 10
                    }, void 0, false, {
                        fileName: "[project]/components/tools/GrammarChecker.js",
                        lineNumber: 55,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleCheck,
                        disabled: loading || !text.trim(),
                        style: {
                            ...styles.button,
                            ...loading || !text.trim() ? styles.buttonDisabled : {}
                        },
                        children: loading ? 'Controllo in corso...' : 'Controlla Grammatica'
                    }, void 0, false, {
                        fileName: "[project]/components/tools/GrammarChecker.js",
                        lineNumber: 63,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/GrammarChecker.js",
                lineNumber: 51,
                columnNumber: 13
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.errorBox,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: styles.errorText,
                    children: error
                }, void 0, false, {
                    fileName: "[project]/components/tools/GrammarChecker.js",
                    lineNumber: 77,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/tools/GrammarChecker.js",
                lineNumber: 76,
                columnNumber: 17
            }, this),
            result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.resultSection,
                children: [
                    corrections.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.warningBox,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.warningTitle,
                                children: [
                                    "✓ ",
                                    corrections.length,
                                    " correzioni trovate"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/GrammarChecker.js",
                                lineNumber: 85,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                style: styles.correctionsList,
                                children: corrections.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        style: styles.correctionItem,
                                        children: c
                                    }, i, false, {
                                        fileName: "[project]/components/tools/GrammarChecker.js",
                                        lineNumber: 88,
                                        columnNumber: 37
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/tools/GrammarChecker.js",
                                lineNumber: 86,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/GrammarChecker.js",
                        lineNumber: 84,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.resultHeader,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: styles.resultTitle,
                                children: "Testo Corretto"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/GrammarChecker.js",
                                lineNumber: 95,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleCopy,
                                style: styles.copyButton,
                                children: [
                                    copied ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiCheckCircle"], {
                                        style: {
                                            width: 16,
                                            height: 16
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/GrammarChecker.js",
                                        lineNumber: 97,
                                        columnNumber: 39
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiClipboard"], {
                                        style: {
                                            width: 16,
                                            height: 16
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/GrammarChecker.js",
                                        lineNumber: 97,
                                        columnNumber: 91
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: copied ? 'Copiato!' : 'Copia'
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/GrammarChecker.js",
                                        lineNumber: 98,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/GrammarChecker.js",
                                lineNumber: 96,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/GrammarChecker.js",
                        lineNumber: 94,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.resultBox,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: styles.resultText,
                            children: result
                        }, void 0, false, {
                            fileName: "[project]/components/tools/GrammarChecker.js",
                            lineNumber: 102,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/tools/GrammarChecker.js",
                        lineNumber: 101,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/GrammarChecker.js",
                lineNumber: 82,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/tools/GrammarChecker.js",
        lineNumber: 50,
        columnNumber: 9
    }, this);
}
_s(GrammarChecker, "ody44piucy8wMG/jZsjTZl1Xl5M=");
_c = GrammarChecker;
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    inputSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    label: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#94a3b8',
        marginBottom: '8px'
    },
    textarea: {
        width: '100%',
        padding: '16px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '2px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        color: '#e6eef8',
        fontSize: '15px',
        lineHeight: 1.6,
        resize: 'vertical',
        outline: 'none',
        transition: 'border-color 0.2s',
        fontFamily: 'inherit'
    },
    button: {
        width: '100%',
        padding: '14px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    errorBox: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '2px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '16px'
    },
    errorText: {
        color: '#ef4444',
        margin: 0
    },
    warningBox: {
        background: 'rgba(234, 179, 8, 0.1)',
        border: '2px solid rgba(234, 179, 8, 0.3)',
        borderRadius: '12px',
        padding: '16px'
    },
    warningTitle: {
        color: '#eab308',
        fontWeight: 600,
        margin: '0 0 12px',
        fontSize: '14px'
    },
    correctionsList: {
        margin: 0,
        paddingLeft: '20px',
        color: '#fde047',
        fontSize: '14px'
    },
    correctionItem: {
        marginBottom: '4px'
    },
    resultSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    resultHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    resultTitle: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#94a3b8',
        margin: 0
    },
    copyButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(51, 65, 85, 0.8)',
        border: 'none',
        borderRadius: '8px',
        color: '#cbd5e1',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    resultBox: {
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '2px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        maxHeight: '400px',
        overflowY: 'auto'
    },
    resultText: {
        color: '#e6eef8',
        fontSize: '15px',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        margin: 0
    }
};
var _c;
__turbopack_context__.k.register(_c, "GrammarChecker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/tools/ThumbnailGenerator.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ThumbnailGenerator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-dropzone/dist/es/index.js [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
function ThumbnailGenerator() {
    _s();
    const [image, setImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [preview, setPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [size, setSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('1280x720');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const sizes = [
        {
            id: '1280x720',
            name: 'YouTube (1280x720)'
        },
        {
            id: '1200x630',
            name: 'Facebook (1200x630)'
        },
        {
            id: '1080x1080',
            name: 'Instagram (1080x1080)'
        },
        {
            id: '1200x675',
            name: 'Twitter (1200x675)'
        }
    ];
    const onDrop = async (acceptedFiles)=>{
        const file = acceptedFiles[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setError(null);
    };
    const { getRootProps, getInputProps, isDragActive } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"])({
        onDrop,
        accept: {
            'image/*': [
                '.png',
                '.jpg',
                '.jpeg',
                '.webp'
            ]
        },
        maxFiles: 1
    });
    const handleGenerate = async ()=>{
        if (!image) return;
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('size', size);
            const response = await fetch('/api/tools/thumbnail-generator', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante la generazione');
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setResult(url);
        } catch (err) {
            setError(err.message);
        } finally{
            setLoading(false);
        }
    };
    const handleDownload = ()=>{
        if (!result) return;
        const a = document.createElement('a');
        a.href = result;
        a.download = `thumbnail_${size}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    const handleReset = ()=>{
        setImage(null);
        setPreview(null);
        setResult(null);
        setError(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: !preview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ...getRootProps(),
            style: {
                ...styles.dropzone,
                ...isDragActive ? styles.dropzoneActive : {}
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    ...getInputProps()
                }, void 0, false, {
                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                    lineNumber: 94,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiUpload"], {
                    style: styles.uploadIcon
                }, void 0, false, {
                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                    lineNumber: 95,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: styles.dropzoneTitle,
                    children: isDragActive ? 'Rilascia qui...' : 'Carica un\'immagine'
                }, void 0, false, {
                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                    lineNumber: 96,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: styles.dropzoneSubtitle,
                    children: "PNG, JPG, JPEG o WEBP"
                }, void 0, false, {
                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                    lineNumber: 99,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/tools/ThumbnailGenerator.js",
            lineNumber: 87,
            columnNumber: 17
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: styles.editorSection,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.sizeSelector,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: styles.sectionTitle,
                            children: "Dimensione thumbnail"
                        }, void 0, false, {
                            fileName: "[project]/components/tools/ThumbnailGenerator.js",
                            lineNumber: 104,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.sizesGrid,
                            children: sizes.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSize(s.id),
                                    style: {
                                        ...styles.sizeButton,
                                        ...size === s.id ? styles.sizeButtonActive : {}
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: styles.sizeButtonText,
                                        children: s.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/ThumbnailGenerator.js",
                                        lineNumber: 115,
                                        columnNumber: 37
                                    }, this)
                                }, s.id, false, {
                                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                                    lineNumber: 107,
                                    columnNumber: 33
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/tools/ThumbnailGenerator.js",
                            lineNumber: 105,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                    lineNumber: 103,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.imagesGrid,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.imageBox,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    style: styles.imageTitle,
                                    children: "Originale"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                                    lineNumber: 123,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.imageContainer,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: preview,
                                        alt: "Original",
                                        style: styles.image
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/ThumbnailGenerator.js",
                                        lineNumber: 125,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                                    lineNumber: 124,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/ThumbnailGenerator.js",
                            lineNumber: 122,
                            columnNumber: 25
                        }, this),
                        result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.imageBox,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    style: styles.imageTitle,
                                    children: "Thumbnail"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                                    lineNumber: 134,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.imageContainer,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: result,
                                        alt: "Result",
                                        style: styles.image
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/ThumbnailGenerator.js",
                                        lineNumber: 136,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                                    lineNumber: 135,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/ThumbnailGenerator.js",
                            lineNumber: 133,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                    lineNumber: 121,
                    columnNumber: 21
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.errorBox,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: styles.errorText,
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/components/tools/ThumbnailGenerator.js",
                        lineNumber: 148,
                        columnNumber: 29
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                    lineNumber: 147,
                    columnNumber: 25
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.actionsRow,
                    children: [
                        !result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleGenerate,
                            disabled: loading,
                            style: {
                                ...styles.button,
                                ...styles.buttonPrimary,
                                ...loading ? styles.buttonDisabled : {}
                            },
                            children: loading ? 'Generazione...' : 'Genera Thumbnail'
                        }, void 0, false, {
                            fileName: "[project]/components/tools/ThumbnailGenerator.js",
                            lineNumber: 154,
                            columnNumber: 29
                        }, this),
                        result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleDownload,
                            style: {
                                ...styles.button,
                                ...styles.buttonSuccess
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiDownload"], {
                                    style: {
                                        width: 20,
                                        height: 20
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                                    lineNumber: 171,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Scarica"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                                    lineNumber: 172,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/ThumbnailGenerator.js",
                            lineNumber: 167,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleReset,
                            style: {
                                ...styles.button,
                                ...styles.buttonSecondary
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiX"], {
                                    style: {
                                        width: 20,
                                        height: 20
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                                    lineNumber: 179,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Reset"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                                    lineNumber: 180,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/ThumbnailGenerator.js",
                            lineNumber: 175,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/ThumbnailGenerator.js",
                    lineNumber: 152,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/tools/ThumbnailGenerator.js",
            lineNumber: 102,
            columnNumber: 17
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/tools/ThumbnailGenerator.js",
        lineNumber: 85,
        columnNumber: 9
    }, this);
}
_s(ThumbnailGenerator, "gu1faIcMBpb0IYaIp1za97Qs0zk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"]
    ];
});
_c = ThumbnailGenerator;
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    dropzone: {
        border: '2px dashed rgba(148, 163, 184, 0.3)',
        borderRadius: '16px',
        padding: '48px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
        background: 'rgba(15, 23, 42, 0.4)'
    },
    dropzoneActive: {
        borderColor: '#667eea',
        background: 'rgba(102, 126, 234, 0.1)'
    },
    uploadIcon: {
        width: '64px',
        height: '64px',
        margin: '0 auto 16px',
        color: '#94a3b8'
    },
    dropzoneTitle: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#e6eef8',
        margin: '0 0 8px'
    },
    dropzoneSubtitle: {
        fontSize: '14px',
        color: '#94a3b8',
        margin: 0
    },
    editorSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    sizeSelector: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#94a3b8',
        margin: 0
    },
    sizesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
    },
    sizeButton: {
        padding: '12px 16px',
        borderRadius: '12px',
        border: '2px solid rgba(148, 163, 184, 0.2)',
        background: 'rgba(15, 23, 42, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left'
    },
    sizeButtonActive: {
        borderColor: '#667eea',
        background: 'rgba(102, 126, 234, 0.1)'
    },
    sizeButtonText: {
        color: '#e6eef8',
        fontWeight: 500,
        margin: 0,
        fontSize: '14px'
    },
    imagesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
    },
    imageBox: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    imageTitle: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#94a3b8',
        margin: 0
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid rgba(148, 163, 184, 0.2)',
        background: 'rgba(15, 23, 42, 0.4)'
    },
    image: {
        width: '100%',
        height: 'auto',
        maxHeight: '400px',
        objectFit: 'contain',
        display: 'block'
    },
    errorBox: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '2px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '16px'
    },
    errorText: {
        color: '#ef4444',
        margin: 0
    },
    actionsRow: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 24px',
        borderRadius: '12px',
        border: 'none',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        flex: 1,
        minWidth: '140px'
    },
    buttonPrimary: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    buttonSuccess: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    },
    buttonSecondary: {
        background: 'rgba(51, 65, 85, 0.8)',
        color: '#cbd5e1'
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    }
};
var _c;
__turbopack_context__.k.register(_c, "ThumbnailGenerator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/tools/CombineSplitPDF.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CombineSplitPDF
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-dropzone/dist/es/index.js [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/bs/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function CombineSplitPDF() {
    _s();
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('combine'); // 'combine' o 'split'
    const [files, setFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [processing, setProcessing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Per split PDF
    const [splitRanges, setSplitRanges] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const { getRootProps, getInputProps, isDragActive } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"])({
        accept: {
            'application/pdf': [
                '.pdf'
            ]
        },
        multiple: mode === 'combine',
        onDrop: {
            "CombineSplitPDF.useDropzone": (acceptedFiles)=>{
                setError('');
                setResult(null);
                if (mode === 'combine') {
                    setFiles([
                        ...files,
                        ...acceptedFiles
                    ]);
                } else {
                    setFiles([
                        acceptedFiles[0]
                    ]);
                }
            }
        }["CombineSplitPDF.useDropzone"]
    });
    const removeFile = (index)=>{
        setFiles(files.filter((_, i)=>i !== index));
    };
    const moveFile = (index, direction)=>{
        const newFiles = [
            ...files
        ];
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < files.length) {
            [newFiles[index], newFiles[newIndex]] = [
                newFiles[newIndex],
                newFiles[index]
            ];
            setFiles(newFiles);
        }
    };
    const handleProcess = async ()=>{
        if (files.length === 0) {
            setError('Carica almeno un file PDF');
            return;
        }
        if (mode === 'combine' && files.length < 2) {
            setError('Carica almeno 2 file PDF da combinare');
            return;
        }
        setProcessing(true);
        setError('');
        setResult(null);
        try {
            const formData = new FormData();
            formData.append('mode', mode);
            if (mode === 'combine') {
                files.forEach((file, index)=>{
                    formData.append('files', file);
                });
            } else {
                formData.append('file', files[0]);
                formData.append('ranges', splitRanges);
            }
            const response = await fetch('/api/tools/combine-split-pdf', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                // Verifica se la risposta è JSON
                const contentType = response.headers.get('content-type');
                let errorMessage = 'Errore durante l\'elaborazione del PDF';
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                    } catch (e) {
                        // Se il parsing JSON fallisce, usa il messaggio di default
                        errorMessage = response.status === 413 ? 'File troppo grande. Dimensione massima: 50MB per file' : `Errore ${response.status}: ${response.statusText}`;
                    }
                } else {
                    // Se la risposta non è JSON, estrai il testo o usa un messaggio generico
                    try {
                        const text = await response.text();
                        errorMessage = response.status === 413 ? 'File troppo grande. Dimensione massima: 50MB per file' : text || `Errore ${response.status}: ${response.statusText}`;
                    } catch (e) {
                        errorMessage = response.status === 413 ? 'File troppo grande. Dimensione massima: 50MB per file' : `Errore ${response.status}: ${response.statusText}`;
                    }
                }
                throw new Error(errorMessage);
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setResult({
                url,
                filename: mode === 'combine' ? 'combined.pdf' : 'split.pdf'
            });
        } catch (err) {
            console.error('Errore:', err);
            setError(err.message || 'Errore durante l\'elaborazione del PDF');
        } finally{
            setProcessing(false);
        }
    };
    const handleDownload = ()=>{
        if (result) {
            const link = document.createElement('a');
            link.href = result.url;
            link.download = result.filename;
            link.click();
        }
    };
    const resetAll = ()=>{
        setFiles([]);
        setResult(null);
        setError('');
        setSplitRanges('');
    };
    const styles = {
        container: {
            maxWidth: '900px',
            margin: '0 auto',
            padding: '20px'
        },
        modeSelector: {
            display: 'flex',
            gap: '10px',
            marginBottom: '30px',
            justifyContent: 'center'
        },
        modeBtn: {
            padding: '12px 30px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: '#e0e0e0',
            color: '#333'
        },
        modeBtnActive: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
        },
        dropzone: {
            border: '3px dashed #ccc',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: '#fafafa',
            marginBottom: '20px'
        },
        dropzoneActive: {
            borderColor: '#667eea',
            background: '#f0f4ff'
        },
        dropzoneIcon: {
            fontSize: '48px',
            color: '#667eea',
            marginBottom: '15px'
        },
        dropzoneText: {
            fontSize: '16px',
            color: '#666',
            margin: '10px 0'
        },
        filesList: {
            marginTop: '20px',
            marginBottom: '20px'
        },
        fileItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px',
            background: 'white',
            borderRadius: '8px',
            marginBottom: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        },
        fileInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flex: 1
        },
        fileIcon: {
            fontSize: '24px',
            color: '#dc2626'
        },
        fileName: {
            fontSize: '14px',
            color: '#333',
            fontWeight: '500'
        },
        fileActions: {
            display: 'flex',
            gap: '8px'
        },
        actionBtn: {
            padding: '6px 12px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            background: '#f3f4f6',
            color: '#333',
            transition: 'background 0.2s'
        },
        removeBtn: {
            background: '#fee2e2',
            color: '#dc2626'
        },
        splitInput: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '8px'
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
        },
        hint: {
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '5px'
        },
        processBtn: {
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            marginTop: '20px'
        },
        processBtnDisabled: {
            opacity: 0.6,
            cursor: 'not-allowed'
        },
        error: {
            padding: '15px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#dc2626',
            marginTop: '20px',
            fontSize: '14px'
        },
        result: {
            marginTop: '30px',
            padding: '25px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center'
        },
        successIcon: {
            fontSize: '48px',
            color: '#10b981',
            marginBottom: '15px'
        },
        resultTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '20px'
        },
        downloadBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 30px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s',
            marginRight: '10px'
        },
        resetBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 30px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.modeSelector,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            setMode('combine');
                            resetAll();
                        },
                        style: {
                            ...styles.modeBtn,
                            ...mode === 'combine' ? styles.modeBtnActive : {}
                        },
                        children: "Combina PDF"
                    }, void 0, false, {
                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                        lineNumber: 340,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            setMode('split');
                            resetAll();
                        },
                        style: {
                            ...styles.modeBtn,
                            ...mode === 'split' ? styles.modeBtnActive : {}
                        },
                        children: "Splitta PDF"
                    }, void 0, false, {
                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                        lineNumber: 349,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/CombineSplitPDF.js",
                lineNumber: 339,
                columnNumber: 13
            }, this),
            mode === 'combine' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ...getRootProps(),
                        style: {
                            ...styles.dropzone,
                            ...isDragActive ? styles.dropzoneActive : {}
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ...getInputProps()
                            }, void 0, false, {
                                fileName: "[project]/components/tools/CombineSplitPDF.js",
                                lineNumber: 369,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsFilePdf"], {
                                style: styles.dropzoneIcon
                            }, void 0, false, {
                                fileName: "[project]/components/tools/CombineSplitPDF.js",
                                lineNumber: 370,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.dropzoneText,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "Trascina qui i file PDF"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                                        lineNumber: 372,
                                        columnNumber: 29
                                    }, this),
                                    " oppure clicca per selezionarli"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/CombineSplitPDF.js",
                                lineNumber: 371,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    ...styles.dropzoneText,
                                    fontSize: '14px',
                                    color: '#999'
                                },
                                children: "Aggiungi almeno 2 file PDF da combinare"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/CombineSplitPDF.js",
                                lineNumber: 374,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                        lineNumber: 362,
                        columnNumber: 21
                    }, this),
                    files.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.filesList,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    marginBottom: '15px',
                                    color: '#333'
                                },
                                children: [
                                    "File da combinare (",
                                    files.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/CombineSplitPDF.js",
                                lineNumber: 381,
                                columnNumber: 29
                            }, this),
                            files.map((file, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.fileItem,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: styles.fileInfo,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsFilePdf"], {
                                                    style: styles.fileIcon
                                                }, void 0, false, {
                                                    fileName: "[project]/components/tools/CombineSplitPDF.js",
                                                    lineNumber: 387,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: styles.fileName,
                                                    children: file.name
                                                }, void 0, false, {
                                                    fileName: "[project]/components/tools/CombineSplitPDF.js",
                                                    lineNumber: 388,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/tools/CombineSplitPDF.js",
                                            lineNumber: 386,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: styles.fileActions,
                                            children: [
                                                index > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>moveFile(index, -1),
                                                    style: styles.actionBtn,
                                                    children: "↑"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/tools/CombineSplitPDF.js",
                                                    lineNumber: 392,
                                                    columnNumber: 45
                                                }, this),
                                                index < files.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>moveFile(index, 1),
                                                    style: styles.actionBtn,
                                                    children: "↓"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/tools/CombineSplitPDF.js",
                                                    lineNumber: 400,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>removeFile(index),
                                                    style: {
                                                        ...styles.actionBtn,
                                                        ...styles.removeBtn
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsX"], {}, void 0, false, {
                                                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                                                        lineNumber: 411,
                                                        columnNumber: 45
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/tools/CombineSplitPDF.js",
                                                    lineNumber: 407,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/tools/CombineSplitPDF.js",
                                            lineNumber: 390,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "[project]/components/tools/CombineSplitPDF.js",
                                    lineNumber: 385,
                                    columnNumber: 33
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                        lineNumber: 380,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ...getRootProps(),
                        style: {
                            ...styles.dropzone,
                            ...isDragActive ? styles.dropzoneActive : {}
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ...getInputProps()
                            }, void 0, false, {
                                fileName: "[project]/components/tools/CombineSplitPDF.js",
                                lineNumber: 428,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsFilePdf"], {
                                style: styles.dropzoneIcon
                            }, void 0, false, {
                                fileName: "[project]/components/tools/CombineSplitPDF.js",
                                lineNumber: 429,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.dropzoneText,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "Trascina qui il file PDF"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                                        lineNumber: 431,
                                        columnNumber: 29
                                    }, this),
                                    " oppure clicca per selezionarlo"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/CombineSplitPDF.js",
                                lineNumber: 430,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    ...styles.dropzoneText,
                                    fontSize: '14px',
                                    color: '#999'
                                },
                                children: "Seleziona un singolo file PDF da dividere"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/CombineSplitPDF.js",
                                lineNumber: 433,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                        lineNumber: 421,
                        columnNumber: 21
                    }, this),
                    files.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.filesList,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.fileItem,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.fileInfo,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsFilePdf"], {
                                            style: styles.fileIcon
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/CombineSplitPDF.js",
                                            lineNumber: 442,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: styles.fileName,
                                            children: files[0].name
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/CombineSplitPDF.js",
                                            lineNumber: 443,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/tools/CombineSplitPDF.js",
                                    lineNumber: 441,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setFiles([]),
                                    style: {
                                        ...styles.actionBtn,
                                        ...styles.removeBtn
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsX"], {}, void 0, false, {
                                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                                        lineNumber: 449,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/CombineSplitPDF.js",
                                    lineNumber: 445,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/CombineSplitPDF.js",
                            lineNumber: 440,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                        lineNumber: 439,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.splitInput,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: styles.label,
                                children: "Specifica le pagine da estrarre"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/CombineSplitPDF.js",
                                lineNumber: 456,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                style: styles.input,
                                placeholder: "es: 1-3,5,7-10",
                                value: splitRanges,
                                onChange: (e)=>setSplitRanges(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/components/tools/CombineSplitPDF.js",
                                lineNumber: 459,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.hint,
                                children: "Inserisci pagine singole (5) o intervalli (1-3) separati da virgola"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/CombineSplitPDF.js",
                                lineNumber: 466,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                        lineNumber: 455,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true),
            !result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleProcess,
                disabled: processing || files.length === 0 || mode === 'combine' && files.length < 2,
                style: {
                    ...styles.processBtn,
                    ...processing || files.length === 0 || mode === 'combine' && files.length < 2 ? styles.processBtnDisabled : {}
                },
                children: processing ? 'Elaborazione in corso...' : mode === 'combine' ? 'Combina PDF' : 'Splitta PDF'
            }, void 0, false, {
                fileName: "[project]/components/tools/CombineSplitPDF.js",
                lineNumber: 474,
                columnNumber: 17
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.error,
                children: error
            }, void 0, false, {
                fileName: "[project]/components/tools/CombineSplitPDF.js",
                lineNumber: 487,
                columnNumber: 17
            }, this),
            result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.result,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiCheckCircle"], {
                        style: styles.successIcon
                    }, void 0, false, {
                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                        lineNumber: 494,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        style: styles.resultTitle,
                        children: mode === 'combine' ? 'PDF Combinato con Successo!' : 'PDF Splittato con Successo!'
                    }, void 0, false, {
                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                        lineNumber: 495,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleDownload,
                        style: styles.downloadBtn,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsDownload"], {}, void 0, false, {
                                fileName: "[project]/components/tools/CombineSplitPDF.js",
                                lineNumber: 499,
                                columnNumber: 25
                            }, this),
                            " Scarica PDF"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                        lineNumber: 498,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: resetAll,
                        style: styles.resetBtn,
                        children: "Nuova Operazione"
                    }, void 0, false, {
                        fileName: "[project]/components/tools/CombineSplitPDF.js",
                        lineNumber: 501,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/CombineSplitPDF.js",
                lineNumber: 493,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/tools/CombineSplitPDF.js",
        lineNumber: 338,
        columnNumber: 9
    }, this);
}
_s(CombineSplitPDF, "LAhyUKIrg1CXSBEQQ5MmokK8LRE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"]
    ];
});
_c = CombineSplitPDF;
var _c;
__turbopack_context__.k.register(_c, "CombineSplitPDF");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/tools/VideoCompressor.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VideoCompressor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-dropzone/dist/es/index.js [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/bs/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function VideoCompressor() {
    _s();
    const [video, setVideo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [preview, setPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [quality, setQuality] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('medium');
    const [originalSize, setOriginalSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [compressedSize, setCompressedSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const qualityOptions = [
        {
            value: 'low',
            label: 'Bassa (massima compressione)',
            bitrate: '500k'
        },
        {
            value: 'medium',
            label: 'Media (bilanciata)',
            bitrate: '1000k'
        },
        {
            value: 'high',
            label: 'Alta (qualità preservata)',
            bitrate: '2000k'
        }
    ];
    const onDrop = async (acceptedFiles)=>{
        const file = acceptedFiles[0];
        if (!file) return;
        setVideo(file);
        setOriginalSize(file.size);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setError(null);
        setCompressedSize(null);
    };
    const { getRootProps, getInputProps, isDragActive } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"])({
        onDrop,
        accept: {
            'video/*': [
                '.mp4',
                '.avi',
                '.mov',
                '.mkv',
                '.webm',
                '.flv',
                '.wmv'
            ]
        },
        maxFiles: 1
    });
    const handleCompress = async ()=>{
        if (!video) return;
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('video', video);
            formData.append('quality', quality);
            const response = await fetch('/api/tools/compress-video', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante la compressione');
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setResult(url);
            setCompressedSize(blob.size);
        } catch (err) {
            setError(err.message);
        } finally{
            setLoading(false);
        }
    };
    const handleDownload = ()=>{
        if (!result) return;
        const a = document.createElement('a');
        a.href = result;
        a.download = `compressed_${video.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    const handleReset = ()=>{
        setVideo(null);
        setPreview(null);
        setResult(null);
        setError(null);
        setOriginalSize(null);
        setCompressedSize(null);
    };
    const formatFileSize = (bytes)=>{
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = [
            'B',
            'KB',
            'MB',
            'GB'
        ];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };
    const compressionRatio = originalSize && compressedSize ? Math.round((1 - compressedSize / originalSize) * 100) : null;
    const styles = {
        container: {
            maxWidth: '900px',
            margin: '0 auto',
            padding: '20px'
        },
        dropzone: {
            border: '3px dashed rgba(148, 163, 184, 0.3)',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'rgba(15, 23, 42, 0.4)'
        },
        dropzoneActive: {
            borderColor: '#667eea',
            background: 'rgba(102, 126, 234, 0.1)'
        },
        uploadIcon: {
            fontSize: '64px',
            color: '#667eea',
            marginBottom: '20px'
        },
        dropzoneText: {
            fontSize: '18px',
            fontWeight: 600,
            color: '#e6eef8',
            margin: '10px 0'
        },
        dropzoneSubtext: {
            fontSize: '14px',
            color: '#94a3b8',
            margin: '5px 0'
        },
        qualitySelector: {
            marginTop: '30px',
            marginBottom: '20px'
        },
        qualityLabel: {
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#94a3b8',
            marginBottom: '12px'
        },
        qualityOptions: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        qualityOption: {
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid rgba(148, 163, 184, 0.2)',
            background: 'rgba(15, 23, 42, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left'
        },
        qualityOptionActive: {
            borderColor: '#667eea',
            background: 'rgba(102, 126, 234, 0.1)'
        },
        qualityOptionLabel: {
            color: '#e6eef8',
            fontWeight: 500,
            fontSize: '14px',
            margin: 0
        },
        videoPreview: {
            marginTop: '30px',
            marginBottom: '20px'
        },
        videoContainer: {
            position: 'relative',
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid rgba(148, 163, 184, 0.2)',
            background: 'rgba(15, 23, 42, 0.4)'
        },
        video: {
            width: '100%',
            height: 'auto',
            maxHeight: '400px',
            display: 'block'
        },
        fileInfo: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '8px',
            marginTop: '15px'
        },
        fileInfoText: {
            fontSize: '14px',
            color: '#94a3b8',
            margin: 0
        },
        compressionStats: {
            display: 'flex',
            gap: '20px',
            marginTop: '15px',
            padding: '15px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px'
        },
        statItem: {
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
        },
        statLabel: {
            fontSize: '12px',
            color: '#94a3b8'
        },
        statValue: {
            fontSize: '16px',
            fontWeight: 600,
            color: '#10b981'
        },
        actionsRow: {
            display: 'flex',
            gap: '12px',
            marginTop: '30px',
            flexWrap: 'wrap'
        },
        button: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 24px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            flex: 1,
            minWidth: '140px'
        },
        buttonPrimary: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        },
        buttonSuccess: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        },
        buttonSecondary: {
            background: 'rgba(51, 65, 85, 0.8)',
            color: '#cbd5e1'
        },
        buttonDisabled: {
            opacity: 0.5,
            cursor: 'not-allowed'
        },
        errorBox: {
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '20px'
        },
        errorText: {
            color: '#ef4444',
            margin: 0
        },
        resultBox: {
            marginTop: '30px',
            padding: '25px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            textAlign: 'center'
        },
        successIcon: {
            fontSize: '48px',
            color: '#10b981',
            marginBottom: '15px'
        },
        resultTitle: {
            fontSize: '18px',
            fontWeight: 600,
            color: '#e6eef8',
            marginBottom: '20px'
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: !preview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ...getRootProps(),
            style: {
                ...styles.dropzone,
                ...isDragActive ? styles.dropzoneActive : {}
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    ...getInputProps()
                }, void 0, false, {
                    fileName: "[project]/components/tools/VideoCompressor.js",
                    lineNumber: 311,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsCameraVideo"], {
                    style: styles.uploadIcon
                }, void 0, false, {
                    fileName: "[project]/components/tools/VideoCompressor.js",
                    lineNumber: 312,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: styles.dropzoneText,
                    children: isDragActive ? 'Rilascia qui...' : 'Carica un video'
                }, void 0, false, {
                    fileName: "[project]/components/tools/VideoCompressor.js",
                    lineNumber: 313,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: styles.dropzoneSubtext,
                    children: "MP4, AVI, MOV, MKV, WEBM, FLV, WMV"
                }, void 0, false, {
                    fileName: "[project]/components/tools/VideoCompressor.js",
                    lineNumber: 316,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/tools/VideoCompressor.js",
            lineNumber: 304,
            columnNumber: 17
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.qualitySelector,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            style: styles.qualityLabel,
                            children: "Qualità di compressione"
                        }, void 0, false, {
                            fileName: "[project]/components/tools/VideoCompressor.js",
                            lineNumber: 323,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.qualityOptions,
                            children: qualityOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setQuality(opt.value),
                                    style: {
                                        ...styles.qualityOption,
                                        ...quality === opt.value ? styles.qualityOptionActive : {}
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: styles.qualityOptionLabel,
                                        children: opt.label
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/VideoCompressor.js",
                                        lineNumber: 334,
                                        columnNumber: 37
                                    }, this)
                                }, opt.value, false, {
                                    fileName: "[project]/components/tools/VideoCompressor.js",
                                    lineNumber: 326,
                                    columnNumber: 33
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/tools/VideoCompressor.js",
                            lineNumber: 324,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/VideoCompressor.js",
                    lineNumber: 322,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.videoPreview,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.videoContainer,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                                src: preview,
                                controls: true,
                                style: styles.video
                            }, void 0, false, {
                                fileName: "[project]/components/tools/VideoCompressor.js",
                                lineNumber: 342,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/tools/VideoCompressor.js",
                            lineNumber: 341,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.fileInfo,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: styles.fileInfoText,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "File originale:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/VideoCompressor.js",
                                            lineNumber: 350,
                                            columnNumber: 33
                                        }, this),
                                        " ",
                                        video.name
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/tools/VideoCompressor.js",
                                    lineNumber: 349,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: styles.fileInfoText,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Dimensione:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/VideoCompressor.js",
                                            lineNumber: 353,
                                            columnNumber: 33
                                        }, this),
                                        " ",
                                        formatFileSize(originalSize)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/tools/VideoCompressor.js",
                                    lineNumber: 352,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/VideoCompressor.js",
                            lineNumber: 348,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/VideoCompressor.js",
                    lineNumber: 340,
                    columnNumber: 21
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.errorBox,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: styles.errorText,
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/components/tools/VideoCompressor.js",
                        lineNumber: 360,
                        columnNumber: 29
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/tools/VideoCompressor.js",
                    lineNumber: 359,
                    columnNumber: 25
                }, this),
                !result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.actionsRow,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleCompress,
                            disabled: loading,
                            style: {
                                ...styles.button,
                                ...styles.buttonPrimary,
                                ...loading ? styles.buttonDisabled : {}
                            },
                            children: loading ? 'Compressione in corso...' : 'Comprimi Video'
                        }, void 0, false, {
                            fileName: "[project]/components/tools/VideoCompressor.js",
                            lineNumber: 366,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleReset,
                            style: {
                                ...styles.button,
                                ...styles.buttonSecondary
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsX"], {
                                    style: {
                                        width: 20,
                                        height: 20
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/VideoCompressor.js",
                                    lineNumber: 381,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Reset"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/VideoCompressor.js",
                                    lineNumber: 382,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/VideoCompressor.js",
                            lineNumber: 377,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/VideoCompressor.js",
                    lineNumber: 365,
                    columnNumber: 25
                }, this),
                result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.resultBox,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiCheckCircle"], {
                                style: styles.successIcon
                            }, void 0, false, {
                                fileName: "[project]/components/tools/VideoCompressor.js",
                                lineNumber: 390,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: styles.resultTitle,
                                children: "Video compresso con successo!"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/VideoCompressor.js",
                                lineNumber: 391,
                                columnNumber: 33
                            }, this),
                            compressionRatio !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.compressionStats,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.statItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.statLabel,
                                                children: "Dimensione originale"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/VideoCompressor.js",
                                                lineNumber: 396,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.statValue,
                                                children: formatFileSize(originalSize)
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/VideoCompressor.js",
                                                lineNumber: 397,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/tools/VideoCompressor.js",
                                        lineNumber: 395,
                                        columnNumber: 41
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.statItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.statLabel,
                                                children: "Dimensione compressa"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/VideoCompressor.js",
                                                lineNumber: 400,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.statValue,
                                                children: formatFileSize(compressedSize)
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/VideoCompressor.js",
                                                lineNumber: 401,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/tools/VideoCompressor.js",
                                        lineNumber: 399,
                                        columnNumber: 41
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.statItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.statLabel,
                                                children: "Riduzione"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/VideoCompressor.js",
                                                lineNumber: 404,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.statValue,
                                                children: [
                                                    compressionRatio,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/tools/VideoCompressor.js",
                                                lineNumber: 405,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/tools/VideoCompressor.js",
                                        lineNumber: 403,
                                        columnNumber: 41
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/VideoCompressor.js",
                                lineNumber: 394,
                                columnNumber: 37
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.actionsRow,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleDownload,
                                        style: {
                                            ...styles.button,
                                            ...styles.buttonSuccess
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsDownload"], {
                                                style: {
                                                    width: 20,
                                                    height: 20
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/VideoCompressor.js",
                                                lineNumber: 415,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Scarica Video"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/VideoCompressor.js",
                                                lineNumber: 416,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/tools/VideoCompressor.js",
                                        lineNumber: 411,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleReset,
                                        style: {
                                            ...styles.button,
                                            ...styles.buttonSecondary
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsX"], {
                                                style: {
                                                    width: 20,
                                                    height: 20
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/VideoCompressor.js",
                                                lineNumber: 422,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Nuovo Video"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/VideoCompressor.js",
                                                lineNumber: 423,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/tools/VideoCompressor.js",
                                        lineNumber: 418,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/VideoCompressor.js",
                                lineNumber: 410,
                                columnNumber: 33
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/VideoCompressor.js",
                        lineNumber: 389,
                        columnNumber: 29
                    }, this)
                }, void 0, false)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/components/tools/VideoCompressor.js",
        lineNumber: 302,
        columnNumber: 9
    }, this);
}
_s(VideoCompressor, "0NveUfZZqTxpHPLsERdmVxNgy54=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"]
    ];
});
_c = VideoCompressor;
var _c;
__turbopack_context__.k.register(_c, "VideoCompressor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/tools/DocumentTranslator.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DocumentTranslator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-dropzone/dist/es/index.js [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/bs/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProBadge$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ProBadge.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
function DocumentTranslator() {
    _s();
    const [document, setDocument] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [targetLanguage, setTargetLanguage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('en');
    const [preserveFormatting, setPreserveFormatting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const languages = [
        {
            code: 'en',
            name: 'Inglese'
        },
        {
            code: 'es',
            name: 'Spagnolo'
        },
        {
            code: 'fr',
            name: 'Francese'
        },
        {
            code: 'de',
            name: 'Tedesco'
        },
        {
            code: 'it',
            name: 'Italiano'
        },
        {
            code: 'pt',
            name: 'Portoghese'
        },
        {
            code: 'ru',
            name: 'Russo'
        },
        {
            code: 'zh',
            name: 'Cinese'
        },
        {
            code: 'ja',
            name: 'Giapponese'
        },
        {
            code: 'ko',
            name: 'Coreano'
        },
        {
            code: 'ar',
            name: 'Arabo'
        },
        {
            code: 'hi',
            name: 'Hindi'
        }
    ];
    const onDrop = async (acceptedFiles)=>{
        const file = acceptedFiles[0];
        if (!file) return;
        setDocument(file);
        setResult(null);
        setError(null);
    };
    const { getRootProps, getInputProps, isDragActive } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"])({
        onDrop,
        accept: {
            'application/pdf': [
                '.pdf'
            ],
            'application/msword': [
                '.doc'
            ],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
                '.docx'
            ],
            'text/plain': [
                '.txt'
            ],
            'text/markdown': [
                '.md'
            ]
        },
        maxFiles: 1
    });
    const handleTranslate = async ()=>{
        if (!document) return;
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('document', document);
            formData.append('targetLanguage', targetLanguage);
            formData.append('preserveFormatting', preserveFormatting.toString());
            const response = await fetch('/api/tools/translate-document', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                // Prova a leggere come JSON, altrimenti usa il testo
                let errorMessage = 'Errore durante la traduzione';
                let errorData = null;
                try {
                    errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (jsonError) {
                    // Se non è JSON, prova a leggere come testo
                    try {
                        const errorText = await response.text();
                        if (errorText) {
                            errorMessage = errorText;
                        } else {
                            errorMessage = `Errore ${response.status}: ${response.statusText || 'Errore del server'}`;
                        }
                    } catch (textError) {
                        errorMessage = `Errore ${response.status}: ${response.statusText || 'Errore del server'}`;
                    }
                }
                // Se è un errore di limite, mostra messaggio di upgrade
                if (errorData && errorData.requiresPro) {
                    const limitError = new Error(errorMessage);
                    limitError.isLimitError = true;
                    limitError.upgradeMessage = errorData.upgradeMessage || 'Passa a PRO per utilizzare questo tool senza limiti!';
                    limitError.limitType = errorData.limitType;
                    limitError.current = errorData.current;
                    limitError.max = errorData.max;
                    throw limitError;
                }
                throw new Error(errorMessage);
            }
            // Verifica che la risposta sia un blob valido
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/') && !contentType.includes('text/')) {
                throw new Error('Risposta del server non valida. Il documento potrebbe non essere stato tradotto correttamente.');
            }
            const blob = await response.blob();
            // Verifica che il blob non sia vuoto
            if (blob.size === 0) {
                throw new Error('Il documento tradotto è vuoto. Riprova con un file diverso.');
            }
            const url = URL.createObjectURL(blob);
            // Determina il nome del file in base al tipo originale
            const ext = document.name.split('.').pop();
            const filename = `translated_${targetLanguage}_${document.name}`;
            setResult({
                url,
                filename
            });
        } catch (err) {
            console.error('Errore traduzione:', err);
            setError(err.message || 'Errore sconosciuto durante la traduzione. Riprova più tardi.');
        } finally{
            setLoading(false);
        }
    };
    const handleDownload = ()=>{
        if (!result) return;
        const a = document.createElement('a');
        a.href = result.url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    const handleReset = ()=>{
        setDocument(null);
        setResult(null);
        setError(null);
    };
    const styles = {
        container: {
            maxWidth: '900px',
            margin: '0 auto',
            padding: '20px'
        },
        dropzone: {
            border: '3px dashed rgba(148, 163, 184, 0.3)',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'rgba(15, 23, 42, 0.4)'
        },
        dropzoneActive: {
            border: '3px dashed #667eea',
            background: 'rgba(102, 126, 234, 0.1)'
        },
        uploadIcon: {
            fontSize: '64px',
            color: '#667eea',
            marginBottom: '20px'
        },
        dropzoneText: {
            fontSize: '18px',
            fontWeight: 600,
            color: '#e6eef8',
            margin: '10px 0'
        },
        dropzoneSubtext: {
            fontSize: '14px',
            color: '#94a3b8',
            margin: '5px 0'
        },
        optionsSection: {
            marginTop: '30px',
            marginBottom: '20px'
        },
        optionGroup: {
            marginBottom: '24px'
        },
        optionLabel: {
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#94a3b8',
            marginBottom: '12px'
        },
        languageSelect: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid rgba(148, 163, 184, 0.2)',
            background: 'rgba(15, 23, 42, 0.6)',
            color: '#e6eef8',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        checkboxContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid rgba(148, 163, 184, 0.2)',
            background: 'rgba(15, 23, 42, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        checkbox: {
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            accentColor: '#667eea'
        },
        checkboxLabel: {
            color: '#e6eef8',
            fontSize: '14px',
            cursor: 'pointer',
            margin: 0
        },
        fileInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '15px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            marginTop: '20px',
            marginBottom: '20px'
        },
        fileIcon: {
            fontSize: '32px',
            color: '#667eea'
        },
        fileDetails: {
            flex: 1
        },
        fileName: {
            fontSize: '16px',
            fontWeight: 600,
            color: '#e6eef8',
            margin: 0,
            marginBottom: '4px'
        },
        fileSize: {
            fontSize: '14px',
            color: '#94a3b8',
            margin: 0
        },
        actionsRow: {
            display: 'flex',
            gap: '12px',
            marginTop: '30px',
            flexWrap: 'wrap'
        },
        button: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 24px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            flex: 1,
            minWidth: '140px'
        },
        buttonPrimary: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        },
        buttonSuccess: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        },
        buttonSecondary: {
            background: 'rgba(51, 65, 85, 0.8)',
            color: '#cbd5e1'
        },
        buttonDisabled: {
            opacity: 0.5,
            cursor: 'not-allowed'
        },
        errorBox: {
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '20px'
        },
        errorText: {
            color: '#ef4444',
            margin: 0
        },
        resultBox: {
            marginTop: '30px',
            padding: '25px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            textAlign: 'center'
        },
        successIcon: {
            fontSize: '48px',
            color: '#10b981',
            marginBottom: '15px'
        },
        resultTitle: {
            fontSize: '18px',
            fontWeight: 600,
            color: '#e6eef8',
            marginBottom: '20px'
        },
        resultInfo: {
            fontSize: '14px',
            color: '#94a3b8',
            marginBottom: '20px'
        },
        proInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap'
        },
        proInfoText: {
            fontSize: '13px',
            color: '#cbd5e1',
            margin: 0,
            flex: 1,
            lineHeight: '1.6'
        },
        proLink: {
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '600',
            marginLeft: '8px',
            transition: 'color 0.2s'
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.proInfo,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProBadge$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                        size: "medium"
                    }, void 0, false, {
                        fileName: "[project]/components/tools/DocumentTranslator.js",
                        lineNumber: 366,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: styles.proInfoText,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Piano Gratuito:"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 368,
                                columnNumber: 21
                            }, this),
                            " 5 documenti/giorno •",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/pricing",
                                style: styles.proLink,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "Passa a PRO"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/DocumentTranslator.js",
                                    lineNumber: 370,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 369,
                                columnNumber: 21
                            }, this),
                            " per utilizzi illimitati"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/DocumentTranslator.js",
                        lineNumber: 367,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/DocumentTranslator.js",
                lineNumber: 365,
                columnNumber: 13
            }, this),
            !document ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ...getRootProps(),
                style: {
                    ...styles.dropzone,
                    ...isDragActive ? styles.dropzoneActive : {}
                },
                role: "button",
                "aria-label": "Area di caricamento documento. Trascina un file qui o clicca per selezionare",
                tabIndex: 0,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ...getInputProps(),
                        "aria-label": "Seleziona documento da tradurre (PDF, DOC, DOCX, TXT, MD)",
                        title: "Seleziona documento da tradurre"
                    }, void 0, false, {
                        fileName: "[project]/components/tools/DocumentTranslator.js",
                        lineNumber: 386,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsTranslate"], {
                        style: styles.uploadIcon
                    }, void 0, false, {
                        fileName: "[project]/components/tools/DocumentTranslator.js",
                        lineNumber: 391,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: styles.dropzoneText,
                        children: isDragActive ? 'Rilascia qui...' : 'Carica un documento'
                    }, void 0, false, {
                        fileName: "[project]/components/tools/DocumentTranslator.js",
                        lineNumber: 392,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: styles.dropzoneSubtext,
                        children: "PDF, DOC, DOCX, TXT, MD"
                    }, void 0, false, {
                        fileName: "[project]/components/tools/DocumentTranslator.js",
                        lineNumber: 395,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/DocumentTranslator.js",
                lineNumber: 376,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.optionsSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.optionGroup,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "targetLanguage",
                                        style: styles.optionLabel,
                                        children: "Lingua di destinazione"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/DocumentTranslator.js",
                                        lineNumber: 403,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        id: "targetLanguage",
                                        name: "targetLanguage",
                                        value: targetLanguage,
                                        onChange: (e)=>setTargetLanguage(e.target.value),
                                        style: styles.languageSelect,
                                        "aria-label": "Seleziona lingua di destinazione",
                                        children: languages.map((lang)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: lang.code,
                                                children: lang.name
                                            }, lang.code, false, {
                                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                                lineNumber: 413,
                                                columnNumber: 37
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/DocumentTranslator.js",
                                        lineNumber: 404,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 402,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.optionGroup,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.checkboxContainer,
                                    onClick: ()=>setPreserveFormatting(!preserveFormatting),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "preserveFormatting",
                                            name: "preserveFormatting",
                                            type: "checkbox",
                                            checked: preserveFormatting,
                                            onChange: (e)=>setPreserveFormatting(e.target.checked),
                                            style: styles.checkbox,
                                            "aria-label": "Mantieni la formattazione originale"
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/DocumentTranslator.js",
                                            lineNumber: 425,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "preserveFormatting",
                                            style: styles.checkboxLabel,
                                            children: "Mantieni la formattazione originale"
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/DocumentTranslator.js",
                                            lineNumber: 434,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/tools/DocumentTranslator.js",
                                    lineNumber: 421,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 420,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/DocumentTranslator.js",
                        lineNumber: 401,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.fileInfo,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsFileText"], {
                                style: styles.fileIcon
                            }, void 0, false, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 442,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.fileDetails,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: styles.fileName,
                                        children: document.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/DocumentTranslator.js",
                                        lineNumber: 444,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: styles.fileSize,
                                        children: [
                                            (document.size / 1024).toFixed(2),
                                            " KB"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/tools/DocumentTranslator.js",
                                        lineNumber: 445,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 443,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleReset,
                                "aria-label": "Rimuovi documento",
                                title: "Rimuovi documento",
                                style: {
                                    padding: '8px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    color: '#ef4444'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsX"], {
                                    style: {
                                        width: 20,
                                        height: 20
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/DocumentTranslator.js",
                                    lineNumber: 462,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 449,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/DocumentTranslator.js",
                        lineNumber: 441,
                        columnNumber: 21
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.errorBox,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.errorText,
                                children: error.split('\n').map((line, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            line,
                                            index < error.split('\n').length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                                lineNumber: 472,
                                                columnNumber: 82
                                            }, this)
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/components/tools/DocumentTranslator.js",
                                        lineNumber: 470,
                                        columnNumber: 37
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 468,
                                columnNumber: 29
                            }, this),
                            error.includes('limite') || error.includes('Limite') || error.includes('raggiunto') ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '15px'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                                        border: '1px solid rgba(102, 126, 234, 0.3)',
                                        borderRadius: '12px',
                                        marginBottom: '12px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: '0 0 12px 0',
                                                fontSize: '15px',
                                                color: '#cbd5e1',
                                                fontWeight: '600'
                                            },
                                            children: "🚀 Passa a PRO per utilizzare questo tool senza limiti!"
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/DocumentTranslator.js",
                                            lineNumber: 487,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: '0 0 16px 0',
                                                fontSize: '14px',
                                                color: '#94a3b8'
                                            },
                                            children: "Con PRO ottieni utilizzi illimitati, file più grandi e funzionalità avanzate."
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/DocumentTranslator.js",
                                            lineNumber: 490,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/pricing",
                                            style: {
                                                display: 'inline-block',
                                                padding: '10px 20px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: '#fff',
                                                borderRadius: '8px',
                                                textDecoration: 'none',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                transition: 'transform 0.2s'
                                            },
                                            children: "Vedi Piani PRO →"
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/DocumentTranslator.js",
                                            lineNumber: 493,
                                            columnNumber: 41
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/tools/DocumentTranslator.js",
                                    lineNumber: 480,
                                    columnNumber: 37
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 479,
                                columnNumber: 33
                            }, this) : (error.includes('limite di richieste') || error.includes('rate')) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '15px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '12px',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            borderRadius: '8px',
                                            marginBottom: '12px'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: 0,
                                                fontSize: '14px',
                                                color: '#93c5fd'
                                            },
                                            children: [
                                                "💡 ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Suggerimento:"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/tools/DocumentTranslator.js",
                                                    lineNumber: 512,
                                                    columnNumber: 48
                                                }, this),
                                                " Se il PDF contiene testo nativo (non scansionato), prova a convertirlo in DOCX o TXT usando il tool di conversione, poi traduci il file convertito."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/tools/DocumentTranslator.js",
                                            lineNumber: 511,
                                            columnNumber: 41
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/DocumentTranslator.js",
                                        lineNumber: 510,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleTranslate,
                                        disabled: loading,
                                        style: {
                                            ...styles.button,
                                            ...styles.buttonPrimary,
                                            ...loading ? styles.buttonDisabled : {},
                                            width: '100%',
                                            marginTop: '10px'
                                        },
                                        children: loading ? 'Riprova in corso...' : '🔄 Riprova Traduzione'
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/DocumentTranslator.js",
                                        lineNumber: 516,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 509,
                                columnNumber: 33
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/DocumentTranslator.js",
                        lineNumber: 467,
                        columnNumber: 25
                    }, this),
                    !result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.actionsRow,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleTranslate,
                                disabled: loading,
                                style: {
                                    ...styles.button,
                                    ...styles.buttonPrimary,
                                    ...loading ? styles.buttonDisabled : {}
                                },
                                children: loading ? 'Traduzione in corso...' : 'Traduci Documento'
                            }, void 0, false, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 536,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleReset,
                                style: {
                                    ...styles.button,
                                    ...styles.buttonSecondary
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsX"], {
                                        style: {
                                            width: 20,
                                            height: 20
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/DocumentTranslator.js",
                                        lineNumber: 551,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Reset"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/DocumentTranslator.js",
                                        lineNumber: 552,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 547,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/DocumentTranslator.js",
                        lineNumber: 535,
                        columnNumber: 25
                    }, this),
                    result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.resultBox,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiCheckCircle"], {
                                style: styles.successIcon
                            }, void 0, false, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 559,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: styles.resultTitle,
                                children: "Documento tradotto con successo!"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 560,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.resultInfo,
                                children: [
                                    "Traduzione in ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: languages.find((l)=>l.code === targetLanguage)?.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/DocumentTranslator.js",
                                        lineNumber: 562,
                                        columnNumber: 47
                                    }, this),
                                    " completata"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 561,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.actionsRow,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleDownload,
                                        style: {
                                            ...styles.button,
                                            ...styles.buttonSuccess
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsDownload"], {
                                                style: {
                                                    width: 20,
                                                    height: 20
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                                lineNumber: 569,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Scarica Documento"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                                lineNumber: 570,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/tools/DocumentTranslator.js",
                                        lineNumber: 565,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleReset,
                                        style: {
                                            ...styles.button,
                                            ...styles.buttonSecondary
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["BsX"], {
                                                style: {
                                                    width: 20,
                                                    height: 20
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                                lineNumber: 576,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Nuovo Documento"
                                            }, void 0, false, {
                                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                                lineNumber: 577,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/tools/DocumentTranslator.js",
                                        lineNumber: 572,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/DocumentTranslator.js",
                                lineNumber: 564,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/DocumentTranslator.js",
                        lineNumber: 558,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/components/tools/DocumentTranslator.js",
        lineNumber: 363,
        columnNumber: 9
    }, this);
}
_s(DocumentTranslator, "6v8qdxrBKiIuOypnbc26QS++SbI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"]
    ];
});
_c = DocumentTranslator;
var _c;
__turbopack_context__.k.register(_c, "DocumentTranslator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/tools/Upscaler.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// components/tools/Upscaler.js - Wrapper component for Upscaler tool
__turbopack_context__.s([
    "default",
    ()=>Upscaler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProBadge$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ProBadge.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
;
;
// Safe analytics loader: defers import to client and no-ops if unavailable
function useSafeAnalytics() {
    _s();
    const [a, setA] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSafeAnalytics.useEffect": ()=>{
            let mounted = true;
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            __turbopack_context__.A("[project]/lib/analytics.js [client] (ecmascript, async loader)").then({
                "useSafeAnalytics.useEffect": (mod)=>{
                    if (mounted) setA(mod);
                }
            }["useSafeAnalytics.useEffect"]).catch({
                "useSafeAnalytics.useEffect": ()=>{}
            }["useSafeAnalytics.useEffect"]);
            return ({
                "useSafeAnalytics.useEffect": ()=>{
                    mounted = false;
                }
            })["useSafeAnalytics.useEffect"];
        }
    }["useSafeAnalytics.useEffect"], []);
    const noop = ()=>{};
    return a || {
        pageview: noop,
        event: noop,
        trackFileUpload: noop,
        trackToolStart: noop,
        trackToolComplete: noop,
        trackConversion: noop,
        trackDownload: noop,
        trackError: noop
    };
}
_s(useSafeAnalytics, "GF4E8ykYQmdG0v+kwz1SzN7ajoQ=");
function Upscaler() {
    _s1();
    const analytics = useSafeAnalytics();
    const [originalFile, setOriginalFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [originalUrl, setOriginalUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [upscaledUrl, setUpscaledUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [sliderPos, setSliderPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(50);
    const [upscaledResolution, setUpscaledResolution] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const sliderRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const dragging = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const rafId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const pendingPos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const onFileSelect = (file)=>{
        if (!file || !file.type?.startsWith('image/')) {
            setStatus('Seleziona un file immagine.');
            return;
        }
        setOriginalFile(file);
        const url = URL.createObjectURL(file);
        setOriginalUrl(url);
        setUpscaledUrl(null);
        setStatus(`Selezionato: ${file.name}`);
        // Track file upload
        try {
            analytics.trackFileUpload(file.type, file.size, 'Image Upscaler');
            analytics.trackToolStart('Image Upscaler', file.type, file.size);
        } catch  {}
    };
    const onDrop = (e)=>{
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        onFileSelect(f);
    };
    const handleUpscale = async ()=>{
        if (!originalFile) return;
        setLoading(true);
        setProgress(0);
        setStatus('Preparazione immagine...');
        const startTime = Date.now();
        // Simula progresso durante l'upscaling
        const progressInterval = setInterval(()=>{
            setProgress((prev)=>{
                const newProgress = Math.min(prev + 3, 95);
                if (newProgress < 20) {
                    setStatus('Analisi immagine...');
                } else if (newProgress < 40) {
                    setStatus('Denoising e pre-processing...');
                } else if (newProgress < 60) {
                    setStatus('Upscaling multi-pass in corso...');
                } else if (newProgress < 80) {
                    setStatus('Micro-ricostruzione pixel...');
                } else if (newProgress < 95) {
                    setStatus('Enhancement finale e ottimizzazione...');
                }
                return newProgress;
            });
        }, 300);
        const fd = new FormData();
        fd.append('image', originalFile);
        try {
            const res = await fetch('/api/upscale', {
                method: 'POST',
                body: fd
            });
            const j = await res.json();
            if (!res.ok) {
                // Se è un errore di limite, crea un errore speciale
                if (j.requiresPro || j.limitType) {
                    const limitError = new Error(j.error || 'Limite raggiunto');
                    limitError.isLimitError = true;
                    limitError.upgradeMessage = j.upgradeMessage || 'Passa a PRO per utilizzare questo tool senza limiti!';
                    limitError.limitType = j.limitType;
                    limitError.current = j.current;
                    limitError.max = j.max;
                    throw limitError;
                }
                throw new Error(j.details || j.error || 'Upscale failed');
            }
            clearInterval(progressInterval);
            setProgress(100);
            setStatus('Completato!');
            // Estrai risoluzione dall'immagine upscalata
            const img = new Image();
            img.onload = ()=>{
                setUpscaledResolution(`${img.width}x${img.height}`);
            };
            img.src = j.url;
            const duration = Date.now() - startTime;
            try {
                analytics.trackToolComplete('Image Upscaler', duration, true);
                analytics.trackConversion('image_upscale', originalFile.type, 'upscaled_image', originalFile.size, duration);
            } catch  {}
            setUpscaledUrl(j.url);
            setTimeout(()=>{
                setProgress(0);
                setStatus('');
            }, 2000);
        } catch (err) {
            clearInterval(progressInterval);
            const duration = Date.now() - startTime;
            try {
                analytics.trackToolComplete('Image Upscaler', duration, false);
                analytics.trackError(err.message, 'Upscaler', 'upscale_error');
            } catch  {}
            // Mostra messaggio di errore con upgrade se è un limite
            if (err.isLimitError) {
                setStatus(`⚠️ ${err.message} ${err.upgradeMessage ? `- ${err.upgradeMessage}` : ''}`);
            } else {
                setStatus(`Errore: ${err.message}`);
            }
            setProgress(0);
        } finally{
            setLoading(false);
        }
    };
    const handleDownload = async ()=>{
        if (!upscaledUrl) return;
        try {
            const res = await fetch(upscaledUrl);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `upscaled-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            // Track download
            try {
                analytics.trackDownload('jpg', 'Image Upscaler', blob.size);
            } catch  {}
        } catch (e) {
            try {
                analytics.trackError(e.message, 'Upscaler', 'download_error');
            } catch  {}
            console.error('Download failed:', e);
        }
    };
    // Slider interactions using Pointer Events for consistent mouse/touch/pen dragging
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Upscaler.useEffect": ()=>{
            try {
                if (("TURBOPACK compile-time value", "object") === 'undefined' || typeof document === 'undefined') return;
                const el = sliderRef.current;
                if (!el || !upscaledUrl) return;
                const getPercent = {
                    "Upscaler.useEffect.getPercent": (clientX)=>{
                        const r = el.getBoundingClientRect();
                        const x = Math.min(Math.max(clientX - r.left, 0), r.width);
                        return x / r.width * 100;
                    }
                }["Upscaler.useEffect.getPercent"];
                const commit = {
                    "Upscaler.useEffect.commit": ()=>{
                        if (pendingPos.current == null) return;
                        setSliderPos(pendingPos.current);
                        rafId.current = null;
                        pendingPos.current = null;
                    }
                }["Upscaler.useEffect.commit"];
                const schedule = {
                    "Upscaler.useEffect.schedule": ()=>{
                        if (rafId.current) return;
                        rafId.current = requestAnimationFrame(commit);
                    }
                }["Upscaler.useEffect.schedule"];
                const onPointerDown = {
                    "Upscaler.useEffect.onPointerDown": (e)=>{
                        dragging.current = true;
                        try {
                            el.setPointerCapture(e.pointerId);
                        } catch  {}
                        pendingPos.current = getPercent(e.clientX);
                        schedule();
                    }
                }["Upscaler.useEffect.onPointerDown"];
                const onPointerMove = {
                    "Upscaler.useEffect.onPointerMove": (e)=>{
                        if (!dragging.current) return;
                        pendingPos.current = getPercent(e.clientX);
                        schedule();
                    }
                }["Upscaler.useEffect.onPointerMove"];
                const onPointerUp = {
                    "Upscaler.useEffect.onPointerUp": (e)=>{
                        dragging.current = false;
                        try {
                            el.releasePointerCapture(e.pointerId);
                        } catch  {}
                    }
                }["Upscaler.useEffect.onPointerUp"];
                el.addEventListener('pointerdown', onPointerDown);
                el.addEventListener('pointermove', onPointerMove);
                el.addEventListener('pointerup', onPointerUp);
                el.addEventListener('pointercancel', onPointerUp);
                return ({
                    "Upscaler.useEffect": ()=>{
                        el.removeEventListener('pointerdown', onPointerDown);
                        el.removeEventListener('pointermove', onPointerMove);
                        el.removeEventListener('pointerup', onPointerUp);
                        el.removeEventListener('pointercancel', onPointerUp);
                    }
                })["Upscaler.useEffect"];
            } catch (e) {
                try {
                    analytics.trackError(e.message, 'Upscaler', 'slider_init_error');
                } catch  {}
            }
        }
    }["Upscaler.useEffect"], [
        upscaledUrl
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.proInfo,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProBadge$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                        size: "medium"
                    }, void 0, false, {
                        fileName: "[project]/components/tools/Upscaler.js",
                        lineNumber: 239,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: styles.proInfoText,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Piano Gratuito:"
                            }, void 0, false, {
                                fileName: "[project]/components/tools/Upscaler.js",
                                lineNumber: 241,
                                columnNumber: 11
                            }, this),
                            " 5 documenti/giorno •",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/pricing",
                                style: styles.proLink,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "Passa a PRO"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 243,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/tools/Upscaler.js",
                                lineNumber: 242,
                                columnNumber: 11
                            }, this),
                            " per utilizzi illimitati"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/Upscaler.js",
                        lineNumber: 240,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/Upscaler.js",
                lineNumber: 238,
                columnNumber: 7
            }, this),
            !originalUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.card,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    id: "upscaler-dropzone",
                    onDrop: onDrop,
                    onDragOver: (e)=>e.preventDefault(),
                    onDragEnter: (e)=>e.preventDefault(),
                    style: styles.dropzone,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.dropzoneContent,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiPhotograph"], {
                                    style: styles.dropzoneIcon
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 258,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: styles.dropzoneText,
                                    children: "Trascina qui la tua immagine o clicca per selezionare"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 259,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.fileFormats,
                                    children: "JPG, PNG, WebP supportati"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 260,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/Upscaler.js",
                            lineNumber: 257,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            id: "fileInput",
                            type: "file",
                            accept: "image/*",
                            onChange: (e)=>{
                                const file = e.target.files?.[0];
                                if (file) onFileSelect(file);
                            },
                            style: styles.fileInput
                        }, void 0, false, {
                            fileName: "[project]/components/tools/Upscaler.js",
                            lineNumber: 262,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/Upscaler.js",
                    lineNumber: 250,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/tools/Upscaler.js",
                lineNumber: 249,
                columnNumber: 9
            }, this),
            originalUrl && !upscaledUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.card,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.controls,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            style: loading ? {
                                ...styles.btnPrimary,
                                ...styles.btnPrimaryDisabled
                            } : styles.btnPrimary,
                            onClick: handleUpscale,
                            disabled: loading,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiUpload"], {
                                    style: styles.btnIcon
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 284,
                                    columnNumber: 15
                                }, this),
                                loading ? 'Upscaling…' : 'Upscale a 4K'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/Upscaler.js",
                            lineNumber: 279,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/tools/Upscaler.js",
                        lineNumber: 278,
                        columnNumber: 11
                    }, this),
                    loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.progressContainer,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.progressBar,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        ...styles.progressFill,
                                        width: `${progress}%`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 291,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/tools/Upscaler.js",
                                lineNumber: 290,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.progressText,
                                children: [
                                    progress,
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/tools/Upscaler.js",
                                lineNumber: 293,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/Upscaler.js",
                        lineNumber: 289,
                        columnNumber: 13
                    }, this),
                    status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...styles.status,
                            ...status.includes('⚠️') || status.includes('limite') || status.includes('Limite') || status.includes('raggiunto') ? {
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#fca5a5'
                            } : {}
                        },
                        children: [
                            status,
                            (status.includes('limite') || status.includes('Limite') || status.includes('raggiunto')) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '12px'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/pricing",
                                    style: {
                                        display: 'inline-block',
                                        padding: '8px 16px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        fontSize: '13px'
                                    },
                                    children: "Vedi Piani PRO →"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 308,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/tools/Upscaler.js",
                                lineNumber: 307,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tools/Upscaler.js",
                        lineNumber: 297,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/Upscaler.js",
                lineNumber: 277,
                columnNumber: 9
            }, this),
            !originalUrl && status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...styles.status,
                    ...status.includes('⚠️') || status.includes('limite') || status.includes('Limite') || status.includes('raggiunto') ? {
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5'
                    } : {}
                },
                children: [
                    status,
                    (status.includes('limite') || status.includes('Limite') || status.includes('raggiunto')) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: '12px'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/pricing",
                            style: {
                                display: 'inline-block',
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '13px'
                            },
                            children: "Vedi Piani PRO →"
                        }, void 0, false, {
                            fileName: "[project]/components/tools/Upscaler.js",
                            lineNumber: 339,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/tools/Upscaler.js",
                        lineNumber: 338,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tools/Upscaler.js",
                lineNumber: 328,
                columnNumber: 9
            }, this),
            originalUrl && upscaledUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.card,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.result,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: sliderRef,
                            style: styles.slider,
                            role: "slider",
                            "aria-valuemin": 0,
                            "aria-valuemax": 100,
                            "aria-valuenow": Math.round(sliderPos),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: originalUrl,
                                    alt: "Originale",
                                    style: styles.sliderImg
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 367,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.badgeLeft,
                                    children: "Originale"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 368,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        ...styles.clip,
                                        clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: upscaledUrl,
                                        alt: "Upscalata",
                                        style: styles.sliderImg
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/Upscaler.js",
                                        lineNumber: 375,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 369,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        ...styles.divider,
                                        left: `${sliderPos}%`,
                                        transform: 'translateX(-50%)'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.handle,
                                        children: "↔"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tools/Upscaler.js",
                                        lineNumber: 384,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 377,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.badgeRight,
                                    children: upscaledResolution ? `${upscaledResolution} 4K` : 'Upscalata 4K'
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 386,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/Upscaler.js",
                            lineNumber: 359,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.downloadActions,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleDownload,
                                    style: styles.btnDownload,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiDownload"], {
                                            style: styles.btnIcon
                                        }, void 0, false, {
                                            fileName: "[project]/components/tools/Upscaler.js",
                                            lineNumber: 392,
                                            columnNumber: 17
                                        }, this),
                                        "Download"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 391,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: upscaledUrl,
                                    target: "_blank",
                                    rel: "noreferrer",
                                    style: styles.openLink,
                                    children: "Apri a piena risoluzione"
                                }, void 0, false, {
                                    fileName: "[project]/components/tools/Upscaler.js",
                                    lineNumber: 395,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/tools/Upscaler.js",
                            lineNumber: 390,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/tools/Upscaler.js",
                    lineNumber: 358,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/tools/Upscaler.js",
                lineNumber: 357,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/tools/Upscaler.js",
        lineNumber: 236,
        columnNumber: 5
    }, this);
}
_s1(Upscaler, "wNgHioV0HNnsJVOALLY+63lzodU=", false, function() {
    return [
        useSafeAnalytics
    ];
});
_c = Upscaler;
const styles = {
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    proInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        background: 'rgba(102, 126, 234, 0.1)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
    },
    proInfoText: {
        fontSize: '13px',
        color: '#cbd5e1',
        margin: 0,
        flex: 1,
        lineHeight: '1.6'
    },
    proLink: {
        color: '#667eea',
        textDecoration: 'none',
        fontWeight: '600',
        marginLeft: '8px',
        transition: 'color 0.2s'
    },
    card: {
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        marginBottom: '32px'
    },
    dropzone: {
        border: '2px dashed rgba(148, 163, 184, 0.4)',
        padding: 'clamp(32px, 5vw, 48px)',
        borderRadius: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative',
        minHeight: 'clamp(240px, 35vh, 320px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        width: '100%',
        visibility: 'visible',
        opacity: 1
    },
    dropzoneContent: {
        pointerEvents: 'none',
        position: 'relative',
        zIndex: 1
    },
    dropzoneIcon: {
        width: '64px',
        height: '64px',
        color: '#667eea',
        margin: '0 auto 16px',
        opacity: 0.9,
        filter: 'drop-shadow(0 0 8px rgba(102, 126, 234, 0.4))',
        transition: 'all 0.3s ease'
    },
    dropzoneText: {
        fontSize: 'clamp(15px, 2.5vw, 18px)',
        color: '#e2e8f0',
        margin: '0 0 12px',
        fontWeight: 600,
        letterSpacing: '-0.01em'
    },
    fileFormats: {
        fontSize: '13px',
        color: '#64748b',
        fontWeight: 500
    },
    fileInput: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        cursor: 'pointer',
        zIndex: 2
    },
    controls: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 'clamp(20px, 3vw, 28px)',
        gap: '12px',
        flexWrap: 'wrap'
    },
    btnPrimary: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 700,
        borderRadius: '12px',
        fontSize: 'clamp(15px, 2.5vw, 16px)',
        padding: '14px 28px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: '200% 200%',
        color: '#fff',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 20px rgba(102, 126, 234, 0.3)',
        letterSpacing: '0.01em'
    },
    btnPrimaryDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none !important'
    },
    btnDownload: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 700,
        borderRadius: '12px',
        fontSize: 'clamp(15px, 2.5vw, 16px)',
        padding: '14px 28px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        backgroundSize: '200% 200%',
        color: '#fff',
        boxShadow: '0 8px 16px rgba(67, 233, 123, 0.3)'
    },
    btnIcon: {
        width: '20px',
        height: '20px',
        transition: 'transform 0.3s ease'
    },
    status: {
        marginTop: 'clamp(16px, 2vw, 20px)',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 'clamp(14px, 2vw, 16px)',
        minHeight: '24px',
        padding: '14px 20px',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        fontWeight: 500,
        transition: 'all 0.3s ease'
    },
    result: {
        marginTop: 'clamp(24px, 3vw, 32px)',
        textAlign: 'center',
        width: '100%'
    },
    slider: {
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        height: 'clamp(450px, 80vh, 800px)',
        background: '#0b0f18',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'ew-resize',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(102, 126, 234, 0.3)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        transition: 'box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        margin: '0 auto'
    },
    sliderImg: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        background: '#000',
        transition: 'opacity 0.3s ease'
    },
    clip: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
    },
    divider: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '3px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 100%)',
        boxShadow: '0 0 12px rgba(255,255,255,0.6), 0 0 20px rgba(102, 126, 234, 0.4)',
        filter: 'drop-shadow(0 0 8px rgba(102, 126, 234, 0.5))'
    },
    handle: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'clamp(44px, 8vw, 56px)',
        height: 'clamp(44px, 8vw, 56px)',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: '200% 200%',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 'clamp(18px, 3vw, 22px)',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.5), 0 0 0 4px rgba(255,255,255,0.15), 0 0 20px rgba(102, 126, 234, 0.4)',
        pointerEvents: 'none',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    badgeLeft: {
        position: 'absolute',
        top: 'clamp(12px, 2vw, 16px)',
        left: 'clamp(12px, 2vw, 16px)',
        padding: 'clamp(6px, 1vw, 10px) clamp(10px, 1.5vw, 14px)',
        borderRadius: '999px',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(16px)',
        color: '#fff',
        fontWeight: 700,
        fontSize: 'clamp(11px, 1.8vw, 14px)',
        letterSpacing: '0.5px',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease'
    },
    badgeRight: {
        position: 'absolute',
        top: 'clamp(12px, 2vw, 16px)',
        right: 'clamp(12px, 2vw, 16px)',
        padding: 'clamp(6px, 1vw, 10px) clamp(10px, 1.5vw, 14px)',
        borderRadius: '999px',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(16px)',
        color: '#fff',
        fontWeight: 700,
        fontSize: 'clamp(11px, 1.8vw, 14px)',
        letterSpacing: '0.5px',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease'
    },
    downloadActions: {
        marginTop: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
    },
    openLink: {
        color: '#60a5fa',
        fontSize: '14px',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'color 0.2s'
    },
    progressContainer: {
        marginTop: '20px',
        width: '100%'
    },
    progressBar: {
        width: '100%',
        height: '8px',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: '200% 100%',
        borderRadius: '4px',
        transition: 'width 0.3s ease',
        animation: 'gradientShift 2s ease infinite'
    },
    progressText: {
        marginTop: '8px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#94a3b8',
        fontWeight: 500
    }
};
var _c;
__turbopack_context__.k.register(_c, "Upscaler");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/pages/tools/[slug].js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__N_SSG",
    ()=>__N_SSG,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/head.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/tools.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$conversionRegistry$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/conversionRegistry.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GenericConverter$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/GenericConverter.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Navbar$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Navbar.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$BackgroundRemover$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tools/BackgroundRemover.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$ImageGenerator$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tools/ImageGenerator.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$CleanNoise$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tools/CleanNoise.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$AudioTranscription$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tools/AudioTranscription.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$OCRAdvanced$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tools/OCRAdvanced.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$TextSummarizer$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tools/TextSummarizer.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$GrammarChecker$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tools/GrammarChecker.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$ThumbnailGenerator$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tools/ThumbnailGenerator.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$CombineSplitPDF$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tools/CombineSplitPDF.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$VideoCompressor$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tools/VideoCompressor.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$DocumentTranslator$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tools/DocumentTranslator.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$Upscaler$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tools/Upscaler.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProBadge$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ProBadge.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
;
;
;
const ToolPage = ({ initialSlug, meta })=>{
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const slug = initialSlug || router.query.slug;
    // First try AI tools list, then conversion registry.
    const aiTool = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2e$js__$5b$client$5d$__$28$ecmascript$29$__["tools"].find((t)=>t.href === `/tools/${slug}`);
    const conversionTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$conversionRegistry$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getConversionTool"])(slug);
    const tool = aiTool || conversionTool && {
        title: conversionTool.title,
        description: conversionTool.description,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiArrowRight"] // fallback icon sempre definito
    };
    const otherTools = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2e$js__$5b$client$5d$__$28$ecmascript$29$__["tools"].filter((t)=>t.href !== `/tools/${slug}`).slice(0, 6);
    if (!tool) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Navbar$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 40,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.notFound,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            style: styles.notFoundTitle,
                            children: "404 - Strumento non trovato"
                        }, void 0, false, {
                            fileName: "[project]/pages/tools/[slug].js",
                            lineNumber: 42,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: styles.notFoundText,
                            children: "Lo strumento che stai cercando non esiste o è stato spostato."
                        }, void 0, false, {
                            fileName: "[project]/pages/tools/[slug].js",
                            lineNumber: 43,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 41,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true);
    }
    const renderToolComponent = ()=>{
        if (conversionTool) {
            // Assicurati che il tool abbia lo slug per le card
            const toolWithSlug = {
                ...conversionTool,
                slug: slug
            };
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GenericConverter$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                tool: toolWithSlug
            }, void 0, false, {
                fileName: "[project]/pages/tools/[slug].js",
                lineNumber: 53,
                columnNumber: 20
            }, ("TURBOPACK compile-time value", void 0));
        }
        switch(slug){
            case 'rimozione-sfondo-ai':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$BackgroundRemover$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 57,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            case 'clean-noise-ai':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$CleanNoise$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 59,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            case 'generazione-immagini-ai':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$ImageGenerator$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 61,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            case 'trascrizione-audio':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$AudioTranscription$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 63,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            case 'ocr-avanzato-ai':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$OCRAdvanced$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 65,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            case 'riassunto-testo':
            case 'elabora-e-riassumi':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$TextSummarizer$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 68,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            case 'correttore-grammaticale':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$GrammarChecker$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 70,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            case 'thumbnail-generator':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$ThumbnailGenerator$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 72,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            case 'combina-splitta-pdf':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$CombineSplitPDF$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 74,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            case 'compressione-video':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$VideoCompressor$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 76,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            case 'traduzione-documenti-ai':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$DocumentTranslator$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 78,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            case 'upscaler-ai':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$Upscaler$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 80,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.comingSoon,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            style: styles.comingSoonTitle,
                            children: "Componente in arrivo"
                        }, void 0, false, {
                            fileName: "[project]/pages/tools/[slug].js",
                            lineNumber: 84,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: styles.comingSoonText,
                            children: [
                                "L'interfaccia per lo strumento \"",
                                tool.title,
                                '" è in fase di sviluppo.'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/tools/[slug].js",
                            lineNumber: 85,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/tools/[slug].js",
                    lineNumber: 83,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0));
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.pageWrap,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                        children: `${meta?.title || tool.title} | Suite di Strumenti AI`
                    }, void 0, false, {
                        fileName: "[project]/pages/tools/[slug].js",
                        lineNumber: 96,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "description",
                        content: meta?.description || tool.description
                    }, void 0, false, {
                        fileName: "[project]/pages/tools/[slug].js",
                        lineNumber: 97,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        property: "og:title",
                        content: `${meta?.title || tool.title} | Suite di Strumenti AI`
                    }, void 0, false, {
                        fileName: "[project]/pages/tools/[slug].js",
                        lineNumber: 98,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        property: "og:description",
                        content: meta?.description || tool.description
                    }, void 0, false, {
                        fileName: "[project]/pages/tools/[slug].js",
                        lineNumber: 99,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/pages/tools/[slug].js",
                lineNumber: 95,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Navbar$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/pages/tools/[slug].js",
                lineNumber: 102,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                style: styles.mainContent,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        style: styles.toolHeader,
                        children: [
                            tool.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.iconBadge,
                                children: typeof tool.icon === 'function' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(tool.icon, {
                                    style: styles.iconBadgeIcon
                                }, void 0, false, {
                                    fileName: "[project]/pages/tools/[slug].js",
                                    lineNumber: 109,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiArrowRight"], {
                                    style: styles.iconBadgeIcon
                                }, void 0, false, {
                                    fileName: "[project]/pages/tools/[slug].js",
                                    lineNumber: 111,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/[slug].js",
                                lineNumber: 107,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.titleRow,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        style: styles.toolTitle,
                                        children: tool.title
                                    }, void 0, false, {
                                        fileName: "[project]/pages/tools/[slug].js",
                                        lineNumber: 116,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    aiTool && aiTool.pro && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProBadge$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        size: "medium",
                                        style: {
                                            marginLeft: '12px'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/pages/tools/[slug].js",
                                        lineNumber: 120,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/tools/[slug].js",
                                lineNumber: 115,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.toolDescription,
                                children: tool.description
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/[slug].js",
                                lineNumber: 123,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/tools/[slug].js",
                        lineNumber: 105,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.toolContent,
                        children: renderToolComponent()
                    }, void 0, false, {
                        fileName: "[project]/pages/tools/[slug].js",
                        lineNumber: 128,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.otherToolsSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: styles.otherToolsTitle,
                                children: "Altri strumenti disponibili"
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/[slug].js",
                                lineNumber: 134,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.toolsGrid,
                                children: otherTools.map((t)=>{
                                    const IconComponent = t.icon;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: t.href,
                                        style: styles.toolCard,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: styles.toolCardIcon,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(IconComponent, {
                                                    style: {
                                                        width: 28,
                                                        height: 28,
                                                        color: '#a78bfa'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/tools/[slug].js",
                                                    lineNumber: 141,
                                                    columnNumber: 41
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/pages/tools/[slug].js",
                                                lineNumber: 140,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: styles.toolCardTitle,
                                                children: t.title
                                            }, void 0, false, {
                                                fileName: "[project]/pages/tools/[slug].js",
                                                lineNumber: 143,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: styles.toolCardDesc,
                                                children: t.description
                                            }, void 0, false, {
                                                fileName: "[project]/pages/tools/[slug].js",
                                                lineNumber: 144,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: styles.toolCardFooter,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: styles.toolCardCta,
                                                        children: "Prova ora"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/tools/[slug].js",
                                                        lineNumber: 146,
                                                        columnNumber: 41
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiArrowRight"], {
                                                        style: {
                                                            width: 18,
                                                            height: 18
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/tools/[slug].js",
                                                        lineNumber: 147,
                                                        columnNumber: 41
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/tools/[slug].js",
                                                lineNumber: 145,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, t.href, true, {
                                        fileName: "[project]/pages/tools/[slug].js",
                                        lineNumber: 139,
                                        columnNumber: 33
                                    }, ("TURBOPACK compile-time value", void 0));
                                })
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/[slug].js",
                                lineNumber: 135,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/tools/[slug].js",
                        lineNumber: 133,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/pages/tools/[slug].js",
                lineNumber: 104,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/pages/tools/[slug].js",
        lineNumber: 94,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ToolPage, "fN7XvhJ+p5oE6+Xlo0NJmXpxjC8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ToolPage;
var __N_SSG = true;
const __TURBOPACK__default__export__ = ToolPage;
const styles = {
    pageWrap: {
        minHeight: '100vh',
        background: '#0a0e1a',
        color: '#e6eef8'
    },
    mainContent: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '48px 24px'
    },
    backLink: {
        marginBottom: '32px'
    },
    backLinkBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        color: '#94a3b8',
        textDecoration: 'none',
        transition: 'color 0.2s',
        fontSize: '15px'
    },
    toolHeader: {
        textAlign: 'center',
        marginBottom: '48px'
    },
    iconBadge: {
        display: 'inline-flex',
        padding: '16px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '50%',
        marginBottom: '16px'
    },
    iconBadgeIcon: {
        width: '40px',
        height: '40px',
        color: '#a78bfa'
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '12px'
    },
    toolTitle: {
        fontSize: 'clamp(28px, 5vw, 48px)',
        fontWeight: 800,
        margin: 0,
        letterSpacing: '-0.02em'
    },
    toolDescription: {
        fontSize: '18px',
        color: '#94a3b8',
        marginTop: '8px',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    toolContent: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 24px'
    },
    notFound: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0e1a',
        color: '#e6eef8'
    },
    notFoundTitle: {
        fontSize: '36px',
        fontWeight: 700,
        marginBottom: '16px'
    },
    notFoundText: {
        color: '#94a3b8',
        marginBottom: '32px'
    },
    backBtn: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        background: '#667eea',
        color: '#fff',
        borderRadius: '8px',
        textDecoration: 'none',
        transition: 'background 0.2s',
        fontWeight: 600
    },
    comingSoon: {
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        padding: '48px 32px',
        textAlign: 'center'
    },
    comingSoonTitle: {
        fontSize: '24px',
        fontWeight: 700,
        marginBottom: '16px'
    },
    comingSoonText: {
        color: '#94a3b8'
    },
    otherToolsSection: {
        marginTop: '80px',
        paddingTop: '48px',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)'
    },
    otherToolsTitle: {
        fontSize: '28px',
        fontWeight: 700,
        color: '#f1f5f9',
        marginBottom: '32px',
        textAlign: 'center'
    },
    toolsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
    },
    toolCard: {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
        border: '2px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    },
    toolCardIcon: {
        width: '52px',
        height: '52px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(102, 126, 234, 0.1)',
        borderRadius: '12px'
    },
    toolCardTitle: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#f1f5f9',
        margin: '0 0 8px',
        textDecoration: 'none'
    },
    toolCardDesc: {
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: 1.5,
        margin: '0 0 16px',
        flex: 1
    },
    toolCardFooter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
        color: '#cbd5e1'
    },
    toolCardCta: {
        fontSize: '13px',
        fontWeight: 600
    },
    loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        fontSize: '16px',
        color: '#94a3b8'
    }
};
var _c;
__turbopack_context__.k.register(_c, "ToolPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/tools/[slug].js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/tools/[slug]";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/tools/[slug].js [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/tools/[slug].js\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/tools/[slug].js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__50e24f7f._.js.map