import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import PDFDocument from 'pdfkit';

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
          return reject(err);
        }
        resolve({ fields, files });
      });
    });

    if (!files?.file) return res.status(400).json({ error: 'Nessun file DJVU inviato' });
    
    const fileList = Array.isArray(files.file) ? files.file : [files.file];
    for (const f of fileList) {
      if (f.size === 0) {
        return res.status(400).json({ error: 'Il file è vuoto. Carica un file valido.' });
      }
    }

    const results = [];

    for (const f of fileList) {
      try {
        // DJVU è un formato binario complesso
        // Per una conversione completa serve djvulibre, ma possiamo creare un PDF informativo
        const chunks = [];
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {});
        
        doc.fontSize(20).text('File DJVU', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`File: ${f.originalFilename || 'document.djvu'}`, { align: 'center' });
        doc.moveDown(2);
        doc.fontSize(10).text('Nota: DJVU è un formato binario complesso che richiede tool specializzati per la conversione completa.', { align: 'left' });
        doc.moveDown();
        doc.text('Per una conversione completa, installa djvulibre (https://sourceforge.net/projects/djvu/files/)', { align: 'left' });
        doc.moveDown();
        doc.text('Questo PDF è stato generato come placeholder. Il contenuto originale DJVU non può essere estratto senza tool esterni.', { align: 'left' });
        
        doc.end();
        await new Promise(resolve => doc.on('end', resolve));
        
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;
        
        results.push({ 
          url: dataUrl,
          name: f.originalFilename?.replace(/\.djvu$/i, '.pdf') || 'converted.pdf',
          type: 'application/pdf'
        });
      } catch (e) {
        console.error('Errore conversione DJVU→PDF:', e);
        throw new Error(`Errore conversione: ${e.message || 'Errore sconosciuto'}`);
      }
      
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('djvu-to-pdf error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'DJVU richiede djvulibre per conversione completa. Questo endpoint genera un PDF informativo.'
    });
  }
}

