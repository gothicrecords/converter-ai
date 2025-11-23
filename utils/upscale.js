import sharp from 'sharp';
import AdvancedUpscaler from './advancedUpscaler.js';

/**
 * Upscale immagine usando upscaler avanzato locale
 * Completamente gratuito, senza API esterne
 */
export default async function upscaleImage(fileBuffer, targetScale = 4) {
  try {
    const upscaler = new AdvancedUpscaler();
    
    // Usa upscaler avanzato per qualità 4K/8K
    // Cerca sempre di raggiungere almeno 4K quando possibile
    const metadata = await sharp(fileBuffer, { sequentialRead: true }).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;
    const mp = (originalWidth * originalHeight) / 1e6;
    
    // Calcola il lato lungo
    const longSide = Math.max(originalWidth, originalHeight);
    
    let upscaled;
    
    // Strategia: sempre upscale a 4K se possibile, altrimenti almeno 4x
    if (longSide < 1920) {
      // Immagine piccola/HD: upscale a 4K (3840px lato lungo)
      console.log(`Upscaling small image (${originalWidth}x${originalHeight}) to 4K`);
      upscaled = await upscaler.upscaleTo4K(fileBuffer);
    } else if (longSide < 3840) {
      // Immagine HD/FHD: upscale a 4K o almeno 2x fino a 4K
      const scaleTo4K = 3840 / longSide;
      console.log(`Upscaling HD image (${originalWidth}x${originalHeight}) to 4K (scale: ${scaleTo4K.toFixed(2)}x)`);
      upscaled = await upscaler.upscale(fileBuffer, scaleTo4K, 3840);
    } else {
      // Immagine già grande: upscale almeno 2x o fino a 8K se possibile
      const scale = Math.max(2, Math.min(4, 7680 / longSide));
      console.log(`Upscaling large image (${originalWidth}x${originalHeight}) by ${scale.toFixed(2)}x`);
      upscaled = await upscaler.upscale(fileBuffer, scale, 7680);
    }
    
    // Ritorna data URL (completamente locale, nessuna API esterna)
    const base64 = upscaled.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (e) {
    console.error('Upscale fallito:', e);
    throw new Error(`Upscale failed: ${e?.message || e}`);
  }
}
