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
"[project]/components/SEOHead.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SEOHead
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/head.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
function SEOHead({ title, description, canonical, toolName, toolCategory, keywords = [], image, type = 'website', locale, alternateLocales = [], faqItems = [], howToSteps = [], articleData = null, videoData = null }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const siteName = 'MegaPixelAI';
    const siteUrl = 'https://best-upscaler-ia.vercel.app';
    const currentLocale = locale || router?.locale || 'en';
    // Fallback per evitare che appaiano le chiavi di traduzione
    const safeTitle = title && !title.startsWith('seo.') ? title : 'Strumenti AI Professionali';
    const safeDescription = description && !description.startsWith('seo.') ? description : 'Piattaforma all-in-one con strumenti AI professionali';
    const fullTitle = `${safeTitle} | ${siteName}`;
    const fullUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
    const ogImage = image || `${siteUrl}/og-image.jpg`;
    // Supported locales
    const supportedLocales = [
        'en',
        'it',
        'es',
        'fr',
        'de',
        'pt',
        'ru',
        'ja',
        'zh',
        'ar',
        'hi',
        'ko'
    ];
    // Generate hreflang tags for all supported locales
    const generateHreflangTags = ()=>{
        const tags = [];
        const basePath = canonical || '/';
        // Add current locale
        tags.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
            rel: "alternate",
            hrefLang: currentLocale,
            href: fullUrl
        }, `hreflang-${currentLocale}`, false, {
            fileName: "[project]/components/SEOHead.js",
            lineNumber: 43,
            columnNumber: 13
        }, this));
        // Add x-default (usually English or main locale)
        tags.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
            rel: "alternate",
            hrefLang: "x-default",
            href: `${siteUrl}${basePath}`
        }, "hreflang-x-default", false, {
            fileName: "[project]/components/SEOHead.js",
            lineNumber: 48,
            columnNumber: 13
        }, this));
        // Add alternate locales
        supportedLocales.forEach((loc)=>{
            if (loc !== currentLocale) {
                const localePath = loc === 'en' ? basePath : `/${loc}${basePath}`;
                tags.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                    rel: "alternate",
                    hrefLang: loc,
                    href: `${siteUrl}${localePath}`
                }, `hreflang-${loc}`, false, {
                    fileName: "[project]/components/SEOHead.js",
                    lineNumber: 56,
                    columnNumber: 21
                }, this));
            }
        });
        return tags;
    };
    // Enhanced Structured Data
    const structuredData = [
        // Organization Schema
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": siteName,
            "url": siteUrl,
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/logo-large.svg`,
                "width": 512,
                "height": 512
            },
            "description": "Professional AI tools platform for image upscaling, PDF conversion, OCR, background removal, image generation, and more",
            "foundingDate": "2024",
            "sameAs": [],
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "availableLanguage": supportedLocales,
                "areaServed": "Worldwide"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "1250",
                "bestRating": "5",
                "worstRating": "1"
            }
        },
        // WebSite Schema
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteName,
            "url": siteUrl,
            "description": "Free AI-powered tools for image upscaling, PDF conversion, OCR, background removal, and more",
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${siteUrl}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            },
            "inLanguage": supportedLocales,
            "publisher": {
                "@type": "Organization",
                "name": siteName
            }
        }
    ];
    // Add SoftwareApplication schema if toolName is provided
    if (toolName) {
        structuredData.push({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": toolName,
            "applicationCategory": toolCategory || "MultimediaApplication",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock"
            },
            "operatingSystem": "Web",
            "description": description,
            "url": fullUrl,
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250",
                "bestRating": "5",
                "worstRating": "1"
            },
            "featureList": [
                "AI-powered processing",
                "High-quality output",
                "Fast processing",
                "Secure and private"
            ]
        });
    }
    // BreadcrumbList if canonical path has multiple segments
    if (canonical && canonical.split('/').filter(Boolean).length > 1) {
        const pathSegments = canonical.split('/').filter(Boolean);
        const breadcrumbItems = pathSegments.map((segment, index)=>{
            const path = '/' + pathSegments.slice(0, index + 1).join('/');
            return {
                "@type": "ListItem",
                "position": index + 1,
                "name": segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
                "item": `${siteUrl}${path}`
            };
        });
        structuredData.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": siteUrl
                },
                ...breadcrumbItems
            ]
        });
    }
    // FAQ Schema for AI crawlers
    if (faqItems && faqItems.length > 0) {
        structuredData.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems.map((faq)=>({
                    "@type": "Question",
                    "name": faq.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq.answer
                    }
                }))
        });
    }
    // HowTo Schema for step-by-step guides
    if (howToSteps && howToSteps.length > 0) {
        structuredData.push({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": title,
            "description": description,
            "step": howToSteps.map((step, index)=>({
                    "@type": "HowToStep",
                    "position": index + 1,
                    "name": step.name,
                    "text": step.text,
                    "image": step.image || ogImage,
                    "url": step.url || fullUrl
                }))
        });
    }
    // Article Schema for blog posts and tool pages
    if (articleData) {
        structuredData.push({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "image": ogImage,
            "author": {
                "@type": "Organization",
                "name": siteName
            },
            "publisher": {
                "@type": "Organization",
                "name": siteName,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${siteUrl}/logo-large.svg`
                }
            },
            ...articleData.datePublished ? {
                "datePublished": articleData.datePublished
            } : {},
            ...articleData.dateModified ? {
                "dateModified": articleData.dateModified
            } : {},
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": fullUrl
            },
            "inLanguage": currentLocale
        });
    }
    // Video Schema if video data is provided
    if (videoData) {
        structuredData.push({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": title,
            "description": description,
            "thumbnailUrl": videoData.thumbnailUrl || ogImage,
            ...videoData.uploadDate ? {
                "uploadDate": videoData.uploadDate
            } : {},
            "duration": videoData.duration,
            "contentUrl": videoData.contentUrl,
            "embedUrl": videoData.embedUrl
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                children: fullTitle
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 262,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "title",
                content: fullTitle
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 263,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "description",
                content: safeDescription
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 264,
                columnNumber: 13
            }, this),
            keywords.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "keywords",
                content: keywords.join(', ')
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 265,
                columnNumber: 37
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "geo.region",
                content: "IT"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 268,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "geo.placename",
                content: "Italy"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 269,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "language",
                content: currentLocale
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 270,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                httpEquiv: "content-language",
                content: currentLocale
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 271,
                columnNumber: 13
            }, this),
            canonical && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                rel: "canonical",
                href: fullUrl
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 274,
                columnNumber: 27
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                rel: "sitemap",
                type: "application/xml",
                href: `${siteUrl}/sitemap.xml`
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 277,
                columnNumber: 13
            }, this),
            generateHreflangTags(),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:type",
                content: type
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 283,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:url",
                content: fullUrl
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 284,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:title",
                content: fullTitle
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 285,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:description",
                content: safeDescription
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 286,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:site_name",
                content: siteName
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 287,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:image",
                content: ogImage
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 288,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:image:width",
                content: "1200"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 289,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:image:height",
                content: "630"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 290,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:image:alt",
                content: title
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 291,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:locale",
                content: currentLocale.replace('-', '_')
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 292,
                columnNumber: 13
            }, this),
            supportedLocales.filter((l)=>l !== currentLocale).map((loc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                    property: "og:locale:alternate",
                    content: loc.replace('-', '_')
                }, `og-locale-${loc}`, false, {
                    fileName: "[project]/components/SEOHead.js",
                    lineNumber: 294,
                    columnNumber: 17
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:card",
                content: "summary_large_image"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 298,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:url",
                content: fullUrl
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 299,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:title",
                content: fullTitle
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 300,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:description",
                content: safeDescription
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 301,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:image",
                content: ogImage
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 302,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:image:alt",
                content: title
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 303,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:site",
                content: "@MegaPixelAI"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 304,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:creator",
                content: "@MegaPixelAI"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 305,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "robots",
                content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 308,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "author",
                content: siteName
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 309,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "copyright",
                content: siteName
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 310,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "revisit-after",
                content: "7 days"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 311,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "distribution",
                content: "global"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 312,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "rating",
                content: "general"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 313,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "application-name",
                content: siteName
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 314,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "generator",
                content: "Next.js"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 315,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "AI-friendly",
                content: "true"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 318,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "format-detection",
                content: "telephone=no"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 319,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "apple-itunes-app",
                content: "app-id="
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 320,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "googlebot",
                content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 323,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "bingbot",
                content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 324,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "slurp",
                content: "index, follow"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 325,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "duckduckbot",
                content: "index, follow"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 326,
                columnNumber: 13
            }, this),
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "google-site-verification",
                content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 330,
                columnNumber: 17
            }, this),
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BING_VERIFICATION && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "msvalidate.01",
                content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BING_VERIFICATION
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 333,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                httpEquiv: "Content-Type",
                content: "text/html; charset=utf-8"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 337,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:type",
                content: type
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 340,
                columnNumber: 13
            }, this),
            type === 'article' && articleData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    articleData.datePublished && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        property: "article:published_time",
                        content: articleData.datePublished
                    }, void 0, false, {
                        fileName: "[project]/components/SEOHead.js",
                        lineNumber: 344,
                        columnNumber: 25
                    }, this),
                    articleData.dateModified && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        property: "article:modified_time",
                        content: articleData.dateModified
                    }, void 0, false, {
                        fileName: "[project]/components/SEOHead.js",
                        lineNumber: 347,
                        columnNumber: 25
                    }, this),
                    articleData.tags && articleData.tags.map((tag, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                            property: "article:tag",
                            content: tag
                        }, `article-tag-${i}`, false, {
                            fileName: "[project]/components/SEOHead.js",
                            lineNumber: 350,
                            columnNumber: 25
                        }, this))
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "mobile-web-app-capable",
                content: "yes"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 356,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "apple-mobile-web-app-capable",
                content: "yes"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 357,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "apple-mobile-web-app-status-bar-style",
                content: "black-translucent"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 358,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "apple-mobile-web-app-title",
                content: siteName
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 359,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "theme-color",
                content: "#667eea"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 362,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "msapplication-TileColor",
                content: "#667eea"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 363,
                columnNumber: 13
            }, this),
            structuredData.map((schema, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                    type: "application/ld+json",
                    dangerouslySetInnerHTML: {
                        __html: JSON.stringify(schema)
                    }
                }, `structured-data-${index}`, false, {
                    fileName: "[project]/components/SEOHead.js",
                    lineNumber: 367,
                    columnNumber: 17
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/components/SEOHead.js",
        lineNumber: 260,
        columnNumber: 9
    }, this);
}
_s(SEOHead, "fN7XvhJ+p5oE6+Xlo0NJmXpxjC8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = SEOHead;
var _c;
__turbopack_context__.k.register(_c, "SEOHead");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Footer.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
const Footer = ()=>{
    _s();
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
        style: styles.footer,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.footerContent,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.footerSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                style: styles.footerTitle,
                                children: "MegaPixelAI"
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 12,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.footerDesc,
                                children: t('footer.description')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 13,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Footer.js",
                        lineNumber: 11,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.footerSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                style: styles.footerTitle,
                                children: t('footer.product')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 16,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/home",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.tools')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 17,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/#features",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.features')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 18,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/pricing",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.pricing')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 19,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Footer.js",
                        lineNumber: 15,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.footerSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                style: styles.footerTitle,
                                children: t('footer.company')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 22,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/about",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.aboutUs')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 23,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/blog",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.blog')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 24,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/contact",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.contact')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 25,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Footer.js",
                        lineNumber: 21,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.footerSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                style: styles.footerTitle,
                                children: t('footer.legal')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 28,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/privacy",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.privacy')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 29,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/terms",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.terms')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 30,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/cookies",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.cookies')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 31,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Footer.js",
                        lineNumber: 27,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/Footer.js",
                lineNumber: 10,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.enterpriseFooter,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        margin: 0,
                        fontSize: '14px',
                        opacity: 0.7
                    },
                    children: t('footer.description')
                }, void 0, false, {
                    fileName: "[project]/components/Footer.js",
                    lineNumber: 35,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/Footer.js",
                lineNumber: 34,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.footerBottom,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: styles.footerCopyright,
                    children: "© 2025 MegaPixelAI. All rights reserved."
                }, void 0, false, {
                    fileName: "[project]/components/Footer.js",
                    lineNumber: 38,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/Footer.js",
                lineNumber: 37,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/Footer.js",
        lineNumber: 9,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Footer, "zlIdU9EjM2llFt74AbE2KsUJXyM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c = Footer;
const __TURBOPACK__default__export__ = /*#__PURE__*/ _c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["memo"])(Footer);
const styles = {
    footer: {
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 14, 26, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(102, 126, 234, 0.3)',
        padding: '50px 24px 24px',
        marginTop: 'auto',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3), 0 0 20px rgba(102, 126, 234, 0.1)'
    },
    footerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
    },
    footerSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    footerTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#e2e8f0',
        margin: '0 0 8px'
    },
    footerDesc: {
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: '1.6',
        margin: 0
    },
    footerLink: {
        fontSize: '14px',
        color: '#94a3b8',
        textDecoration: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        padding: '4px 0',
        position: 'relative',
        display: 'inline-block'
    },
    footerLinkHover: {
        color: '#667eea',
        transform: 'translateX(4px)'
    },
    enterpriseFooter: {
        textAlign: 'center',
        padding: '24px 24px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        color: '#cbd5e1'
    },
    footerBottom: {
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '20px',
        borderTop: '1px solid rgba(102, 126, 234, 0.2)',
        textAlign: 'center'
    },
    footerCopyright: {
        fontSize: '14px',
        color: '#94a3b8',
        margin: 0
    }
};
var _c, _c1;
__turbopack_context__.k.register(_c, "Footer");
__turbopack_context__.k.register(_c1, "%default%");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/pages/tools/rimozione-sfondo-ai.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__N_SSG",
    ()=>__N_SSG,
    "default",
    ()=>RimozioneSfondoAIPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Navbar$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Navbar.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$BackgroundRemover$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tools/BackgroundRemover.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SEOHead$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SEOHead.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Footer$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Footer.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
