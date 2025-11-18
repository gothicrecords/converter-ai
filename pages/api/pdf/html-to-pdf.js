import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable({ multiples: true });
  try {
    const { files, fields } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });

    const results = [];

    if (files?.file) {
      // Convert HTML file to PDF
      const htmlPdf = (await import('html-pdf-node')).default;
      const list = Array.isArray(files.file) ? files.file : [files.file];
      for (const f of list) {
        const htmlContent = readFileSync(f.filepath, 'utf-8');
        const options = { format: 'A4' };
        const file = { content: htmlContent };
        
        const pdfBuffer = await htmlPdf.generatePdf(file, options);
        const base64 = pdfBuffer.toString('base64');
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
      const htmlPdf = (await import('html-pdf-node')).default;
      const targetUrl = Array.isArray(fields.url) ? fields.url[0] : fields.url;
      const options = { format: 'A4' };
      const file = { url: targetUrl };
      
      const pdfBuffer = await htmlPdf.generatePdf(file, options);
      const base64 = pdfBuffer.toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64}`;
      
      results.push({ name: 'page.pdf', url: dataUrl, type: 'application/pdf' });
    } else {
      return res.status(400).json({ error: 'Nessun file HTML o URL fornito' });
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url });
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
