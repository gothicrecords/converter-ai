import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import mammoth from 'mammoth';
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

    if (!files?.file) return res.status(400).json({ error: 'Nessun file DOC/DOCM/DOT/DOTX inviato' });
    
    const fileList = Array.isArray(files.file) ? files.file : [files.file];
    for (const f of fileList) {
      if (f.size === 0) {
        return res.status(400).json({ error: 'Il file è vuoto. Carica un file valido.' });
      }
    }

    const results = [];

    for (const f of fileList) {
      const dataBuffer = readFileSync(f.filepath);
      const ext = (f.originalFilename || '').split('.').pop()?.toLowerCase() || '';
      
      try {
        let html = '';
        
        // Prova con mammoth per DOCM e DOTX (formati moderni simili a DOCX)
        if (ext === 'docm' || ext === 'dotx') {
          try {
            const { value } = await mammoth.convertToHtml({ buffer: dataBuffer });
            html = value;
          } catch (e) {
            // Fallback: estrai testo
            const { value } = await mammoth.extractRawText({ buffer: dataBuffer });
            html = `<html><body><pre>${value || 'Contenuto non estraibile'}</pre></body></html>`;
          }
        } else if (ext === 'doc' || ext === 'dot') {
          // DOC e DOT legacy: prova parsing base
          try {
            // Prova con mammoth (potrebbe funzionare per alcuni DOC moderni)
            const { value } = await mammoth.convertToHtml({ buffer: dataBuffer });
            html = value;
          } catch (e) {
            // Fallback: estrai testo grezzo
            const text = dataBuffer.toString('utf8', 0, Math.min(10000, dataBuffer.length));
            // Rimuovi caratteri non stampabili
            const cleanText = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ' ').trim();
            html = `<html><body><pre>${cleanText || 'Contenuto non estraibile dal formato DOC legacy'}</pre></body></html>`;
          }
        } else {
          // Prova comunque con mammoth
          try {
            const { value } = await mammoth.convertToHtml({ buffer: dataBuffer });
            html = value;
          } catch (e) {
            html = `<html><body><p>Formato non supportato completamente. Prova a salvare come DOCX.</p></body></html>`;
          }
        }
        
        // Estrai testo dall'HTML
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
          name: f.originalFilename?.replace(/\.(doc|docm|dot|dotx)$/i, '.pdf') || 'converted.pdf',
          type: 'application/pdf'
        });
      } catch (e) {
        console.error('Errore conversione DOC→PDF:', e);
        throw new Error(`Errore conversione: ${e.message || 'Errore sconosciuto'}`);
      }
      
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('doc-to-pdf error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione nativa DOC→PDF (illimitata, gratuita). Nota: DOC legacy potrebbe avere limitazioni.'
    });
  }
}

