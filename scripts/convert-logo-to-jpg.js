import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertSvgToJpg() {
  try {
    const svgPath = path.join(__dirname, '../public/logo-with-text.svg');
    const jpgPath = path.join(__dirname, '../public/logo-with-text.jpg');
    
    // Read SVG file
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Convert SVG to JPG with high quality
    await sharp(svgBuffer, { density: 300 })
      .resize(1200, null, { // Width 1200px, height auto
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .jpeg({ quality: 95 })
      .toFile(jpgPath);
    
    console.log('✅ Logo converted successfully!');
    console.log(`📁 Saved to: ${jpgPath}`);
    
    // Get file size
    const stats = fs.statSync(jpgPath);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Error converting logo:', error);
    process.exit(1);
  }
}

convertSvgToJpg();
