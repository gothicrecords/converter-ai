import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = { api: { bodyParser: false } };

function toDataUrl(buffer, mime) {
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { target } = req.query;
  const form = formidable({ multiples: false, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload error' });
    const file = files.file;
    if (!file) return res.status(400).json({ error: 'File missing' });
    try {
      const inputPath = file.filepath;
      const originalName = file.originalFilename || 'file';
      // Placeholder conversion logic: identity or simple text/image normalization.
      const buffer = fs.readFileSync(inputPath);
      let outputName = originalName;
      // Force extension to target
      const ext = `.${target.toLowerCase()}`;
      if (!outputName.toLowerCase().endsWith(ext)) {
        outputName = outputName.replace(/\.[^/.]+$/, ext);
        if (!outputName.toLowerCase().endsWith(ext)) outputName += ext; // if replace failed
      }
      // Basic mime inference
      let mime = 'application/octet-stream';
      if (['png','jpg','jpeg','webp','gif','bmp'].includes(target)) mime = `image/${target==='jpg'?'jpeg':target}`;
      else if (target === 'txt' || target === 'md') mime = 'text/plain';
      else if (target === 'pdf') mime = 'application/pdf';
      else if (target === 'csv') mime = 'text/csv';
      else if (target === 'zip') mime = 'application/zip';
      else if (target === 'epub') mime = 'application/epub+zip';
      const dataUrl = toDataUrl(buffer, mime);
      return res.status(200).json({ name: outputName, dataUrl, note: 'Conversion placeholder: native transformation pending.' });
    } catch (e) {
      return res.status(500).json({ error: 'Conversion failed', details: e.message });
    }
  });
}
