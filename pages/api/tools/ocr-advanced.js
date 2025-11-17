import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';

export const config = {
    api: {
        bodyParser: false,
    },
};

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
        maxFileSize: 20 * 1024 * 1024, // 20MB
    });

    try {
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!file) {
            return res.status(400).json({ error: 'Nessun file caricato' });
        }

        console.log('Inizio OCR su file:', file.originalFilename);

        // Esegui OCR con Tesseract.js
        const result = await Tesseract.recognize(
            file.filepath,
            'ita+eng', // Italiano e Inglese
            {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                }
            }
        );

        // Cleanup file
        try {
            fs.unlinkSync(file.filepath);
        } catch (e) {
            console.error('Errore durante la pulizia del file:', e);
        }

        const extractedText = result.data.text.trim();

        if (!extractedText) {
            return res.status(200).json({ 
                text: 'Nessun testo trovato nell\'immagine. Assicurati che l\'immagine contenga testo leggibile.' 
            });
        }

        res.status(200).json({ 
            text: extractedText,
            confidence: result.data.confidence 
        });

    } catch (error) {
        console.error('Errore API OCR Advanced:', error);
        res.status(500).json({ 
            error: 'Errore durante l\'estrazione del testo. Riprova con un\'immagine più chiara.' 
        });
    }
}
