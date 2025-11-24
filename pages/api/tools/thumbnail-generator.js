import { formidable } from 'formidable';
import fs from 'fs';
import sharp from 'sharp';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const form = formidable({});
        const [fields, files] = await form.parse(req);
        
        const imageFile = files.image?.[0];
        const size = fields.size?.[0]; // es. "1280x720"

        if (!imageFile || !size) {
            return res.status(400).json({ error: 'Immagine e dimensione sono richieste.' });
        }

        // Parse dimensioni
        const [width, height] = size.split('x').map(Number);
        
        if (!width || !height) {
            return res.status(400).json({ error: 'Formato dimensione non valido. Usa formato: 1280x720' });
        }

        // Processa immagine con sharp
        const processedImage = await sharp(imageFile.filepath)
            .resize(width, height, {
                fit: 'cover',
                position: 'center'
            })
            .png()
            .toBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(processedImage);

    } catch (error) {
        console.error('Errore API Thumbnail Generator:', error);
        res.status(500).json({ error: 'Errore interno del server durante la generazione della thumbnail.' });
    }
}
