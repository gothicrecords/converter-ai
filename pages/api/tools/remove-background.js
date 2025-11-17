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

        const formData = new FormData();
        formData.append('image_file', fs.createReadStream(imageFile.filepath));
        formData.append('size', 'auto');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': removeBgApiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Errore da remove.bg:', errorBody);
            return res.status(response.status).json({ error: `Errore dall'API esterna: ${response.statusText}` });
        }

        const imageBlob = await response.blob();
        
        res.setHeader('Content-Type', imageBlob.type);
        const buffer = await imageBlob.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error("Errore durante l'elaborazione dell'immagine:", error);
        res.status(500).json({ error: "Errore interno del server durante l'elaborazione dell'immagine." });
    }
}
