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
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/ffmpeg-static [external] (ffmpeg-static, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("ffmpeg-static", () => require("ffmpeg-static"));

module.exports = mod;
}),
"[externals]/fluent-ffmpeg [external] (fluent-ffmpeg, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fluent-ffmpeg", () => require("fluent-ffmpeg"));

module.exports = mod;
}),
"[project]/pages/api/tools/compress-video.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/formidable [external] (formidable, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$ffmpeg$2d$static__$5b$external$5d$__$28$ffmpeg$2d$static$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/ffmpeg-static [external] (ffmpeg-static, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fluent$2d$ffmpeg__$5b$external$5d$__$28$fluent$2d$ffmpeg$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fluent-ffmpeg [external] (fluent-ffmpeg, cjs)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const config = {
    api: {
        bodyParser: false
    }
};
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }
    const uploadDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'uploads');
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(uploadDir)) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(uploadDir, {
            recursive: true
        });
    }
    const form = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__["default"])({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 500 * 1024 * 1024
    });
    try {
        const [fields, files] = await new Promise((resolve, reject)=>{
            form.parse(req, (err, fields, files)=>{
                if (err) reject(err);
                else resolve([
                    fields,
                    files
                ]);
            });
        });
        const videoFile = Array.isArray(files.video) ? files.video[0] : files.video;
        const quality = Array.isArray(fields.quality) ? fields.quality[0] : fields.quality || 'medium';
        if (!videoFile) {
            return res.status(400).json({
                error: 'Nessun file video caricato'
            });
        }
        // Configurazione bitrate in base alla qualità
        const qualitySettings = {
            low: {
                videoBitrate: '500k',
                audioBitrate: '64k'
            },
            medium: {
                videoBitrate: '1000k',
                audioBitrate: '128k'
            },
            high: {
                videoBitrate: '2000k',
                audioBitrate: '192k'
            }
        };
        const settings = qualitySettings[quality] || qualitySettings.medium;
        // Configura ffmpeg
        __TURBOPACK__imported__module__$5b$externals$5d2f$fluent$2d$ffmpeg__$5b$external$5d$__$28$fluent$2d$ffmpeg$2c$__cjs$29$__["default"].setFfmpegPath(__TURBOPACK__imported__module__$5b$externals$5d2f$ffmpeg$2d$static__$5b$external$5d$__$28$ffmpeg$2d$static$2c$__cjs$29$__["default"]);
        const inputPath = videoFile.filepath;
        const outputPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(inputPath), `compressed_${Date.now()}.mp4`);
        // Esegui compressione
        await new Promise((resolve, reject)=>{
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fluent$2d$ffmpeg__$5b$external$5d$__$28$fluent$2d$ffmpeg$2c$__cjs$29$__["default"])(inputPath).videoCodec('libx264').audioCodec('aac').videoBitrate(settings.videoBitrate).audioBitrate(settings.audioBitrate).outputOptions([
                '-movflags faststart',
                '-preset medium',
                '-crf 23'
            ]).output(outputPath).on('end', ()=>{
                console.log('Compressione completata');
                resolve();
            }).on('error', (err)=>{
                console.error('Errore ffmpeg:', err);
                reject(err);
            }).on('progress', (progress)=>{
                console.log('Progress:', progress.percent + '%');
            }).run();
        });
        // Leggi il file compresso
        const compressedBuffer = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(outputPath);
        // Cleanup
        try {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(inputPath);
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(outputPath);
        } catch (e) {
            console.error('Errore cleanup:', e);
        }
        // Determina il tipo MIME
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename=compressed_${videoFile.originalFilename || 'video.mp4'}`);
        res.status(200).send(compressedBuffer);
    } catch (error) {
        console.error('Errore API Compressione Video:', error);
        res.status(500).json({
            error: error.message || 'Errore durante la compressione del video. Riprova con un file diverso.'
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__65bd37d2._.js.map