import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import htmlPdf from 'html-pdf-node';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable({ 
    multiples: true,
    allowEmptyFiles: false // Non permettere file vuoti
  });
  try {
    const { files, fields } = await new Promise((resolve, reject) => {
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
    
    // Valida che se c'è un file, non sia vuoto
    if (files?.file) {
      const fileList = Array.isArray(files.file) ? files.file : [files.file];
      for (const f of fileList) {
        if (f.size === 0) {
          return res.status(400).json({ error: 'Il file è vuoto. Carica un file valido.' });
        }
      }
    }

    const results = [];

    if (files?.file) {
      // Convert HTML file to PDF
      const list = Array.isArray(files.file) ? files.file : [files.file];
      for (const f of list) {
        const htmlContent = readFileSync(f.filepath, 'utf-8');
        const options = { 
          format: 'A4',
          margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
        };
        const file = { content: htmlContent };
        
        const pdfBuffer = await htmlPdf.generatePdf(file, options);
        const base64 = Buffer.from(pdfBuffer).toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;
        
        results.push({ 
          url: dataUrl,
          name: f.originalFilename?.replace(/\.html?$/i, '.pdf') || 'converted.pdf',
          type: 'application/pdf' 
        });
        try { unlinkSync(f.filepath); } catch {}
      }
    } else if (fields?.url) {
      // Convert URL to PDF
      const targetUrl = Array.isArray(fields.url) ? fields.url[0] : fields.url;
      const options = { 
        format: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
      };
      const file = { url: targetUrl };
      
      const pdfBuffer = await htmlPdf.generatePdf(file, options);
      const base64 = Buffer.from(pdfBuffer).toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64}`;
      
      results.push({ name: 'page.pdf', url: dataUrl, type: 'application/pdf' });
    } else {
      return res.status(400).json({ error: 'Nessun file HTML o URL fornito' });
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('html-to-pdf error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione nativa HTML→PDF con Puppeteer (illimitata, gratuita)'
    });
  }
}
