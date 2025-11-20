import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import sharp from 'sharp';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable({ 
    multiples: true,
    allowEmptyFiles: false
  });
  
  try {
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
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

    if (!files?.file) return res.status(400).json({ error: 'Nessun PDF inviato' });
    
    const fileList = Array.isArray(files.file) ? files.file : [files.file];
    for (const f of fileList) {
      if (f.size === 0) {
        return res.status(400).json({ error: 'Il file è vuoto. Carica un file valido.' });
      }
    }

    const results = [];

    for (const f of fileList) {
      const dataBuffer = readFileSync(f.filepath);
      
      try {
        // Converti PDF in JPG usando sharp (prima pagina)
        // Sharp può convertire direttamente PDF in immagini
        const jpgBuffer = await sharp(dataBuffer, { 
          density: 300, // DPI alto per qualità migliore
          pages: 1 // Solo prima pagina
        })
        .jpeg({ 
          quality: 90,
          mozjpeg: true 
        })
        .toBuffer();
        
        const base64 = jpgBuffer.toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        
        results.push({ 
          url: dataUrl,
          name: f.originalFilename?.replace(/\.pdf$/i, '.jpg') || 'converted.jpg',
          type: 'image/jpeg'
        });
      } catch (e) {
        console.error('Errore conversione PDF→JPG:', e);
        // Se fallisce, prova con density più bassa
        try {
          const jpgBuffer = await sharp(dataBuffer, { 
            density: 150,
            pages: 1
          })
          .jpeg({ quality: 85 })
          .toBuffer();
          
          const base64 = jpgBuffer.toString('base64');
          const dataUrl = `data:image/jpeg;base64,${base64}`;
          
          results.push({ 
            url: dataUrl,
            name: f.originalFilename?.replace(/\.pdf$/i, '.jpg') || 'converted.jpg',
            type: 'image/jpeg'
          });
        } catch (e2) {
          throw new Error(`Errore conversione: ${e2.message || 'Impossibile convertire PDF in JPG'}`);
        }
      }
      
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('pdf-to-jpg error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione nativa PDF→JPG (illimitata, gratuita)'
    });
  }
}
