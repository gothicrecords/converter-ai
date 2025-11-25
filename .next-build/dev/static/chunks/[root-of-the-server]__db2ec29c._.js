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
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({
        "Navbar.useState": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                return window.innerWidth <= 768;
            }
            //TURBOPACK unreachable
            ;
        }
    }["Navbar.useState"]);
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
    // Safe client-side mobile detection with throttling
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const checkMobile = {
                "Navbar.useEffect.checkMobile": ()=>{
                    const width = window.innerWidth;
                    const isMobileWidth = width <= 768;
                    setIsMobile(isMobileWidth);
                    // Se non è mobile, chiudi i menu
                    if (!isMobileWidth) {
                        setMobileMenuOpen(false);
                        setMobileSecondaryMenuOpen(false);
                    }
                }
            }["Navbar.useEffect.checkMobile"];
            // Check immediately
            checkMobile();
            // Throttle resize events for better performance
            let resizeTimeout;
            const handleResize = {
                "Navbar.useEffect.handleResize": ()=>{
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(checkMobile, 150);
                }
            }["Navbar.useEffect.handleResize"];
            window.addEventListener('resize', handleResize, {
                passive: true
            });
            return ({
                "Navbar.useEffect": ()=>{
                    window.removeEventListener('resize', handleResize);
                    clearTimeout(resizeTimeout);
                }
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
            background: scrolled ? 'rgba(10, 14, 26, 0.95)' : 'rgba(10, 14, 26, 0.98)',
            WebkitBackdropFilter: 'blur(20px)',
            backdropFilter: 'blur(20px)',
            borderBottom: scrolled ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid rgba(102, 126, 234, 0.2)',
            padding: scrolled ? '8px 0' : '12px 0',
            boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(102, 126, 234, 0.1)' : '0 2px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden',
            overflowY: 'visible',
            boxSizing: 'border-box',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)',
            willChange: 'background, box-shadow, padding'
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
            padding: '10px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '26px',
            marginRight: '8px',
            minWidth: '44px',
            minHeight: '44px',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none',
            WebkitUserSelect: 'none'
        },
        secondaryMenuBtn: {
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '26px',
            marginRight: '12px',
            minWidth: '44px',
            minHeight: '44px',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none',
            WebkitUserSelect: 'none'
        },
        mobileMenu: {
            position: 'fixed',
            top: 0,
            right: mobileMenuOpen ? 0 : '-100%',
            bottom: 0,
            width: '85%',
            maxWidth: '340px',
            minWidth: '280px',
            background: 'rgba(10, 14, 26, 0.99)',
            WebkitBackdropFilter: 'blur(20px)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(102, 126, 234, 0.3)',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px 20px',
            zIndex: 100004,
            transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.6)',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            display: 'block',
            visibility: mobileMenuOpen ? 'visible' : 'hidden',
            opacity: mobileMenuOpen ? 1 : 0,
            pointerEvents: mobileMenuOpen ? 'auto' : 'none'
        },
        mobileSecondaryMenu: {
            position: 'fixed',
            top: 0,
            right: mobileSecondaryMenuOpen ? 0 : '-100%',
            bottom: 0,
            width: '85%',
            maxWidth: '320px',
            minWidth: '260px',
            background: 'rgba(10, 14, 26, 0.99)',
            WebkitBackdropFilter: 'blur(20px)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(102, 126, 234, 0.3)',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px 20px',
            zIndex: 100004,
            transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.6)',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            display: 'block',
            visibility: mobileSecondaryMenuOpen ? 'visible' : 'hidden',
            opacity: mobileSecondaryMenuOpen ? 1 : 0,
            pointerEvents: mobileSecondaryMenuOpen ? 'auto' : 'none'
        },
        mobileOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            WebkitBackdropFilter: 'blur(4px)',
            backdropFilter: 'blur(4px)',
            zIndex: 100003,
            opacity: mobileMenuOpen || mobileSecondaryMenuOpen ? 1 : 0,
            visibility: mobileMenuOpen || mobileSecondaryMenuOpen ? 'visible' : 'hidden',
            transition: 'opacity 0.3s ease, visibility 0.3s ease',
            WebkitTapHighlightColor: 'transparent'
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
            fontSize: '28px',
            cursor: 'pointer',
            padding: '8px',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'rgba(102, 126, 234, 0.2)',
            touchAction: 'manipulation',
            borderRadius: '8px',
            transition: 'background 0.2s ease'
        },
        mobileMenuItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(102, 126, 234, 0.25)',
            marginBottom: '10px',
            cursor: 'pointer',
            minHeight: '48px',
            WebkitTapHighlightColor: 'rgba(102, 126, 234, 0.2)',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            userSelect: 'none',
            WebkitUserSelect: 'none'
        },
        mobileCategoryHeader: {
            padding: '14px 18px',
            color: '#667eea',
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginTop: '16px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            background: 'rgba(102, 126, 234, 0.15)',
            borderRadius: '10px',
            minHeight: '48px',
            WebkitTapHighlightColor: 'rgba(102, 126, 234, 0.3)',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            userSelect: 'none',
            WebkitUserSelect: 'none'
        },
        mobileDropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px 12px 36px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            background: 'rgba(15, 23, 42, 0.7)',
            marginBottom: '6px',
            minHeight: '44px',
            WebkitTapHighlightColor: 'rgba(102, 126, 234, 0.2)',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            userSelect: 'none',
            WebkitUserSelect: 'none'
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
                                                                lineNumber: 576,
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
                                                                lineNumber: 577,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 575,
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
                                                                lineNumber: 580,
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
                                                                        lineNumber: 582,
                                                                        columnNumber: 37
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feMergeNode", {
                                                                        in: "SourceGraphic",
                                                                        className: "jsx-3b10be881c6611e8"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/Navbar.js",
                                                                        lineNumber: 583,
                                                                        columnNumber: 37
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/Navbar.js",
                                                                lineNumber: 581,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 579,
                                                        columnNumber: 29
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 574,
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
                                                lineNumber: 589,
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
                                                lineNumber: 596,
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
                                                lineNumber: 597,
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
                                                lineNumber: 598,
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
                                                lineNumber: 599,
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
                                                lineNumber: 600,
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
                                                lineNumber: 601,
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
                                                lineNumber: 604,
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
                                                lineNumber: 605,
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
                                                lineNumber: 606,
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
                                                lineNumber: 607,
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
                                                lineNumber: 610,
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
                                                lineNumber: 611,
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
                                                lineNumber: 612,
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
                                                lineNumber: 613,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 572,
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
                                                lineNumber: 616,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.logoSub,
                                                className: "jsx-3b10be881c6611e8",
                                                children: "ToolSuite"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 617,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 615,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 571,
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
                                        lineNumber: 622,
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
                                                            lineNumber: 661,
                                                            columnNumber: 33
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/Navbar.js",
                                                    lineNumber: 648,
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
                                                                                    lineNumber: 720,
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
                                                                                    lineNumber: 721,
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
                                                                                    lineNumber: 723,
                                                                                    columnNumber: 57
                                                                                }, ("TURBOPACK compile-time value", void 0))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/Navbar.js",
                                                                            lineNumber: 695,
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
                                                                            lineNumber: 738,
                                                                            columnNumber: 53
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, tool.href, true, {
                                                                    fileName: "[project]/components/Navbar.js",
                                                                    lineNumber: 694,
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
                                                                        lineNumber: 762,
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
                                                                        lineNumber: 763,
                                                                        columnNumber: 45
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/Navbar.js",
                                                                lineNumber: 750,
                                                                columnNumber: 41
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 678,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Navbar.js",
                                                    lineNumber: 673,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, catName, true, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 642,
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
                                        lineNumber: 773,
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
                                        lineNumber: 786,
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
                                        lineNumber: 797,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LanguageSwitcher$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 810,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 621,
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
                                            lineNumber: 825,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 816,
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
                                            lineNumber: 837,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 828,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 815,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Navbar.js",
                        lineNumber: 569,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    isMobile && (mobileMenuOpen || mobileSecondaryMenuOpen) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.mobileOverlay,
                        onClick: (e)=>{
                            e.stopPropagation();
                            setMobileMenuOpen(false);
                            setMobileSecondaryMenuOpen(false);
                        },
                        onTouchStart: (e)=>{
                            e.stopPropagation();
                            setMobileMenuOpen(false);
                            setMobileSecondaryMenuOpen(false);
                        },
                        className: "jsx-3b10be881c6611e8"
                    }, void 0, false, {
                        fileName: "[project]/components/Navbar.js",
                        lineNumber: 845,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.mobileMenu,
                        onClick: (e)=>e.stopPropagation(),
                        onTouchStart: (e)=>e.stopPropagation(),
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
                                        lineNumber: 868,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        style: styles.closeBtn,
                                        onClick: (e)=>{
                                            e.stopPropagation();
                                            setMobileMenuOpen(false);
                                        },
                                        onTouchEnd: (e)=>{
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setMobileMenuOpen(false);
                                        },
                                        "aria-label": "Chiudi menu",
                                        title: "Chiudi menu",
                                        className: "jsx-3b10be881c6611e8",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiX"], {}, void 0, false, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 883,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 869,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 867,
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
                                lineNumber: 887,
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
                                                    lineNumber: 905,
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
                                                    lineNumber: 906,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 901,
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
                                                        lineNumber: 922,
                                                        columnNumber: 51
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-3b10be881c6611e8",
                                                        children: tool.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 923,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, tool.href, true, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 916,
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
                                                lineNumber: 936,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 927,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, catName, true, {
                                    fileName: "[project]/components/Navbar.js",
                                    lineNumber: 900,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Navbar.js",
                        lineNumber: 862,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.mobileSecondaryMenu,
                        onClick: (e)=>e.stopPropagation(),
                        onTouchStart: (e)=>e.stopPropagation(),
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
                                        lineNumber: 952,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        style: styles.closeBtn,
                                        onClick: (e)=>{
                                            e.stopPropagation();
                                            setMobileSecondaryMenuOpen(false);
                                        },
                                        onTouchEnd: (e)=>{
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setMobileSecondaryMenuOpen(false);
                                        },
                                        "aria-label": "Chiudi menu",
                                        title: "Chiudi menu",
                                        className: "jsx-3b10be881c6611e8",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiX"], {}, void 0, false, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 967,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 953,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 951,
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
                                lineNumber: 971,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/pricing",
                                style: styles.mobileMenuItem,
                                onClick: ()=>setMobileSecondaryMenuOpen(false),
                                children: t('nav.pricing')
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 983,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/faq",
                                style: styles.mobileMenuItem,
                                onClick: ()=>setMobileSecondaryMenuOpen(false),
                                children: "FAQ"
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 991,
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
                                        lineNumber: 1000,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LanguageSwitcher$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 1003,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 999,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Navbar.js",
                        lineNumber: 946,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/Navbar.js",
                lineNumber: 568,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
};
_s(Navbar, "3F9DaflNv1rrvUKONQ+jGvFs5ss=", false, function() {
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
    const siteUrl = ("TURBOPACK compile-time value", "http://localhost:3000") || (("TURBOPACK compile-time truthy", 1) ? window.location.origin : "TURBOPACK unreachable");
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
            lineNumber: 45,
            columnNumber: 13
        }, this));
        // Add x-default (usually English or main locale)
        tags.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
            rel: "alternate",
            hrefLang: "x-default",
            href: `${siteUrl}${basePath}`
        }, "hreflang-x-default", false, {
            fileName: "[project]/components/SEOHead.js",
            lineNumber: 50,
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
                    lineNumber: 58,
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
                lineNumber: 264,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "title",
                content: fullTitle
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 265,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "description",
                content: safeDescription
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 266,
                columnNumber: 13
            }, this),
            keywords.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "keywords",
                content: keywords.join(', ')
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 267,
                columnNumber: 37
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "geo.region",
                content: "IT"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 270,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "geo.placename",
                content: "Italy"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 271,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "language",
                content: currentLocale
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 272,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                httpEquiv: "content-language",
                content: currentLocale
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 273,
                columnNumber: 13
            }, this),
            canonical && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                rel: "canonical",
                href: fullUrl
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 276,
                columnNumber: 27
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                rel: "sitemap",
                type: "application/xml",
                href: `${siteUrl}/sitemap.xml`
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 279,
                columnNumber: 13
            }, this),
            generateHreflangTags(),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:type",
                content: type
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 285,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:url",
                content: fullUrl
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 286,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:title",
                content: fullTitle
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 287,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:description",
                content: safeDescription
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 288,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:site_name",
                content: siteName
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 289,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:image",
                content: ogImage
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 290,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:image:width",
                content: "1200"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 291,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:image:height",
                content: "630"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 292,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:image:alt",
                content: title
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 293,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:locale",
                content: currentLocale.replace('-', '_')
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 294,
                columnNumber: 13
            }, this),
            supportedLocales.filter((l)=>l !== currentLocale).map((loc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                    property: "og:locale:alternate",
                    content: loc.replace('-', '_')
                }, `og-locale-${loc}`, false, {
                    fileName: "[project]/components/SEOHead.js",
                    lineNumber: 296,
                    columnNumber: 17
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:card",
                content: "summary_large_image"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 300,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:url",
                content: fullUrl
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 301,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:title",
                content: fullTitle
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 302,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:description",
                content: safeDescription
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 303,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:image",
                content: ogImage
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 304,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:image:alt",
                content: title
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 305,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:site",
                content: "@MegaPixelAI"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 306,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "twitter:creator",
                content: "@MegaPixelAI"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 307,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "robots",
                content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 310,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "author",
                content: siteName
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 311,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "copyright",
                content: siteName
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 312,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "revisit-after",
                content: "7 days"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 313,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "distribution",
                content: "global"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 314,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "rating",
                content: "general"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 315,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "application-name",
                content: siteName
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 316,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "generator",
                content: "Next.js"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 317,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "AI-friendly",
                content: "true"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 320,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "format-detection",
                content: "telephone=no"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 321,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "apple-itunes-app",
                content: "app-id="
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 322,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "googlebot",
                content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 325,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "bingbot",
                content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 326,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "slurp",
                content: "index, follow"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 327,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "duckduckbot",
                content: "index, follow"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 328,
                columnNumber: 13
            }, this),
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "google-site-verification",
                content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 332,
                columnNumber: 17
            }, this),
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BING_VERIFICATION && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "msvalidate.01",
                content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BING_VERIFICATION
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 335,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                httpEquiv: "Content-Type",
                content: "text/html; charset=utf-8"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 339,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                property: "og:type",
                content: type
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 342,
                columnNumber: 13
            }, this),
            type === 'article' && articleData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    articleData.datePublished && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        property: "article:published_time",
                        content: articleData.datePublished
                    }, void 0, false, {
                        fileName: "[project]/components/SEOHead.js",
                        lineNumber: 346,
                        columnNumber: 25
                    }, this),
                    articleData.dateModified && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        property: "article:modified_time",
                        content: articleData.dateModified
                    }, void 0, false, {
                        fileName: "[project]/components/SEOHead.js",
                        lineNumber: 349,
                        columnNumber: 25
                    }, this),
                    articleData.tags && articleData.tags.map((tag, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                            property: "article:tag",
                            content: tag
                        }, `article-tag-${i}`, false, {
                            fileName: "[project]/components/SEOHead.js",
                            lineNumber: 352,
                            columnNumber: 25
                        }, this))
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "mobile-web-app-capable",
                content: "yes"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 358,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "apple-mobile-web-app-capable",
                content: "yes"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 359,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "apple-mobile-web-app-status-bar-style",
                content: "black-translucent"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 360,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "apple-mobile-web-app-title",
                content: siteName
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 361,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "theme-color",
                content: "#667eea"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 364,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "msapplication-TileColor",
                content: "#667eea"
            }, void 0, false, {
                fileName: "[project]/components/SEOHead.js",
                lineNumber: 365,
                columnNumber: 13
            }, this),
            structuredData.map((schema, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                    type: "application/ld+json",
                    dangerouslySetInnerHTML: {
                        __html: JSON.stringify(schema)
                    }
                }, `structured-data-${index}`, false, {
                    fileName: "[project]/components/SEOHead.js",
                    lineNumber: 369,
                    columnNumber: 17
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/components/SEOHead.js",
        lineNumber: 262,
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
"[project]/lib/auth.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Sistema di autenticazione con Supabase Database
// Usa API routes per comunicare con il database in sicurezza
__turbopack_context__.s([
    "getCurrentUser",
    ()=>getCurrentUser,
    "getUserStats",
    ()=>getUserStats,
    "isAuthenticated",
    ()=>isAuthenticated,
    "login",
    ()=>login,
    "logout",
    ()=>logout,
    "signup",
    ()=>signup,
    "updateUserStats",
    ()=>updateUserStats
]);
const SESSION_STORAGE_KEY = 'megapixelai_session';
const USER_CACHE_KEY = 'megapixelai_user_cache';
// Ottieni session token (da localStorage o cookie)
const getSessionToken = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Prima prova localStorage
    const localToken = localStorage.getItem(SESSION_STORAGE_KEY);
    if (localToken) return localToken;
    // Poi prova cookie (per OAuth)
    const cookies = document.cookie.split(';').reduce((acc, cookie)=>{
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});
    const cookieToken = cookies.megapixelai_session;
    if (cookieToken) {
        // Salva anche in localStorage per consistenza
        localStorage.setItem(SESSION_STORAGE_KEY, cookieToken);
        return cookieToken;
    }
    return null;
};
// Salva session token
const saveSessionToken = (token)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.setItem(SESSION_STORAGE_KEY, token);
};
// Rimuovi session token
const removeSessionToken = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
};
// Cache utente locale (per performance)
const getCachedUser = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (!cached) return null;
    try {
        return JSON.parse(cached);
    } catch  {
        return null;
    }
};
const setCachedUser = (user)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
};
const signup = async (name, email, password)=>{
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });
        const data = await response.json();
        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Errore durante la registrazione'
            };
        }
        // Salva session token
        saveSessionToken(data.sessionToken);
        setCachedUser(data.user);
        return {
            success: true,
            user: data.user
        };
    } catch (error) {
        console.error('Signup error:', error);
        return {
            success: false,
            error: 'Errore di connessione'
        };
    }
};
const login = async (email, password)=>{
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        const data = await response.json();
        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Email o password errati'
            };
        }
        // Salva session token
        saveSessionToken(data.sessionToken);
        setCachedUser(data.user);
        return {
            success: true,
            user: data.user
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: 'Errore di connessione'
        };
    }
};
const logout = async ()=>{
    try {
        const sessionToken = getSessionToken();
        if (sessionToken) {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                body: JSON.stringify({
                    sessionToken
                })
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally{
        removeSessionToken();
    }
};
const getCurrentUser = async (forceRefresh = false)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const sessionToken = getSessionToken();
    if (!sessionToken) return null;
    // Usa cache se non forziamo refresh
    if (!forceRefresh) {
        const cached = getCachedUser();
        if (cached) return cached;
    }
    try {
        const response = await fetch('/api/auth/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
        if (!response.ok) {
            // Session invalida o scaduta
            removeSessionToken();
            return null;
        }
        const data = await response.json();
        setCachedUser(data.user);
        return data.user;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
};
const isAuthenticated = ()=>{
    return getSessionToken() !== null;
};
const updateUserStats = async (toolName)=>{
    const sessionToken = getSessionToken();
    if (!sessionToken) return {
        success: false,
        error: 'Non autenticato'
    };
    try {
        const response = await fetch('/api/users/stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
                toolName
            })
        });
        const data = await response.json();
        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Errore aggiornamento stats'
            };
        }
        // Aggiorna cache
        setCachedUser(data.user);
        return {
            success: true,
            user: data.user
        };
    } catch (error) {
        console.error('Update stats error:', error);
        return {
            success: false,
            error: 'Errore di connessione'
        };
    }
};
const getUserStats = (user)=>{
    if (!user) return null;
    const registeredDays = Math.max(1, Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)));
    const toolsUsedCount = Array.isArray(user.tools_used) ? user.tools_used.length : 0;
    return {
        imagesProcessed: user.images_processed || 0,
        toolsUsed: toolsUsedCount,
        registeredDays,
        averageDaily: Math.round((user.images_processed || 0) / registeredDays),
        hasDiscount: user.has_discount || false,
        plan: user.plan || 'free'
    };
};
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
"[project]/pages/login.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Navbar$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Navbar.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SEOHead$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SEOHead.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/analytics.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.js [client] (ecmascript)");
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
function LoginPage() {
    _s();
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({
        email: '',
        password: ''
    });
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LoginPage.useEffect": ()=>{
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$js__$5b$client$5d$__$28$ecmascript$29$__["isAuthenticated"])()) {
                router.push('/dashboard');
            }
            // Check for OAuth errors in URL
            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get('error');
            if (error) {
                setError(decodeURIComponent(error));
            }
        }
    }["LoginPage.useEffect"], [
        router
    ]);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$js__$5b$client$5d$__$28$ecmascript$29$__["login"])(formData.email, formData.password);
        if (result.success) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$js__$5b$client$5d$__$28$ecmascript$29$__["trackLogin"])('email');
            router.push('/dashboard');
        } else {
            setError(result.error);
            setLoading(false);
        }
    };
    const handleChange = (e)=>{
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.pageWrap,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SEOHead$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                title: t('seo.loginTitle'),
                description: t('seo.loginDesc'),
                canonical: "/login",
                keywords: [
                    'login',
                    'accedi',
                    'accesso',
                    'account'
                ]
            }, void 0, false, {
                fileName: "[project]/pages/login.js",
                lineNumber: 53,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Navbar$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/pages/login.js",
                lineNumber: 59,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.container,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.formCard,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.header,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        style: styles.title,
                                        children: t('auth.welcomeBack')
                                    }, void 0, false, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 64,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: styles.subtitle,
                                        children: t('auth.loginSubtitle')
                                    }, void 0, false, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 65,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/login.js",
                                lineNumber: 63,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.oauthSection,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "/api/auth/oauth/google",
                                        style: styles.oauthButton,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                width: "20",
                                                height: "20",
                                                viewBox: "0 0 24 24",
                                                style: styles.oauthIcon,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        fill: "#4285F4",
                                                        d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/login.js",
                                                        lineNumber: 72,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        fill: "#34A853",
                                                        d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/login.js",
                                                        lineNumber: 73,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        fill: "#FBBC05",
                                                        d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/login.js",
                                                        lineNumber: 74,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        fill: "#EA4335",
                                                        d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/login.js",
                                                        lineNumber: 75,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/login.js",
                                                lineNumber: 71,
                                                columnNumber: 29
                                            }, this),
                                            "Continua con Google"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 70,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "/api/auth/oauth/facebook",
                                        style: {
                                            ...styles.oauthButton,
                                            ...styles.oauthButtonFacebook
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                width: "20",
                                                height: "20",
                                                viewBox: "0 0 24 24",
                                                fill: "#1877F2",
                                                style: styles.oauthIcon,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/login.js",
                                                    lineNumber: 81,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/pages/login.js",
                                                lineNumber: 80,
                                                columnNumber: 29
                                            }, this),
                                            "Continua con Facebook"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 79,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/login.js",
                                lineNumber: 69,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.divider,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: styles.dividerText,
                                    children: "oppure"
                                }, void 0, false, {
                                    fileName: "[project]/pages/login.js",
                                    lineNumber: 88,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/pages/login.js",
                                lineNumber: 87,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleSubmit,
                                style: styles.form,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.inputGroup,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: styles.label,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiMail"], {
                                                        style: styles.inputIcon
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/login.js",
                                                        lineNumber: 94,
                                                        columnNumber: 33
                                                    }, this),
                                                    t('auth.email')
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/login.js",
                                                lineNumber: 93,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "email",
                                                name: "email",
                                                value: formData.email,
                                                onChange: handleChange,
                                                required: true,
                                                placeholder: t('auth.email'),
                                                style: styles.input
                                            }, void 0, false, {
                                                fileName: "[project]/pages/login.js",
                                                lineNumber: 97,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 92,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.inputGroup,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: styles.label,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["HiLockClosed"], {
                                                        style: styles.inputIcon
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/login.js",
                                                        lineNumber: 110,
                                                        columnNumber: 33
                                                    }, this),
                                                    t('auth.password')
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/login.js",
                                                lineNumber: 109,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "password",
                                                name: "password",
                                                value: formData.password,
                                                onChange: handleChange,
                                                required: true,
                                                placeholder: t('auth.password'),
                                                style: styles.input
                                            }, void 0, false, {
                                                fileName: "[project]/pages/login.js",
                                                lineNumber: 113,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 108,
                                        columnNumber: 25
                                    }, this),
                                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.error,
                                        children: error
                                    }, void 0, false, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 124,
                                        columnNumber: 35
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        disabled: loading,
                                        style: {
                                            ...styles.submitButton,
                                            ...loading ? styles.buttonDisabled : {}
                                        },
                                        children: loading ? t('common.processing') : t('auth.login')
                                    }, void 0, false, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 126,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/login.js",
                                lineNumber: 91,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.footer,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: styles.footerText,
                                        children: [
                                            t('auth.noAccount'),
                                            ' ',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/signup",
                                                style: styles.link,
                                                children: t('auth.signupFree')
                                            }, void 0, false, {
                                                fileName: "[project]/pages/login.js",
                                                lineNumber: 138,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 136,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: styles.footerText,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/contact",
                                            style: styles.link,
                                            children: t('auth.forgotPassword')
                                        }, void 0, false, {
                                            fileName: "[project]/pages/login.js",
                                            lineNumber: 141,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 140,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/login.js",
                                lineNumber: 135,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/login.js",
                        lineNumber: 62,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.infoCard,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: styles.infoTitle,
                                children: t('auth.whyAccount')
                            }, void 0, false, {
                                fileName: "[project]/pages/login.js",
                                lineNumber: 147,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                style: styles.infoList,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        style: styles.infoItem,
                                        children: [
                                            "📊 ",
                                            t('auth.benefit1Desc')
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 149,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        style: styles.infoItem,
                                        children: [
                                            "💾 ",
                                            t('auth.benefit2Desc')
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 150,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        style: styles.infoItem,
                                        children: [
                                            "💰 ",
                                            t('auth.benefit3Desc')
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 151,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        style: styles.infoItem,
                                        children: [
                                            "⭐ ",
                                            t('auth.benefit4Desc')
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 152,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        style: styles.infoItem,
                                        children: [
                                            "🔔 ",
                                            t('auth.benefit5Desc')
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 153,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        style: styles.infoItem,
                                        children: [
                                            "🎯 ",
                                            t('auth.benefit6Desc')
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 154,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/login.js",
                                lineNumber: 148,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/login.js",
                        lineNumber: 146,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/login.js",
                lineNumber: 61,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/login.js",
        lineNumber: 52,
        columnNumber: 9
    }, this);
}
_s(LoginPage, "+O3B5kGTe5pF8KJeNFIYzef15T0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useTranslation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = LoginPage;
const styles = {
    pageWrap: {
        minHeight: '100vh',
        background: '#0a0e1a',
        color: '#e6eef8'
    },
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '100px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'center'
    },
    formCard: {
        padding: '48px',
        background: 'rgba(102, 126, 234, 0.05)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '24px'
    },
    header: {
        marginBottom: '40px',
        textAlign: 'center'
    },
    title: {
        fontSize: '32px',
        fontWeight: '900',
        margin: '0 0 12px',
        color: '#e2e8f0'
    },
    subtitle: {
        fontSize: '16px',
        color: '#94a3b8',
        margin: 0
    },
    oauthSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '24px'
    },
    oauthButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '14px 20px',
        background: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        color: '#1a1a1a',
        fontSize: '15px',
        fontWeight: '600',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    oauthButtonFacebook: {
        background: '#1877F2',
        color: '#ffffff'
    },
    oauthIcon: {
        flexShrink: 0
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        margin: '24px 0',
        position: 'relative'
    },
    dividerText: {
        padding: '0 16px',
        background: 'rgba(102, 126, 234, 0.05)',
        color: '#94a3b8',
        fontSize: '14px',
        position: 'relative',
        zIndex: 1
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#cbd5e1'
    },
    inputIcon: {
        width: 16,
        height: 16
    },
    input: {
        padding: '14px 16px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '10px',
        color: '#e2e8f0',
        fontSize: '15px',
        outline: 'none',
        transition: 'border 0.2s'
    },
    error: {
        padding: '12px',
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        color: '#ef4444',
        fontSize: '14px',
        textAlign: 'center'
    },
    submitButton: {
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'transform 0.2s'
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    },
    footer: {
        marginTop: '32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    footerText: {
        fontSize: '14px',
        color: '#94a3b8'
    },
    link: {
        color: '#667eea',
        textDecoration: 'none',
        fontWeight: '600'
    },
    infoCard: {
        padding: '40px',
        background: 'rgba(102, 126, 234, 0.05)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '24px'
    },
    infoTitle: {
        fontSize: '24px',
        fontWeight: '800',
        margin: '0 0 24px',
        color: '#e2e8f0'
    },
    infoList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    infoItem: {
        fontSize: '16px',
        color: '#cbd5e1',
        lineHeight: '1.6'
    }
};
var _c;
__turbopack_context__.k.register(_c, "LoginPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/login.js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/login";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/login.js [client] (ecmascript)");
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
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/login\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/login.js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__db2ec29c._.js.map