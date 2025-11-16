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
    // Get original image metadata
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // 8K-style photorealistic upscaling - natural, no artificial enhancement
    // Pass 1: Gentle denoise while preserving fine detail
    const denoised = await image
      .median(1) // Minimal noise reduction, preserve texture
      .toBuffer();
    
    // Pass 2: Intermediate upscale for smoother result
    const intermediate = await sharp(denoised)
      .resize(Math.round(metadata.width * 1.5), Math.round(metadata.height * 1.5), {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill'
      })
      .sharpen({ sigma: 0.3, m1: 0.3, m2: 0.1 }) // Gentle sharpening
      .toBuffer();
    
    // Pass 3: Final 2x upscale with photorealistic processing
    const upscaled = await sharp(intermediate)
      .resize(metadata.width * 2, metadata.height * 2, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill',
        fastShrinkOnLoad: false
      })
      .sharpen({ sigma: 0.8, m1: 0.5, m2: 0.3 }) // Natural edge clarity
      .modulate({ 
        brightness: 1.0, // No brightness change
        saturation: 1.0, // Keep original color saturation
        hue: 0
      })
      .linear(1.02, 0) // Minimal contrast, photorealistic
      .jpeg({ 
        quality: 100, // Maximum quality for 8K-like result
        chromaSubsampling: '4:4:4',
        mozjpeg: true,
        trellisQuantisation: true,
        overshootDeringing: true,
        optimiseScans: true
      })
      .toBuffer();
    
    console.log(`8K Photorealistic upscale: ${metadata.width}x${metadata.height} -> ${metadata.width * 2}x${metadata.height * 2}`);
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
    return `data:image/png;base64,${base64}`;
  } catch (e) {
    console.error('Upscale fallito:', e);
    throw new Error(`Upscale failed: ${e?.message || e}`);
  }
}
