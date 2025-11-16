// utils/upscale.js
import { v2 as cloudinary } from 'cloudinary';

// Configura Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function upscaleImage(fileBuffer) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;

  if (!cloudName || !apiKey) {
    throw new Error('Cloudinary config mancante in .env');
  }

  try {
    // Carica l'immagine su Cloudinary con trasformazione di upscale
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          transformation: [
            { effect: 'upscale', quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    // Ritorna l'URL upscalato (già trasformato)
    if (uploadResult && uploadResult.secure_url) {
      return uploadResult.secure_url;
    } else {
      throw new Error('Upload fallito: ' + JSON.stringify(uploadResult));
    }

  } catch (err) {
    console.error('Errore Cloudinary upscale:', err && err.message ? err.message : err);
    throw err;
  }
}

export default upscaleImage;