;
;
;
;
;
;
var __N_SSG = true;
function RimozioneSfondoAIPage({ articleData }) {
    const faqItems = [
        {
            question: "Come funziona la rimozione dello sfondo con AI?",
            answer: "La nostra tecnologia AI utilizza algoritmi avanzati di deep learning per identificare automaticamente il soggetto principale dell'immagine e rimuovere lo sfondo con precisione. Il sistema analizza pixel per pixel per creare un ritaglio preciso e professionale."
        },
        {
            question: "Quali formati di immagine sono supportati?",
            answer: "Supportiamo tutti i formati immagine comuni: JPG, PNG, WEBP, GIF e BMP. Puoi caricare immagini fino a 10MB di dimensione."
        },
        {
            question: "La rimozione dello sfondo è gratuita?",
            answer: "Sì, offriamo un servizio gratuito per la rimozione dello sfondo. Per utenti PRO, offriamo elaborazioni più veloci e immagini ad alta risoluzione senza limiti."
        },
        {
            question: "Quanto tempo richiede l'elaborazione?",
            answer: "L'elaborazione è istantanea per la maggior parte delle immagini. Le immagini più complesse possono richiedere pochi secondi. Gli utenti PRO hanno accesso a elaborazioni prioritarie ancora più veloci."
        },
        {
            question: "Le mie immagini sono sicure?",
            answer: "Assolutamente sì. Tutte le immagini vengono elaborate in modo sicuro e vengono eliminate automaticamente dai nostri server dopo 24 ore. Non condividiamo mai le tue immagini con terze parti."
        },
        {
            question: "Posso rimuovere lo sfondo da più immagini contemporaneamente?",
            answer: "Sì, puoi elaborare più immagini in sequenza. Gli utenti PRO possono elaborare batch di immagini più grandi con elaborazione prioritaria."
        }
    ];
    const howToSteps = [
        {
            name: "Carica l'immagine",
            text: "Trascina e rilascia la tua immagine nell'area di upload oppure clicca per selezionare un file dal tuo computer.",
            image: null,
            url: "/tools/rimozione-sfondo-ai"
        },
        {
            name: "Elaborazione automatica",
            text: "La nostra AI analizza automaticamente l'immagine, identifica il soggetto principale e rimuove lo sfondo con precisione.",
            image: null,
            url: "/tools/rimozione-sfondo-ai"
        },
        {
            name: "Scarica il risultato",
            text: "Una volta completata l'elaborazione, puoi scaricare l'immagine con sfondo trasparente in formato PNG ad alta qualità.",
            image: null,
            url: "/tools/rimozione-sfondo-ai"
        }
    ];
    // articleData is provided via getStaticProps to avoid hydration drift
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.pageWrap,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SEOHead$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                title: "Rimozione Sfondo AI - Strumento Gratuito Online",
                description: "Rimuovi lo sfondo da qualsiasi immagine con un click usando l'intelligenza artificiale. Soggetto rilevato automaticamente, qualità professionale, ritaglio preciso. Gratis, veloce e sicuro. Supporta JPG, PNG, WEBP.",
                canonical: "/tools/rimozione-sfondo-ai",
                toolName: "Rimozione Sfondo AI",
                toolCategory: "ImageApplication",
                keywords: [
                    'rimozione sfondo',
                    'remove background',
                    'AI sfondo',
                    'trasparente',
                    'foto editing',
                    'ritaglio immagini',
                    'background remover',
                    'PNG trasparente'
                ],
                faqItems: faqItems,
                howToSteps: howToSteps,
                articleData: articleData,
                type: "article"
            }, void 0, false, {
                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Navbar$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                style: styles.mainContent,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        style: styles.header,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                style: styles.title,
                                children: "Rimozione Sfondo AI"
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.subtitle,
                                children: "Rimuovi lo sfondo da qualsiasi immagine con un click usando l'intelligenza artificiale avanzata. Il nostro strumento rileva automaticamente il soggetto principale e crea un ritaglio preciso con sfondo trasparente."
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tools$2f$BackgroundRemover$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        style: styles.contentSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: styles.sectionTitle,
                                children: "Come Rimuovere lo Sfondo dalle Immagini con AI"
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.contentText,
                                children: "La rimozione dello sfondo è una delle operazioni più comuni nell'editing fotografico. Con il nostro strumento AI, puoi rimuovere lo sfondo da qualsiasi immagine in pochi secondi, senza bisogno di competenze tecniche o software complessi."
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                lineNumber: 88,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: styles.subsectionTitle,
                                children: "Caratteristiche Principali"
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                style: styles.featureList,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Rilevamento automatico:"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                                lineNumber: 96,
                                                columnNumber: 17
                                            }, this),
                                            " L'AI identifica automaticamente il soggetto principale dell'immagine"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 96,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Alta precisione:"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                                lineNumber: 97,
                                                columnNumber: 17
                                            }, this),
                                            " Ritaglio preciso anche per dettagli complessi come capelli e pelliccia"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 97,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Velocità:"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                                lineNumber: 98,
                                                columnNumber: 17
                                            }, this),
                                            " Elaborazione istantanea per la maggior parte delle immagini"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 98,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Qualità professionale:"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                                lineNumber: 99,
                                                columnNumber: 17
                                            }, this),
                                            " Risultati pronti per uso commerciale e professionale"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 99,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Sicurezza:"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                                lineNumber: 100,
                                                columnNumber: 17
                                            }, this),
                                            " Le tue immagini vengono eliminate automaticamente dopo 24 ore"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 100,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Formati supportati:"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                                lineNumber: 101,
                                                columnNumber: 17
                                            }, this),
                                            " JPG, PNG, WEBP, GIF, BMP"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 101,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                lineNumber: 95,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: styles.subsectionTitle,
                                children: "Casi d'Uso"
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                lineNumber: 104,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.contentText,
                                children: "Questo strumento è perfetto per:"
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                lineNumber: 105,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                style: styles.useCaseList,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: "Creazione di cataloghi prodotti per e-commerce"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 109,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: "Design di grafiche per social media"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 110,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: "Creazione di presentazioni professionali"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 111,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: "Editing fotografico personale"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 112,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: "Creazione di materiale marketing"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 113,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: "Design di loghi e branding"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 114,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                lineNumber: 108,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: styles.subsectionTitle,
                                children: "FAQ - Domande Frequenti"
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                lineNumber: 117,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.faqSection,
                                children: faqItems.map((faq, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.faqItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                style: styles.faqQuestion,
                                                children: faq.question
                                            }, void 0, false, {
                                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                                lineNumber: 121,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: styles.faqAnswer,
                                                children: faq.answer
                                            }, void 0, false, {
                                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                                lineNumber: 122,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 120,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                lineNumber: 118,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: styles.subsectionTitle,
                                children: "Strumenti Correlati"
                            }, void 0, false, {
                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                lineNumber: 127,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.relatedTools,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/upscaler",
                                        style: styles.relatedToolLink,
                                        children: "Upscaler AI - Migliora la risoluzione delle immagini"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 129,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/tools/generazione-immagini-ai",
                                        style: styles.relatedToolLink,
                                        children: "Generazione Immagini AI - Crea immagini da testo"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 132,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/tools/thumbnail-generator",
                                        style: styles.relatedToolLink,
                                        children: "Thumbnail Generator - Crea miniature per video"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 135,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/pdf",
                                        style: styles.relatedToolLink,
                                        children: "Convertitore PDF - Converti immagini in PDF"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                        lineNumber: 138,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                                lineNumber: 128,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                        lineNumber: 86,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Footer$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
                lineNumber: 144,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/tools/rimozione-sfondo-ai.js",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_c = RimozioneSfondoAIPage;
const styles = {
    pageWrap: {
        minHeight: '100vh',
        background: '#0a0e1a',
        color: '#e6eef8'
    },
    mainContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 24px'
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px'
    },
    title: {
        fontSize: 'clamp(32px, 5vw, 48px)',
        fontWeight: 900,
        margin: 0,
        letterSpacing: '-0.02em',
        background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    },
    subtitle: {
        color: '#94a3b8',
        marginTop: 16,
        fontSize: '18px',
        lineHeight: 1.6,
        maxWidth: '800px',
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    contentSection: {
        marginTop: '60px',
        padding: '40px',
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '20px',
        border: '1px solid rgba(102, 126, 234, 0.2)'
    },
    sectionTitle: {
        fontSize: '28px',
        fontWeight: 800,
        marginBottom: '20px',
        color: '#e2e8f0'
    },
    contentText: {
        fontSize: '16px',
        lineHeight: 1.8,
        color: '#cbd5e1',
        marginBottom: '20px'
    },
    subsectionTitle: {
        fontSize: '22px',
        fontWeight: 700,
        marginTop: '32px',
        marginBottom: '16px',
        color: '#e2e8f0'
    },
    featureList: {
        listStyle: 'none',
        padding: 0,
        marginBottom: '24px'
    },
    'featureList li': {
        padding: '8px 0',
        color: '#cbd5e1',
        fontSize: '15px',
        lineHeight: 1.7
    },
    useCaseList: {
        listStyle: 'none',
        padding: 0,
        marginBottom: '24px'
    },
    'useCaseList li': {
        padding: '8px 0',
        color: '#cbd5e1',
        fontSize: '15px',
        lineHeight: 1.7,
        paddingLeft: '24px',
        position: 'relative'
    },
    'useCaseList li:before': {
        content: '"✓"',
        position: 'absolute',
        left: 0,
        color: '#a78bfa'
    },
    faqSection: {
        marginTop: '32px'
    },
    faqItem: {
        marginBottom: '24px',
        padding: '20px',
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '12px',
        border: '1px solid rgba(102, 126, 234, 0.1)'
    },
    faqQuestion: {
        fontSize: '18px',
        fontWeight: 700,
        marginBottom: '12px',
        color: '#a78bfa'
    },
    faqAnswer: {
        fontSize: '15px',
        lineHeight: 1.7,
        color: '#cbd5e1',
        margin: 0
    },
    relatedTools: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '24px'
    },
    relatedToolLink: {
        color: '#60a5fa',
        textDecoration: 'none',
        fontSize: '16px',
        padding: '12px 16px',
        background: 'rgba(96, 165, 250, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(96, 165, 250, 0.2)',
        transition: 'all 0.3s'
    }
};
var _c;
__turbopack_context__.k.register(_c, "RimozioneSfondoAIPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/tools/rimozione-sfondo-ai.js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/tools/rimozione-sfondo-ai";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/tools/rimozione-sfondo-ai.js [client] (ecmascript)");
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
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/tools/rimozione-sfondo-ai.js\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/tools/rimozione-sfondo-ai.js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__a06b7768._.js.map