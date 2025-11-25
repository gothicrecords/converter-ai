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
"[externals]/xlsx [external] (xlsx, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("xlsx", () => require("xlsx"));

module.exports = mod;
}),
"[externals]/openai [external] (openai, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("openai");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/lib/openai.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

// OpenAI API integration with official SDK
__turbopack_context__.s([
    "analyzeImageWithVision",
    ()=>analyzeImageWithVision,
    "chatCompletion",
    ()=>chatCompletion,
    "classifyDocument",
    ()=>classifyDocument,
    "enhanceImageQualityWithAI",
    ()=>enhanceImageQualityWithAI,
    "extractTextFromPdfWithOpenAI",
    ()=>extractTextFromPdfWithOpenAI,
    "generateEmbedding",
    ()=>generateEmbedding,
    "generateEmbeddingsBatch",
    ()=>generateEmbeddingsBatch,
    "generateImageWithDALLE",
    ()=>generateImageWithDALLE,
    "generateSummary",
    ()=>generateSummary,
    "generateTags",
    ()=>generateTags,
    "getImageUrlFromDALLE",
    ()=>getImageUrlFromDALLE,
    "upscaleImageWithDALLE",
    ()=>upscaleImageWithDALLE
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/openai [external] (openai, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const openai = new __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__["default"]({
    apiKey: process.env.OPENAI_API_KEY
});
async function generateEmbedding(text) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text.substring(0, 8000)
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
}
async function generateEmbeddingsBatch(texts) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    if (!Array.isArray(texts) || texts.length === 0) return [];
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: texts.map((t)=>(t || '').toString().substring(0, 8000))
        });
        return response.data.map((d)=>d.embedding);
    } catch (error) {
        console.error('Error generating batch embeddings:', error);
        throw new Error(`Failed to generate batch embeddings: ${error.message}`);
    }
}
async function chatCompletion(messages, options = {}) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        const response = await openai.chat.completions.create({
            model: options.model || 'gpt-4o-mini',
            messages: messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 1000,
            top_p: options.top_p || 1,
            frequency_penalty: options.frequency_penalty || 0,
            presence_penalty: options.presence_penalty || 0
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error in chat completion:', error);
        // Handle specific OpenAI errors
        if (error.status === 401) {
            throw new Error('Chiave API OpenAI non valida. Verifica la configurazione.');
        } else if (error.status === 429) {
            throw new Error('Limite di rate raggiunto. Riprova tra qualche secondo.');
        } else if (error.status === 500) {
            throw new Error('Errore del server OpenAI. Riprova più tardi.');
        }
        throw new Error(`Errore nella comunicazione con OpenAI: ${error.message}`);
    }
}
async function generateSummary(text, maxLength = 200) {
    const messages = [
        {
            role: 'system',
            content: 'You are a helpful assistant that creates concise summaries.'
        },
        {
            role: 'user',
            content: `Summarize the following text in ${maxLength} words or less:\n\n${text}`
        }
    ];
    return await chatCompletion(messages, {
        temperature: 0.5,
        max_tokens: 300
    });
}
async function generateTags(text, count = 5) {
    const messages = [
        {
            role: 'system',
            content: 'You are a helpful assistant that generates relevant tags for documents. Return only comma-separated tags, no explanations.'
        },
        {
            role: 'user',
            content: `Generate ${count} relevant tags for this document:\n\n${text.substring(0, 2000)}`
        }
    ];
    const response = await chatCompletion(messages, {
        temperature: 0.3,
        max_tokens: 100
    });
    return response.split(',').map((tag)=>tag.trim().toLowerCase()).filter((tag)=>tag.length > 0).slice(0, count);
}
async function classifyDocument(text) {
    const categories = [
        'contract',
        'invoice',
        'report',
        'presentation',
        'spreadsheet',
        'image',
        'code',
        'email',
        'article',
        'other'
    ];
    const messages = [
        {
            role: 'system',
            content: `You are a document classifier. Classify the document into one or more of these categories: ${categories.join(', ')}. Return only category names, comma-separated.`
        },
        {
            role: 'user',
            content: `Classify this document:\n\n${text.substring(0, 1000)}`
        }
    ];
    const response = await chatCompletion(messages, {
        temperature: 0.2,
        max_tokens: 50
    });
    return response.split(',').map((cat)=>cat.trim().toLowerCase()).filter((cat)=>categories.includes(cat));
}
async function analyzeImageWithVision(imageBuffer, imageMimeType, query = 'Cosa contiene questa immagine? Descrivi tutto ciò che vedi.') {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        // Converti il buffer in base64
        const base64Image = imageBuffer.toString('base64');
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'Sei un assistente AI esperto nell\'analisi di immagini. Descrivi in dettaglio tutto ciò che vedi nell\'immagine, inclusi testo, oggetti, persone, scene, colori e qualsiasi altro dettaglio rilevante. Rispondi sempre in italiano.'
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: query
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${imageMimeType};base64,${base64Image}`,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 2000,
            temperature: 0.2
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error in vision API:', error);
        if (error.status === 401) {
            throw new Error('Chiave API OpenAI non valida. Verifica la configurazione.');
        } else if (error.status === 429) {
            throw new Error('Limite di rate raggiunto. Riprova tra qualche secondo.');
        } else if (error.status === 400 && error.message?.includes('image')) {
            throw new Error('Formato immagine non supportato o immagine troppo grande.');
        }
        throw new Error(`Errore nell'analisi dell'immagine: ${error.message}`);
    }
}
async function extractTextFromPdfWithOpenAI(filePath) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    const fs = await __turbopack_context__.A("[externals]/fs [external] (fs, cjs, async loader)");
    let uploadedFile = null;
    try {
        console.log('Caricamento PDF su OpenAI (Responses API):', filePath);
        // 1) Carica il file su OpenAI come user_data
        uploadedFile = await openai.files.create({
            file: fs.createReadStream(filePath),
            purpose: 'user_data'
        });
        console.log('File caricato su OpenAI:', uploadedFile.id);
        // 2) Richiesta al modello GPT-4o per estrazione testo dal file caricato
        const response = await openai.responses.create({
            model: 'gpt-4o',
            input: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'input_text',
                            text: 'Estrai tutto il testo e le informazioni rilevanti da questo documento. Rispondi SOLO con il testo estratto, senza commenti.'
                        },
                        {
                            type: 'input_file',
                            file_id: uploadedFile.id
                        }
                    ]
                }
            ],
            max_output_tokens: 8000,
            temperature: 0.1
        });
        // 3) Prendi solo testo
        const extractedText = (response.output_text || '').toString().trim();
        console.log(`Testo estratto da PDF: ${extractedText.length} caratteri`);
        if (!extractedText) {
            throw new Error('Nessun testo estratto dal PDF');
        }
        return extractedText;
    } catch (error) {
        console.error('Error in PDF text extraction (Responses API):', error);
        if (error.status === 401) {
            throw new Error('Chiave API OpenAI non valida. Verifica la configurazione.');
        } else if (error.status === 429) {
            throw new Error('Limite di rate raggiunto. Riprova tra qualche secondo.');
        } else if (error.status === 400) {
            throw new Error('Errore nell\'analisi del PDF con Responses API. Il file potrebbe essere troppo grande o danneggiato.');
        }
        throw new Error(`Errore nell'estrazione del testo PDF: ${error.message}`);
    } finally{
        // 4) Prova a rimuovere il file caricato (se l'SDK lo supporta)
        try {
            if (uploadedFile && uploadedFile.id) {
                if (openai.files?.delete) {
                    await openai.files.delete(uploadedFile.id);
                } else if (openai.files?.del) {
                    await openai.files.del(uploadedFile.id);
                }
                console.log('File rimosso da OpenAI:', uploadedFile.id);
            }
        } catch (delError) {
            console.warn('Errore rimozione file da OpenAI (ignorato):', delError?.message || delError);
        }
    }
}
async function getImageUrlFromDALLE(prompt, options = {}) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        const size = options.size || '1024x1024';
        const quality = options.quality || 'standard';
        const style = options.style || 'vivid';
        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            size: size,
            quality: quality,
            style: style,
            n: 1
        });
        const imageUrl = response.data[0]?.url;
        if (!imageUrl) {
            throw new Error('Nessuna immagine generata da DALL-E');
        }
        return imageUrl;
    } catch (error) {
        console.error('Error getting image URL from DALL-E:', error);
        console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            code: error.code,
            response: error.response?.data || error.response
        });
        if (error.status === 401) {
            throw new Error('Chiave API OpenAI non valida. Verifica la configurazione.');
        } else if (error.status === 429) {
            throw new Error('Limite di rate raggiunto. Riprova tra qualche secondo.');
        } else if (error.status === 400) {
            const errorMessage = error.message || error.response?.data?.error?.message || 'Prompt non valido o contenuto non consentito';
            throw new Error(`Errore nella generazione: ${errorMessage}`);
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new Error('Errore di connessione con OpenAI. Verifica la tua connessione internet.');
        }
        throw new Error(`Errore nella generazione dell'immagine: ${error.message || 'Errore sconosciuto'}`);
    }
}
async function generateImageWithDALLE(prompt, options = {}) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        const imageUrl = await getImageUrlFromDALLE(prompt, options);
        // Download the image and return as buffer
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            const errorText = await imageResponse.text().catch(()=>'Unknown error');
            throw new Error(`Errore nel download dell'immagine generata: ${imageResponse.status} ${imageResponse.statusText}. ${errorText}`);
        }
        const arrayBuffer = await imageResponse.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        // Re-throw errors from getImageUrlFromDALLE
        throw error;
    }
}
async function upscaleImageWithDALLE(imageBuffer, imageMimeType, enhancementPrompt = null) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        // 1. Analizza l'immagine con Vision API per creare un prompt descrittivo
        const analysisPrompt = enhancementPrompt || 'Descrivi in dettaglio questa immagine, includendo tutti i dettagli visivi, colori, composizione, stile e qualità. La descrizione sarà usata per creare una versione migliorata ad alta risoluzione.';
        const imageDescription = await analyzeImageWithVision(imageBuffer, imageMimeType, analysisPrompt);
        // 2. Crea un prompt per DALL-E che migliora l'immagine
        const enhancementPromptText = `Crea una versione migliorata e ad alta risoluzione di questa immagine: ${imageDescription}. Mantieni fedeltà ai dettagli originali ma migliora la qualità, la nitidezza e la risoluzione.`;
        // 3. Genera immagine migliorata con DALL-E 3 in alta risoluzione
        const enhancedImageBuffer = await generateImageWithDALLE(enhancementPromptText, {
            size: '1792x1024',
            quality: 'hd',
            style: 'natural'
        });
        return enhancedImageBuffer;
    } catch (error) {
        console.error('Error upscaling image with DALL-E:', error);
        throw new Error(`Errore nel miglioramento dell'immagine: ${error.message}`);
    }
}
async function enhanceImageQualityWithAI(imageBuffer, imageMimeType) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        // Use Vision API to analyze image quality issues
        const analysisPrompt = `Analyze this image and identify specific quality issues that need improvement. Focus on:
1. Noise level (low/medium/high)
2. Sharpness (blurry/sharp)
3. Color accuracy (washed out/vibrant)
4. Artifacts (compression artifacts, pixelation)
5. Overall quality issues

Respond with a JSON object: {"noise": "low|medium|high", "sharpness": "blurry|moderate|sharp", "color": "washed|normal|vibrant", "artifacts": "none|minor|major", "recommendations": "brief description"}`;
        const analysisResult = await analyzeImageWithVision(imageBuffer, imageMimeType, analysisPrompt);
        // Parse analysis result
        let analysis = {
            noise: 'medium',
            sharpness: 'moderate',
            color: 'normal',
            artifacts: 'none'
        };
        try {
            // Try to parse JSON from analysis
            const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                analysis = {
                    ...analysis,
                    ...parsed
                };
            }
        } catch (parseError) {
            console.warn('Could not parse AI analysis, using defaults');
        }
        // Apply targeted enhancements using sharp based on AI analysis
        const sharp = (await __turbopack_context__.A("[externals]/sharp [external] (sharp, cjs, async loader)")).default;
        let enhanced = sharp(imageBuffer, {
            sequentialRead: true
        });
        // Apply denoising if needed
        if (analysis.noise === 'high' || analysis.noise === 'medium') {
            enhanced = enhanced.median(analysis.noise === 'high' ? 3 : 2);
        }
        // Apply sharpening based on analysis
        if (analysis.sharpness === 'blurry') {
            enhanced = enhanced.sharpen({
                sigma: 2.0,
                m1: 1.0,
                m2: 0.5,
                x1: 3,
                y2: 3,
                y3: 3
            });
        } else if (analysis.sharpness === 'moderate') {
            enhanced = enhanced.sharpen({
                sigma: 1.0,
                m1: 0.7,
                m2: 0.4
            });
        }
        // Enhance color if needed
        if (analysis.color === 'washed') {
            enhanced = enhanced.modulate({
                saturation: 1.15,
                brightness: 1.05
            }).linear(1.05, -128 * 0.05); // Slight contrast boost
        }
        // Remove compression artifacts
        if (analysis.artifacts === 'major' || analysis.artifacts === 'minor') {
            enhanced = enhanced.png({
                quality: 100,
                compressionLevel: 6,
                adaptiveFiltering: true
            });
        } else {
            // Keep original format but with high quality
            if (imageMimeType === 'image/jpeg' || imageMimeType === 'image/jpg') {
                enhanced = enhanced.jpeg({
                    quality: 98,
                    mozjpeg: true,
                    trellisQuantisation: true,
                    overshootDeringing: true
                });
            } else {
                enhanced = enhanced.png({
                    quality: 100,
                    compressionLevel: 6
                });
            }
        }
        const enhancedBuffer = await enhanced.toBuffer();
        return enhancedBuffer;
    } catch (error) {
        console.error('Error enhancing image quality with AI:', error);
        // Return original buffer if enhancement fails
        return imageBuffer;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/documentAI.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

// Sistema AI completo per analisi documenti con OpenAI GPT-4
__turbopack_context__.s([
    "createTextChunks",
    ()=>createTextChunks,
    "extractTextFromDocument",
    ()=>extractTextFromDocument,
    "generateAnswer",
    ()=>generateAnswer,
    "generateMultiDocumentAnswer",
    ()=>generateMultiDocumentAnswer,
    "getAllDocuments",
    ()=>getAllDocuments,
    "getDocument",
    ()=>getDocument,
    "getDocumentStats",
    ()=>getDocumentStats,
    "removeDocument",
    ()=>removeDocument,
    "searchAllDocuments",
    ()=>searchAllDocuments,
    "semanticSearch",
    ()=>semanticSearch,
    "storeDocument",
    ()=>storeDocument
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mammoth__$5b$external$5d$__$28$mammoth$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mammoth [external] (mammoth, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$xlsx__$5b$external$5d$__$28$xlsx$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/xlsx [external] (xlsx, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/openai.js [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2e$js__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2e$js__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// pdf-parse ha problemi ESM/CJS con Turbopack, usiamo solo pdfjs-dist
// Storage in-memory per i documenti caricati (in produzione si può usare database)
const documentStore = new Map(); // { fileId: { text, chunks, metadata } }
async function extractTextFromDocument(buffer, mimeType, filename, filepath = null) {
    try {
        let text = '';
        let metadata = {
            filename,
            mimeType,
            pages: 0,
            wordCount: 0
        };
        if (mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
            // PDF: usa OpenAI file upload + GPT extraction (tutto lato server OpenAI)
            const { extractTextFromPdfWithOpenAI } = await __turbopack_context__.A("[project]/lib/openai.js [api] (ecmascript, async loader)");
            console.log(`Analizzando PDF con OpenAI file upload: ${filename}`);
            // Salva temporaneamente il file per l'upload
            const fs = await __turbopack_context__.A("[externals]/fs [external] (fs, cjs, async loader)");
            const path = await __turbopack_context__.A("[externals]/path [external] (path, cjs, async loader)");
            const os = await __turbopack_context__.A("[externals]/os [external] (os, cjs, async loader)");
            const tempDir = os.tmpdir();
            const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${filename}`);
            try {
                // Scrivi il buffer su file temporaneo
                fs.writeFileSync(tempFilePath, buffer);
                // Estrai testo con OpenAI (file upload -> GPT risponde con SOLO testo)
                text = await extractTextFromPdfWithOpenAI(tempFilePath);
                // Assicurati che sia una stringa pulita
                text = (text || "").toString().trim();
                metadata.analysisMethod = 'openai-file-upload';
                if (!text || text.length === 0) {
                    throw new Error('Nessun testo estratto dal PDF tramite OpenAI');
                }
                console.log(`PDF analizzato con OpenAI: ${text.length} caratteri estratti`);
            } finally{
                // Pulisci file temporaneo
                try {
                    if (fs.existsSync(tempFilePath)) {
                        fs.unlinkSync(tempFilePath);
                    }
                } catch (cleanupError) {
                    console.warn('Errore pulizia file temporaneo:', cleanupError);
                }
            }
        } else if (mimeType.includes('wordprocessingml') || filename.toLowerCase().endsWith('.docx')) {
            const result = await __TURBOPACK__imported__module__$5b$externals$5d2f$mammoth__$5b$external$5d$__$28$mammoth$2c$__cjs$29$__["default"].extractRawText({
                buffer
            });
            text = result.value;
            // Pulisci il testo
            text = text.replace(/\s+/g, ' ').trim();
        } else if (mimeType.includes('spreadsheet') || filename.toLowerCase().match(/\.(xlsx|xls|csv)$/i)) {
            const workbook = __TURBOPACK__imported__module__$5b$externals$5d2f$xlsx__$5b$external$5d$__$28$xlsx$2c$__cjs$29$__["read"](buffer, {
                type: 'buffer'
            });
            const sheets = workbook.SheetNames;
            // Estrai testo da tutte le celle
            const allText = [];
            for (const sheetName of sheets){
                const sheet = workbook.Sheets[sheetName];
                const sheetData = __TURBOPACK__imported__module__$5b$externals$5d2f$xlsx__$5b$external$5d$__$28$xlsx$2c$__cjs$29$__["utils"].sheet_to_json(sheet, {
                    header: 1,
                    defval: ''
                });
                for (const row of sheetData){
                    if (Array.isArray(row)) {
                        const rowText = row.filter((cell)=>cell && cell.toString().trim()).join(' ');
                        if (rowText.trim()) {
                            allText.push(`[${sheetName}] ${rowText}`);
                        }
                    }
                }
            }
            text = allText.join('\n');
        } else if (mimeType.startsWith('text/') || filename.toLowerCase().endsWith('.txt')) {
            text = buffer.toString('utf-8');
        } else if (mimeType.startsWith('image/') || filename.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp|bmp|tif|tiff|heic|heif)$/i)) {
            // Usa OpenAI Vision API come ChatGPT (più intelligente) + OCR come fallback
            try {
                const { analyzeImageWithVision } = await __turbopack_context__.A("[project]/lib/openai.js [api] (ecmascript, async loader)");
                console.log(`Analizzando immagine con OpenAI Vision API: ${filename}`);
                try {
                    // Prova prima con OpenAI Vision API (come ChatGPT)
                    const visionText = await analyzeImageWithVision(buffer, mimeType, 'Analizza questa immagine in dettaglio. Descrivi tutto ciò che vedi, incluso qualsiasi testo presente, oggetti, persone, scene, colori e dettagli rilevanti. Se c\'è del testo, trascrivilo accuratamente.');
                    text = visionText;
                    console.log(`Vision API completato: ${text.length} caratteri estratti`);
                    // Aggiungi metadata per indicare che è stato usato Vision API
                    metadata.analysisMethod = 'openai-vision';
                } catch (visionError) {
                    console.log('Vision API fallito, provo con OCR:', visionError.message);
                    // Fallback a OCR tradizionale
                    const Tesseract = (await __turbopack_context__.A("[externals]/tesseract.js [external] (tesseract.js, cjs, async loader)")).default;
                    const imageSource = filepath || buffer;
                    try {
                        const result = await Tesseract.recognize(imageSource, 'ita+eng', {
                            logger: (m)=>{
                                if (m.status === 'recognizing text') {
                                    console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                                }
                            }
                        });
                        text = result.data.text.trim();
                        metadata.analysisMethod = 'ocr-tesseract';
                    } catch (ocrError) {
                        // Se anche OCR fallisce, prova con createWorker
                        console.log('OCR semplice fallito, provo con createWorker:', ocrError.message);
                        const worker = await Tesseract.createWorker('ita+eng', 1, {
                            logger: (m)=>{
                                if (m.status === 'recognizing text') {
                                    console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                                }
                            }
                        });
                        try {
                            const result = await worker.recognize(imageSource);
                            text = result.data.text.trim();
                            metadata.analysisMethod = 'ocr-tesseract-worker';
                        } finally{
                            await worker.terminate();
                        }
                    }
                }
                if (!text || text.length === 0) {
                    throw new Error('Nessun contenuto estratto dall\'immagine. L\'immagine potrebbe essere vuota o non contenere testo leggibile.');
                }
                console.log(`Analisi immagine completata: ${text.length} caratteri estratti (metodo: ${metadata.analysisMethod || 'unknown'})`);
            } catch (imageError) {
                console.error('Errore analisi immagine completo:', imageError);
                throw new Error(`Errore nell'analisi dell'immagine: ${imageError.message}`);
            }
        } else {
            throw new Error(`Tipo di file non supportato: ${mimeType}`);
        }
        if (!text || text.trim().length === 0) {
            throw new Error('Nessun testo estratto dal documento');
        }
        metadata.wordCount = text.split(/\s+/).length;
        return {
            text,
            metadata
        };
    } catch (error) {
        console.error('Errore estrazione testo:', error);
        throw new Error(`Errore nell'estrazione del testo: ${error.message}`);
    }
}
async function createTextChunks(text, chunkSize = 1000, overlap = 200) {
    const sentences = text.split(/[.!?]+\s+/).filter((s)=>s.trim().length > 10);
    const chunks = [];
    let currentChunk = '';
    let currentLength = 0;
    for (const sentence of sentences){
        const sentenceLength = sentence.length;
        if (currentLength + sentenceLength > chunkSize && currentChunk.trim()) {
            // Salva il chunk corrente
            chunks.push({
                text: currentChunk.trim(),
                startIndex: text.indexOf(currentChunk.trim()),
                endIndex: text.indexOf(currentChunk.trim()) + currentChunk.length
            });
            // Crea nuovo chunk con overlap (ultime parole del chunk precedente)
            const words = currentChunk.split(/\s+/);
            const overlapWords = words.slice(-Math.floor(overlap / 10));
            currentChunk = overlapWords.join(' ') + ' ' + sentence + ' ';
            currentLength = currentChunk.length;
        } else {
            currentChunk += sentence + '. ';
            currentLength += sentenceLength + 2;
        }
    }
    // Aggiungi l'ultimo chunk
    if (currentChunk.trim()) {
        chunks.push({
            text: currentChunk.trim(),
            startIndex: text.indexOf(currentChunk.trim()),
            endIndex: text.length
        });
    }
    const finalChunks = chunks.length > 0 ? chunks : [
        {
            text: text.trim(),
            startIndex: 0,
            endIndex: text.length
        }
    ];
    // Genera embeddings per i chunk in batch per ridurre latenza
    const { generateEmbeddingsBatch } = await __turbopack_context__.A("[project]/lib/openai.js [api] (ecmascript, async loader)");
    try {
        // Processa in lotti per evitare payload troppo grandi
        const BATCH_SIZE = 16;
        for(let i = 0; i < finalChunks.length; i += BATCH_SIZE){
            const batch = finalChunks.slice(i, i + BATCH_SIZE);
            const embeddings = await generateEmbeddingsBatch(batch.map((c)=>c.text));
            embeddings.forEach((emb, idx)=>{
                batch[idx].embedding = emb;
            });
        }
    } catch (embError) {
        console.warn('Batch embeddings failed, falling back to per-chunk:', embError.message);
        const { generateEmbedding } = await __turbopack_context__.A("[project]/lib/openai.js [api] (ecmascript, async loader)");
        for (const chunk of finalChunks){
            try {
                chunk.embedding = await generateEmbedding(chunk.text);
            } catch (err) {
                console.warn('Errore generazione embedding per chunk:', err.message);
                chunk.embedding = null;
            }
        }
    }
    return finalChunks;
}
/**
 * Calcola cosine similarity tra due vettori di embedding
 */ function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    const dot = vecA.reduce((sum, val, i)=>sum + val * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, val)=>sum + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((sum, val)=>sum + val * val, 0));
    return dot / (magA * magB);
}
/**
 * Calcola TF-IDF per ricerca semantica semplice (fallback se embedding non disponibile)
 */ function calculateTFIDF(text, query) {
    const textWords = text.toLowerCase().split(/\W+/).filter((w)=>w.length > 2);
    const queryWords = query.toLowerCase().split(/\W+/).filter((w)=>w.length > 2);
    if (queryWords.length === 0) return 0;
    let score = 0;
    const textWordCount = {};
    textWords.forEach((word)=>{
        textWordCount[word] = (textWordCount[word] || 0) + 1;
    });
    queryWords.forEach((queryWord)=>{
        const wordCount = textWordCount[queryWord] || 0;
        if (wordCount > 0) {
            // TF: frequenza del termine nel documento
            const tf = wordCount / textWords.length;
            // IDF: inversa della frequenza (più raro = più importante)
            const idf = Math.log(textWords.length / (wordCount + 1)) + 1;
            score += tf * idf;
        }
    });
    return score / queryWords.length;
}
async function semanticSearch(documentText, chunks, query, topK = 5) {
    if (!chunks || chunks.length === 0) {
        return [];
    }
    // Genera embedding per la query
    const { generateEmbedding } = await __turbopack_context__.A("[project]/lib/openai.js [api] (ecmascript, async loader)");
    let queryEmbedding = null;
    try {
        queryEmbedding = await generateEmbedding(query);
    } catch (embError) {
        console.warn('Errore generazione embedding query, uso TF-IDF:', embError);
    }
    // Calcola score per ogni chunk
    const scoredChunks = chunks.map((chunk, index)=>{
        let semanticScore = 0;
        // Usa cosine similarity se embeddings disponibili
        if (queryEmbedding && chunk.embedding) {
            semanticScore = cosineSimilarity(queryEmbedding, chunk.embedding);
        } else {
            // Fallback a TF-IDF
            semanticScore = calculateTFIDF(chunk.text, query) / 10; // Normalizza per essere simile a cosine
        }
        // Bonus per match esatti
        const lowerChunk = chunk.text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        let exactMatchBonus = 0;
        if (lowerChunk.includes(lowerQuery)) {
            exactMatchBonus = 0.1;
        }
        // Bonus per parole chiave comuni
        const queryWords = query.toLowerCase().split(/\W+/).filter((w)=>w.length > 2);
        const matchingWords = queryWords.filter((word)=>lowerChunk.includes(word)).length;
        const keywordBonus = matchingWords / queryWords.length * 0.05;
        const totalScore = semanticScore + exactMatchBonus + keywordBonus;
        return {
            ...chunk,
            score: totalScore,
            index
        };
    });
    // Ordina per score e ritorna i top K (anche con score bassi)
    const sortedChunks = scoredChunks.sort((a, b)=>b.score - a.score).slice(0, topK);
    console.log('Top chunk scores:', sortedChunks.map((c)=>c.score.toFixed(4)));
    // Ritorna anche risultati con score bassi (meglio di niente)
    return sortedChunks.filter((chunk)=>chunk.score >= 0);
}
async function generateAnswer(query, relevantChunks, documentText, conversationContext = '', documentMetadata = {}) {
    if (!relevantChunks || relevantChunks.length === 0) {
        return {
            answer: "Non ho trovato informazioni rilevanti nel documento per rispondere alla tua domanda. Prova a formulare la domanda in modo diverso o carica un documento più pertinente.",
            confidence: 0,
            sources: []
        };
    }
    // Combina i chunk più rilevanti - SOLO TESTO (no oggetti, no IDs)
    const combinedContext = relevantChunks.map((chunk, idx)=>`[Sezione ${idx + 1}]\n${chunk.text}`).join('\n\n---\n\n');
    // Usa OpenAI GPT-4 per generare una risposta intelligente
    const confidence = Math.min(relevantChunks[0].score * 10, 1.0);
    try {
        // Costruisci il prompt con contesto della conversazione se disponibile
        let contextSection = '';
        if (conversationContext && conversationContext.trim()) {
            contextSection = `\n\n**CONTESTO DELLA CONVERSAZIONE PRECEDENTE:**
${conversationContext}

Usa questo contesto per capire meglio la domanda e fornire una risposta coerente con la conversazione.`;
        }
        const messages = [
            {
                role: 'system',
                content: `Sei un assistente AI esperto nell'analisi di documenti. Segui un ragionamento interno SILENTE (non mostrarlo) con i passi: 1) Identifica concetti chiave 2) Seleziona parti rilevanti 3) Sintetizza relazioni 4) Verifica contraddizioni o assenze 5) Struttura risposta finale. Poi produci SOLO l'output formattato.

OBIETTIVI:
1. Analisi accurata delle sezioni fornite
2. Risposta logica e coerente basata esclusivamente sul contenuto
3. Struttura chiara e professionale in italiano
4. Citazione delle fonti/Sezioni rilevanti
5. Nessuna invenzione: se manca l'informazione, dichiaralo e suggerisci cosa servirebbe

FORMATTA LA RISPOSTA CON LE SEZIONI (usa markdown semplice):
**Risposta**: sintesi principale diretta alla domanda.
**Dettagli**: approfondisci punti chiave organizzati.
**Fonti**: elenco puntato con sezione e breve estratto.
**Limiti**: cosa non è presente o ambiguo.
**Suggerimenti**: eventuali passi successivi o chiarimenti da richiedere.

Regole:
- Non includere il ragionamento interno.
- Non scusarti a meno che il contenuto sia realmente assente.
- Mantieni tono professionale, conciso ma completo.`
            },
            {
                role: 'user',
                content: `Analizza il seguente contenuto estratto dal documento e rispondi alla domanda dell'utente in modo completo e accurato.

**CONTENUTO DEL DOCUMENTO:**
${combinedContext}${contextSection}

**DOMANDA DELL'UTENTE:**
${query}

**ISTRUZIONI:**
- Rispondi basandoti SOLO sul contenuto fornito sopra
- Se la risposta richiede informazioni non presenti, dillo chiaramente
- Cita o fai riferimento alle sezioni rilevanti quando possibile
- Fornisci una risposta completa e ben strutturata
- Considera il contesto della conversazione se fornito per una risposta più pertinente`
            }
        ];
        let answer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2e$js__$5b$api$5d$__$28$ecmascript$29$__["chatCompletion"])(messages, {
            model: 'gpt-4o-mini',
            temperature: 0.2,
            max_tokens: 1200,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1 // Incentiva varietà
        });
        answer = answer.trim();
        // Post-processing: se il modello ha prodotto solo una frase debole/apologetica, arricchisci con estratti
        const isWeak = /mi dispiace|non posso/i.test(answer) && answer.length < 120;
        if (isWeak) {
            const enriched = `**Risposta**: Informazioni limitate nel testo fornito.
**Dettagli**:\n${relevantChunks.slice(0, 3).map((c)=>'- ' + c.text.substring(0, 200).replace(/\n+/g, ' ') + (c.text.length > 200 ? '...' : '')).join('\n')}\n**Fonti**:\n${relevantChunks.map((c, i)=>`- Sezione ${i + 1} (score ${c.score.toFixed(3)})`).join('\n')}\n**Limiti**: Il documento sembra contenere testo estremamente breve o generico.\n**Suggerimenti**: Carica un documento più esteso oppure specifica meglio la domanda.`;
            answer = enriched;
        }
        return {
            answer,
            confidence,
            sources: relevantChunks.map((c)=>({
                    filename: documentMetadata?.originalFilename || documentMetadata?.filename || 'Documento',
                    text: c.text.substring(0, 150) + '...',
                    score: c.score.toFixed(3)
                }))
        };
    } catch (error) {
        console.error('Errore nella generazione della risposta con OpenAI:', error);
        // Fallback a risposta semplice se OpenAI fallisce
        const contextText = relevantChunks[0].text;
        return {
            answer: `Basandomi sul documento:\n\n${contextText}\n\n${relevantChunks.length > 1 ? '\nInformazioni aggiuntive:\n' + relevantChunks.slice(1, 3).map((c, i)=>`• ${c.text.substring(0, 200)}...`).join('\n') : ''}`,
            confidence,
            sources: relevantChunks.map((c)=>({
                    filename: documentMetadata?.originalFilename || documentMetadata?.filename || 'Documento',
                    text: c.text.substring(0, 150) + '...',
                    score: c.score.toFixed(3)
                }))
        };
    }
}
async function storeDocument(fileId, text, metadata = {}) {
    console.log(`storeDocument called for ${fileId}, text length: ${text.length}`);
    const chunks = await createTextChunks(text);
    console.log(`Created ${chunks.length} chunks for document ${fileId}`);
    const documentData = {
        text,
        chunks,
        metadata: {
            ...metadata,
            filename: metadata.filename || metadata.originalFilename || 'Unknown',
            storedAt: new Date().toISOString(),
            chunkCount: chunks.length
        }
    };
    documentStore.set(fileId, documentData);
    console.log(`Document ${fileId} stored. Store size now: ${documentStore.size}`);
    console.log(`Store keys:`, Array.from(documentStore.keys()));
    return {
        fileId,
        chunkCount: chunks.length,
        wordCount: text.split(/\s+/).length
    };
}
function getDocument(fileId) {
    return documentStore.get(fileId);
}
function removeDocument(fileId) {
    return documentStore.delete(fileId);
}
async function searchAllDocuments(query, fileIds = null) {
    console.log('searchAllDocuments called with query:', query, 'fileIds:', fileIds);
    console.log('documentStore size:', documentStore.size);
    console.log('documentStore keys:', Array.from(documentStore.keys()));
    const documents = fileIds && fileIds.length > 0 ? fileIds.map((id)=>{
        const data = documentStore.get(id);
        console.log(`Looking for fileId ${id}:`, data ? 'found' : 'NOT FOUND');
        return {
            id,
            data
        };
    }).filter((d)=>d.data) : Array.from(documentStore.entries()).map(([id, data])=>{
        console.log(`Document ${id}:`, data ? 'found' : 'NOT FOUND');
        return {
            id,
            data
        };
    });
    console.log(`Found ${documents.length} documents to search`);
    if (documents.length === 0) {
        console.log('No documents found to search in');
        return [];
    }
    const allResults = [];
    for (const { id, data } of documents){
        if (!data || !data.chunks || !data.chunks.length) {
            console.log(`Document ${id} has no chunks, skipping`);
            continue;
        }
        console.log(`Searching in document ${id} (${data.chunks.length} chunks)`);
        const results = await semanticSearch(data.text, data.chunks, query, 5);
        if (results.length > 0) {
            console.log(`Found ${results.length} relevant chunks in document ${id}`);
            allResults.push({
                fileId: id,
                filename: data.metadata?.originalFilename || data.metadata?.filename || 'Unknown',
                results,
                topScore: results[0].score
            });
        } else {
            console.log(`No relevant chunks found in document ${id}`);
        }
    }
    console.log(`Total search results: ${allResults.length}`);
    // Ordina per score migliore
    return allResults.sort((a, b)=>b.topScore - a.topScore);
}
async function generateMultiDocumentAnswer(query, searchResults, conversationContext = '') {
    if (!searchResults || searchResults.length === 0) {
        return {
            answer: "Non ho trovato informazioni rilevanti nei documenti caricati. Prova a formulare la domanda in modo diverso o carica documenti più pertinenti.",
            confidence: 0,
            sources: []
        };
    }
    // Prendi i chunk migliori da tutti i documenti
    const topChunks = searchResults.flatMap((fileResult)=>fileResult.results.map((r)=>({
                ...r,
                filename: fileResult.filename,
                fileId: fileResult.fileId
            }))).sort((a, b)=>b.score - a.score).slice(0, 5);
    if (topChunks.length === 0) {
        return {
            answer: "Non ho trovato informazioni sufficienti per rispondere.",
            confidence: 0,
            sources: []
        };
    }
    // Genera risposta combinata usando OpenAI
    const primaryChunk = topChunks[0];
    const document = getDocument(primaryChunk.fileId);
    if (searchResults.length === 1) {
        // Un solo documento - usa generateAnswer con metadata per filename
        return await generateAnswer(query, topChunks, document.text, conversationContext, document.metadata || {});
    } else {
        // Multiple documenti - combina informazioni da più fonti
        const confidence = Math.min(primaryChunk.score * 10, 1.0);
        try {
            // Combina SOLO testo dai documenti (no file IDs, no oggetti)
            const combinedContext = topChunks.map((chunk, idx)=>`[Documento: "${chunk.filename}" - Sezione ${idx + 1}]\n${chunk.text}`).join('\n\n---\n\n');
            // Costruisci il prompt con contesto della conversazione se disponibile
            let contextSection = '';
            if (conversationContext && conversationContext.trim()) {
                contextSection = `\n\n**CONTESTO DELLA CONVERSAZIONE PRECEDENTE:**
${conversationContext}

Usa questo contesto per capire meglio la domanda e fornire una risposta coerente con la conversazione.`;
            }
            const messages = [
                {
                    role: 'system',
                    content: `Sei un assistente AI esperto nell'analisi di documenti multipli. Usa ragionamento interno SILENTE (non mostrarlo) seguendo: 1) Mappa concetti per documento 2) Trova sovrapposizioni/contrasti 3) Sintetizza 4) Valuta completezza 5) Struttura output. Non mostrare i passi.

FORMATTA OUTPUT:
**Risposta** (sintesi diretta alla domanda)
**Analisi** (integrazione logica tra documenti, relazioni, eventuali differenze)
**Fonti** (elenco: Documento – breve estratto pertinente)
**Limiti** (informazioni mancanti, contraddizioni non risolte)
**Suggerimenti** (cosa potrebbe aiutare o prossimi passi)

Regole:
- Non inventare contenuto
- Non scusarti salvo assenza totale di informazioni
- Cita il nome del documento per ogni informazione specifica
- Indica contraddizioni se presenti.`
                },
                {
                    role: 'user',
                    content: `Analizza il contenuto estratto da ${searchResults.length} documenti diversi e rispondi alla domanda dell'utente sintetizzando le informazioni rilevanti.

**CONTENUTO DAI DOCUMENTI:**
${combinedContext}${contextSection}

**DOMANDA DELL'UTENTE:**
${query}

**ISTRUZIONI:**
- Combina informazioni da tutti i documenti rilevanti
- Cita sempre il nome del documento quando fai riferimento a informazioni specifiche
- Se ci sono informazioni correlate in più documenti, integrale in modo coerente
- Fornisci una risposta completa che risponda alla domanda utilizzando tutte le fonti pertinenti
- Considera il contesto della conversazione se fornito per una risposta più pertinente`
                }
            ];
            let answer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2e$js__$5b$api$5d$__$28$ecmascript$29$__["chatCompletion"])(messages, {
                model: 'gpt-4o-mini',
                temperature: 0.2,
                max_tokens: 1500,
                top_p: 0.9,
                frequency_penalty: 0.1,
                presence_penalty: 0.1
            });
            answer = answer.trim();
            const isWeak = /mi dispiace|non posso/i.test(answer) && answer.length < 140;
            if (isWeak) {
                const enrichment = topChunks.slice(0, 5).map((c, i)=>`- ${c.filename} [score ${c.score.toFixed(3)}]: ${c.text.substring(0, 160).replace(/\n+/g, ' ')}${c.text.length > 160 ? '...' : ''}`).join('\n');
                answer = `**Risposta**: Informazioni limitate ma estratte dai documenti.
**Analisi**: I contenuti disponibili sono molto brevi; non emergono argomentazioni complesse.
**Fonti**:\n${enrichment}
**Limiti**: Poca profondità; serve testo aggiuntivo.
**Suggerimenti**: Carica versioni più complete dei documenti o specifica una domanda più dettagliata.`;
            }
            return {
                answer,
                confidence,
                sources: topChunks.slice(0, 3).map((c)=>({
                        filename: c.filename,
                        text: c.text.substring(0, 100) + '...',
                        score: c.score.toFixed(3)
                    }))
            };
        } catch (error) {
            console.error('Errore nella generazione della risposta multi-documento con OpenAI:', error);
            // Fallback
            let answer = `Basandomi sui ${searchResults.length} documenti caricati:\n\n`;
            answer += `**Dal documento "${primaryChunk.filename}":**\n${primaryChunk.text}\n\n`;
            if (topChunks.length > 1) {
                const otherDocs = topChunks.slice(1, 3).filter((c)=>c.fileId !== primaryChunk.fileId);
                if (otherDocs.length > 0) {
                    answer += `**Informazioni correlate da altri documenti:**\n`;
                    otherDocs.forEach((chunk, idx)=>{
                        answer += `\n[${idx + 1}] Da "${chunk.filename}":\n${chunk.text.substring(0, 200)}...\n`;
                    });
                }
            }
            const confidence = Math.min(primaryChunk.score * 10, 1.0);
            return {
                answer: answer.trim(),
                confidence,
                sources: topChunks.slice(0, 3).map((c)=>({
                        filename: c.filename,
                        text: c.text.substring(0, 100) + '...',
                        score: c.score.toFixed(3)
                    }))
            };
        }
    }
}
function getAllDocuments() {
    return Array.from(documentStore.entries()).map(([fileId, doc])=>({
            fileId,
            ...doc
        }));
}
function getDocumentStats() {
    const documents = Array.from(documentStore.values());
    return {
        totalDocuments: documentStore.size,
        totalWords: documents.reduce((sum, doc)=>sum + (doc.text.split(/\s+/).length || 0), 0),
        totalChunks: documents.reduce((sum, doc)=>sum + (doc.chunks?.length || 0), 0),
        documents: Array.from(documentStore.entries()).map(([fileId, doc])=>({
                fileId,
                index: Array.from(documentStore.keys()).indexOf(fileId),
                filename: doc.metadata?.filename || doc.metadata?.originalFilename || 'Unknown',
                wordCount: doc.text.split(/\s+/).length,
                chunkCount: doc.chunks?.length || 0,
                storedAt: doc.metadata?.storedAt
            }))
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/uuid [external] (uuid, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("uuid");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/pages/api/chat/upload-document.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

// API per caricare e analizzare documenti
__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/formidable [external] (formidable, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$documentAI$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/documentAI.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$uuid__$5b$external$5d$__$28$uuid$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/uuid [external] (uuid, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$documentAI$2e$js__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$uuid__$5b$external$5d$__$28$uuid$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$documentAI$2e$js__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$uuid__$5b$external$5d$__$28$uuid$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
    try {
        const isVercel = Boolean(process.env.VERCEL);
        const MAX_FILE_MB = isVercel ? Number(process.env.VERCEL_MAX_MB || 25) : 200;
        const MAX_FILES = isVercel ? Number(process.env.VERCEL_MAX_FILES || 5) : 10;
        const uploadDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'uploads', 'chat');
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(uploadDir)) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(uploadDir, {
                recursive: true
            });
        }
        const form = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__["default"])({
            uploadDir,
            keepExtensions: true,
            // Imposta limite massimo per file in base all'ambiente
            maxFileSize: MAX_FILE_MB * 1024 * 1024,
            multiples: true
        });
        const [fields, files] = await new Promise((resolve, reject)=>{
            form.parse(req, (err, fields, files)=>{
                if (err) reject(err);
                else resolve([
                    fields,
                    files
                ]);
            });
        });
        const fileArray = Array.isArray(files.files) ? files.files : [
            files.files
        ].filter(Boolean);
        if (!fileArray || fileArray.length === 0) {
            return res.status(400).json({
                error: 'Nessun file caricato'
            });
        }
        if (fileArray.length > MAX_FILES) {
            return res.status(400).json({
                error: `Numero massimo di file per analisi superato: ${fileArray.length} > ${MAX_FILES}`,
                details: isVercel ? `Limite Vercel: ${MAX_FILES} file per richiesta (riduci o usa caricamento diretto su storage).` : `Carica al massimo ${MAX_FILES} file per volta.`,
                limit: MAX_FILES
            });
        }
        // Verifica dimensione file (utile per errori di payload su Vercel)
        for (const f of fileArray){
            const size = f.size || (f.filepath && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(f.filepath) ? __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(f.filepath).size : 0);
            if (size > MAX_FILE_MB * 1024 * 1024) {
                return res.status(413).json({
                    error: `File troppo grande: ${(size / (1024 * 1024)).toFixed(1)}MB > ${MAX_FILE_MB}MB`,
                    details: isVercel ? `Le funzioni serverless Vercel hanno un limite di payload. Usa file più piccoli, carica direttamente su storage (Vercel Blob/S3) o esegui in ambiente non serverless.` : `Riduci la dimensione del file o carica meno contenuti.`,
                    limitMB: MAX_FILE_MB
                });
            }
        }
        // Processa i file in parallelo per velocità (max 3 alla volta)
        const processFile = async (file)=>{
            try {
                // Leggi il file come buffer
                const buffer = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(file.filepath);
                const filename = file.originalFilename || file.newFilename;
                const mimeType = file.mimetype || 'application/octet-stream';
                // Estrai testo dal documento usando pdfjs-dist, mammoth, xlsx, ecc.
                console.log(`Processing file: ${filename} (${mimeType})`);
                let text, metadata;
                try {
                    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$documentAI$2e$js__$5b$api$5d$__$28$ecmascript$29$__["extractTextFromDocument"])(buffer, mimeType, filename, file.filepath);
                    text = result.text;
                    metadata = result.metadata || {};
                    console.log(`Extracted text length: ${text ? text.length : 0} characters`);
                } catch (extractError) {
                    console.error(`Error extracting text from ${filename}:`, extractError);
                    return {
                        filename,
                        success: false,
                        error: `Errore estrazione testo: ${extractError.message}`
                    };
                }
                if (!text || text.trim().length === 0) {
                    console.warn(`No text extracted from ${filename}`);
                    return {
                        filename,
                        success: false,
                        error: 'Nessun testo estratto dal documento'
                    };
                }
                // Genera ID unico per il file
                const fileId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$uuid__$5b$external$5d$__$28$uuid$2c$__esm_import$29$__["v4"])();
                console.log(`Storing document ${fileId} with filename ${filename}`);
                console.log(`Text length: ${text.length} characters`);
                // Salva nello store in-memory con embeddings (async)
                const storeResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$documentAI$2e$js__$5b$api$5d$__$28$ecmascript$29$__["storeDocument"])(fileId, text, {
                    ...metadata,
                    originalFilename: filename,
                    filename,
                    mimeType,
                    uploadedAt: new Date().toISOString(),
                    size: buffer.length
                });
                console.log(`Document ${fileId} stored in memory with ${storeResult.chunkCount} chunks and embeddings`);
                // Pulisci il file temporaneo
                try {
                    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(file.filepath);
                } catch (unlinkError) {
                    console.warn('Errore eliminazione file temporaneo:', unlinkError);
                }
                return {
                    fileId,
                    filename,
                    success: true,
                    wordCount: storeResult.wordCount,
                    chunkCount: storeResult.chunkCount,
                    pages: metadata.pages || 0,
                    size: buffer.length
                };
            } catch (fileError) {
                console.error('Errore processamento file:', fileError);
                return {
                    filename: file.originalFilename || file.newFilename,
                    success: false,
                    error: fileError.message || 'Errore durante il processamento'
                };
            }
        };
        // Processa tutti i file (riduci concorrenza su Vercel per evitare timeout)
        const BATCH_SIZE = isVercel ? 1 : 3;
        const results = [];
        for(let i = 0; i < fileArray.length; i += BATCH_SIZE){
            const batch = fileArray.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.all(batch.map(processFile));
            results.push(...batchResults);
        }
        const successCount = results.filter((r)=>r.success).length;
        console.log(`Upload completed: ${successCount} successful out of ${results.length} total files`);
        console.log('Results:', JSON.stringify(results, null, 2));
        return res.status(200).json({
            success: successCount > 0,
            files: results,
            message: `${successCount} file analizzati con successo`
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            error: 'Errore durante il caricamento',
            details: error.message
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__560a5c5b._.js.map