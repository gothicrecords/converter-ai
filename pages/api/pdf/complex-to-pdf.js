import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import PDFDocument from 'pdfkit';
import JSZip from 'jszip';

export const config = { api: { bodyParser: false } };

// Formati supportati: PUB, XPS, HWP, LWP, PAGES, WPD, WPS, TEX, RST
const SUPPORTED_FORMATS = ['pub', 'xps', 'hwp', 'lwp', 'pages', 'wpd', 'wps', 'tex', 'rst'];

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

    if (!files?.file) return res.status(400).json({ error: 'Nessun file inviato' });
    
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
      
      if (!SUPPORTED_FORMATS.includes(ext)) {
        return res.status(400).json({ 
          error: `Formato non supportato: ${ext}. Formati supportati: ${SUPPORTED_FORMATS.join(', ')}` 
        });
      }
      
      try {
        let content = '';
        let formatName = ext.toUpperCase();
        
        // Prova parsing base per formati XML/ZIP
        if (ext === 'xps' || ext === 'pages') {
          // XPS e PAGES possono essere archivi ZIP
          try {
            const zip = await JSZip.loadAsync(dataBuffer);
            // Cerca file XML o testo
            for (const [path, file] of Object.entries(zip.files)) {
              if (path.endsWith('.xml') || path.endsWith('.txt')) {
                const text = await file.async('string');
                content += text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() + '\n';
              }
            }
          } catch (e) {
            // Non è un ZIP, prova parsing diretto
            const text = dataBuffer.toString('utf8', 0, Math.min(5000, dataBuffer.length));
            content = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ' ').trim();
          }
        } else if (ext === 'tex' || ext === 'rst') {
          // TEX e RST sono formati testuali
          content = dataBuffer.toString('utf8');
        } else {
          // Altri formati binari: prova estrazione testo base
          const text = dataBuffer.toString('utf8', 0, Math.min(10000, dataBuffer.length));
          content = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ' ').trim();
        }
        
        if (!content || content.trim().length === 0) {
          content = `File ${formatName} convertito. Il contenuto completo richiede tool specializzati.`;
        }
        
        // Crea PDF
        const chunks = [];
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {});
        
        doc.fontSize(18).text(`Documento ${formatName}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`File: ${f.originalFilename || `document.${ext}`}`, { align: 'center' });
        doc.moveDown(2);
        
        // Aggiungi contenuto estratto
        const lines = content.split(/\r?\n/).slice(0, 100); // Limita a 100 righe
        doc.fontSize(10);
        lines.forEach(line => {
          if (line.trim().length > 0) {
            doc.text(line.substring(0, 100), { align: 'left' }); // Limita lunghezza riga
          }
        });
        
        if (lines.length >= 100) {
          doc.moveDown();
          doc.fontSize(8).text('... (contenuto troncato)', { align: 'left' });
        }
        
        doc.moveDown(2);
        doc.fontSize(8).text(`Nota: ${formatName} è un formato complesso. Per una conversione completa, considera l'uso di tool specializzati.`, { align: 'left' });
        
        doc.end();
        await new Promise(resolve => doc.on('end', resolve));
        
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;
        
        results.push({ 
          url: dataUrl,
          name: f.originalFilename?.replace(/\.\w+$/i, '.pdf') || 'converted.pdf',
          type: 'application/pdf'
        });
      } catch (e) {
        console.error(`Errore conversione ${ext}→PDF:`, e);
        throw new Error(`Errore conversione: ${e.message || 'Errore sconosciuto'}`);
      }
      
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('complex-to-pdf error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione base per formati complessi. Per conversione completa, alcuni formati richiedono tool esterni.'
    });
  }
}

