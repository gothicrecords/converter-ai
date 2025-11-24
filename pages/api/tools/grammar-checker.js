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
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Il testo è richiesto.' });
        }

        // Correzioni grammaticali basilari
        const corrections = [];
        let corrected = text;

        // Doppi spazi
        if (corrected.includes('  ')) {
            corrections.push('Rimossi spazi doppi');
            corrected = corrected.replace(/ {2,}/g, ' ');
        }

        // Spazio prima della punteggiatura
        const spaceBefore = corrected.match(/ ([,.!?;:])/g);
        if (spaceBefore) {
            corrections.push(`Rimossi ${spaceBefore.length} spazi prima della punteggiatura`);
            corrected = corrected.replace(/ ([,.!?;:])/g, '$1');
        }

        // Mancanza di spazio dopo la punteggiatura
        const spaceAfter = corrected.match(/([,.!?;:])([A-Za-z])/g);
        if (spaceAfter) {
            corrections.push(`Aggiunti ${spaceAfter.length} spazi dopo la punteggiatura`);
            corrected = corrected.replace(/([,.!?;:])([A-Za-z])/g, '$1 $2');
        }

        // Prima lettera maiuscola
        if (corrected.length > 0 && corrected[0] === corrected[0].toLowerCase()) {
            corrections.push('Maiuscola iniziale aggiunta');
            corrected = corrected[0].toUpperCase() + corrected.slice(1);
        }

        // Maiuscola dopo punto
        corrected = corrected.replace(/\. ([a-z])/g, (match, letter) => {
            corrections.push('Maiuscola dopo punto');
            return '. ' + letter.toUpperCase();
        });

        if (corrections.length === 0) {
            corrections.push('Nessun errore evidente trovato');
        }

        res.status(200).json({ 
            corrected: corrected.trim(), 
            corrections: [...new Set(corrections)] // Rimuovi duplicati
        });

    } catch (error) {
        console.error('Errore API Grammar Checker:', error);
        res.status(500).json({ error: 'Errore interno del server durante la correzione.' });
    }
}
