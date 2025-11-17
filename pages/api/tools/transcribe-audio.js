import { formidable } from 'formidable';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Placeholder: Logica per la trascrizione audio.
        // In un'implementazione reale, si userebbe un'API come Whisper di OpenAI.
        // Per ora, restituiamo un testo segnaposto.

        const form = formidable({});
        const [fields, files] = await form.parse(req);
        
        const audioFile = files.audio?.[0];

        if (!audioFile) {
            return res.status(400).json({ error: 'Nessun file audio caricato.' });
        }

        const placeholderText = `Questo è un testo di trascrizione segnaposto per il file: ${audioFile.originalFilename}. In un'implementazione reale, qui ci sarebbe il testo trascritto dal modello AI.`;
        
        res.status(200).json({ text: placeholderText });

    } catch (error) {
        console.error('Errore API Transcribe Audio:', error);
        res.status(500).json({ error: 'Errore interno del server durante la trascrizione.' });
    }
}
