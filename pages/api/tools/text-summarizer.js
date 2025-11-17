export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Il testo è richiesto.' });
        }

        if (text.length < 100) {
            return res.status(400).json({ error: 'Il testo deve essere almeno di 100 caratteri per essere riassunto.' });
        }

        // Logica di riassunto basilare: estrae le prime frasi fino a ~30% della lunghezza
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const targetLength = Math.floor(text.length * 0.3);
        let summary = '';
        let currentLength = 0;

        for (const sentence of sentences) {
            if (currentLength + sentence.length > targetLength && summary.length > 0) {
                break;
            }
            summary += sentence;
            currentLength += sentence.length;
        }

        // Se il riassunto è troppo corto, aggiungi almeno 3 frasi
        if (sentences.length > 3 && summary.split(/[.!?]/).length < 3) {
            summary = sentences.slice(0, 3).join('');
        }

        res.status(200).json({ 
            summary: summary.trim() || sentences[0],
            originalLength: text.length,
            summaryLength: summary.trim().length
        });

    } catch (error) {
        console.error('Errore API Text Summarizer:', error);
        res.status(500).json({ error: 'Errore interno del server durante il riassunto.' });
    }
}
