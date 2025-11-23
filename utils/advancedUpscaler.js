import sharp from 'sharp';

/**
 * Upscaler avanzato per immagini 4K/8K
 * Usa tecniche multi-pass, denoising e sharpening avanzato
 */
class AdvancedUpscaler {
    constructor() {
        this.maxDimension = 7680; // 8K
    }

    // Denoising avanzato prima dell'upscaling
    async denoise(image) {
        // Applica leggero blur per ridurre noise, poi sharpening mirato
        return image
            .blur(0.3) // Leggero blur per noise
            .sharpen({
                sigma: 0.5,
                m1: 0.4,
                m2: 0.2
            });
    }

    // Upscaling multi-pass per qualità massima
    async multiPassUpscale(image, targetWidth, targetHeight, passes = 3) {
        const metadata = await image.metadata();
        let currentWidth = metadata.width;
        let currentHeight = metadata.height;
        
        let currentImage = image;
        
        // Calcola fattore di scala per passaggio
        const totalScale = Math.max(
            targetWidth / currentWidth,
            targetHeight / currentHeight
        );
        const scalePerPass = Math.pow(totalScale, 1 / passes);
        
        for (let pass = 0; pass < passes; pass++) {
            const nextWidth = Math.min(
                Math.round(currentWidth * scalePerPass),
                targetWidth
            );
            const nextHeight = Math.min(
                Math.round(currentHeight * scalePerPass),
                targetHeight
            );
            
            // Usa kernel diverso per ogni passaggio
            let kernel = sharp.kernel.lanczos3;
            if (pass === 0) {
                kernel = sharp.kernel.lanczos3; // Primo passaggio: massima qualità
            } else if (pass === passes - 1) {
                kernel = sharp.kernel.lanczos3; // Ultimo passaggio: massima qualità
            } else {
                kernel = sharp.kernel.lanczos2; // Passaggi intermedi: bilanciato
            }
            
            // Resize con kernel ottimizzato
            currentImage = currentImage.resize(nextWidth, nextHeight, {
                kernel,
                fit: 'fill',
                withoutEnlargement: false
            });
            
            // Sharpening progressivo migliorato (più aggressivo negli ultimi passaggi)
            const sharpenIntensity = 0.4 + (pass / passes) * 0.5;
            const sharpenParams = {
                sigma: 0.5 + sharpenIntensity,
                m1: 0.4 + (pass / passes) * 0.3,
                m2: 0.2 + (pass / passes) * 0.2
            };
            
            // Negli ultimi passaggi, aggiungi parametri avanzati per dettagli ultra-fini
            if (pass >= passes - 2) {
                sharpenParams.x1 = 2;
                sharpenParams.y2 = 2;
                sharpenParams.y3 = 2;
            }
            
            currentImage = currentImage.sharpen(sharpenParams);
            
            // Converti a buffer per il prossimo passaggio
            if (pass < passes - 1) {
                const buffer = await currentImage.toBuffer();
                currentImage = sharp(buffer, { sequentialRead: true });
            }
            
            currentWidth = nextWidth;
            currentHeight = nextHeight;
        }
        
        return currentImage;
    }

    // Applica enhancement finale per massima qualità 4K
    async applyFinalEnhancement(image, quality = 'high') {
        let enhanced = image;
        
        // Step 1: Contrasto migliorato per chiarezza e profondità
        enhanced = enhanced.linear(1.05, -(128 * 0.05));
        
        // Step 2: Sharpening avanzato multi-pass per dettagli ultra-definiti
        // Primo passaggio: sharpening generale
        enhanced = enhanced.sharpen({
            sigma: 1.5,
            m1: 0.8,
            m2: 0.5,
            x1: 2,
            y2: 2,
            y3: 2
        });
        
        // Step 3: Enhancement locale per dettagli fini
        // Usa unsharp mask per migliorare la nitidezza
        enhanced = enhanced.sharpen({
            sigma: 0.8,
            m1: 1.0,
            m2: 0.6,
            x1: 3,
            y2: 3,
            y3: 3
        });
        
        // Step 4: Slight saturation boost per colori più vividi
        enhanced = enhanced.modulate({
            saturation: 1.08,
            brightness: 1.02
        });
        
        // Step 5: Rimozione artefatti e compressione ottimale
        // Usa JPEG con qualità massima per preservare dettagli
        enhanced = enhanced.jpeg({
            quality: 98,
            chromaSubsampling: '4:4:4', // No chroma subsampling per massima qualità
            mozjpeg: true,
            trellisQuantisation: true,
            overshootDeringing: true,
            optimiseScans: true,
            progressive: true
        });
        
        return enhanced;
    }

