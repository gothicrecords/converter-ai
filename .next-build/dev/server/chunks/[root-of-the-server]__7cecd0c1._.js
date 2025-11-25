module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/formidable [external] (formidable, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("formidable");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/pdf-lib [external] (pdf-lib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("pdf-lib", () => require("pdf-lib"));

module.exports = mod;
}),
"[project]/utils/pdf.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "imagesToPdf",
    ()=>imagesToPdf
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$lib__$5b$external$5d$__$28$pdf$2d$lib$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/pdf-lib [external] (pdf-lib, cjs)");
;
async function imagesToPdf(imageBuffers) {
    const pdfDoc = await __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$lib__$5b$external$5d$__$28$pdf$2d$lib$2c$__cjs$29$__["PDFDocument"].create();
    for (const buf of imageBuffers){
        let embedded;
        try {
            embedded = await pdfDoc.embedJpg(buf);
        } catch  {
            embedded = await pdfDoc.embedPng(buf);
        }
        const { width, height } = embedded.size();
        const page = pdfDoc.addPage([
            width,
            height
        ]);
        page.drawImage(embedded, {
            x: 0,
            y: 0,
            width,
            height
        });
    }
    return await pdfDoc.save({
        useObjectStreams: true
    });
}
}),
"[project]/pages/api/pdf/jpg-to-pdf.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/formidable [external] (formidable, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pdf$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/pdf.js [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const config = {
    api: {
        bodyParser: false
    }
};
function fsReadFile(path) {
    return new Promise((resolve, reject)=>{
        __turbopack_context__.A("[externals]/fs [external] (fs, cjs, async loader)").then(({ readFile })=>readFile(path, (e, d)=>e ? reject(e) : resolve(d)));
    });
}
async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'POST') return res.status(405).json({
        error: 'Method not allowed'
    });
    const form = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__["default"])({
        multiples: true,
        allowEmptyFiles: false // Non permettere file vuoti
    });
    try {
        const { files } = await new Promise((resolve, reject)=>{
            form.parse(req, (err, fields, files)=>{
                if (err) {
                    // Gestisci errori specifici di formidable
                    if (err.message && err.message.includes('file size should be greater than 0')) {
                        return reject(new Error('Il file è vuoto. Carica un file valido.'));
                    }
                    if (err.message && err.message.includes('options.allowEmptyFiles')) {
                        return reject(new Error('Il file caricato è vuoto. Carica un file con contenuto.'));
                    }
                    return reject(err);
                }
                resolve({
                    fields,
                    files
                });
            });
        });
        const imgs = [];
        const add = (f)=>{
            if (!f) return;
            if (Array.isArray(f)) return f.forEach(add);
            imgs.push(f);
        };
        add(files.image);
        add(files.images);
        if (!imgs.length) return res.status(400).json({
            error: 'Nessuna immagine inviata'
        });
        // Valida che le immagini non siano vuote
        for (const img of imgs){
            if (img.size === 0) {
                return res.status(400).json({
                    error: 'Una o più immagini sono vuote. Carica file validi.'
                });
            }
        }
        const buffers = await Promise.all(imgs.map((f)=>fsReadFile(f.filepath)));
        const pdfBytes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pdf$2e$js__$5b$api$5d$__$28$ecmascript$29$__["imagesToPdf"])(buffers);
        const base64 = Buffer.from(pdfBytes).toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;
        // Restituisci anche il nome del file
        const originalName = imgs[0]?.originalFilename || 'converted.pdf';
        const resultName = originalName.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '.pdf') || 'converted.pdf';
        return res.status(200).json({
            url: dataUrl,
            name: resultName
        });
    } catch (e) {
        console.error('jpg-to-pdf error', e);
        return res.status(500).json({
            error: 'Conversione fallita',
            details: e?.message || e
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7cecd0c1._.js.map