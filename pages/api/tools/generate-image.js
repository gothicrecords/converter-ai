import sharp from 'sharp';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, aspect = '1:1', detail = 1.0, realism = true } = req.body || {};

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Il prompt è richiesto e deve essere una stringa.' });
        }

        // Prompt enhancement
        const realismTags = 'ultra realistic, hyperrealistic, photorealistic, natural skin texture, film grain, lifelike, authentic, DSLR quality, professional color grading, volumetric lighting, ambient occlusion, depth of field, bokeh';
        const cinematicTags = 'cinematic composition, perfect lighting, ray tracing, physically based rendering, studio lighting, sharp focus, vivid colors';
        const artTags = 'digital art, masterpiece, highly detailed, 8k uhd, intricate details, award winning';
        const enhancedPrompt = realism
            ? `${prompt}, ${realismTags}, ${cinematicTags}`
            : `${prompt}, ${artTags}`;

        // Dimensions
        const baseLong = 1536; // base generation long side
        const targetLong = 3840; // 4K long side
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
        
        // Pollinations.ai base generation (affidabile/rapida), poi upscaling locale a 4K con sharp
        // Genero base a 1536 per qualità + velocità, poi porto il lato lungo a 3840
        const encodedPrompt = encodeURIComponent(enhancedPrompt);
        const seed = Math.floor(Math.random() * 1000000);
        const API_URL = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${baseW}&height=${baseH}&seed=${seed}&model=flux-pro&nologo=true&enhance=true&private=false`;

        console.log('Generating BASE image (1536) with enhanced prompt:', enhancedPrompt);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 120000); // 2 min timeout

        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            },
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Pollinations API Error:', response.status, errorText);
            throw new Error(`API Error: ${response.status}`);
        }

        const imageBuffer = await response.arrayBuffer();
        
        if (!imageBuffer || imageBuffer.byteLength === 0) {
            throw new Error('Immagine vuota ricevuta dall\'API');
        }

        // Upscale a vero 4K (lato lungo = 3840) con pipeline a due passaggi + sharpening
        const input = sharp(Buffer.from(imageBuffer), { sequentialRead: true }).rotate();
        const meta = await input.metadata();
        const inW = meta.width || 0;
        const inH = meta.height || 0;
        const longSide = Math.max(inW, inH) || 1;
        const scale = targetLong / longSide;

        let outBuffer;
        if (scale <= 1) {
            // Già >= 4K sul lato lungo: applico solo un leggero sharpening + re-encode di qualità
            const sFinal = 0.6 + 0.2 * detail; // 0.6..0.8
            const m1Final = 0.5 + 0.1 * (detail - 1); // around 0.5
            const m2Final = 0.3 + 0.05 * (detail - 1); // around 0.3
            outBuffer = await input
                .sharpen({ sigma: sFinal, m1: m1Final, m2: m2Final })
                .jpeg({
                    quality: 97,
                    chromaSubsampling: '4:4:4',
                    mozjpeg: true,
                    trellisQuantisation: true,
                    overshootDeringing: true,
                    optimiseScans: true,
                })
                .toBuffer();
        } else {
            // Due passaggi per upscaling pulito e dettagli nitidi
            const interLong = Math.min(targetLong, Math.round(longSide * Math.min(scale, 1.8)));
            const interW = inW >= inH ? interLong : Math.round((interLong / inH) * inW);
            const interH = inH > inW ? interLong : Math.round((interLong / inW) * inH);

            const s1 = 0.45 + 0.15 * detail; // 0.6 @detail=1
            const m1a = 0.35 + 0.1 * detail; // 0.45 @detail=1
            const m2a = 0.18 + 0.06 * detail; // 0.24 @detail=1
            const firstPass = await input
                .resize(interW, interH, { kernel: sharp.kernel.lanczos3, fit: 'inside' })
                .sharpen({ sigma: s1, m1: m1a, m2: m2a })
                .toBuffer();

            const finalW = inW >= inH ? targetLong : Math.round((targetLong / inH) * inW);
            const finalH = inH > inW ? targetLong : Math.round((targetLong / inW) * inH);

            const s2 = 0.8 + 0.25 * detail; // 1.05 @detail=1
            const m1b = 0.5 + 0.1 * detail; // 0.6 @detail=1
            const m2b = 0.28 + 0.08 * detail; // 0.36 @detail=1
            const contrast = 1.02 + 0.02 * detail; // 1.04 @detail=1

            outBuffer = await sharp(firstPass, { sequentialRead: true })
                .resize(finalW, finalH, { kernel: sharp.kernel.lanczos3, fit: 'inside' })
                .sharpen({ sigma: s2, m1: m1b, m2: m2b })
                .linear(contrast, 0)
                .jpeg({
                    quality: 97,
                    chromaSubsampling: '4:4:4',
                    mozjpeg: true,
                    trellisQuantisation: true,
                    overshootDeringing: true,
                    optimiseScans: true,
                })
                .toBuffer();
        }

        console.log('Final 4K output size:', (outBuffer.byteLength / 1024 / 1024).toFixed(2), 'MB');

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', outBuffer.byteLength);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.status(200).send(outBuffer);

    } catch (error) {
        console.error('Errore API Generate Image:', error);
        
        if (error.name === 'AbortError') {
            res.status(504).json({ 
                error: 'Timeout: la generazione 4K richiede troppo tempo. Riprova con un prompt più semplice.' 
            });
        } else {
            res.status(500).json({ 
                error: error.message || 'Errore interno del server durante la generazione dell\'immagine.' 
            });
        }
    }
}
