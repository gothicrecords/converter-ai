import { formidable } from 'formidable';
import FormData from 'form-data';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const removeBgApiKey = process.env.REMOVE_BG_API_KEY;
    if (!removeBgApiKey) {
        console.error('API key per la rimozione dello sfondo non trovata.');
        return res.status(500).json({ error: 'Servizio non configurato correttamente.' });
    }

    const form = formidable({});

    try {
        const [fields, files] = await form.parse(req);
        
        if (!files.file || files.file.length === 0) {
            return res.status(400).json({ error: 'Nessun file caricato.' });
        }

        const imageFile = files.file[0];

        // Opzioni aggiuntive dal client per migliorare il risultato
        // Supportate da remove.bg: type, size, crop, crop_margin, bg_color, channels, format
        const type = (fields.type?.[0] || 'auto').toString(); // auto | person | product | car | animal
        const size = (fields.size?.[0] || 'full').toString(); // preview | small | regular | medium | full | auto
        const crop = (fields.crop?.[0] || 'false').toString(); // 'true' | 'false'
        const cropMargin = (fields.crop_margin?.[0] || '0').toString(); // e.g. '10%'
        const bgColor = (fields.bg_color?.[0] || '').toString(); // e.g. 'ffffff'

        const formData = new FormData();
        formData.append('image_file', fs.createReadStream(imageFile.filepath));
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
        res.status(200).send(Buffer.from(buffer));

    } catch (error) {
        console.error("Errore durante l'elaborazione dell'immagine:", error);
        res.status(500).json({ error: "Errore interno del server durante l'elaborazione dell'immagine." });
    }
}
