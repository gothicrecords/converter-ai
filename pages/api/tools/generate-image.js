import { generateImageWithDALLE } from '../../../lib/openai.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, aspect = '1:1', quality = 'hd', style = 'vivid' } = req.body || {};

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Il prompt è richiesto e deve essere una stringa.' });
        }

        // Map aspect ratios to DALL-E 3 sizes
        const sizeMap = {
            '1:1': '1024x1024',
            '16:9': '1792x1024',
            '9:16': '1024x1792',
            '4:3': '1792x1024',
            '3:4': '1024x1792',
        };
        const size = sizeMap[aspect] || sizeMap['1:1'];

        console.log('Generating image with DALL-E 3:', prompt);
        console.log('Size:', size, 'Quality:', quality, 'Style:', style);

        // Genera immagine con DALL-E 3
        const imageBuffer = await generateImageWithDALLE(prompt, {
            size: size,
            quality: quality, // 'standard' or 'hd'
            style: style, // 'vivid' or 'natural'
        });

        console.log('Image generated, size:', (imageBuffer.length / 1024 / 1024).toFixed(2), 'MB');

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', imageBuffer.length);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.status(200).send(imageBuffer);

    } catch (error) {
        console.error('Errore API Generate Image:', error);
        res.status(500).json({ 
            error: error.message || 'Errore interno del server durante la generazione dell\'immagine.' 
        });
    }
}
