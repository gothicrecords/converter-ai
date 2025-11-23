import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import PDFDocument from 'pdfkit';
import OpenAI from 'openai';
import Tesseract from 'tesseract.js';

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
        
        // Tentativo 1: pdf-parse per PDF con testo nativo
        try {
            console.log('[PDF Extract] Inizio estrazione PDF:', originalFilename);
            
            // Prova diversi modi di importare pdf-parse per compatibilità Turbopack
            let pdfParse;
            try {
                const mod = await import('pdf-parse');
                pdfParse = mod.default || mod;
            } catch (e) {
                console.log('[PDF Extract] Import ESM fallito, provo require dinamico');
                // Fallback per ambienti che non supportano ESM import di CommonJS
                pdfParse = require('pdf-parse');
            }
            
            if (typeof pdfParse !== 'function') {
                throw new Error('pdf-parse non disponibile come funzione');
            }
            
            console.log('[PDF Extract] pdf-parse caricato correttamente');
            
            const dataBuffer = fs.readFileSync(filePath);
            console.log('[PDF Extract] Buffer letto, dimensione:', dataBuffer.length, 'bytes');
            
            const result = await pdfParse(dataBuffer);
            console.log('[PDF Extract] Parsing completato, testo estratto:', result?.text?.length || 0, 'caratteri');
            
            text = (result && result.text) ? result.text.trim() : '';
        } catch (pdfError) {
            console.log('[PDF Extract] pdf-parse fallito:', pdfError.message);
            text = ''; // Continua con OCR
        }

        // Tentativo 2: OCR se pdf-parse ha fallito o testo insufficiente
        if (!text || text.length < 50) {
            console.log('[PDF Extract] Testo insufficiente, uso OCR automatico...');
            try {
                const { data: { text: ocrText } } = await Tesseract.recognize(
                    filePath,
                    'ita+eng',
                    {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
                            }
                        }
                    }
                );
                
                if (ocrText && ocrText.trim().length > 0) {
                    console.log('[OCR] Testo estratto via OCR:', ocrText.length, 'caratteri');
                    return ocrText.trim();
                }
            } catch (ocrError) {
                console.error('[OCR] Errore OCR:', ocrError.message);
            }
            
            throw new Error('Il PDF non contiene testo estraibile. Impossibile leggere il contenuto.');
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
        
        const prompt = preserveFormatting 
            ? `Traduci il seguente testo in ${targetLangName} mantenendo ESATTAMENTE la stessa formattazione, struttura, interruzioni di riga e spaziatura. Non aggiungere commenti o spiegazioni, restituisci solo il testo tradotto:\n\n${text}`
            : `Traduci il seguente testo in ${targetLangName}. Restituisci solo la traduzione senza commenti:\n\n${text}`;
        
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Sei un traduttore professionale. Traduci il testo mantenendo il tono e lo stile originale.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
        });
        
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Errore traduzione con OpenAI:', error);
        throw new Error('Errore durante la traduzione del testo');
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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
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

        // Estrai testo dal documento
        const originalText = await extractText(
            documentFile.filepath,
            documentFile.mimetype,
            documentFile.originalFilename
        );

        if (!originalText || originalText.trim().length === 0) {
            return res.status(400).json({ error: 'Impossibile estrarre testo dal documento' });
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
            const tempFiles = fs.readdirSync(uploadDir).filter(f => f.startsWith('translated_'));
            tempFiles.forEach(f => {
                try {
                    fs.unlinkSync(path.join(uploadDir, f));
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
