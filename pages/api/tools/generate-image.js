import ProceduralImageGenerator from '../../utils/proceduralImageGenerator.js';
import AdvancedUpscaler from '../../utils/advancedUpscaler.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, aspect = '1:1', detail = 1.0, realism = true } = req.body || {};

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Il prompt è richiesto e deve essere una stringa.' });
        }

        // Dimensions - generiamo direttamente in alta risoluzione
        const baseLong = 2048; // Base generation più alta per qualità migliore
        const targetLong = 3840; // 4K target
        const aspectMap = {
            '1:1': [1, 1],
            '16:9': [16, 9],
            '9:16': [9, 16],
            '4:3': [4, 3],
            '3:4': [3, 4],
        };
        const ratio = aspectMap[aspect] || aspectMap['1:1'];
        const rW = ratio[0];
        const rH = ratio[1];
        const baseW = Math.round((rW >= rH ? baseLong : (baseLong * rW) / rH));
        const baseH = Math.round((rH > rW ? baseLong : (baseLong * rH) / rW));

        console.log('Generating image procedurally (completely local):', prompt);
        console.log('Base dimensions:', baseW, 'x', baseH);

        // Genera immagine base usando generatore procedurale locale
        const generator = new ProceduralImageGenerator();
        const baseImageBuffer = await generator.generate(prompt, baseW, baseH, detail, realism);

        console.log('Base image generated, size:', (baseImageBuffer.length / 1024 / 1024).toFixed(2), 'MB');

        // Upscale a 4K usando upscaler avanzato
        const upscaler = new AdvancedUpscaler();
        const upscaledBuffer = await upscaler.upscaleTo4K(baseImageBuffer);

        console.log('Final 4K output size:', (upscaledBuffer.byteLength / 1024 / 1024).toFixed(2), 'MB');

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', upscaledBuffer.byteLength);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.status(200).send(upscaledBuffer);

    } catch (error) {
        console.error('Errore API Generate Image:', error);
        res.status(500).json({ 
            error: error.message || 'Errore interno del server durante la generazione dell\'immagine.' 
        });
    }
}
