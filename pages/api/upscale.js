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
    // Support both callback and promise styles robustly
    const parsed = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const { files } = parsed;

    // Accept 'image' or 'file' field names; normalize array/single
    let file = files?.image ?? files?.file ?? null;
    if (Array.isArray(file)) file = file[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = file.filepath || file.path; // v3 vs older
    if (!filePath) {
      return res.status(400).json({ error: 'Uploaded file path missing' });
    }

    const buffer = await fs.readFile(filePath);
    const url = await upscaleImage(buffer);

    // best-effort cleanup
    try { await fs.unlink(filePath); } catch {}

    return res.status(200).json({ url });

  } catch (error) {
    console.error('API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Upscale failed', details: String(error?.message || error) });
    }
  }
}
