import sharp from 'sharp';

/**
 * Generatore di immagini procedurali avanzato completamente locale
 * Crea immagini uniche basate su prompt usando tecniche procedurali avanzate
 */
class ProceduralImageGenerator {
    constructor() {
        this.seed = null;
    }

    // Genera seed deterministica dal prompt
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    // Genera numero pseudo-random basato su seed
    random(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    // Estrae keyword dal prompt per determinare lo stile
    extractKeywords(prompt) {
        const lower = prompt.toLowerCase();
        const keywords = {
            colors: [],
            style: 'abstract',
            theme: 'nature',
            mood: 'calm'
        };

        // Colori
        const colorMap = {
            'rosso': [255, 0, 0], 'red': [255, 0, 0],
            'blu': [0, 0, 255], 'blue': [0, 0, 255],
            'verde': [0, 255, 0], 'green': [0, 255, 0],
            'giallo': [255, 255, 0], 'yellow': [255, 255, 0],
            'viola': [128, 0, 128], 'purple': [128, 0, 128],
            'arancione': [255, 165, 0], 'orange': [255, 165, 0],
            'rosa': [255, 192, 203], 'pink': [255, 192, 203],
            'nero': [0, 0, 0], 'black': [0, 0, 0],
            'bianco': [255, 255, 255], 'white': [255, 255, 255],
            'grigio': [128, 128, 128], 'gray': [128, 128, 128], 'grey': [128, 128, 128]
        };

        for (const [key, value] of Object.entries(colorMap)) {
            if (lower.includes(key)) {
                keywords.colors.push(value);
            }
        }

        // Stile
        if (lower.includes('realistic') || lower.includes('realistico') || lower.includes('foto')) {
            keywords.style = 'realistic';
        } else if (lower.includes('abstract') || lower.includes('astratto')) {
            keywords.style = 'abstract';
        } else if (lower.includes('artistic') || lower.includes('artistico')) {
            keywords.style = 'artistic';
        } else if (lower.includes('minimal') || lower.includes('minimalista')) {
            keywords.style = 'minimal';
        }

        // Tema
        if (lower.includes('natura') || lower.includes('nature') || lower.includes('paesaggio') || lower.includes('landscape')) {
            keywords.theme = 'nature';
        } else if (lower.includes('città') || lower.includes('city') || lower.includes('urban')) {
            keywords.theme = 'urban';
        } else if (lower.includes('spazio') || lower.includes('space') || lower.includes('cosmo')) {
            keywords.theme = 'space';
        } else if (lower.includes('oceano') || lower.includes('ocean') || lower.includes('mare') || lower.includes('sea')) {
            keywords.theme = 'ocean';
        }

        // Mood
        if (lower.includes('calm') || lower.includes('calmo') || lower.includes('sereno')) {
            keywords.mood = 'calm';
        } else if (lower.includes('energetic') || lower.includes('energico') || lower.includes('vibrante')) {
            keywords.mood = 'energetic';
        } else if (lower.includes('dark') || lower.includes('scuro') || lower.includes('oscuro')) {
            keywords.mood = 'dark';
        }

        return keywords;
    }

    // Noise Perlin-like semplificato
    noise2D(x, y, seed) {
        const n = Math.floor(x) + Math.floor(y) * 57;
        const n2 = (n << 13) ^ n;
        const seedValue = (seed + n2) * 9301 + 49297;
        return ((seedValue & 0x7fffffff) / 2147483648.0) * 2.0 - 1.0;
    }

    // Interpolazione smooth
    smoothstep(edge0, edge1, x) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    // Crea gradiente complesso con tecniche avanzate
    async createComplexGradient(width, height, colors, seed) {
        const channels = 3;
        const buffer = Buffer.alloc(width * height * channels);
        
        // Genera multiple layer di pattern
        const layers = 3;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * channels;
                
                // Calcola posizione normalizzata
                const nx = x / width;
                const ny = y / height;
                
                // Distanza dal centro (multiple centri per pattern complesso)
                const dx = nx - 0.5;
                const dy = ny - 0.5;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Angolo
                const angle = Math.atan2(dy, dx);
                
                // Seleziona colore base
                let color = [128, 128, 128];
                if (colors.length > 0) {
                    // Mix di colori basato su pattern complesso
                    const colorMix = [];
                    for (let i = 0; i < colors.length; i++) {
                        const weight = Math.abs(Math.sin(angle * (i + 1) + dist * 5));
                        colorMix.push(weight);
                    }
                    
                    // Normalizza pesi
                    const totalWeight = colorMix.reduce((a, b) => a + b, 0) || 1;
                    const r = colorMix.reduce((sum, w, i) => sum + (colors[i][0] * w), 0) / totalWeight;
                    const g = colorMix.reduce((sum, w, i) => sum + (colors[i][1] * w), 0) / totalWeight;
                    const b = colorMix.reduce((sum, w, i) => sum + (colors[i][2] * w), 0) / totalWeight;
                    color = [r, g, b];
                } else {
                    // Colori procedurali avanzati
                    const hue = (angle / Math.PI + 1) * 0.5;
                    const saturation = 0.5 + dist * 0.5;
                    const lightness = 0.3 + (1 - dist * 1.5) * 0.4;
                    color = this.hslToRgb(hue * 360, saturation * 100, lightness * 100);
                }
                
                // Aggiungi pattern multi-layer
                let finalR = color[0];
                let finalG = color[1];
                let finalB = color[2];
                
                for (let layer = 0; layer < layers; layer++) {
                    const layerSeed = seed + layer * 10000;
                    const freq = Math.pow(2, layer);
                    const amplitude = 1.0 / (layer + 1);
                    
                    // Noise procedurale
                    const noiseX = nx * freq * 10;
                    const noiseY = ny * freq * 10;
                    const noise = this.noise2D(noiseX, noiseY, layerSeed);
                    
                    // Pattern radiali
                    const radial = Math.sin(dist * freq * Math.PI * 4) * amplitude;
                    
                    // Pattern angolari
                    const angular = Math.sin(angle * freq * 3) * amplitude * 0.5;
                    
                    // Combina pattern
                    const pattern = (noise + radial + angular) * 30;
                    
                    finalR += pattern;
                    finalG += pattern * 0.9;
                    finalB += pattern * 0.8;
                }
                
                // Clamp valori
                buffer[idx] = Math.max(0, Math.min(255, finalR));
                buffer[idx + 1] = Math.max(0, Math.min(255, finalG));
                buffer[idx + 2] = Math.max(0, Math.min(255, finalB));
            }
        }
        
