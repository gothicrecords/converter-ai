import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import pdfParse from 'pdf-parse';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
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

    if (!files?.file) return res.status(400).json({ error: 'Nessun file PDF caricato' });
    
    // Valida che il file non sia vuoto
    const fileList = Array.isArray(files.file) ? files.file : [files.file];
    for (const f of fileList) {
      if (f.size === 0) {
        return res.status(400).json({ error: 'Il file è vuoto. Carica un file valido.' });
      }
    }

    const results = [];

    for (const f of fileList) {
      const dataBuffer = readFileSync(f.filepath);
      let text = '';
      
      try {
        // Estrai il testo usando pdf-parse
        const data = await pdfParse(dataBuffer);
        text = data.text || '';
      } catch (e) {
        // Se pdf-parse non è disponibile, restituisci un messaggio di errore
        console.error('Errore estrazione testo PDF:', e);
        text = 'Impossibile estrarre il testo dal PDF. Il file potrebbe essere scansionato o protetto.';
      }
      
      // Se il testo è vuoto, restituisci un messaggio informativo
      if (!text || text.trim().length === 0) {
        text = 'Il PDF non contiene testo estraibile. Potrebbe essere un file scansionato (solo immagini).';
      }
      
      // Converti il testo in base64 data URL
      const textBuffer = Buffer.from(text, 'utf8');
      const base64 = textBuffer.toString('base64');
      const dataUrl = `data:text/plain;base64,${base64}`;
      
      results.push({ 
        url: dataUrl,
        name: f.originalFilename?.replace(/\.pdf$/i, '.txt') || 'converted.txt',
        type: 'text/plain'
      });
      
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('pdf-to-txt error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione nativa PDF→TXT (illimitata, gratuita)'
    });
  }
}

