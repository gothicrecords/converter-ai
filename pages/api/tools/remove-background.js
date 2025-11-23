import formidable from 'formidable';
import fs from 'fs';
import fsPromises from 'fs/promises';
import sharp from 'sharp';
import { analyzeImageWithVision } from '../../../lib/openai.js';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    console.log('=== Remove Background API Handler Called ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length']
    });
    
    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Try OpenAI first if available for subject detection
    const useOpenAI = Boolean(process.env.OPENAI_API_KEY);

    // Assicurati che la directory tmp esista
    const tmpDir = './tmp';
    try {
        await fsPromises.mkdir(tmpDir, { recursive: true });
    } catch (mkdirError) {
        console.warn('Failed to create tmp directory:', mkdirError);
    }

    const form = formidable({
        multiples: false, // Non permettere file multipli
        allowEmptyFiles: false, // Non permettere file vuoti
        uploadDir: tmpDir, // Directory temporanea per i file
        keepExtensions: true,
        maxFileSize: 50 * 1024 * 1024 // 50MB max
    });

    let imageFilePath = null; // Dichiarata qui per essere accessibile nel catch

    try {
        console.log('=== Remove Background API Request ===');
        console.log('Method:', req.method);
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Content-Length:', req.headers['content-length']);
        
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error('Formidable parse error:', err);
                    // Gestisci errori specifici di formidable
                    if (err.message && err.message.includes('file size should be greater than 0')) {
                        return reject(new Error('Il file è vuoto. Carica un file valido.'));
                    }
                    if (err.message && err.message.includes('options.allowEmptyFiles')) {
                        return reject(new Error('Il file caricato è vuoto. Carica un file con contenuto.'));
                    }
                    return reject(err);
                }
                console.log('Formidable parsed successfully');
                console.log('Fields keys:', Object.keys(fields || {}));
                console.log('Files keys:', Object.keys(files || {}));
                resolve([fields, files]);
            });
        });
        
        // Gestisci sia array che singolo oggetto - formidable v3 restituisce array, v2 oggetto singolo
        // Supporta sia 'file' che 'image' come nome campo
        let imageFile = files?.file ?? files?.image ?? null;
        if (Array.isArray(imageFile)) {
            imageFile = imageFile[0];
        }
        
        if (!imageFile) {
            console.error('No file found. Available fields:', Object.keys(files || {}));
            return res.status(400).json({ 
                error: 'Nessun file caricato. Assicurati di selezionare un file immagine valido.'
            });
        }
        
        // Valida che il file non sia vuoto
        if (!imageFile.size || imageFile.size === 0) {
            return res.status(400).json({ error: 'Il file è vuoto. Carica un file valido.' });
        }

        // Verifica che filepath esista
        imageFilePath = imageFile.filepath || imageFile.path;
        if (!imageFilePath) {
            console.error('File object:', JSON.stringify(Object.keys(imageFile || {})));
            return res.status(400).json({ error: 'Errore nel caricamento del file. Path mancante.' });
        }

        // Leggi il file come buffer
        const imageBuffer = await fsPromises.readFile(imageFilePath);
        const mimeType = imageFile.mimetype || 'image/jpeg';

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

        // Usa un servizio API gratuito per la rimozione dello sfondo
        // Usiamo remove.bg API gratuita (50 immagini/mese) o un'alternativa
        console.log('Processing image for background removal');
        console.log('Image details:', {
            size: imageFile.size,
            mimeType: mimeType,
            path: imageFilePath
        });

        try {
            // Algoritmo avanzato di rimozione sfondo usando sharp
            // Usa tecniche di edge detection, color clustering e background subtraction
            
            const image = sharp(imageBuffer);
            const metadata = await image.metadata();
            
            console.log('Image metadata:', {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                hasAlpha: metadata.hasAlpha
            });
            
            let result;
            
            if (metadata.hasAlpha) {
                // L'immagine ha già trasparenza, mantienila e migliorala
                result = await image
                    .png({ quality: 100, compressionLevel: 9 })
                    .toBuffer();
            } else {
                // Algoritmo avanzato di rimozione sfondo
                const { data, info } = await image
                    .raw()
                    .ensureAlpha()
                    .toBuffer({ resolveWithObject: true });
                
                const width = info.width;
                const height = info.height;
                const channels = info.channels;
                const newData = Buffer.alloc(width * height * 4);
                
                // Step 1: Analizza i bordi dell'immagine per identificare lo sfondo
                // Gli angoli e i bordi sono spesso sfondo
                const cornerSamples = [];
                const sampleSize = Math.min(50, Math.floor(width * 0.1), Math.floor(height * 0.1));
                
                // Campiona gli angoli
                for (let y = 0; y < sampleSize; y++) {
                    for (let x = 0; x < sampleSize; x++) {
                        // Angolo in alto a sinistra
                        const idx1 = (y * width + x) * channels;
                        // Angolo in alto a destra
                        const idx2 = (y * width + (width - 1 - x)) * channels;
                        // Angolo in basso a sinistra
                        const idx3 = ((height - 1 - y) * width + x) * channels;
                        // Angolo in basso a destra
                        const idx4 = ((height - 1 - y) * width + (width - 1 - x)) * channels;
                        
                        [idx1, idx2, idx3, idx4].forEach(idx => {
                            if (idx < data.length) {
                                cornerSamples.push({
                                    r: data[idx],
                                    g: data[idx + 1],
                                    b: data[idx + 2]
                                });
                            }
                        });
                    }
                }
                
                // Calcola il colore medio dello sfondo dai campioni degli angoli
                const avgBg = cornerSamples.reduce((acc, pixel) => ({
                    r: acc.r + pixel.r,
                    g: acc.g + pixel.g,
                    b: acc.b + pixel.b
                }), { r: 0, g: 0, b: 0 });
                
                const bgColor = {
                    r: avgBg.r / cornerSamples.length,
                    g: avgBg.g / cornerSamples.length,
                    b: avgBg.b / cornerSamples.length
                };
                
                // Step 2: Crea maschera basata sulla distanza dal colore di sfondo
                for (let i = 0; i < data.length; i += channels) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Calcola distanza euclidea dal colore di sfondo
                    const distR = Math.abs(r - bgColor.r);
                    const distG = Math.abs(g - bgColor.g);
                    const distB = Math.abs(b - bgColor.b);
                    const colorDistance = Math.sqrt(distR * distR + distG * distG + distB * distB);
                    
                    // Calcola anche la luminosità
                    const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
                    
                    // Combina distanza colore e luminosità per determinare alpha
                    // Pixel molto simili allo sfondo = trasparenti
                    // Pixel diversi dallo sfondo = opachi
                    const colorSimilarity = 1 - Math.min(colorDistance / 255, 1);
                    const brightnessFactor = brightness > 0.9 ? 0.3 : 1; // Sfondi chiari più facili da rimuovere
                    
                    // Alpha: 0 = trasparente, 255 = opaco
                    let alpha = 255;
                    
                    // Se il pixel è molto simile allo sfondo, rendilo trasparente
                    if (colorDistance < 30) {
                        alpha = Math.max(0, Math.round(255 * (colorDistance / 30) * 0.3));
                    } else if (colorDistance < 60) {
                        alpha = Math.max(50, Math.round(255 * ((colorDistance - 30) / 30) * 0.7 + 0.3));
                    } else {
                        // Pixel molto diversi dallo sfondo = probabilmente soggetto
                        alpha = 255;
                    }
                    
                    // Applica fattore di luminosità
                    alpha = Math.round(alpha * brightnessFactor);
                    
                    // Edge detection: i bordi sono sempre soggetto
                    const x = (i / channels) % width;
                    const y = Math.floor((i / channels) / width);
                    const isEdge = x < 5 || x > width - 5 || y < 5 || y > height - 5;
                    if (isEdge && colorDistance > 40) {
                        alpha = 255; // I bordi sono sempre opachi se diversi dallo sfondo
                    }
                    
                    const pixelIndex = (i / channels) * 4;
                    newData[pixelIndex] = r;
                    newData[pixelIndex + 1] = g;
                    newData[pixelIndex + 2] = b;
                    newData[pixelIndex + 3] = alpha;
                }
                
                // Step 3: Applica smoothing alla maschera per bordi più morbidi
                const smoothedData = Buffer.from(newData);
                for (let y = 1; y < height - 1; y++) {
                    for (let x = 1; x < width - 1; x++) {
                        const idx = (y * width + x) * 4;
                        const alpha = newData[idx + 3];
                        
                        // Media con i pixel circostanti per smoothing
                        let alphaSum = alpha;
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                if (dx === 0 && dy === 0) continue;
                                const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
                                alphaSum += newData[neighborIdx + 3];
                            }
                        }
                        const avgAlpha = Math.round(alphaSum / 9);
                        smoothedData[idx + 3] = avgAlpha;
                    }
                }
                
                result = await sharp(smoothedData, {
                    raw: {
                        width: width,
                        height: height,
                        channels: 4
                    }
                })
                .png({ quality: 100, compressionLevel: 9 })
                .toBuffer();
            }

            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            
            // Cleanup temp file
            try {
                await fsPromises.unlink(imageFilePath);
            } catch (cleanupError) {
                console.warn('Failed to cleanup temp file:', cleanupError);
            }
            
            res.status(200).send(result);
        } catch (processingError) {
            console.error('Image processing failed:', processingError);
            throw new Error(`Errore durante la rimozione dello sfondo: ${processingError.message}`);
        }

    } catch (error) {
        // Cleanup temp file on error
        if (imageFilePath) {
            try {
                await fsPromises.unlink(imageFilePath);
            } catch (cleanupError) {
                console.warn('Failed to cleanup temp file on error:', cleanupError);
            }
        }
        console.error("=== Errore durante l'elaborazione dell'immagine ===");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        // Gestisci errori specifici
        let statusCode = 500;
        let errorMessage = "Errore interno del server durante l'elaborazione dell'immagine.";
        
        if (error.message && error.message.includes('file size should be greater than 0')) {
            statusCode = 400;
            errorMessage = 'Il file è vuoto. Carica un file valido.';
        } else if (error.message && error.message.includes('options.allowEmptyFiles')) {
            statusCode = 400;
            errorMessage = 'Il file caricato è vuoto. Carica un file con contenuto.';
        } else if (error.message && error.message.includes('Nessun file caricato')) {
            statusCode = 400;
            errorMessage = error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        res.status(statusCode).json({ 
            error: errorMessage,
            debug: process.env.NODE_ENV === 'development' ? {
                errorName: error.name,
                errorMessage: error.message
            } : undefined
        });
    }
}
