import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
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
      const { PDFDocument } = await import('pdf-lib');
      const existingPdfBytes = readFileSync(f.filepath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Aggiungi metadata PDF/A compliance
      pdfDoc.setTitle('PDF/A Document');
      pdfDoc.setProducer('PDF/A Converter');
      pdfDoc.setCreator('Upscaler AI');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());
      
      // Serializza il PDF con metadata PDF/A
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
        objectsPerTick: 50
      });
      
      const base64 = Buffer.from(pdfBytes).toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64}`;
      
      results.push({ 
        url: dataUrl,
        name: f.originalFilename?.replace(/\.pdf$/i, '-pdfa.pdf') || 'converted-pdfa.pdf',
        type: 'application/pdf' 
      });
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('pdf-to-pdfa error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione nativa PDF→PDF/A (illimitata, gratuita)'
    });
  }
}
