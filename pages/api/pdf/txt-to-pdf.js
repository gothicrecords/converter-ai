import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import PDFDocument from 'pdfkit';

export const config = { api: { bodyParser: false } };

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
    allowEmptyFiles: false
  });
  
  try {
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          if (err.message && err.message.includes('file size should be greater than 0')) {
            return reject(new Error('Il file è vuoto. Carica un file valido.'));
          }
          return reject(err);
        }
        resolve({ fields, files });
      });
    });

    if (!files?.file) return res.status(400).json({ error: 'Nessun file TXT inviato' });
    
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
        // Leggi testo
        const text = dataBuffer.toString('utf8');
        const lines = text.split(/\r?\n/);
        
        // Crea PDF
        const chunks = [];
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {});
        
        // Aggiungi testo
        doc.fontSize(12);
        lines.forEach((line, index) => {
          if (index > 0 && line.trim() === '' && lines[index - 1]?.trim() === '') {
            doc.moveDown(0.5);
          } else {
            doc.text(line || ' ', { 
              align: 'left',
              continued: false
            });
          }
        });
        
        doc.end();
        
        // Aspetta che il PDF sia completato
        await new Promise(resolve => doc.on('end', resolve));
        
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;
        
        results.push({ 
          url: dataUrl,
          name: f.originalFilename?.replace(/\.txt$/i, '.pdf') || 'converted.pdf',
          type: 'application/pdf'
        });
      } catch (e) {
        console.error('Errore conversione TXT→PDF:', e);
        throw new Error(`Errore conversione: ${e.message || 'Errore sconosciuto'}`);
      }
      
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('txt-to-pdf error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione nativa TXT→PDF (illimitata, gratuita)'
    });
  }
}

