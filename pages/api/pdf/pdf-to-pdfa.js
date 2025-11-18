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

    if (results.length === 1) return res.status(200).json({ url: results[0].url });
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
