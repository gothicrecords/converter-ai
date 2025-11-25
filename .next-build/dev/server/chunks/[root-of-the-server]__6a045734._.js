module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/formidable [external] (formidable, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("formidable");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/sharp [external] (sharp, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("sharp", () => require("sharp"));

module.exports = mod;
}),
"[project]/utils/advancedUpscaler.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/sharp [external] (sharp, cjs)");
;
/**
 * Upscaler avanzato per immagini 4K/8K
 * Usa tecniche multi-pass, denoising e sharpening avanzato
 */ class AdvancedUpscaler {
    constructor(){
        this.maxDimension = 7680; // 8K
    }
    // Denoising avanzato prima dell'upscaling
    async denoise(image) {
        // Applica leggero blur per ridurre noise, poi sharpening mirato
        return image.blur(0.3) // Leggero blur per noise
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
        const totalScale = Math.max(targetWidth / currentWidth, targetHeight / currentHeight);
        const scalePerPass = Math.pow(totalScale, 1 / passes);
        for(let pass = 0; pass < passes; pass++){
            const nextWidth = Math.min(Math.round(currentWidth * scalePerPass), targetWidth);
            const nextHeight = Math.min(Math.round(currentHeight * scalePerPass), targetHeight);
            // Usa kernel diverso per ogni passaggio
            let kernel = __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"].kernel.lanczos3;
            if (pass === 0) {
                kernel = __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"].kernel.lanczos3; // Primo passaggio: massima qualità
            } else if (pass === passes - 1) {
                kernel = __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"].kernel.lanczos3; // Ultimo passaggio: massima qualità
            } else {
                kernel = __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"].kernel.lanczos2; // Passaggi intermedi: bilanciato
            }
            // Resize con kernel ottimizzato
            currentImage = currentImage.resize(nextWidth, nextHeight, {
                kernel,
                fit: 'fill',
                withoutEnlargement: false
            });
            // Sharpening progressivo migliorato (più aggressivo negli ultimi passaggi)
            const sharpenIntensity = 0.4 + pass / passes * 0.5;
            const sharpenParams = {
                sigma: 0.5 + sharpenIntensity,
                m1: 0.4 + pass / passes * 0.3,
                m2: 0.2 + pass / passes * 0.2
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
                currentImage = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(buffer, {
                    sequentialRead: true
                });
            }
            currentWidth = nextWidth;
            currentHeight = nextHeight;
        }
        return currentImage;
    }
    // Micro-ricostruzione pixel: edge enhancement e detail recovery
    async microPixelReconstruction(image) {
        let reconstructed = image;
        // Step 1: Edge detection e enhancement per ricostruire bordi netti
        // Usa unsharp mask avanzato per migliorare i bordi
        reconstructed = reconstructed.sharpen({
            sigma: 0.5,
            m1: 1.2,
            m2: 0.8,
            x1: 1,
            y2: 1,
            y3: 1
        });
        // Step 2: Detail recovery usando contrasto locale
        // Aumenta il contrasto locale per recuperare dettagli persi
        reconstructed = reconstructed.normalise();
        // Step 3: Micro-sharpening per pixel-level detail
        reconstructed = reconstructed.sharpen({
            sigma: 0.3,
            m1: 0.9,
            m2: 0.5
        });
        return reconstructed;
    }
    // Miglioramento luce avanzato: exposure, brightness, contrast
    async enhanceLighting(image) {
        let enhanced = image;
        // Step 1: Auto-exposure adjustment
        // Normalizza l'esposizione per bilanciare luci e ombre
        enhanced = enhanced.normalise();
        // Step 2: Brightness adjustment intelligente
        // Aumenta leggermente la luminosità senza sovraesporre
        enhanced = enhanced.modulate({
            brightness: 1.05,
            saturation: 1.1,
            hue: 0
        });
        // Step 3: Contrast enhancement per profondità
        // Aumenta il contrasto per dare profondità all'immagine
        enhanced = enhanced.linear(1.08, -128 * 0.08);
        // Step 4: Shadow/highlight recovery
        // Usa gamma correction per recuperare dettagli in ombre e luci
        enhanced = enhanced.gamma(1.1);
        return enhanced;
    }
    // Applica enhancement finale per massima qualità 4K
    async applyFinalEnhancement(image, quality = 'high') {
        let enhanced = image;
        // Step 1: Miglioramento luce (exposure, brightness, contrast)
        enhanced = await this.enhanceLighting(enhanced);
        // Step 2: Micro-ricostruzione pixel per dettagli ultra-fini
        enhanced = await this.microPixelReconstruction(enhanced);
        // Step 3: Sharpening avanzato multi-pass per dettagli ultra-definiti
        // Primo passaggio: sharpening generale
        enhanced = enhanced.sharpen({
            sigma: 1.5,
            m1: 0.8,
            m2: 0.5,
            x1: 2,
            y2: 2,
            y3: 2
        });
        // Step 4: Enhancement locale per dettagli fini
        // Usa unsharp mask per migliorare la nitidezza
        enhanced = enhanced.sharpen({
            sigma: 0.8,
            m1: 1.0,
            m2: 0.6,
            x1: 3,
            y2: 3,
            y3: 3
        });
        // Step 5: Rimozione artefatti e compressione ottimale
        // Usa JPEG con qualità massima per preservare dettagli
        enhanced = enhanced.jpeg({
            quality: 98,
            chromaSubsampling: '4:4:4',
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
            const input = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(buffer, {
                sequentialRead: true
            }).rotate();
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
            const mp = originalWidth * originalHeight / 1e6;
            // Applica denoising per immagini piccole o se la risoluzione è bassa
            if (mp < 3 || Math.max(originalWidth, originalHeight) < 2000) {
                processed = await this.denoise(processed);
            }
            // Step 2: Multi-pass upscaling
            const scaleFactor = Math.max(targetWidth / originalWidth, targetHeight / originalHeight);
            // Determina numero di passaggi basato su scala (più passaggi = migliore qualità)
            let passes = 3; // Default aumentato da 2 a 3
            if (scaleFactor > 4) {
                passes = 6; // Per upscaling molto grandi, usa più passaggi
            } else if (scaleFactor > 3) {
                passes = 5;
            } else if (scaleFactor > 2) {
                passes = 4;
            }
            processed = await this.multiPassUpscale(processed, targetWidth, targetHeight, passes);
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
        const input = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(buffer, {
            sequentialRead: true
        }).rotate();
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
        const input = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(buffer, {
            sequentialRead: true
        }).rotate();
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
const __TURBOPACK__default__export__ = AdvancedUpscaler;
}),
"[project]/utils/msrUpscaler.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/sharp [external] (sharp, cjs)");
;
/**
 * Multi-Stage Super Resolution (MSR) Upscaler
 * Implementa una pipeline multi-stadio per upscaling di alta qualità
 */ class MSRUpscaler {
    constructor(){
        this.maxDimension = 7680; // 8K
    }
    /**
     * Stage 1: Denoising + Deblurring
     * Rimuove rumore e sfocatura prima dell'upscaling
     */ async stage1_DenoiseDeblur(image) {
        let processed = image;
        // Step 1: Denoising con median filter (preserva i bordi)
        processed = processed.median(3);
        // Step 2: Deblurring con unsharp mask leggero
        processed = processed.sharpen({
            sigma: 0.3,
            m1: 0.5,
            m2: 0.3
        });
        // Step 3: Bilateral-like filtering (simulato con blur selettivo)
        // Sharp non ha convolve diretto, usiamo un approccio alternativo
        // Applica un blur molto leggero seguito da sharpening per preservare i bordi
        processed = processed.blur(0.5);
        processed = processed.sharpen({
            sigma: 0.2,
            m1: 0.3,
            m2: 0.15
        });
        return processed;
    }
    /**
     * Stage 2: Super Resolution x2 o x4
     * Upscaling progressivo con kernel ottimizzati
     */ async stage2_SuperResolution(image, targetScale, originalWidth, originalHeight) {
        let currentImage = image;
        let currentWidth = originalWidth;
        let currentHeight = originalHeight;
        // Calcola il numero di passaggi necessari (ogni passaggio max 2x)
        const totalPasses = Math.ceil(Math.log2(targetScale));
        for(let pass = 0; pass < totalPasses; pass++){
            const scaleThisPass = Math.min(2, targetScale / Math.pow(2, pass));
            const nextWidth = Math.round(currentWidth * scaleThisPass);
            const nextHeight = Math.round(currentHeight * scaleThisPass);
            // Usa Lanczos3 per massima qualità
            currentImage = currentImage.resize(nextWidth, nextHeight, {
                kernel: __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"].kernel.lanczos3,
                fit: 'fill',
                withoutEnlargement: false
            });
            // Sharpening leggero dopo ogni passaggio
            if (pass < totalPasses - 1) {
                currentImage = currentImage.sharpen({
                    sigma: 0.4,
                    m1: 0.5,
                    m2: 0.3
                });
            }
            // Converti a buffer per il prossimo passaggio
            if (pass < totalPasses - 1) {
                const buffer = await currentImage.toBuffer();
                currentImage = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(buffer, {
                    sequentialRead: true
                });
            }
            currentWidth = nextWidth;
            currentHeight = nextHeight;
        }
        return currentImage;
    }
    /**
     * Stage 3: Fine Detail + Intelligent Sharpening (non lineare)
     * Enhancement intelligente che evita artefatti
     */ async stage3_FineDetail(image) {
        let enhanced = image;
        // Step 1: Edge-preserving sharpening
        // Usa unsharp mask con parametri conservativi
        enhanced = enhanced.sharpen({
            sigma: 1.0,
            m1: 0.7,
            m2: 0.4,
            x1: 2,
            y2: 2,
            y3: 2
        });
        // Step 2: Detail enhancement non lineare
        // Applica contrasto locale per migliorare i dettagli senza artefatti
        enhanced = enhanced.normalise();
        // Step 3: Micro-sharpening per dettagli fini
        enhanced = enhanced.sharpen({
            sigma: 0.5,
            m1: 0.8,
            m2: 0.5
        });
        return enhanced;
    }
    /**
     * Edge-Aware Enhancement
     * Riconosce e migliora bordi e contorni usando tecniche edge-preserving
     */ async edgeAwareEnhancement(image) {
        let enhanced = image;
        // Step 1: Edge-preserving sharpening
        // Usa unsharp mask avanzato che preserva i bordi
        enhanced = enhanced.sharpen({
            sigma: 1.2,
            m1: 0.9,
            m2: 0.6,
            x1: 2,
            y2: 2,
            y3: 2
        });
        // Step 2: Contrast enhancement per bordi più netti
        // Aumenta il contrasto locale per evidenziare i bordi
        enhanced = enhanced.linear(1.06, -128 * 0.06);
        // Step 3: Normalizzazione per migliorare la definizione dei bordi
        enhanced = enhanced.normalise();
        // Step 4: Sharpening mirato per bordi ultra-netti
        enhanced = enhanced.sharpen({
            sigma: 0.8,
            m1: 0.7,
            m2: 0.5
        });
        return enhanced;
    }
    /**
     * High-Frequency Detail Injector
     * Estrae e potenzia le alte frequenze (dettagli fini)
     */ async highFrequencyInjector(image) {
        let enhanced = image;
        // Step 1: Estrai alte frequenze usando sharpening avanzato
        // Usa unsharp mask per evidenziare i dettagli fini
        enhanced = enhanced.sharpen({
            sigma: 0.8,
            m1: 1.0,
            m2: 0.6,
            x1: 3,
            y2: 3,
            y3: 3
        });
        // Step 2: Potenzia le alte frequenze con contrasto locale
        enhanced = enhanced.normalise();
        // Step 3: Enhancement mirato per dettagli ultra-fini
        enhanced = enhanced.sharpen({
            sigma: 0.5,
            m1: 0.8,
            m2: 0.5
        });
        // Step 4: Leggero boost di luminosità e saturazione
        enhanced = enhanced.modulate({
            brightness: 1.03,
            saturation: 1.05
        });
        return enhanced;
    }
    /**
     * Color Space Enhancement
     * Lavora in spazi colore ottimizzati per migliorare nitidezza
     */ async colorSpaceEnhancement(image) {
        let enhanced = image;
        // Step 1: Converti a LAB per lavorare sulla luminanza separatamente
        // Sharp non supporta LAB direttamente, quindi usiamo RGB con canali separati
        // Ma possiamo migliorare la luminanza con normalizzazione
        // Step 2: Normalizza la luminanza per migliorare i dettagli
        enhanced = enhanced.normalise();
        // Step 3: Aumenta il contrasto nella luminanza
        enhanced = enhanced.linear(1.05, -128 * 0.05);
        // Step 4: Migliora la saturazione per colori più vividi
        enhanced = enhanced.modulate({
            saturation: 1.1,
            brightness: 1.02,
            hue: 0
        });
        return enhanced;
    }
    /**
     * Texture-Aware Processing
     * Applica filtri diversi in base al tipo di texture
     */ async textureAwareProcessing(image) {
        let enhanced = image;
        // Per ora usiamo un approccio generale
        // In futuro si può integrare segmentazione semantica
        // Step 1: Enhancement generale per texture
        enhanced = enhanced.sharpen({
            sigma: 0.6,
            m1: 0.7,
            m2: 0.4
        });
        // Step 2: Contrasto locale per texture più definite
        enhanced = enhanced.normalise();
        return enhanced;
    }
    /**
     * Blind Degradation Modeling
     * Rileva il tipo di degradazione e applica il trattamento appropriato
     */ async detectDegradation(image) {
        // Analizza l'immagine per determinare il tipo di degradazione
        // Usiamo euristiche basate sui metadati
        const metadata = await image.metadata();
        // Estrai informazioni base
        const width = metadata.width || 0;
        const height = metadata.height || 0;
        const hasAlpha = metadata.hasAlpha || false;
        const format = metadata.format || '';
        // Determina il tipo di degradazione basandosi su caratteristiche dell'immagine
        let degradationType = 'unknown';
        // Bassa risoluzione
        if (width < 1000 && height < 1000) {
            degradationType = 'low_res';
        } else if (format === 'jpeg' && width * height > 500000 && width * height < 2000000) {
            degradationType = 'compression';
        } else if (width * height < 500000) {
            degradationType = 'noise';
        } else {
            degradationType = 'blur';
        }
        return degradationType;
    }
    /**
     * Pipeline principale MSR
     */ async upscale(buffer, targetScale = 4, maxDimension = 7680) {
        try {
            const input = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(buffer, {
                sequentialRead: true
            }).rotate();
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
            console.log(`[MSR] Upscaling: ${originalWidth}x${originalHeight} -> ${targetWidth}x${targetHeight}`);
            // Rileva tipo di degradazione
            const degradationType = await this.detectDegradation(input);
            console.log(`[MSR] Detected degradation type: ${degradationType}`);
            // Stage 1: Denoising + Deblurring
            console.log('[MSR] Stage 1: Denoising + Deblurring...');
            let processed = await this.stage1_DenoiseDeblur(input);
            // Stage 2: Super Resolution
            const actualScale = Math.max(targetWidth / originalWidth, targetHeight / originalHeight);
            console.log(`[MSR] Stage 2: Super Resolution (${actualScale.toFixed(2)}x)...`);
            processed = await this.stage2_SuperResolution(processed, actualScale, originalWidth, originalHeight);
            // Stage 3: Fine Detail + Intelligent Sharpening
            console.log('[MSR] Stage 3: Fine Detail Enhancement...');
            processed = await this.stage3_FineDetail(processed);
            // Edge-Aware Enhancement
            console.log('[MSR] Edge-Aware Enhancement...');
            processed = await this.edgeAwareEnhancement(processed);
            // High-Frequency Detail Injector
            console.log('[MSR] High-Frequency Detail Injection...');
            processed = await this.highFrequencyInjector(processed);
            // Color Space Enhancement
            console.log('[MSR] Color Space Enhancement...');
            processed = await this.colorSpaceEnhancement(processed);
            // Texture-Aware Processing
            console.log('[MSR] Texture-Aware Processing...');
            processed = await this.textureAwareProcessing(processed);
            // Output finale con qualità massima
            const outputBuffer = await processed.jpeg({
                quality: 98,
                chromaSubsampling: '4:4:4',
                mozjpeg: true,
                trellisQuantisation: true,
                overshootDeringing: true,
                optimiseScans: true,
                progressive: true
            }).toBuffer();
            console.log(`[MSR] Upscale completato: ${(outputBuffer.length / 1024 / 1024).toFixed(2)} MB`);
            return outputBuffer;
        } catch (error) {
            console.error('[MSR] Errore upscaling:', error);
            throw new Error(`MSR Upscaling fallito: ${error.message}`);
        }
    }
    /**
     * Upscale a 4K usando MSR
     */ async upscaleTo4K(buffer) {
        const input = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(buffer, {
            sequentialRead: true
        }).rotate();
        const metadata = await input.metadata();
        const originalWidth = metadata.width || 0;
        const originalHeight = metadata.height || 0;
        const longSide = Math.max(originalWidth, originalHeight);
        const scale = 3840 / longSide;
        return this.upscale(buffer, scale, 3840);
    }
}
const __TURBOPACK__default__export__ = MSRUpscaler;
}),
"[project]/utils/upscale.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>upscaleImage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/sharp [external] (sharp, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$advancedUpscaler$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/advancedUpscaler.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$msrUpscaler$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/msrUpscaler.js [api] (ecmascript)");
;
;
;
async function upscaleImage(fileBuffer, targetScale = 4) {
    try {
        // Usa MSR Upscaler per risultati di qualità superiore
        const msrUpscaler = new __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$msrUpscaler$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"]();
        // Usa upscaler avanzato per qualità 4K/8K
        // Cerca sempre di raggiungere almeno 4K quando possibile
        const metadata = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__cjs$29$__["default"])(fileBuffer, {
            sequentialRead: true
        }).metadata();
        const originalWidth = metadata.width || 0;
        const originalHeight = metadata.height || 0;
        const mp = originalWidth * originalHeight / 1e6;
        // Calcola il lato lungo
        const longSide = Math.max(originalWidth, originalHeight);
        let upscaled;
        // Strategia MSR: sempre upscale a 4K se possibile, altrimenti almeno 4x
        if (longSide < 1920) {
            // Immagine piccola/HD: upscale a 4K (3840px lato lungo)
            console.log(`[MSR] Upscaling small image (${originalWidth}x${originalHeight}) to 4K`);
            upscaled = await msrUpscaler.upscaleTo4K(fileBuffer);
        } else if (longSide < 3840) {
            // Immagine HD/FHD: upscale a 4K o almeno 2x fino a 4K
            const scaleTo4K = 3840 / longSide;
            console.log(`[MSR] Upscaling HD image (${originalWidth}x${originalHeight}) to 4K (scale: ${scaleTo4K.toFixed(2)}x)`);
            upscaled = await msrUpscaler.upscale(fileBuffer, scaleTo4K, 3840);
        } else {
            // Immagine già grande: upscale almeno 2x o fino a 8K se possibile
            const scale = Math.max(2, Math.min(4, 7680 / longSide));
            console.log(`[MSR] Upscaling large image (${originalWidth}x${originalHeight}) by ${scale.toFixed(2)}x`);
            upscaled = await msrUpscaler.upscale(fileBuffer, scale, 7680);
        }
        // Ritorna data URL (completamente locale, nessuna API esterna)
        const base64 = upscaled.toString('base64');
        return `data:image/jpeg;base64,${base64}`;
    } catch (e) {
        console.error('Upscale fallito:', e);
        throw new Error(`Upscale failed: ${e?.message || e}`);
    }
}
}),
"[externals]/openai [external] (openai, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("openai");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/lib/openai.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