    // Upscale principale con pipeline completa
    async upscale(buffer, targetScale = 4, maxDimension = 7680) {
        try {
            const input = sharp(buffer, { sequentialRead: true }).rotate();
            const metadata = await input.metadata();
            
            const originalWidth = metadata.width || 0;
            const originalHeight = metadata.height || 0;
            
            if (originalWidth === 0 || originalHeight === 0) {
                throw new Error('Dimensioni immagine non valide');
            }
            
            // Calcola dimensioni target
            let targetWidth = Math.round(originalWidth * targetScale);
            let targetHeight = Math.round(originalHeight * targetScale);
            
            // Limita a maxDimension
            if (targetWidth > maxDimension || targetHeight > maxDimension) {
                const scale = maxDimension / Math.max(targetWidth, targetHeight);
                targetWidth = Math.round(targetWidth * scale);
                targetHeight = Math.round(targetHeight * scale);
            }
            
            console.log(`Upscaling: ${originalWidth}x${originalHeight} -> ${targetWidth}x${targetHeight}`);
            
            // Step 1: Denoising migliorato (applicato più spesso per immagini di qualità inferiore)
            let processed = input;
            const mp = (originalWidth * originalHeight) / 1e6;
            // Applica denoising per immagini piccole o se la risoluzione è bassa
            if (mp < 3 || Math.max(originalWidth, originalHeight) < 2000) {
                processed = await this.denoise(processed);
            }
            
            // Step 2: Multi-pass upscaling
            const scaleFactor = Math.max(
                targetWidth / originalWidth,
                targetHeight / originalHeight
            );
            
            // Determina numero di passaggi basato su scala (più passaggi = migliore qualità)
            let passes = 3; // Default aumentato da 2 a 3
            if (scaleFactor > 4) {
                passes = 6; // Per upscaling molto grandi, usa più passaggi
            } else if (scaleFactor > 3) {
                passes = 5;
            } else if (scaleFactor > 2) {
                passes = 4;
            }
            
            processed = await this.multiPassUpscale(
                processed,
                targetWidth,
                targetHeight,
                passes
            );
            
            // Step 3: Enhancement finale (converte già a JPEG)
            processed = await this.applyFinalEnhancement(processed, 'high');
            
            // L'enhancement finale restituisce già un'immagine processata, converti a buffer
            const outputBuffer = await processed.toBuffer();
            
            console.log(`Upscale completato: ${(outputBuffer.length / 1024 / 1024).toFixed(2)} MB`);
            
            return outputBuffer;
            
        } catch (error) {
            console.error('Errore upscaling avanzato:', error);
            throw new Error(`Upscaling fallito: ${error.message}`);
        }
    }

    // Upscale a 4K (3840x2160 o lato lungo 3840)
    async upscaleTo4K(buffer) {
        const input = sharp(buffer, { sequentialRead: true }).rotate();
        const metadata = await input.metadata();
        
        const originalWidth = metadata.width || 0;
        const originalHeight = metadata.height || 0;
        
        // Calcola dimensioni 4K mantenendo aspect ratio
        const longSide = Math.max(originalWidth, originalHeight);
        const scale = 3840 / longSide;
        
        const targetWidth = Math.round(originalWidth * scale);
        const targetHeight = Math.round(originalHeight * scale);
        
        return this.upscale(buffer, scale, 3840);
    }

    // Upscale a 8K (7680x4320 o lato lungo 7680)
    async upscaleTo8K(buffer) {
        const input = sharp(buffer, { sequentialRead: true }).rotate();
        const metadata = await input.metadata();
        
        const originalWidth = metadata.width || 0;
        const originalHeight = metadata.height || 0;
        
        // Calcola dimensioni 8K mantenendo aspect ratio
        const longSide = Math.max(originalWidth, originalHeight);
        const scale = 7680 / longSide;
        
        const targetWidth = Math.round(originalWidth * scale);
        const targetHeight = Math.round(originalHeight * scale);
        
        return this.upscale(buffer, scale, 7680);
    }
}

export default AdvancedUpscaler;

