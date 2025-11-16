import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

// Configura Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder: 'upscaler-ai', ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

async function upscaleWithSharp(buffer) {
  try {
    // Fast decode path and honor EXIF orientation
    const input = sharp(buffer, { sequentialRead: true }).rotate();
    const metadata = await input.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const mp = (width * height) / 1e6;

    // Heuristic: big images use a faster path; small images use a quality path
    const isLarge = mp >= 3.5; // ~3.5 megapixel threshold

    if (isLarge) {
      // FAST PATH: Single-pass, faster kernel and lean JPEG for speed
      const fastBuffer = await input
        .resize(width * 2, height * 2, {
          kernel: sharp.kernel.cubic, // Faster than lanczos with good quality
          fit: 'fill',
        })
        .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.3 })
        .jpeg({
          quality: 94,
          chromaSubsampling: '4:2:0', // Faster and smaller
          mozjpeg: true,
        })
        .toBuffer();
      console.log(`Upscale FAST ${mp.toFixed(2)}MP: ${width}x${height} -> ${width * 2}x${height * 2}`);
      return fastBuffer;
    }

    // QUALITY PATH: Two-pass for visible detail but still efficient
    const firstPass = await input
      .resize(Math.round(width * 1.5), Math.round(height * 1.5), {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill',
      })
      .sharpen({ sigma: 0.5, m1: 0.4, m2: 0.2 })
      .toBuffer();

    const upscaled = await sharp(firstPass, { sequentialRead: true })
      .resize(width * 2, height * 2, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill',
      })
      .sharpen({ sigma: 0.9, m1: 0.55, m2: 0.3 }) // Natural but visibly sharper
      .linear(1.03, 0) // Tiny contrast for clarity without saturation changes
      .jpeg({
        quality: 96,
        chromaSubsampling: '4:4:4',
        mozjpeg: true,
        trellisQuantisation: true,
        overshootDeringing: true,
        optimiseScans: true,
      })
      .toBuffer();

    console.log(`Upscale QUALITY ${mp.toFixed(2)}MP: ${width}x${height} -> ${width * 2}x${height * 2}`);
    return upscaled;
  } catch (e) {
    throw new Error(`Sharp upscale failed: ${e.message}`);
  }
}

export default async function upscaleImage(fileBuffer) {
  try {
    // Upscale using Sharp (fast, high quality, local)
    const upscaled = await upscaleWithSharp(fileBuffer);
    
    // Try hosting on Cloudinary; if it fails (size limits), return data URL
    try {
      const upload = await uploadToCloudinary(upscaled);
      if (upload?.secure_url) return upload.secure_url;
    } catch (e) {
      console.warn('Upload Cloudinary fallito, ritorno data URL:', e?.message || e);
    }
    
    const base64 = upscaled.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (e) {
    console.error('Upscale fallito:', e);
    throw new Error(`Upscale failed: ${e?.message || e}`);
  }
}