// OpenAI API integration with official SDK
__turbopack_context__.s([
    "analyzeImageWithVision",
    ()=>analyzeImageWithVision,
    "chatCompletion",
    ()=>chatCompletion,
    "classifyDocument",
    ()=>classifyDocument,
    "enhanceImageQualityWithAI",
    ()=>enhanceImageQualityWithAI,
    "extractTextFromPdfWithOpenAI",
    ()=>extractTextFromPdfWithOpenAI,
    "generateEmbedding",
    ()=>generateEmbedding,
    "generateEmbeddingsBatch",
    ()=>generateEmbeddingsBatch,
    "generateImageWithDALLE",
    ()=>generateImageWithDALLE,
    "generateSummary",
    ()=>generateSummary,
    "generateTags",
    ()=>generateTags,
    "getImageUrlFromDALLE",
    ()=>getImageUrlFromDALLE,
    "upscaleImageWithDALLE",
    ()=>upscaleImageWithDALLE
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/openai [external] (openai, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const openai = new __TURBOPACK__imported__module__$5b$externals$5d2f$openai__$5b$external$5d$__$28$openai$2c$__esm_import$29$__["default"]({
    apiKey: process.env.OPENAI_API_KEY
});
async function generateEmbedding(text) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text.substring(0, 8000)
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
}
async function generateEmbeddingsBatch(texts) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    if (!Array.isArray(texts) || texts.length === 0) return [];
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: texts.map((t)=>(t || '').toString().substring(0, 8000))
        });
        return response.data.map((d)=>d.embedding);
    } catch (error) {
        console.error('Error generating batch embeddings:', error);
        throw new Error(`Failed to generate batch embeddings: ${error.message}`);
    }
}
async function chatCompletion(messages, options = {}) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        const response = await openai.chat.completions.create({
            model: options.model || 'gpt-4o-mini',
            messages: messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 1000,
            top_p: options.top_p || 1,
            frequency_penalty: options.frequency_penalty || 0,
            presence_penalty: options.presence_penalty || 0
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error in chat completion:', error);
        // Handle specific OpenAI errors
        if (error.status === 401) {
            throw new Error('Chiave API OpenAI non valida. Verifica la configurazione.');
        } else if (error.status === 429) {
            throw new Error('Limite di rate raggiunto. Riprova tra qualche secondo.');
        } else if (error.status === 500) {
            throw new Error('Errore del server OpenAI. Riprova più tardi.');
        }
        throw new Error(`Errore nella comunicazione con OpenAI: ${error.message}`);
    }
}
async function generateSummary(text, maxLength = 200) {
    const messages = [
        {
            role: 'system',
            content: 'You are a helpful assistant that creates concise summaries.'
        },
        {
            role: 'user',
            content: `Summarize the following text in ${maxLength} words or less:\n\n${text}`
        }
    ];
    return await chatCompletion(messages, {
        temperature: 0.5,
        max_tokens: 300
    });
}
async function generateTags(text, count = 5) {
    const messages = [
        {
            role: 'system',
            content: 'You are a helpful assistant that generates relevant tags for documents. Return only comma-separated tags, no explanations.'
        },
        {
            role: 'user',
            content: `Generate ${count} relevant tags for this document:\n\n${text.substring(0, 2000)}`
        }
    ];
    const response = await chatCompletion(messages, {
        temperature: 0.3,
        max_tokens: 100
    });
    return response.split(',').map((tag)=>tag.trim().toLowerCase()).filter((tag)=>tag.length > 0).slice(0, count);
}
async function classifyDocument(text) {
    const categories = [
        'contract',
        'invoice',
        'report',
        'presentation',
        'spreadsheet',
        'image',
        'code',
        'email',
        'article',
        'other'
    ];
    const messages = [
        {
            role: 'system',
            content: `You are a document classifier. Classify the document into one or more of these categories: ${categories.join(', ')}. Return only category names, comma-separated.`
        },
        {
            role: 'user',
            content: `Classify this document:\n\n${text.substring(0, 1000)}`
        }
    ];
    const response = await chatCompletion(messages, {
        temperature: 0.2,
        max_tokens: 50
    });
    return response.split(',').map((cat)=>cat.trim().toLowerCase()).filter((cat)=>categories.includes(cat));
}
async function analyzeImageWithVision(imageBuffer, imageMimeType, query = 'Cosa contiene questa immagine? Descrivi tutto ciò che vedi.') {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        // Converti il buffer in base64
        const base64Image = imageBuffer.toString('base64');
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'Sei un assistente AI esperto nell\'analisi di immagini. Descrivi in dettaglio tutto ciò che vedi nell\'immagine, inclusi testo, oggetti, persone, scene, colori e qualsiasi altro dettaglio rilevante. Rispondi sempre in italiano.'
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: query
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${imageMimeType};base64,${base64Image}`,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 2000,
            temperature: 0.2
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error in vision API:', error);
        if (error.status === 401) {
            throw new Error('Chiave API OpenAI non valida. Verifica la configurazione.');
        } else if (error.status === 429) {
            throw new Error('Limite di rate raggiunto. Riprova tra qualche secondo.');
        } else if (error.status === 400 && error.message?.includes('image')) {
            throw new Error('Formato immagine non supportato o immagine troppo grande.');
        }
        throw new Error(`Errore nell'analisi dell'immagine: ${error.message}`);
    }
}
async function extractTextFromPdfWithOpenAI(filePath) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    const fs = await __turbopack_context__.A("[externals]/fs [external] (fs, cjs, async loader)");
    let uploadedFile = null;
    try {
        console.log('Caricamento PDF su OpenAI (Responses API):', filePath);
        // 1) Carica il file su OpenAI come user_data
        uploadedFile = await openai.files.create({
            file: fs.createReadStream(filePath),
            purpose: 'user_data'
        });
        console.log('File caricato su OpenAI:', uploadedFile.id);
        // 2) Richiesta al modello GPT-4o per estrazione testo dal file caricato
        const response = await openai.responses.create({
            model: 'gpt-4o',
            input: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'input_text',
                            text: 'Estrai tutto il testo e le informazioni rilevanti da questo documento. Rispondi SOLO con il testo estratto, senza commenti.'
                        },
                        {
                            type: 'input_file',
                            file_id: uploadedFile.id
                        }
                    ]
                }
            ],
            max_output_tokens: 8000,
            temperature: 0.1
        });
        // 3) Prendi solo testo
        const extractedText = (response.output_text || '').toString().trim();
        console.log(`Testo estratto da PDF: ${extractedText.length} caratteri`);
        if (!extractedText) {
            throw new Error('Nessun testo estratto dal PDF');
        }
        return extractedText;
    } catch (error) {
        console.error('Error in PDF text extraction (Responses API):', error);
        if (error.status === 401) {
            throw new Error('Chiave API OpenAI non valida. Verifica la configurazione.');
        } else if (error.status === 429) {
            throw new Error('Limite di rate raggiunto. Riprova tra qualche secondo.');
        } else if (error.status === 400) {
            throw new Error('Errore nell\'analisi del PDF con Responses API. Il file potrebbe essere troppo grande o danneggiato.');
        }
        throw new Error(`Errore nell'estrazione del testo PDF: ${error.message}`);
    } finally{
        // 4) Prova a rimuovere il file caricato (se l'SDK lo supporta)
        try {
            if (uploadedFile && uploadedFile.id) {
                if (openai.files?.delete) {
                    await openai.files.delete(uploadedFile.id);
                } else if (openai.files?.del) {
                    await openai.files.del(uploadedFile.id);
                }
                console.log('File rimosso da OpenAI:', uploadedFile.id);
            }
        } catch (delError) {
            console.warn('Errore rimozione file da OpenAI (ignorato):', delError?.message || delError);
        }
    }
}
async function getImageUrlFromDALLE(prompt, options = {}) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        const size = options.size || '1024x1024';
        const quality = options.quality || 'standard';
        const style = options.style || 'vivid';
        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            size: size,
            quality: quality,
            style: style,
            n: 1
        });
        const imageUrl = response.data[0]?.url;
        if (!imageUrl) {
            throw new Error('Nessuna immagine generata da DALL-E');
        }
        return imageUrl;
    } catch (error) {
        console.error('Error getting image URL from DALL-E:', error);
        console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            code: error.code,
            response: error.response?.data || error.response
        });
        if (error.status === 401) {
            throw new Error('Chiave API OpenAI non valida. Verifica la configurazione.');
        } else if (error.status === 429) {
            throw new Error('Limite di rate raggiunto. Riprova tra qualche secondo.');
        } else if (error.status === 400) {
            const errorMessage = error.message || error.response?.data?.error?.message || 'Prompt non valido o contenuto non consentito';
            throw new Error(`Errore nella generazione: ${errorMessage}`);
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new Error('Errore di connessione con OpenAI. Verifica la tua connessione internet.');
        }
        throw new Error(`Errore nella generazione dell'immagine: ${error.message || 'Errore sconosciuto'}`);
    }
}
async function generateImageWithDALLE(prompt, options = {}) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        const imageUrl = await getImageUrlFromDALLE(prompt, options);
        // Download the image and return as buffer
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            const errorText = await imageResponse.text().catch(()=>'Unknown error');
            throw new Error(`Errore nel download dell'immagine generata: ${imageResponse.status} ${imageResponse.statusText}. ${errorText}`);
        }
        const arrayBuffer = await imageResponse.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        // Re-throw errors from getImageUrlFromDALLE
        throw error;
    }
}
async function upscaleImageWithDALLE(imageBuffer, imageMimeType, enhancementPrompt = null) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        // 1. Analizza l'immagine con Vision API per creare un prompt descrittivo
        const analysisPrompt = enhancementPrompt || 'Descrivi in dettaglio questa immagine, includendo tutti i dettagli visivi, colori, composizione, stile e qualità. La descrizione sarà usata per creare una versione migliorata ad alta risoluzione.';
        const imageDescription = await analyzeImageWithVision(imageBuffer, imageMimeType, analysisPrompt);
        // 2. Crea un prompt per DALL-E che migliora l'immagine
        const enhancementPromptText = `Crea una versione migliorata e ad alta risoluzione di questa immagine: ${imageDescription}. Mantieni fedeltà ai dettagli originali ma migliora la qualità, la nitidezza e la risoluzione.`;
        // 3. Genera immagine migliorata con DALL-E 3 in alta risoluzione
        const enhancedImageBuffer = await generateImageWithDALLE(enhancementPromptText, {
            size: '1792x1024',
            quality: 'hd',
            style: 'natural'
        });
        return enhancedImageBuffer;
    } catch (error) {
        console.error('Error upscaling image with DALL-E:', error);
        throw new Error(`Errore nel miglioramento dell'immagine: ${error.message}`);
    }
}
async function enhanceImageQualityWithAI(imageBuffer, imageMimeType) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
    }
    try {
        // Use Vision API to analyze image quality issues
        const analysisPrompt = `Analyze this image and identify specific quality issues that need improvement. Focus on:
1. Noise level (low/medium/high)
2. Sharpness (blurry/sharp)
3. Color accuracy (washed out/vibrant)
4. Artifacts (compression artifacts, pixelation)
5. Overall quality issues

Respond with a JSON object: {"noise": "low|medium|high", "sharpness": "blurry|moderate|sharp", "color": "washed|normal|vibrant", "artifacts": "none|minor|major", "recommendations": "brief description"}`;
        const analysisResult = await analyzeImageWithVision(imageBuffer, imageMimeType, analysisPrompt);
        // Parse analysis result
        let analysis = {
            noise: 'medium',
            sharpness: 'moderate',
            color: 'normal',
            artifacts: 'none'
        };
        try {
            // Try to parse JSON from analysis
            const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                analysis = {
                    ...analysis,
                    ...parsed
                };
            }
        } catch (parseError) {
            console.warn('Could not parse AI analysis, using defaults');
        }
        // Apply targeted enhancements using sharp based on AI analysis
        const sharp = (await __turbopack_context__.A("[externals]/sharp [external] (sharp, cjs, async loader)")).default;
        let enhanced = sharp(imageBuffer, {
            sequentialRead: true
        });
        // Apply denoising if needed
        if (analysis.noise === 'high' || analysis.noise === 'medium') {
            enhanced = enhanced.median(analysis.noise === 'high' ? 3 : 2);
        }
        // Apply sharpening based on analysis
        if (analysis.sharpness === 'blurry') {
            enhanced = enhanced.sharpen({
                sigma: 2.0,
                m1: 1.0,
                m2: 0.5,
                x1: 3,
                y2: 3,
                y3: 3
            });
        } else if (analysis.sharpness === 'moderate') {
            enhanced = enhanced.sharpen({
                sigma: 1.0,
                m1: 0.7,
                m2: 0.4
            });
        }
        // Enhance color if needed
        if (analysis.color === 'washed') {
            enhanced = enhanced.modulate({
                saturation: 1.15,
                brightness: 1.05
            }).linear(1.05, -128 * 0.05); // Slight contrast boost
        }
        // Remove compression artifacts
        if (analysis.artifacts === 'major' || analysis.artifacts === 'minor') {
            enhanced = enhanced.png({
                quality: 100,
                compressionLevel: 6,
                adaptiveFiltering: true
            });
        } else {
            // Keep original format but with high quality
            if (imageMimeType === 'image/jpeg' || imageMimeType === 'image/jpg') {
                enhanced = enhanced.jpeg({
                    quality: 98,
                    mozjpeg: true,
                    trellisQuantisation: true,
                    overshootDeringing: true
                });
            } else {
                enhanced = enhanced.png({
                    quality: 100,
                    compressionLevel: 6
                });
            }
        }
        const enhancedBuffer = await enhanced.toBuffer();
        return enhancedBuffer;
    } catch (error) {
        console.error('Error enhancing image quality with AI:', error);
        // Return original buffer if enhancement fails
        return imageBuffer;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/errors/index.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized error handling
 * Provides consistent error responses and error classes
 */ __turbopack_context__.s([
    "AppError",
    ()=>AppError,
    "AuthenticationError",
    ()=>AuthenticationError,
    "AuthorizationError",
    ()=>AuthorizationError,
    "ConflictError",
    ()=>ConflictError,
    "DatabaseError",
    ()=>DatabaseError,
    "FileSystemError",
    ()=>FileSystemError,
    "FileTooLargeError",
    ()=>FileTooLargeError,
    "InvalidFileTypeError",
    ()=>InvalidFileTypeError,
    "NetworkError",
    ()=>NetworkError,
    "NotFoundError",
    ()=>NotFoundError,
    "ProcessingError",
    ()=>ProcessingError,
    "RateLimitError",
    ()=>RateLimitError,
    "TimeoutError",
    ()=>TimeoutError,
    "ValidationError",
    ()=>ValidationError,
    "asyncHandler",
    ()=>asyncHandler,
    "formatErrorResponse",
    ()=>formatErrorResponse,
    "handleApiError",
    ()=>handleApiError,
    "retryOperation",
    ()=>retryOperation
]);
class AppError extends Error {
    constructor(message, statusCode = 500, code = null, details = null, originalError = null){
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
        this.requestId = null; // Can be set by middleware
        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error().stack;
        }
    }
    /**
   * Convert error to plain object for logging
   */ toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            code: this.code,
            details: this.details,
            timestamp: this.timestamp,
            requestId: this.requestId,
            stack: this.stack
        };
    }
}
class ValidationError extends AppError {
    constructor(message, details = null){
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}
class AuthenticationError extends AppError {
    constructor(message = 'Authentication required'){
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}
class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions'){
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}
class NotFoundError extends AppError {
    constructor(resource = 'Resource'){
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}
class ConflictError extends AppError {
    constructor(message){
        super(message, 409, 'CONFLICT');
    }
}
class RateLimitError extends AppError {
    constructor(message = 'Too many requests', retryAfter = null){
        super(message, 429, 'RATE_LIMIT_EXCEEDED', retryAfter ? {
            retryAfter
        } : null);
    }
}
class DatabaseError extends AppError {
    constructor(message, originalError = null){
        super(message, 500, 'DATABASE_ERROR', null, originalError);
    }
}
class FileSystemError extends AppError {
    constructor(message, originalError = null){
        super(message, 500, 'FILE_SYSTEM_ERROR', null, originalError);
    }
}
class NetworkError extends AppError {
    constructor(message, originalError = null){
        super(message, 503, 'NETWORK_ERROR', null, originalError);
    }
}
class TimeoutError extends AppError {
    constructor(message = 'Request timeout', timeoutMs = null){
        super(message, 408, 'TIMEOUT_ERROR', timeoutMs ? {
            timeoutMs
        } : null);
    }
}
class FileTooLargeError extends AppError {
    constructor(maxSize, actualSize = null){
        const message = `File too large. Maximum size is ${formatFileSize(maxSize)}`;
        super(message, 413, 'FILE_TOO_LARGE', {
            maxSize,
            actualSize
        });
    }
}
class InvalidFileTypeError extends AppError {
    constructor(allowedTypes = null){
        const message = allowedTypes ? `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` : 'Invalid file type';
        super(message, 400, 'INVALID_FILE_TYPE', {
            allowedTypes
        });
    }
}
class ProcessingError extends AppError {
    constructor(message, originalError = null){
        super(message, 500, 'PROCESSING_ERROR', null, originalError);
    }
}
/**
 * Format file size for human-readable display
 */ function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = [
        'Bytes',
        'KB',
        'MB',
        'GB'
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
/**
 * Enhanced error logger with advanced tracking
 */ async function logError(error, context = {}) {
    const errorInfo = {
        timestamp: new Date().toISOString(),
        error: error instanceof AppError ? error.toJSON() : {
            name: error.name,
            message: error.message,
            stack: error.stack
        },
        context,
        environment: ("TURBOPACK compile-time value", "development")
    };
    // Log to console with appropriate level
    if (error instanceof AppError && error.statusCode < 500) {
        // Client errors (4xx) - log as warning
        console.warn('Client Error:', JSON.stringify(errorInfo, null, 2));
    } else {
        // Server errors (5xx) - log as error
        console.error('Server Error:', JSON.stringify(errorInfo, null, 2));
    }
    // Track error with advanced error tracker
    try {
        const { default: errorTracker } = await __turbopack_context__.A("[project]/lib/errorTracker.js [api] (ecmascript, async loader)");
        const { log } = await __turbopack_context__.A("[project]/lib/logger.js [api] (ecmascript, async loader)");
        await errorTracker.trackError(error, context);
        log.error('Error logged', error, context);
    } catch (importError) {
        // Error tracker not available, continue with basic logging
        console.warn('Error tracker not available:', importError.message);
    }
    // In production, you might want to send to error tracking service
    // Example: Sentry, LogRocket, etc.
    if (("TURBOPACK compile-time value", "development") === 'production' && process.env.ERROR_TRACKING_ENABLED === 'true') {
    // TODO: Integrate with error tracking service
    // trackError(errorInfo);
    }
    return errorInfo;
}
function formatErrorResponse(error, includeStack = false, includeDetails = true) {
    const isDevelopment = ("TURBOPACK compile-time value", "development") === 'development';
    const response = {
        error: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_ERROR'
    };
    // Include details if available and allowed
    if (includeDetails && error.details) {
        response.details = error.details;
    }
    // Include stack trace only in development
    if ("TURBOPACK compile-time truthy", 1) {
        response.stack = error.stack;
    }
    // Include request ID if available
    if (error.requestId) {
        response.requestId = error.requestId;
    }
    // Include timestamp
    if (error.timestamp) {
        response.timestamp = error.timestamp;
    }
    return response;
}
async function handleApiError(error, res, context = {}) {
    // Log the error with context
    await logError(error, context);
    // If response already sent, just log
    if (res.headersSent) {
        return;
    }
    // Handle known error types
    if (error instanceof AppError) {
        return res.status(error.statusCode).json(formatErrorResponse(error, false, true));
    }
    // Handle specific error types from libraries and Node.js
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json(formatErrorResponse(new ValidationError(error.message, error.errors), false));
    }
    // Handle database connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return res.status(503).json(formatErrorResponse(new NetworkError('Database connection failed', error), false));
    }
    // Handle file system errors
    if (error.code === 'ENOENT' || error.code === 'EACCES' || error.code === 'EMFILE') {
        return res.status(500).json(formatErrorResponse(new FileSystemError('File system operation failed', error), false));
    }
    // Handle timeout errors
    if (error.message && (error.message.includes('timeout') || error.message.includes('ETIMEDOUT'))) {
        return res.status(408).json(formatErrorResponse(new TimeoutError('Request timeout', error.timeout), false));
    }
    // Handle file size errors
    if (error.code === 'LIMIT_FILE_SIZE' || error.message?.includes('too large')) {
        return res.status(413).json(formatErrorResponse(new FileTooLargeError(), false));
    }
    // Default to 500 with safe error message
    const isDevelopment = ("TURBOPACK compile-time value", "development") === 'development';
    const safeMessage = ("TURBOPACK compile-time truthy", 1) ? error.message || 'Internal server error' : "TURBOPACK unreachable";
    res.status(500).json(formatErrorResponse(new AppError(safeMessage, 500, 'INTERNAL_ERROR', null, error), isDevelopment));
}
function asyncHandler(handler) {
    return async (req, res, next)=>{
        try {
            await handler(req, res, next);
        } catch (error) {
            handleApiError(error, res, {
                method: req.method,
                url: req.url,
                path: req.path,
                query: req.query,
                user: req.user?.id
            });
        }
    };
}
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    for(let attempt = 1; attempt <= maxRetries; attempt++){
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            // Don't retry on certain errors
            if (error instanceof ValidationError || error instanceof AuthenticationError || error instanceof AuthorizationError) {
                throw error;
            }
            // If last attempt, throw error
            if (attempt === maxRetries) {
                break;
            }
            // Wait before retrying (exponential backoff)
            const waitTime = delay * Math.pow(2, attempt - 1);
            await new Promise((resolve)=>setTimeout(resolve, waitTime));
        }
    }
    throw lastError;
}
}),
"[project]/lib/usage-limits.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Sistema di limiti d'uso per tool gratuiti e PRO
// Piano gratuito senza registrazione: molto generoso per convincere a registrarsi
__turbopack_context__.s([
    "USAGE_LIMITS",
    ()=>USAGE_LIMITS,
    "canUseTool",
    ()=>canUseTool,
    "default",
    ()=>__TURBOPACK__default__export__,
    "getToolLimits",
    ()=>getToolLimits,
    "getUpgradeMessage",
    ()=>getUpgradeMessage
]);
const USAGE_LIMITS = {
    // Piano gratuito SENZA registrazione (generoso ma limitato per incentivare registrazione)
    GUEST: {
        // Tool PRO - 5 utilizzi al giorno per tutti (generoso ma limitato)
        'rimozione-sfondo-ai': {
            daily: 5,
            monthly: 50,
            fileSize: 5 * 1024 * 1024
        },
        'generazione-immagini-ai': {
            daily: 5,
            monthly: 50
        },
        'clean-noise-ai': {
            daily: 5,
            monthly: 50,
            fileSize: 10 * 1024 * 1024
        },
        'ocr-avanzato-ai': {
            daily: 5,
            monthly: 50,
            fileSize: 10 * 1024 * 1024
        },
        'traduzione-documenti-ai': {
            daily: 5,
            monthly: 50,
            fileSize: 10 * 1024 * 1024
        },
        'elabora-e-riassumi': {
            daily: 5,
            monthly: 50,
            maxLength: 5000
        },
        'thumbnail-generator': {
            daily: 5,
            monthly: 50
        },
        'upscaler-ai': {
            daily: 5,
            monthly: 50,
            fileSize: 5 * 1024 * 1024
        },
        // Tool gratuiti - limiti molto generosi
        'trascrizione-audio': {
            daily: 10,
            monthly: 200,
            fileSize: 25 * 1024 * 1024
        },
        'riassunto-testo': {
            daily: 20,
            monthly: 500,
            maxLength: 10000
        },
        'traduci-testo': {
            daily: 50,
            monthly: 1000,
            maxLength: 5000
        },
        'correttore-grammaticale': {
            daily: 30,
            monthly: 500,
            maxLength: 5000
        },
        'combina-splitta-pdf': {
            daily: 20,
            monthly: 300,
            fileSize: 50 * 1024 * 1024
        }
    },
    // Piano gratuito CON registrazione (ancora più generoso)
    FREE: {
        'rimozione-sfondo-ai': {
            daily: 50,
            monthly: 1000,
            fileSize: 10 * 1024 * 1024
        },
        'generazione-immagini-ai': {
            daily: 20,
            monthly: 300
        },
        'clean-noise-ai': {
            daily: 20,
            monthly: 400,
            fileSize: 25 * 1024 * 1024
        },
        'ocr-avanzato-ai': {
            daily: 50,
            monthly: 1000,
            fileSize: 25 * 1024 * 1024
        },
        'traduzione-documenti-ai': {
            daily: 20,
            monthly: 400,
            fileSize: 25 * 1024 * 1024
        },
        'elabora-e-riassumi': {
            daily: 50,
            monthly: 1000,
            maxLength: 20000
        },
        'thumbnail-generator': {
            daily: 50,
            monthly: 1000
        },
        'upscaler-ai': {
            daily: 100,
            monthly: 2000,
            fileSize: 25 * 1024 * 1024
        },
        'trascrizione-audio': {
            daily: 50,
            monthly: 1000,
            fileSize: 50 * 1024 * 1024
        },
        'riassunto-testo': {
            daily: 100,
            monthly: 2000,
            maxLength: 50000
        },
        'traduci-testo': {
            daily: 200,
            monthly: 5000,
            maxLength: 20000
        },
        'correttore-grammaticale': {
            daily: 100,
            monthly: 2000,
            maxLength: 20000
        },
        'combina-splitta-pdf': {
            daily: 100,
            monthly: 2000,
            fileSize: 100 * 1024 * 1024
        }
    },
    // Piano PRO (illimitato o limiti molto alti)
    PRO: {
        'rimozione-sfondo-ai': {
            daily: -1,
            monthly: -1,
            fileSize: 50 * 1024 * 1024
        },
        'generazione-immagini-ai': {
            daily: 100,
            monthly: 2000
        },
        'clean-noise-ai': {
            daily: -1,
            monthly: -1,
            fileSize: 100 * 1024 * 1024
        },
        'ocr-avanzato-ai': {
            daily: -1,
            monthly: -1,
            fileSize: 100 * 1024 * 1024
        },
        'traduzione-documenti-ai': {
            daily: -1,
            monthly: -1,
            fileSize: 100 * 1024 * 1024
        },
        'elabora-e-riassumi': {
            daily: -1,
            monthly: -1,
            maxLength: -1
        },
        'thumbnail-generator': {
            daily: -1,
            monthly: -1
        },
        'upscaler-ai': {
            daily: -1,
            monthly: -1,
            fileSize: 100 * 1024 * 1024
        },
        'trascrizione-audio': {
            daily: -1,
            monthly: -1,
            fileSize: 200 * 1024 * 1024
        },
        'riassunto-testo': {
            daily: -1,
            monthly: -1,
            maxLength: -1
        },
        'traduci-testo': {
            daily: -1,
            monthly: -1,
            maxLength: -1
        },
        'correttore-grammaticale': {
            daily: -1,
            monthly: -1,
            maxLength: -1
        },
        'combina-splitta-pdf': {
            daily: -1,
            monthly: -1,
            fileSize: 500 * 1024 * 1024
        }
    }
};
function getToolLimits(toolSlug, userPlan = 'GUEST') {
    const planLimits = USAGE_LIMITS[userPlan] || USAGE_LIMITS.GUEST;
    return planLimits[toolSlug] || null;
}
function canUseTool(toolSlug, userPlan = 'GUEST', usageStats = {}, fileInfo = {}) {
    const limits = getToolLimits(toolSlug, userPlan);
    if (!limits) {
        return {
            allowed: true,
            reason: 'Nessun limite configurato'
        };
    }
    // Verifica limite giornaliero
    if (limits.daily !== -1 && usageStats.daily >= limits.daily) {
        return {
            allowed: false,
            reason: `Hai raggiunto il limite giornaliero di ${limits.daily} utilizzi. Riprova domani o passa a PRO per limiti più alti.`,
            limitType: 'daily',
            current: usageStats.daily,
            max: limits.daily
        };
    }
    // Verifica limite mensile
    if (limits.monthly !== -1 && usageStats.monthly >= limits.monthly) {
        return {
            allowed: false,
            reason: `Hai raggiunto il limite mensile di ${limits.monthly} utilizzi. Passa a PRO per limiti più alti.`,
            limitType: 'monthly',
            current: usageStats.monthly,
            max: limits.monthly
        };
    }
    // Verifica dimensione file
    if (limits.fileSize && fileInfo.size && fileInfo.size > limits.fileSize) {
        const maxMB = (limits.fileSize / (1024 * 1024)).toFixed(0);
        return {
            allowed: false,
            reason: `File troppo grande. Dimensione massima: ${maxMB}MB. Passa a PRO per file più grandi.`,
            limitType: 'fileSize',
            current: fileInfo.size,
            max: limits.fileSize
        };
    }
    // Verifica lunghezza testo
    if (limits.maxLength && fileInfo.length && fileInfo.length > limits.maxLength) {
        return {
            allowed: false,
            reason: `Testo troppo lungo. Lunghezza massima: ${limits.maxLength} caratteri. Passa a PRO per testi più lunghi.`,
            limitType: 'maxLength',
            current: fileInfo.length,
            max: limits.maxLength
        };
    }
    return {
        allowed: true,
        reason: 'OK'
    };
}
function getUpgradeMessage(toolSlug, currentPlan = 'GUEST') {
    const limits = getToolLimits(toolSlug, currentPlan);
    const proLimits = getToolLimits(toolSlug, 'PRO');
    if (!limits || !proLimits) {
        return 'Passa a PRO per funzionalità avanzate!';
    }
    const messages = [];
    if (limits.daily !== -1 && proLimits.daily === -1) {
        messages.push('utilizzi illimitati');
    } else if (limits.daily < proLimits.daily) {
        messages.push(`${proLimits.daily} utilizzi al giorno`);
    }
    if (limits.fileSize && proLimits.fileSize && limits.fileSize < proLimits.fileSize) {
        const maxMB = (proLimits.fileSize / (1024 * 1024)).toFixed(0);
        messages.push(`file fino a ${maxMB}MB`);
    }
    if (limits.maxLength && proLimits.maxLength === -1) {
        messages.push('testi di lunghezza illimitata');
    }
    if (messages.length === 0) {
        return 'Passa a PRO per funzionalità avanzate!';
    }
    return `Passa a PRO per ${messages.join(', ')} e molto altro!`;
}
const __TURBOPACK__default__export__ = {
    USAGE_LIMITS,
    getToolLimits,
    canUseTool,
    getUpgradeMessage
};
}),
"[project]/lib/usage-tracker.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Sistema di tracking degli usi per limiti gratuiti/PRO
// Usa storage in-memory (in produzione si può usare database)
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getUsageStats",
    ()=>getUsageStats,
    "getUserId",
    ()=>getUserId,
    "getUserPlan",
    ()=>getUserPlan,
    "incrementUsage",
    ()=>incrementUsage
]);
const usageStore = new Map(); // { userId: { toolSlug: { daily: count, monthly: count, lastReset: date } } }
function getUsageStats(userId = 'guest', toolSlug) {
    const userKey = userId || 'guest';
    if (!usageStore.has(userKey)) {
        usageStore.set(userKey, {});
    }
    const userUsage = usageStore.get(userKey);
    if (!userUsage[toolSlug]) {
        userUsage[toolSlug] = {
            daily: 0,
            monthly: 0,
            lastDailyReset: new Date().toDateString(),
            lastMonthlyReset: new Date().getMonth()
        };
    }
    const toolUsage = userUsage[toolSlug];
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    // Reset giornaliero se necessario
    if (toolUsage.lastDailyReset !== today) {
        toolUsage.daily = 0;
        toolUsage.lastDailyReset = today;
    }
    // Reset mensile se necessario
    if (toolUsage.lastMonthlyReset !== thisMonth) {
        toolUsage.monthly = 0;
        toolUsage.lastMonthlyReset = thisMonth;
    }
    return {
        daily: toolUsage.daily || 0,
        monthly: toolUsage.monthly || 0
    };
}
function incrementUsage(userId = 'guest', toolSlug) {
    const userKey = userId || 'guest';
    if (!usageStore.has(userKey)) {
        usageStore.set(userKey, {});
    }
    const userUsage = usageStore.get(userKey);
    if (!userUsage[toolSlug]) {
        userUsage[toolSlug] = {
            daily: 0,
            monthly: 0,
            lastDailyReset: new Date().toDateString(),
            lastMonthlyReset: new Date().getMonth()
        };
    }
    const toolUsage = userUsage[toolSlug];
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    // Reset se necessario
    if (toolUsage.lastDailyReset !== today) {
        toolUsage.daily = 0;
        toolUsage.lastDailyReset = today;
    }
    if (toolUsage.lastMonthlyReset !== thisMonth) {
        toolUsage.monthly = 0;
        toolUsage.lastMonthlyReset = thisMonth;
    }
    // Incrementa contatori
    toolUsage.daily = (toolUsage.daily || 0) + 1;
    toolUsage.monthly = (toolUsage.monthly || 0) + 1;
}
function getUserPlan(req = null) {
    // TODO: In produzione, leggere dal database o dalla sessione
    // Per ora ritorna sempre 'GUEST' (utente non registrato)
    if (req && req.headers && req.headers['x-user-id']) {
        // Se c'è un user ID, potresti controllare il piano dal database
        // Per ora assumiamo FREE se registrato
        return 'FREE';
    }
    return 'GUEST';
}
function getUserId(req = null) {
    if (req && req.headers && req.headers['x-user-id']) {
        return req.headers['x-user-id'];
    }
    // In produzione, potresti usare session/cookie
    return 'guest';
}
const __TURBOPACK__default__export__ = {
    getUsageStats,
    incrementUsage,
    getUserPlan,
    getUserId
};
}),
"[project]/pages/api/upscale.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/formidable [external] (formidable, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$upscale$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/upscale.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/openai.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/errors/index.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$usage$2d$limits$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/usage-limits.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$usage$2d$tracker$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/usage-tracker.js [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2e$js__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2e$js__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
const config = {
    api: {
        bodyParser: false
    }
};
async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({
            error: 'Method not allowed',
            code: 'METHOD_NOT_ALLOWED'
        });
    }
    // Set timeout for long-running operations
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const TIMEOUT_MS = 120000; // 2 minutes
    const form = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$formidable__$5b$external$5d$__$28$formidable$2c$__esm_import$29$__["default"])({
        multiples: false,
        maxFileSize: MAX_FILE_SIZE,
        keepExtensions: true
    });
    let filePath = null;
    try {
        // Support both callback and promise styles robustly
        const parsed = await Promise.race([
            new Promise((resolve, reject)=>{
                form.parse(req, (err, fields, files)=>{
                    if (err) {
                        // Handle formidable-specific errors
                        if (err.code === 'LIMIT_FILE_SIZE') {
                            return reject(new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["FileTooLargeError"](MAX_FILE_SIZE));
                        }
                        return reject(new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"]('File upload failed: ' + err.message, err));
                    }
                    resolve({
                        fields,
                        files
                    });
                });
            }),
            new Promise((_, reject)=>setTimeout(()=>reject(new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["TimeoutError"]('Request timeout', TIMEOUT_MS)), TIMEOUT_MS))
        ]);
        const { files } = parsed;
        // Accept 'image' or 'file' field names; normalize array/single
        let file = files?.image ?? files?.file ?? null;
        if (Array.isArray(file)) file = file[0];
        if (!file) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"]('No file uploaded');
        }
        // Validate file type
        if (!file.mimetype?.startsWith('image/')) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["InvalidFileTypeError"]([
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/gif'
            ]);
        }
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["FileTooLargeError"](MAX_FILE_SIZE, file.size);
        }
        // Verifica limiti d'uso (tool PRO)
        const userId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$usage$2d$tracker$2e$js__$5b$api$5d$__$28$ecmascript$29$__["getUserId"])(req);
        const userPlan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$usage$2d$tracker$2e$js__$5b$api$5d$__$28$ecmascript$29$__["getUserPlan"])(req);
        const toolSlug = 'upscaler-ai';
        const usageStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$usage$2d$tracker$2e$js__$5b$api$5d$__$28$ecmascript$29$__["getUsageStats"])(userId, toolSlug);
        const fileInfo = {
            size: file.size
        };
        const limitCheck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$usage$2d$limits$2e$js__$5b$api$5d$__$28$ecmascript$29$__["canUseTool"])(toolSlug, userPlan, usageStats, fileInfo);
        if (!limitCheck.allowed) {
            // Cleanup file prima di ritornare errore
            if (filePath) {
                try {
                    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(filePath);
                } catch (cleanupError) {
                    console.warn('Failed to cleanup temp file:', cleanupError);
                }
            }
            return res.status(403).json({
                error: limitCheck.reason,
                limitType: limitCheck.limitType,
                current: limitCheck.current,
                max: limitCheck.max,
                upgradeMessage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$usage$2d$limits$2e$js__$5b$api$5d$__$28$ecmascript$29$__["getUpgradeMessage"])(toolSlug, userPlan),
                requiresPro: true
            });
        }
        filePath = file.filepath || file.path; // v3 vs older
        if (!filePath) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"]('Uploaded file path missing');
        }
        let buffer;
        try {
            buffer = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(filePath);
        } catch (readError) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["FileSystemError"]('Failed to read uploaded file', readError);
        }
        // Validate buffer is not empty
        if (!buffer || buffer.length === 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ValidationError"]('File is empty or corrupted');
        }
        let upscaledUrl;
        try {
            // Use advanced local upscaler as primary method (improves existing image quality)
            console.log('Using advanced local upscaler to enhance image quality');
            upscaledUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$upscale$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"])(buffer);
            // Optional: If OpenAI API key is available, use it for additional quality enhancement
            // This analyzes the image and applies AI-based improvements
            if (process.env.OPENAI_API_KEY) {
                try {
                    console.log('Applying AI-based quality enhancement with OpenAI Vision...');
                    const enhancedBuffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2e$js__$5b$api$5d$__$28$ecmascript$29$__["enhanceImageQualityWithAI"])(buffer, file.mimetype);
                    // Convert enhanced buffer to data URL
                    const base64 = enhancedBuffer.toString('base64');
                    upscaledUrl = `data:${file.mimetype || 'image/jpeg'};base64,${base64}`;
                    console.log('AI enhancement applied successfully');
                } catch (aiError) {
                    console.warn('AI enhancement failed, using upscaled result:', aiError.message);
                // Continue with upscaled result if AI enhancement fails
                }
            }
            // Incrementa contatore uso (solo se la richiesta è andata a buon fine)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$usage$2d$tracker$2e$js__$5b$api$5d$__$28$ecmascript$29$__["incrementUsage"])(userId, toolSlug);
            // Cleanup temp file
            if (filePath) {
                try {
                    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(filePath);
                    filePath = null;
                } catch (cleanupError) {
                    console.warn('Failed to cleanup temp file:', cleanupError);
                }
            }
            return res.status(200).json({
                url: upscaledUrl
            });
        } catch (upscaleError) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["ProcessingError"]('Failed to upscale image', upscaleError);
        }
    } catch (error) {
        // Cleanup on error
        if (filePath) {
            try {
                await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(filePath);
            } catch (cleanupError) {
                console.warn('Failed to cleanup temp file on error:', cleanupError);
            }
        }
        // Use centralized error handler
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$errors$2f$index$2e$js__$5b$api$5d$__$28$ecmascript$29$__["handleApiError"])(error, res, {
            method: req.method,
            url: req.url,
            endpoint: '/api/upscale'
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6a045734._.js.map