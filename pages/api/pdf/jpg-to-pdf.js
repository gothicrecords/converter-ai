import formidable from 'formidable';
import { imagesToPdf } from '../../../utils/pdf.js';

export const config = { api: { bodyParser: false } };

function fsReadFile(path) {
  return new Promise((resolve, reject) => {
    import('fs').then(({ readFile }) => readFile(path, (e, d) => (e ? reject(e) : resolve(d))));
  });
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const form = formidable({ 
    multiples: true,
    allowEmptyFiles: false // Non permettere file vuoti
  });
  try {
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          // Gestisci errori specifici di formidable
          if (err.message && err.message.includes('file size should be greater than 0')) {
            return reject(new Error('Il file è vuoto. Carica un file valido.'));
          }
          if (err.message && err.message.includes('options.allowEmptyFiles')) {
            return reject(new Error('Il file caricato è vuoto. Carica un file con contenuto.'));
          }
          return reject(err);
        }
        resolve({ fields, files });
      });
    });

    const imgs = [];
    const add = (f) => {
      if (!f) return;
      if (Array.isArray(f)) return f.forEach(add);
      imgs.push(f);
    };
    add(files.image);
    add(files.images);

    if (!imgs.length) return res.status(400).json({ error: 'Nessuna immagine inviata' });
    
    // Valida che le immagini non siano vuote
    for (const img of imgs) {
      if (img.size === 0) {
        return res.status(400).json({ error: 'Una o più immagini sono vuote. Carica file validi.' });
      }
    }

    const buffers = await Promise.all(imgs.map((f) => fsReadFile(f.filepath)));
    const pdfBytes = await imagesToPdf(buffers);
    const base64 = Buffer.from(pdfBytes).toString('base64');
    const dataUrl = `data:application/pdf;base64,${base64}`;
    
    // Restituisci anche il nome del file
    const originalName = imgs[0]?.originalFilename || 'converted.pdf';
    const resultName = originalName.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '.pdf') || 'converted.pdf';
    
    return res.status(200).json({ url: dataUrl, name: resultName });
  } catch (e) {
    console.error('jpg-to-pdf error', e);
    return res.status(500).json({ error: 'Conversione fallita', details: e?.message || e });
  }
}
