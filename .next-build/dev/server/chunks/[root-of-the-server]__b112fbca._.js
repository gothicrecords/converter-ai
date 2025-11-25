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
"[externals]/mammoth [external] (mammoth, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mammoth", () => require("mammoth"));

module.exports = mod;
}),
"[externals]/pdfkit [external] (pdfkit, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("pdfkit", () => require("pdfkit"));

module.exports = mod;
}),
"[externals]/openai [external] (openai, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("openai");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/tesseract.js [external] (tesseract.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tesseract.js", () => require("tesseract.js"));

module.exports = mod;
}),
"[externals]/sharp [external] (sharp, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("sharp", () => require("sharp"));

module.exports = mod;
}),
"[externals]/pdf-parse [external] (pdf-parse, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("pdf-parse", () => require("pdf-parse"));

module.exports = mod;
}),
"[project]/pages/api/tools/translate-document.js [api] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$externals$5d2f$mammoth__$5b$external$5d$__$28$mammoth$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mammoth [external] (mammoth, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pdfkit__$5b$external$5d$__$28$pdfkit$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/pdfkit [external] (pdfkit, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/openai [external] (openai, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$tesseract$2e$js__$5b$external$5d$__$28$tesseract$2e$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/tesseract.js [external] (tesseract.js, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/sharp [external] (sharp, cjs)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
const openai = new __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__["default"]({
    apiKey: process.env.OPENAI_API_KEY
});
const config = {
    api: {
        bodyParser: false
    }
};
// Funzione per estrarre testo da diversi formati
async function extractText(filePath, mimeType, originalFilename) {
    const ext = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].extname(originalFilename).toLowerCase();
    if (mimeType === 'application/pdf' || ext === '.pdf') {
        // Estrazione testo da PDF usando pdf-parse con fallback OCR
        let text = '';
        let numPages = 1;
        // Tentativo 1: pdf-parse per PDF con testo nativo
        try {
            console.log('[PDF Extract] Inizio estrazione PDF:', originalFilename);
            // Prova diversi modi di importare pdf-parse per compatibilità Turbopack
            let pdfParse;
            try {
                const mod = await __turbopack_context__.A("[externals]/pdf-parse [external] (pdf-parse, esm_import, async loader)");
                pdfParse = mod.default || mod;
            } catch (e) {
                console.log('[PDF Extract] Import ESM fallito, provo require dinamico');
                // Fallback per ambienti che non supportano ESM import di CommonJS
                pdfParse = __turbopack_context__.r("[externals]/pdf-parse [external] (pdf-parse, cjs)");
            }
            if (typeof pdfParse !== 'function') {
                throw new Error('pdf-parse non disponibile come funzione');
            }
            console.log('[PDF Extract] pdf-parse caricato correttamente');
            const dataBuffer = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath);
            console.log('[PDF Extract] Buffer letto, dimensione:', dataBuffer.length, 'bytes');
            const result = await pdfParse(dataBuffer);
            console.log('[PDF Extract] Parsing completato, testo estratto:', result?.text?.length || 0, 'caratteri');
            console.log('[PDF Extract] Numero pagine:', result?.numpages || 1);
            text = result && result.text ? result.text.trim() : '';
            numPages = result?.numpages || 1;
        } catch (pdfError) {
            console.log('[PDF Extract] pdf-parse fallito:', pdfError.message);
            text = ''; // Continua con OCR
        }
        // Tentativo 2: OCR se pdf-parse ha fallito o testo insufficiente
        if (!text || text.length < 50) {
            console.log('[PDF Extract] Testo insufficiente, uso OCR automatico...');
            try {
                const dataBuffer = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath);
                const allTexts = [];
                // Converti ogni pagina del PDF in immagine e fai OCR
                console.log('[PDF Extract] Conversione PDF in immagini per OCR...');
                // Prova a ottenere il numero di pagine
                let totalPages = numPages;
                let processAllPages = false;
                // Se abbiamo il numero di pagine da pdf-parse, usalo
                if (numPages > 1) {
                    totalPages = numPages;
                    console.log('[PDF Extract] Numero pagine da pdf-parse:', totalPages);
                } else {
                    // Altrimenti prova a ottenere il numero di pagine processando fino a quando non fallisce
                    // o usando un limite ragionevole
                    totalPages = 10; // Limite di default
                    processAllPages = true;
                    console.log('[PDF Extract] Numero pagine sconosciuto, processo fino a', totalPages, 'pagine');
                }
                // Processa ogni pagina (limite a 10 pagine per performance)
                const maxPages = Math.min(totalPages, 10);
                console.log(`[PDF Extract] Processo ${maxPages} pagina/e con OCR...`);
                for(let page = 0; page < maxPages; page++){
                    try {
                        console.log(`[PDF Extract] Processo pagina ${page + 1}/${maxPages}...`);
                        // Converti la pagina PDF in immagine PNG usando sharp
                        const imageBuffer = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(dataBuffer, {
                            density: 300,
                            page: page
                        }).png().toBuffer();
                        console.log(`[PDF Extract] Pagina ${page + 1} convertita in immagine, dimensione:`, imageBuffer.length, 'bytes');
                        // Preprocessa l'immagine per migliorare OCR
                        const processedImage = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(imageBuffer).greyscale().normalize().sharpen().toBuffer();
                        // Esegui OCR sull'immagine
                        const { data: { text: pageText } } = await __TURBOPACK__imported__module__$5b$externals$5d2f$tesseract$2e$js__$5b$external$5d$__$28$tesseract$2e$js$2c$__cjs$29$__["default"].recognize(processedImage, 'ita+eng', {
                            logger: (m)=>{
                                if (m.status === 'recognizing text') {
                                    console.log(`[OCR] Pagina ${page + 1} - Progress: ${Math.round(m.progress * 100)}%`);
                                }
                            }
                        });
                        if (pageText && pageText.trim().length > 0) {
                            allTexts.push(pageText.trim());
                            console.log(`[OCR] Pagina ${page + 1} - Testo estratto:`, pageText.trim().length, 'caratteri');
                        }
                    } catch (pageError) {
                        console.error(`[OCR] Errore processando pagina ${page + 1}:`, pageError.message);
                        // Se stiamo processando tutte le pagine e questa fallisce, potrebbe essere la fine del PDF
                        if (processAllPages && pageError.message.includes('page')) {
                            console.log(`[PDF Extract] Raggiunta fine del PDF alla pagina ${page + 1}`);
                            break; // Ferma il loop se non ci sono più pagine
                        }
                    // Altrimenti continua con la pagina successiva
                    }
                }
                if (allTexts.length > 0) {
                    const ocrText = allTexts.join('\n\n');
                    console.log('[OCR] Testo totale estratto via OCR:', ocrText.length, 'caratteri da', allTexts.length, 'pagina/e');
                    return ocrText;
                } else {
                    throw new Error('Nessun testo estratto dalle immagini del PDF');
                }
            } catch (ocrError) {
                console.error('[OCR] Errore OCR:', ocrError.message);
                throw new Error(`Errore durante l'estrazione del testo: ${ocrError.message}`);
            }
        }
        console.log('[PDF Extract] Estrazione completata con successo');
        return text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx') {
        const result = await __TURBOPACK__imported__module__$5b$externals$5d2f$mammoth__$5b$external$5d$__$28$mammoth$2c$__cjs$29$__["default"].extractRawText({
            path: filePath
        });
        return result.value;
    } else if (mimeType === 'application/msword' || ext === '.doc') {
        throw new Error('I file .doc non sono supportati. Converti in .docx o .pdf');
    } else if (mimeType === 'text/plain' || ext === '.txt') {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath, 'utf-8');
    } else if (mimeType === 'text/markdown' || ext === '.md') {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath, 'utf-8');
    } else {
        throw new Error('Formato file non supportato');
    }
}
// Funzione per tradurre testo usando OpenAI
async function translateText(text, targetLanguage, preserveFormatting) {
    try {
        const languageNames = {
            'it': 'Italiano',
            'en': 'Inglese',
            'es': 'Spagnolo',
            'fr': 'Francese',
            'de': 'Tedesco',
            'pt': 'Portoghese',
            'ru': 'Russo',
            'ja': 'Giapponese',
            'zh': 'Cinese',
            'ar': 'Arabo'
        };
        const targetLangName = languageNames[targetLanguage] || targetLanguage;
        const prompt = preserveFormatting ? `Traduci il seguente testo in ${targetLangName} mantenendo ESATTAMENTE la stessa formattazione, struttura, interruzioni di riga e spaziatura. Non aggiungere commenti o spiegazioni, restituisci solo il testo tradotto:\n\n${text}` : `Traduci il seguente testo in ${targetLangName}. Restituisci solo la traduzione senza commenti:\n\n${text}`;
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Sei un traduttore professionale. Traduci il testo mantenendo il tono e lo stile originale.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Errore traduzione con OpenAI:', error);
        throw new Error('Errore durante la traduzione del testo');
    }
}
// Funzione per creare documento tradotto
async function createTranslatedDocument(originalText, translatedText, originalPath, originalFilename, targetLanguage) {
    const ext = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].extname(originalFilename).toLowerCase();
    if (ext === '.pdf') {
        // Per PDF, creiamo un nuovo PDF con il testo tradotto
        // In produzione, useresti pdf-lib per mantenere meglio la formattazione
        const doc = new __TURBOPACK__imported__module__$5b$externals$5d2f$pdfkit__$5b$external$5d$__$28$pdfkit$2c$__cjs$29$__["default"]();
        const outputPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(originalPath), `translated_${Date.now()}.pdf`);
        const stream = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].createWriteStream(outputPath);
        doc.pipe(stream);
        doc.fontSize(12);
        // Dividi il testo in paragrafi per una migliore formattazione
        const paragraphs = translatedText.split('\n\n');
        paragraphs.forEach((para, index)=>{
            if (index > 0) doc.moveDown();
            doc.text(para, {
                align: 'left',
                continued: false
            });
        });
        doc.end();
        await new Promise((resolve, reject)=>{
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
        return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(outputPath);
    } else if (ext === '.docx') {
        // Per DOCX, creiamo un nuovo documento
        // In produzione, useresti docx o officegen per mantenere la formattazione
        const outputPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(originalPath), `translated_${Date.now()}.txt`);
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(outputPath, translatedText, 'utf-8');
        return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(outputPath);
    } else {
        // Per TXT e MD, creiamo un nuovo file di testo
        const outputPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(originalPath), `translated_${Date.now()}${ext}`);
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(outputPath, translatedText, 'utf-8');
        return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(outputPath);
    }
}
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
        maxFileSize: 50 * 1024 * 1024
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
        const documentFile = Array.isArray(files.document) ? files.document[0] : files.document;
        const targetLanguage = Array.isArray(fields.targetLanguage) ? fields.targetLanguage[0] : fields.targetLanguage || 'en';
        const preserveFormatting = Array.isArray(fields.preserveFormatting) ? fields.preserveFormatting[0] === 'true' : fields.preserveFormatting === 'true';
        if (!documentFile) {
            return res.status(400).json({
                error: 'Nessun documento caricato'
            });
        }
        // Estrai testo dal documento
        const originalText = await extractText(documentFile.filepath, documentFile.mimetype, documentFile.originalFilename);
        if (!originalText || originalText.trim().length === 0) {
            return res.status(400).json({
                error: 'Impossibile estrarre testo dal documento'
            });
        }
        // Traduci il testo
        const translatedText = await translateText(originalText, targetLanguage, preserveFormatting);
        // Crea documento tradotto
        const translatedBuffer = await createTranslatedDocument(originalText, translatedText, documentFile.filepath, documentFile.originalFilename, targetLanguage);
        // Determina il tipo MIME e nome file
        const ext = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].extname(documentFile.originalFilename).toLowerCase();
        let mimeType = 'application/octet-stream';
        let filename = `translated_${targetLanguage}_${documentFile.originalFilename}`;
        if (ext === '.pdf') {
            mimeType = 'application/pdf';
        } else if (ext === '.docx') {
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (ext === '.txt') {
            mimeType = 'text/plain';
        } else if (ext === '.md') {
            mimeType = 'text/markdown';
        }
        // Cleanup
        try {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(documentFile.filepath);
            // Pulisci anche i file temporanei creati
            const tempFiles = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(uploadDir).filter((f)=>f.startsWith('translated_'));
            tempFiles.forEach((f)=>{
                try {
                    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(uploadDir, f));
                } catch (e) {}
            });
        } catch (e) {
            console.error('Errore cleanup:', e);
        }
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.status(200).send(translatedBuffer);
    } catch (error) {
        console.error('Errore API Traduzione Documenti:', error);
        res.status(500).json({
            error: error.message || 'Errore durante la traduzione del documento. Riprova con un file diverso.'
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b112fbca._.js.map