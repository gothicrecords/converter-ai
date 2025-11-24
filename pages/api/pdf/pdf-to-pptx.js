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
      let pages = 1;
      try {
        const data = await pdfParse(dataBuffer);
        text = data.text || '';
        pages = data.numpages || 1;
      } catch (e) {
        text = 'Conversione base: contenuto non estratto.';
        pages = 1;
      }
      
      // Crea PPTX nativo (fallback funziona sempre)
      const pptxBuffer = await createPPTX(text, pages);
      const base64 = pptxBuffer.toString('base64');
      const dataUrl = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${base64}`;
      
      results.push({ 
        url: dataUrl,
        name: f.originalFilename?.replace(/\.pdf$/i, '.pptx') || 'converted.pptx',
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('pdf-to-pptx error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione nativa PDF→PPTX (illimitata, gratuita)'
    });
  }
}

// Nessuna dipendenza extra: l'estrazione testo è opzionale e non blocca la conversione

async function createPPTX(text, numPages) {
  const mod = await import('pptxgenjs');
  const PptxGenJS = mod.default || mod;
  const pptx = new PptxGenJS();
  
  // Dividi il testo in pagine/slide
  const safePages = Math.max(1, Number.isFinite(numPages) && numPages > 0 ? Math.floor(numPages) : 1);
  const lines = String(text || '').split('\n').filter(l => l.trim());
  const linesPerSlide = Math.max(1, Math.ceil(lines.length / safePages));
  
  for (let i = 0; i < safePages; i++) {
    const slide = pptx.addSlide();
    const slideLines = lines.slice(i * linesPerSlide, (i + 1) * linesPerSlide);
    const slideText = slideLines.join('\n') || `Slide ${i + 1}`;
    
    slide.addText(slideText, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 5,
      fontSize: 14,
      color: '000000'
    });
  }
  
  const out = await pptx.write({ outputType: 'nodebuffer' });
  // Garantisce un Buffer Node
  return Buffer.isBuffer(out) ? out : Buffer.from(out);
}
