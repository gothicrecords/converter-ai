import formidable from 'formidable';
import FormData from 'form-data';
import fs from 'fs/promises';
import { analyzeImageWithVision } from '../../../lib/openai.js';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Try OpenAI first if available, otherwise use remove.bg
    const useOpenAI = Boolean(process.env.OPENAI_API_KEY);
    const removeBgApiKey = process.env.REMOVE_BG_API_KEY;

    const form = formidable({
        allowEmptyFiles: false, // Non permettere file vuoti
        uploadDir: './tmp', // Directory temporanea per i file
        keepExtensions: true,
        maxFileSize: 50 * 1024 * 1024 // 50MB max
    });

    try {
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
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
                resolve([fields, files]);
            });
        });
        
        if (!files.file || files.file.length === 0) {
            return res.status(400).json({ error: 'Nessun file caricato.' });
        }
        
        const imageFile = files.file[0];
        
        // Valida che il file non sia vuoto
        if (imageFile.size === 0) {
            return res.status(400).json({ error: 'Il file è vuoto. Carica un file valido.' });
        }

        // Leggi il file come buffer
        const imageBuffer = await fs.readFile(imageFile.filepath);
        const mimeType = imageFile.mimetype || 'image/jpeg';
        const imageFilePath = imageFile.filepath;

        // Se OpenAI è disponibile, usa Vision API per identificare il tipo di soggetto
        let detectedType = 'auto';
        if (useOpenAI) {
            try {
                console.log('Using OpenAI Vision API to detect subject type');
                const analysisPrompt = 'Analizza questa immagine e identifica il tipo principale di soggetto. Rispondi con una sola parola: "person", "product", "car", "animal", o "other".';
                const analysis = await analyzeImageWithVision(imageBuffer, mimeType, analysisPrompt);
                const lowerAnalysis = analysis.toLowerCase();
                if (lowerAnalysis.includes('person') || lowerAnalysis.includes('persona') || lowerAnalysis.includes('uomo') || lowerAnalysis.includes('donna')) {
                    detectedType = 'person';
                } else if (lowerAnalysis.includes('product') || lowerAnalysis.includes('prodotto') || lowerAnalysis.includes('oggetto')) {
                    detectedType = 'product';
                } else if (lowerAnalysis.includes('car') || lowerAnalysis.includes('auto') || lowerAnalysis.includes('veicolo')) {
                    detectedType = 'car';
                } else if (lowerAnalysis.includes('animal') || lowerAnalysis.includes('animale') || lowerAnalysis.includes('cane') || lowerAnalysis.includes('gatto')) {
                    detectedType = 'animal';
                }
                console.log('Detected subject type:', detectedType);
            } catch (visionError) {
                console.warn('OpenAI Vision API failed, using default type:', visionError.message);
            }
        }

        // Opzioni aggiuntive dal client per migliorare il risultato
        // Supportate da remove.bg: type, size, crop, crop_margin, bg_color, channels, format
        const type = (fields.type?.[0] || detectedType).toString(); // Usa il tipo rilevato da OpenAI se disponibile
        const size = (fields.size?.[0] || 'full').toString(); // preview | small | regular | medium | full | auto
        const crop = (fields.crop?.[0] || 'false').toString(); // 'true' | 'false'
        const cropMargin = (fields.crop_margin?.[0] || '0').toString(); // e.g. '10%'
        const bgColor = (fields.bg_color?.[0] || '').toString(); // e.g. 'ffffff'

        // Usa remove.bg per la rimozione effettiva (OpenAI non ha API diretta per rimozione sfondo)
        if (!removeBgApiKey) {
            return res.status(500).json({ 
                error: 'Servizio non configurato correttamente. REMOVE_BG_API_KEY richiesta.' 
            });
        }

        const formData = new FormData();
        formData.append('image_file', fs.createReadStream(imageFilePath));
        formData.append('size', size);
        if (type && type !== 'auto') formData.append('type', type);
        if (crop === 'true') {
            formData.append('crop', 'true');
            if (cropMargin) formData.append('crop_margin', cropMargin);
        }
        if (bgColor) formData.append('bg_color', bgColor);

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': removeBgApiKey,
                ...formData.getHeaders(),
            },
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Errore da remove.bg:', errorBody);
            return res.status(response.status).json({ error: `Errore dall'API esterna: ${response.statusText}` });
        }

        const imageBlob = await response.blob();

        res.setHeader('Content-Type', imageBlob.type || 'image/png');
        // Cache busting: risultato dipende dall'immagine, non cache lato client per sicurezza
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        const buffer = await imageBlob.arrayBuffer();
        
        // Cleanup temp file
        try {
            await fs.unlink(imageFilePath);
        } catch (cleanupError) {
            console.warn('Failed to cleanup temp file:', cleanupError);
        }
        
        res.status(200).send(Buffer.from(buffer));

    } catch (error) {
        // Cleanup temp file on error
        if (imageFilePath) {
            try {
                await fs.unlink(imageFilePath);
            } catch (cleanupError) {
                console.warn('Failed to cleanup temp file on error:', cleanupError);
            }
        }
        console.error("Errore durante l'elaborazione dell'immagine:", error);
        
        // Gestisci errori specifici
        let errorMessage = "Errore interno del server durante l'elaborazione dell'immagine.";
        if (error.message && error.message.includes('file size should be greater than 0')) {
            errorMessage = 'Il file è vuoto. Carica un file valido.';
        } else if (error.message && error.message.includes('options.allowEmptyFiles')) {
            errorMessage = 'Il file caricato è vuoto. Carica un file con contenuto.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        res.status(500).json({ error: errorMessage });
    }
}
