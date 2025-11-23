import { generateImageWithDALLE, getImageUrlFromDALLE } from '../../../lib/openai.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, aspect = '1:1', quality, style, detail, realism } = req.body || {};

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

        // Map old parameters (detail, realism) to new ones (quality, style) for backward compatibility
        const mappedQuality = quality || (detail && detail > 0.8 ? 'hd' : 'standard');
        const mappedStyle = style || (realism ? 'natural' : 'vivid');

        console.log('Generating image with DALL-E 3:', prompt);
        console.log('Size:', size, 'Quality:', mappedQuality, 'Style:', mappedStyle);

        // Get image URL from DALL-E (faster, no download yet)
        const imageUrl = await getImageUrlFromDALLE(prompt, {
            size: size,
            quality: mappedQuality,
            style: mappedStyle,
        });

        console.log('Image URL obtained, streaming download...');

        // Stream the image directly from OpenAI to the client
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Fetch and stream the image
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error(`Errore nel download dell'immagine: ${imageResponse.status}`);
        }

        // Stream the response body directly to the client using ReadableStream
        if (imageResponse.body) {
            res.status(200);
            
            // Convert ReadableStream to chunks and stream to client
            const reader = imageResponse.body.getReader();
            
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        res.end();
                        break;
                    }
                    // Write chunk to response immediately
                    if (!res.headersSent) {
                        res.writeHead(200, {
                            'Content-Type': 'image/png',
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        });
                    }
                    res.write(Buffer.from(value));
                }
            } catch (streamError) {
                console.error('Streaming error:', streamError);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Errore durante lo streaming dell\'immagine' });
                } else {
                    res.end();
                }
                throw streamError;
            }
        } else {
            // Fallback: download and send
            const arrayBuffer = await imageResponse.arrayBuffer();
            res.setHeader('Content-Length', arrayBuffer.byteLength);
            res.status(200).send(Buffer.from(arrayBuffer));
        }

    } catch (error) {
        console.error('Errore API Generate Image:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: error.message || 'Errore interno del server durante la generazione dell\'immagine.' 
            });
        }
    }
}
