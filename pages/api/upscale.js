import formidable from 'formidable';
import fs from 'fs/promises';
import upscaleImage from '../../utils/upscale.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary right away, as it's needed by upscaleImage
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

  try {
    const [fields, files] = await form.parse(req);
    
    const imageFile = files.image && files.image.length > 0 ? files.image[0] : null;

    if (!imageFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // formidable v3 uses `filepath`
    const filePath = imageFile.filepath;
    if (!filePath) {
      return res.status(400).json({ error: 'Uploaded file path missing' });
    }

    // Read the file from the temporary path
    const buffer = await fs.readFile(filePath);

    // Upscale the image using the utility function
    const url = await upscaleImage(buffer);

    // Clean up the temporary file
    await fs.unlink(filePath);

    return res.status(200).json({ url });

  } catch (error) {
    console.error('API Error:', error);
    // Ensure a response is always sent
    if (!res.headersSent) {
      res.status(500).json({ error: 'Upscale failed', details: error.message });
    }
  }
}
