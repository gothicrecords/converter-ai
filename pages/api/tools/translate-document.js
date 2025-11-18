import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import PDFDocument from 'pdfkit';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Funzione per estrarre testo da diversi formati
async function extractText(filePath, mimeType, originalFilename) {
    const ext = path.extname(originalFilename).toLowerCase();
    
    if (mimeType === 'application/pdf' || ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } else if (mimeType === 'application/msword' || ext === '.doc') {
        // Per .doc potremmo usare mammoth o altri parser, ma per semplicità restituiamo un messaggio
        throw new Error('I file .doc non sono supportati. Converti in .docx o .pdf');
    } else if (mimeType === 'text/plain' || ext === '.txt') {
        return fs.readFileSync(filePath, 'utf-8');
    } else if (mimeType === 'text/markdown' || ext === '.md') {
        return fs.readFileSync(filePath, 'utf-8');
    } else {
        throw new Error('Formato file non supportato');
    }
}

// Funzione per tradurre testo (placeholder - in produzione usare API di traduzione)
async function translateText(text, targetLanguage, preserveFormatting) {
    // PLACEHOLDER: In produzione, qui useresti:
    // - Google Translate API
    // - DeepL API
    // - Azure Translator
    // - OpenAI GPT con prompt di traduzione
    
    // Per ora restituiamo il testo originale con un prefisso
    // In produzione, sostituire con chiamata API reale
    return `[TRADOTTO IN ${targetLanguage.toUpperCase()}]\n\n${text}`;
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
