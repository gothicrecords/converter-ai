import formidable from 'formidable';
import fs from 'fs';
import upscaleImage from '../../utils/upscale.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      res.status(500).json({ error: 'Form parse error' });
      return;
    }

    const file = files.image;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const buffer = fs.readFileSync(file.filepath || file.path);
      const url = await upscaleImage(buffer);
      return res.status(200).json({ url });
    } catch (error) {
      console.error('Upscale error:', error);
      return res.status(500).json({ error: 'Upscale failed' });
    }
  });
}
