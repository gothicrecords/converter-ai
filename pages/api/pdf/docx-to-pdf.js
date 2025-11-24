import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import mammoth from 'mammoth';
import PDFDocument from 'pdfkit';

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

    if (!files?.file) return res.status(400).json({ error: 'Nessun DOCX inviato' });
    
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
        // Converti DOCX in HTML usando mammoth
        const { value: html } = await mammoth.convertToHtml({ buffer: dataBuffer });
        
        // Converti HTML in testo semplice per PDF
        let text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim();
        
        // Genera PDF con pdfkit
        const chunks = [];
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {});
        
        // Aggiungi testo al PDF
        const lines = text.split(/\s+/);
        let currentLine = '';
        doc.fontSize(12);
        
        lines.forEach(word => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (doc.widthOfString(testLine) < (doc.page.width - doc.page.margins.left - doc.page.margins.right - 20)) {
            currentLine = testLine;
          } else {
            if (currentLine) {
              doc.text(currentLine);
              doc.moveDown(0.5);
            }
            currentLine = word;
          }
        });
        
        if (currentLine) {
          doc.text(currentLine);
        }
        
        doc.end();
        await new Promise(resolve => doc.on('end', resolve));
        
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;
        
        results.push({ 
          url: dataUrl,
          name: f.originalFilename?.replace(/\.(docx?)$/i, '.pdf') || 'converted.pdf',
          type: 'application/pdf'
        });
      } catch (e) {
        console.error('Errore conversione DOCX→PDF:', e);
        console.error('Stack:', e.stack);
        throw new Error(`Errore conversione: ${e.message || 'Errore sconosciuto'}`);
      }
      
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('docx-to-pdf error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione nativa DOCX→PDF (illimitata, gratuita)'
    });
  }
}