        return sharp(buffer, {
            raw: {
                width,
                height,
                channels: 3
            }
        });
    }

    // Aggiunge pattern e texture
    async addPatterns(image, keywords, seed) {
        const { width, height } = await image.metadata();
        
        // Crea pattern overlay
        const patternBuffer = Buffer.alloc(width * height * 4);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                let pattern = 0;
                
                // Pattern basati su tema
                if (keywords.theme === 'nature') {
                    // Pattern organici
                    const fx = x / 50;
                    const fy = y / 50;
                    pattern = Math.sin(fx * Math.PI) * Math.cos(fy * Math.PI) * 0.1;
                } else if (keywords.theme === 'space') {
                    // Pattern stellari
                    const fx = x / 20;
                    const fy = y / 20;
                    pattern = (Math.sin(fx) * Math.sin(fy) > 0.8) ? 0.2 : 0;
                } else if (keywords.theme === 'ocean') {
                    // Pattern ondulati
                    const fx = x / 30;
                    const fy = y / 30;
                    pattern = Math.sin(fx + fy) * 0.15;
                } else {
                    // Pattern astratti
                    const fx = x / 40;
                    const fy = y / 40;
                    pattern = (Math.sin(fx) + Math.cos(fy)) * 0.1;
                }
                
                // Aggiungi noise procedurale
                const noise = (this.random(seed + x + y) - 0.5) * 0.05;
                pattern += noise;
                
                patternBuffer[idx] = 255; // R
                patternBuffer[idx + 1] = 255; // G
                patternBuffer[idx + 2] = 255; // B
                patternBuffer[idx + 3] = Math.floor((pattern + 0.5) * 50); // Alpha
            }
        }
        
        const patternImage = sharp(patternBuffer, {
            raw: {
                width,
                height,
                channels: 4
            }
        });
        
        return image.composite([{
            input: await patternImage.toBuffer(),
            blend: 'overlay'
        }]);
    }

    // Applica effetti avanzati
    async applyAdvancedEffects(image, keywords, detail) {
        let processed = image;
        
        // Sharpening basato su dettaglio (più aggressivo)
        const sharpenSigma = 0.8 + (detail * 0.7);
        processed = processed.sharpen({
            sigma: sharpenSigma,
            m1: 0.6 + (detail * 0.3),
            m2: 0.3 + (detail * 0.2)
        });
        
        // Contrasto e saturazione basati su mood
        if (keywords.mood === 'energetic') {
            processed = processed
                .modulate({
                    brightness: 1.15,
                    saturation: 1.4,
                    hue: 0
                })
                .linear(1.1, -(128 * 0.1)); // Contrasto aggiuntivo
        } else if (keywords.mood === 'calm') {
            processed = processed
                .modulate({
                    brightness: 0.98,
                    saturation: 0.85,
                    hue: 0
                })
                .linear(0.98, 0); // Contrasto ridotto
        } else if (keywords.mood === 'dark') {
            processed = processed
                .modulate({
                    brightness: 0.65,
                    saturation: 1.2,
                    hue: 0
                })
                .linear(1.15, -(128 * 0.15)); // Contrasto aumentato
        } else {
            // Default: miglioramento generale
            processed = processed
                .modulate({
                    brightness: 1.02,
                    saturation: 1.1,
                    hue: 0
                })
                .linear(1.05, -(128 * 0.05));
        }
        
        // Vignette e gamma per stile realistico
        if (keywords.style === 'realistic') {
            processed = processed
                .gamma(1.15)
                .linear(1.08, -(128 * 0.08));
        } else if (keywords.style === 'artistic') {
            processed = processed
                .gamma(0.95)
                .modulate({
                    brightness: 1.05,
                    saturation: 1.25,
                    hue: 0
                });
        }
        
        // Denoising leggero per immagini procedurali
        processed = processed.blur(0.2);
        
        // Sharpening finale per dettagli
        processed = processed.sharpen({
            sigma: 0.5 + (detail * 0.3),
            m1: 0.4,
            m2: 0.2
        });
        
        return processed;
    }

    // Genera immagine principale
    async generate(prompt, width, height, detail = 1.0, realism = true) {
        // Genera seed dal prompt
        this.seed = this.hashString(prompt);
        
        // Estrai keyword
        const keywords = this.extractKeywords(prompt);
        
        // Determina colori
        let colors = keywords.colors;
        if (colors.length === 0) {
            // Colori di default basati su seed
            const baseHue = this.random(this.seed) * 360;
            colors = [
                this.hslToRgb(baseHue, 70, 50),
                this.hslToRgb((baseHue + 60) % 360, 70, 60),
                this.hslToRgb((baseHue + 120) % 360, 70, 40)
            ];
        }
        
        // Crea gradiente base
        let image = await this.createComplexGradient(width, height, colors, this.seed);
        
        // Aggiungi pattern
        image = await this.addPatterns(image, keywords, this.seed);
        
        // Applica effetti avanzati
        image = await this.applyAdvancedEffects(image, keywords, detail);
        
        // Converti a buffer
        return await image.jpeg({
            quality: 95,
            chromaSubsampling: '4:4:4',
            mozjpeg: true
        }).toBuffer();
    }

    // Converte HSL a RGB
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }
}

export default ProceduralImageGenerator;

