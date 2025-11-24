import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import os from 'os';
import mammoth from 'mammoth';
import PDFDocument from 'pdfkit';
import OpenAI from 'openai';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import pdfParse from 'pdf-parse';
import openAIQueue from '../../../lib/openai-queue.js';
import { canUseTool, getUpgradeMessage } from '../../../lib/usage-limits.js';
import { getUsageStats, incrementUsage, getUserPlan, getUserId } from '../../../lib/usage-tracker.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
    api: {
        bodyParser: false,
    },
};

// Funzione per estrarre testo da diversi formati
async function extractText(filePath, mimeType, originalFilename) {
    const ext = path.extname(originalFilename).toLowerCase();
    
    if (mimeType === 'application/pdf' || ext === '.pdf') {
        // Estrazione testo da PDF usando pdf-parse con fallback OCR
        let text = '';
        let numPages = 1;
        
        // Tentativo 1: pdf-parse per PDF con testo nativo
        try {
            console.log('[PDF Extract] Inizio estrazione PDF:', originalFilename);
            
            const dataBuffer = fs.readFileSync(filePath);
            console.log('[PDF Extract] Buffer letto, dimensione:', dataBuffer.length, 'bytes');
            
            const result = await pdfParse(dataBuffer);
            console.log('[PDF Extract] Parsing completato, testo estratto:', result?.text?.length || 0, 'caratteri');
            console.log('[PDF Extract] Numero pagine:', result?.numpages || 1);
            
            text = (result && result.text) ? result.text.trim() : '';
            numPages = result?.numpages || 1;
        } catch (pdfError) {
            console.log('[PDF Extract] pdf-parse fallito:', pdfError.message);
            console.error('[PDF Extract] Stack:', pdfError.stack);
            text = ''; // Continua con OCR
        }

        // Tentativo 2: OCR se pdf-parse ha fallito o testo insufficiente
        // Riduciamo la soglia minima a 10 caratteri per essere meno restrittivi
        if (!text || text.trim().length < 10) {
            console.log('[PDF Extract] Testo insufficiente, uso OCR automatico...');
            try {
                const dataBuffer = fs.readFileSync(filePath);
                const allTexts = [];
                
                // Converti ogni pagina del PDF in immagine e fai OCR
                console.log('[PDF Extract] Conversione PDF in immagini per OCR...');
                
                // Sharp potrebbe non supportare PDF direttamente senza librerie native
                // Proviamo diversi approcci per convertire PDF in immagine
                console.log('[PDF Extract] Conversione prima pagina PDF in immagine per OCR...');
                
                let imageBuffer = null;
                
                // Tentativo 1: Sharp con pages: 1 (plurale)
                try {
                    console.log('[PDF Extract] Tentativo 1: Sharp con pages: 1');
                    imageBuffer = await sharp(dataBuffer, {
                        density: 300,
                        pages: 1
                    })
                    .png()
                    .toBuffer();
                    console.log('[PDF Extract] Successo con pages: 1');
                } catch (sharpError1) {
                    console.log('[PDF Extract] Fallito con pages: 1, errore:', sharpError1.message);
                    
                    // Tentativo 2: Sharp con page: 0 (singolare, 0-based)
                    try {
                        console.log('[PDF Extract] Tentativo 2: Sharp con page: 0');
                        imageBuffer = await sharp(dataBuffer, {
                            density: 300,
                            page: 0
                        })
                        .png()
                        .toBuffer();
                        console.log('[PDF Extract] Successo con page: 0');
                    } catch (sharpError2) {
                        console.log('[PDF Extract] Fallito con page: 0, errore:', sharpError2.message);
                        
                        // Tentativo 3: Sharp senza specificare pagina (prima pagina di default)
                        try {
                            console.log('[PDF Extract] Tentativo 3: Sharp senza specificare pagina');
                            imageBuffer = await sharp(dataBuffer, {
                                density: 300
                            })
                            .png()
                            .toBuffer();
                            console.log('[PDF Extract] Successo senza specificare pagina');
                        } catch (sharpError3) {
                            console.error('[PDF Extract] Tutti i tentativi Sharp falliti');
                            console.error('[PDF Extract] Errore finale:', sharpError3.message);
                            
                            // Se Sharp non può processare il PDF, usiamo OpenAI come fallback (stesso metodo dei documenti AI)
                            console.log('[PDF Extract] Sharp fallito, uso OpenAI per estrazione testo (stesso metodo documenti AI)');
                            try {
                                const { extractTextFromPdfWithOpenAI } = await import('../../../lib/openai.js');
                                
                                // Salva temporaneamente il file per l'upload
                                const os = await import('os');
                                const tempDir = os.tmpdir();
                                const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${originalFilename}`);
                                
                                try {
                                    // Scrivi il buffer su file temporaneo
                                    fs.writeFileSync(tempFilePath, dataBuffer);
                                    
                                    // Estrai testo con OpenAI usando la queue (stesso metodo dei documenti AI)
                                    console.log('[PDF Extract] Aggiungo richiesta estrazione testo alla queue OpenAI');
                                    const openaiText = await openAIQueue.add(
                                        async () => {
                                            return await extractTextFromPdfWithOpenAI(tempFilePath);
                                        },
                                        {
                                            priority: 7, // Priorità alta per estrazione testo
                                            maxRetries: 3,
                                            id: `extract_${Date.now()}`,
                                        }
                                    );
                                    
                                    if (openaiText && openaiText.trim().length > 0) {
                                        console.log('[OpenAI] Testo estratto dal PDF:', openaiText.trim().length, 'caratteri');
                                        return openaiText.trim();
                                    } else {
                                        throw new Error('OpenAI non ha estratto testo dal PDF');
                                    }
                                } finally {
                                    // Pulisci file temporaneo
                                    try {
                                        if (fs.existsSync(tempFilePath)) {
                                            fs.unlinkSync(tempFilePath);
                                        }
                                    } catch (cleanupError) {
                                        console.warn('Errore pulizia file temporaneo:', cleanupError);
                                    }
                                }
                            } catch (openaiError) {
                                console.error('[OpenAI] Estrazione testo fallita:', openaiError.message);
                                
                                // Verifica se è un errore di rate limit
                                const isRateLimit = openaiError.message && (
                                    openaiError.message.includes('rate') || 
                                    openaiError.message.includes('Limite') ||
                                    openaiError.message.includes('429')
                                );
                                
                                if (isRateLimit) {
                                    console.log('[OpenAI] Rate limit raggiunto, provo OCR diretto come alternativa');
                                }
                                
                                // Ultimo tentativo: OCR diretto sul PDF con Tesseract
                                console.log('[PDF Extract] Tentativo finale: OCR diretto sul PDF');
                                try {
                                    const { data: { text: directOcrText } } = await Tesseract.recognize(
                                        dataBuffer,
                                        'ita+eng',
                                        {
                                            logger: m => {
                                                if (m.status === 'recognizing text') {
                                                    console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
                                                }
                                            }
                                        }
                                    );
                                    
                                    if (directOcrText && directOcrText.trim().length > 0) {
                                        console.log('[OCR] Testo estratto direttamente dal PDF:', directOcrText.trim().length, 'caratteri');
                                        return directOcrText.trim();
                                    } else {
                                        throw new Error('OCR diretto non ha estratto testo');
                                    }
                                } catch (directOcrError) {
                                    console.error('[OCR] OCR diretto fallito:', directOcrError.message);
                                    
                                    // Costruisci messaggio di errore più informativo e utile
                                    let errorMessage = '';
                                    let suggestions = [];
                                    
                                    if (isRateLimit) {
                                        errorMessage = 'OpenAI ha raggiunto il limite di richieste. ';
                                        suggestions = [
                                            'Attendi 1-2 minuti e riprova',
                                            'Prova con un PDF che contiene testo nativo (non solo immagini scansionate)',
                                            'Converti il PDF in DOCX o TXT usando un altro tool prima di tradurlo',
                                            'Prova a estrarre il testo manualmente e incollalo come file TXT'
                                        ];
                                    } else {
                                        errorMessage = 'Impossibile estrarre testo dal PDF. ';
                                        suggestions = [
                                            'Il PDF potrebbe essere protetto o corrotto',
                                            'Il PDF potrebbe contenere solo immagini senza testo estraibile',
                                            'Prova a convertire il PDF in DOCX o TXT usando un altro tool',
                                            'Prova con un PDF diverso che contiene testo nativo'
                                        ];
                                    }
                                    
                                    errorMessage += '\n\nCosa puoi fare:\n';
                                    suggestions.forEach((suggestion, index) => {
                                        errorMessage += `${index + 1}. ${suggestion}\n`;
                                    });
                                    
                                    errorMessage += '\nMetodi tentati: pdf-parse, conversione Sharp, estrazione OpenAI, OCR diretto.';
                                    
                                    throw new Error(errorMessage);
                                }
                            }
                        }
                    }
                }
                
                // Se abbiamo un'immagine, processiamola
                if (imageBuffer) {
                    console.log('[PDF Extract] Immagine ottenuta, dimensione:', imageBuffer.length, 'bytes');
                    
                    try {
                        // Preprocessa l'immagine per migliorare OCR
                        const processedImage = await sharp(imageBuffer)
                            .greyscale()
                            .normalize()
                            .sharpen()
                            .toBuffer();
                        
                        // Esegui OCR sull'immagine
                        console.log('[OCR] Esecuzione OCR sulla prima pagina...');
                        const { data: { text: pageText } } = await Tesseract.recognize(
                            processedImage,
                            'ita+eng',
                            {
                                logger: m => {
                                    if (m.status === 'recognizing text') {
                                        console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
                                    }
                                }
                            }
                        );
                        
                        if (pageText && pageText.trim().length > 0) {
                            allTexts.push(pageText.trim());
                            console.log('[OCR] Testo estratto dalla prima pagina:', pageText.trim().length, 'caratteri');
                        } else {
                            throw new Error('OCR non ha estratto testo dall\'immagine');
                        }
                    } catch (processError) {
                        console.error('[OCR] Errore processando immagine:', processError.message);
                        throw new Error(`Errore durante l'OCR: ${processError.message}`);
                    }
                } else {
                    throw new Error('Impossibile ottenere immagine dal PDF');
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
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } else if (mimeType === 'application/msword' || ext === '.doc') {
        throw new Error('I file .doc non sono supportati. Converti in .docx o .pdf');
    } else if (mimeType === 'text/plain' || ext === '.txt') {
        return fs.readFileSync(filePath, 'utf-8');
    } else if (mimeType === 'text/markdown' || ext === '.md') {
        return fs.readFileSync(filePath, 'utf-8');
    } else {
        throw new Error('Formato file non supportato');
    }
}

// Funzione per tradurre testo usando OpenAI con queue e retry automatico
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
        
        const prompt = preserveFormatting 
            ? `Traduci il seguente testo in ${targetLangName} mantenendo ESATTAMENTE la stessa formattazione, struttura, interruzioni di riga e spaziatura. Non aggiungere commenti o spiegazioni, restituisci solo il testo tradotto:\n\n${text}`
            : `Traduci il seguente testo in ${targetLangName}. Restituisci solo la traduzione senza commenti:\n\n${text}`;
        
        // Usa la queue per gestire rate limiting e retry automatico
        console.log('[Translate] Aggiungo richiesta traduzione alla queue OpenAI');
        const translatedText = await openAIQueue.add(
            async () => {
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'Sei un traduttore professionale. Traduci il testo mantenendo il tono e lo stile originale.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.3,
                });
                
                return response.choices[0].message.content;
            },
            {
                priority: 8, // Priorità alta per traduzione
                maxRetries: 3,
                id: `translate_${Date.now()}_${targetLanguage}`,
            }
        );
        
        return translatedText;
    } catch (error) {
        console.error('Errore traduzione con OpenAI:', error);
        
        // Se è un errore di rate limit, fornisci un messaggio più chiaro
        if (error.message && (error.message.includes('rate') || error.message.includes('Limite') || error.message.includes('429'))) {
            throw new Error('OpenAI ha raggiunto il limite di richieste. La richiesta è stata messa in coda e verrà riprovata automaticamente. Riprova tra qualche minuto.');
        }
        
        throw new Error(`Errore durante la traduzione del testo: ${error.message || 'Errore sconosciuto'}`);
    }
}

// Funzione per creare documento tradotto
async function createTranslatedDocument(originalText, translatedText, originalPath, originalFilename, targetLanguage) {
    const ext = path.extname(originalFilename).toLowerCase();
    
    if (ext === '.pdf') {
        // Per PDF, creiamo un nuovo PDF con il testo tradotto
        // In produzione, useresti pdf-lib per mantenere meglio la formattazione
        const doc = new PDFDocument();
        const outputPath = path.join(path.dirname(originalPath), `translated_${Date.now()}.pdf`);
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);
        doc.fontSize(12);
        
        // Dividi il testo in paragrafi per una migliore formattazione
        const paragraphs = translatedText.split('\n\n');
        paragraphs.forEach((para, index) => {
            if (index > 0) doc.moveDown();
            doc.text(para, { align: 'left', continued: false });
        });
        
        doc.end();
        
        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
        
        return fs.readFileSync(outputPath);
    } else if (ext === '.docx') {
        // Per DOCX, creiamo un nuovo documento
        // In produzione, useresti docx o officegen per mantenere la formattazione
        const outputPath = path.join(path.dirname(originalPath), `translated_${Date.now()}.txt`);
        fs.writeFileSync(outputPath, translatedText, 'utf-8');
        return fs.readFileSync(outputPath);
    } else {
        // Per TXT e MD, creiamo un nuovo file di testo
        const outputPath = path.join(path.dirname(originalPath), `translated_${Date.now()}${ext}`);
        fs.writeFileSync(outputPath, translatedText, 'utf-8');
        return fs.readFileSync(outputPath);
    }
}

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Su Vercel, usa /tmp (unico filesystem scrivibile)
    const tmpDir = process.env.VERCEL ? '/tmp' : os.tmpdir();
    const uploadDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'uploads');
    
    // Su Vercel, /tmp esiste sempre, non serve crearlo
    if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    try {
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        const documentFile = Array.isArray(files.document) ? files.document[0] : files.document;
        const targetLanguage = Array.isArray(fields.targetLanguage) ? fields.targetLanguage[0] : fields.targetLanguage || 'en';
        const preserveFormatting = Array.isArray(fields.preserveFormatting) 
            ? fields.preserveFormatting[0] === 'true' 
            : fields.preserveFormatting === 'true';

        if (!documentFile) {
            return res.status(400).json({ error: 'Nessun documento caricato' });
        }

        // Verifica limiti d'uso (tool PRO)
        const userId = getUserId(req);
        const userPlan = getUserPlan(req);
        const toolSlug = 'traduzione-documenti-ai';
        const usageStats = getUsageStats(userId, toolSlug);
        const fileInfo = {
            size: documentFile.size,
            length: 0, // Verrà aggiornato dopo l'estrazione del testo
        };

        const limitCheck = canUseTool(toolSlug, userPlan, usageStats, fileInfo);
        
        if (!limitCheck.allowed) {
            return res.status(403).json({
                error: limitCheck.reason,
                limitType: limitCheck.limitType,
                current: limitCheck.current,
                max: limitCheck.max,
                upgradeMessage: getUpgradeMessage(toolSlug, userPlan),
                requiresPro: true,
            });
        }

        // Estrai testo dal documento
        const originalText = await extractText(
            documentFile.filepath,
            documentFile.mimetype,
            documentFile.originalFilename
        );

        if (!originalText || originalText.trim().length === 0) {
            return res.status(400).json({ error: 'Impossibile estrarre testo dal documento' });
        }

        // Verifica limite lunghezza testo
        fileInfo.length = originalText.length;
        const lengthCheck = canUseTool(toolSlug, userPlan, usageStats, fileInfo);
        
        if (!lengthCheck.allowed) {
            return res.status(403).json({
                error: lengthCheck.reason,
                limitType: lengthCheck.limitType,
                current: lengthCheck.current,
                max: lengthCheck.max,
                upgradeMessage: getUpgradeMessage(toolSlug, userPlan),
                requiresPro: true,
            });
        }

        // Traduci il testo
        const translatedText = await translateText(originalText, targetLanguage, preserveFormatting);

        // Crea documento tradotto
        const translatedBuffer = await createTranslatedDocument(
            originalText,
            translatedText,
            documentFile.filepath,
            documentFile.originalFilename,
            targetLanguage
        );

        // Determina il tipo MIME e nome file
        const ext = path.extname(documentFile.originalFilename).toLowerCase();
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
            fs.unlinkSync(documentFile.filepath);
            // Pulisci anche i file temporanei creati
            // Su Vercel, pulisci solo file temporanei nella stessa sessione
            const tempFiles = process.env.VERCEL 
              ? [] // Su Vercel non puliamo altri file in /tmp
              : fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir).filter(f => f.startsWith('translated_')) : [];
            tempFiles.forEach(f => {
                try {
                    fs.unlinkSync(path.join(uploadDir, f));
                } catch (e) {}
            });
        } catch (e) {
            console.error('Errore cleanup:', e);
        }

        // Incrementa contatore uso (solo se la richiesta è andata a buon fine)
        incrementUsage(userId, toolSlug);

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.status(200).send(translatedBuffer);

    } catch (error) {
        console.error('Errore API Traduzione Documenti:', error);
        console.error('Stack trace:', error.stack);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            code: error.code
        });
        
        // Determina il messaggio di errore appropriato
        let errorMessage = 'Errore durante la traduzione del documento. Riprova con un file diverso.';
        
        if (error.message) {
            errorMessage = error.message;
        } else if (error.code === 'ENOENT') {
            errorMessage = 'File non trovato. Assicurati di aver caricato un file valido.';
        } else if (error.code === 'LIMIT_FILE_SIZE') {
            errorMessage = 'File troppo grande. Dimensione massima: 50MB.';
        }
        
        res.status(500).json({ 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
