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
            
            // Sharpening progressivo (più aggressivo negli ultimi passaggi)
            const sharpenIntensity = 0.3 + (pass / passes) * 0.4;
            currentImage = currentImage.sharpen({
                sigma: 0.4 + sharpenIntensity,
                m1: 0.3 + (pass / passes) * 0.2,
                m2: 0.15 + (pass / passes) * 0.15
            });
            
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

    // Applica enhancement finale
    async applyFinalEnhancement(image, quality = 'high') {
        let enhanced = image;
        
        // Contrasto leggero per chiarezza
        enhanced = enhanced.linear(1.02, -(128 * 0.02));
        
        // Sharpening finale mirato
        enhanced = enhanced.sharpen({
            sigma: 1.2,
            m1: 0.7,
            m2: 0.4
        });
        
        // Rimozione artefatti
        enhanced = enhanced.png({
            quality: 100,
            compressionLevel: 6,
            adaptiveFiltering: true
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
            
            // Step 1: Denoising (solo se immagine piccola o con noise evidente)
            let processed = input;
            const mp = (originalWidth * originalHeight) / 1e6;
            if (mp < 2) {
                processed = await this.denoise(processed);
            }
            
            // Step 2: Multi-pass upscaling
            const scaleFactor = Math.max(
                targetWidth / originalWidth,
                targetHeight / originalHeight
            );
            
            // Determina numero di passaggi basato su scala
            let passes = 2;
            if (scaleFactor > 3) {
                passes = 4;
            } else if (scaleFactor > 2) {
                passes = 3;
            }
            
            processed = await this.multiPassUpscale(
                processed,
                targetWidth,
                targetHeight,
                passes
            );
            
            // Step 3: Enhancement finale
            processed = await this.applyFinalEnhancement(processed, 'high');
            
            // Converti a JPEG per output finale (migliore compressione)
            const outputBuffer = await processed
                .jpeg({
                    quality: 98,
                    chromaSubsampling: '4:4:4',
                    mozjpeg: true,
                    trellisQuantisation: true,
                    overshootDeringing: true,
                    optimiseScans: true
                })
                .toBuffer();
            
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

