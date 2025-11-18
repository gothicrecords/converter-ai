import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable({ multiples: true });
  try {
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });

    if (!files?.file) return res.status(400).json({ error: 'Nessun file PDF caricato' });

    const list = Array.isArray(files.file) ? files.file : [files.file];
    const results = [];

    for (const f of list) {
      const dataBuffer = readFileSync(f.filepath);
      let text = '';
      let pages = 1;
      try {
        const { createRequire } = await import('module');
        const req = createRequire(typeof import.meta !== 'undefined' ? import.meta.url : __filename);
        const pdfParse = req('pdf-parse');
        const data = await pdfParse(dataBuffer);
        text = data.text || '';
        pages = data.numpages || 1;
      } catch (e) {
        text = 'Conversione base: contenuto non estratto (nessuna dipendenza esterna).';
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

    if (results.length === 1) return res.status(200).json({ url: results[0].url });
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
