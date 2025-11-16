import fetch from 'node-fetch';
import { v2 as cloudinary } from 'cloudinary';

// Configura Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function upscaleImage(fileBuffer) {
  const HF_API_TOKEN = process.env.HF_API_TOKEN;

  if (!HF_API_TOKEN) {
    throw new Error('HF_API_TOKEN mancante in .env');
  }

  try {
    // Chiama HuggingFace Inference API per Real-ESRGAN
    const response = await fetch('https://router.huggingface.co/hf-inference/models/nightmareai/real-esrgan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/octet-stream',
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Errore HF API');
    }

    const upscaledBuffer = await response.arrayBuffer();

    // Carica l'immagine upscalata su Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'upscaler-ai',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(Buffer.from(upscaledBuffer));
    });

    if (uploadResult && uploadResult.secure_url) {
      return uploadResult.secure_url;
    } else {
      throw new Error('Upload Cloudinary fallito');
    }

  } catch (err) {
    console.error('Errore upscale:', err.message);
    throw err;
  }
}

export default upscaleImage;
