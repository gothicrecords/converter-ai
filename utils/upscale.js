import sharp from 'sharp';
import AdvancedUpscaler from './advancedUpscaler.js';

/**
 * Upscale immagine usando upscaler avanzato locale
 * Completamente gratuito, senza API esterne
 */
export default async function upscaleImage(fileBuffer, targetScale = 2) {
  try {
    const upscaler = new AdvancedUpscaler();
    
    // Usa upscaler avanzato per qualità 4K
    // Se l'immagine è piccola, upscale a 4K, altrimenti 2x
    const metadata = await sharp(fileBuffer, { sequentialRead: true }).metadata();
    const mp = ((metadata.width || 0) * (metadata.height || 0)) / 1e6;
    
    let upscaled;
    if (mp < 1) {
      // Immagine molto piccola: upscale a 4K
      upscaled = await upscaler.upscaleTo4K(fileBuffer);
    } else {
      // Immagine normale: upscale 2x o targetScale
      upscaled = await upscaler.upscale(fileBuffer, targetScale, 7680);
    }
    
    // Ritorna data URL (completamente locale, nessuna API esterna)
    const base64 = upscaled.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (e) {
    console.error('Upscale fallito:', e);
    throw new Error(`Upscale failed: ${e?.message || e}`);
  }
}
