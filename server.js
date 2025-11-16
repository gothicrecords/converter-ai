import express from 'express';
import next from 'next';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import upscaleImage from './utils/upscale.js';
import dotenv from 'dotenv';

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.prepare().then(() => {
  const server = express();

  server.use(express.json());

  server.post('/api/upscale', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Uploaded file path missing' });
    }

    try {
      const upscaledUrl = await upscaleImage(req.file.buffer);
      const uploadResult = await cloudinary.uploader.upload(upscaledUrl, {
        folder: 'upscaler-ai',
      });
      res.status(200).json({ url: uploadResult.secure_url });
    } catch (error) {
      console.error('API upscale error:', error);
      res.status(500).json({ error: 'Network or server error' });
    }
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});