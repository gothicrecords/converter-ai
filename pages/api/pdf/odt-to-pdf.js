import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import JSZip from 'jszip';
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

    if (!files?.file) return res.status(400).json({ error: 'Nessun file ODT inviato' });
    
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
        // ODT è un archivio ZIP
        const zip = await JSZip.loadAsync(dataBuffer);
        let content = '';
        
        // Estrai contenuto da content.xml
        if (zip.files['content.xml']) {
          const xmlContent = await zip.files['content.xml'].async('string');
          // Estrai testo dai tag <text:>
          const textMatches = xmlContent.match(/<text:[^>]*>([^<]*)<\/text:[^>]*>/gi) || [];
          const texts = textMatches.map(m => {
            const match = m.match(/>([^<]+)</i);
            return match ? match[1] : '';
          }).filter(t => t.trim().length > 0);
          
          content = texts.join('\n');
          
          // Se non trovato, estrai tutto il testo
          if (!content) {
            content = xmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          }
        }
        
        if (!content) {
          content = 'Contenuto non estraibile da ODT.';
        }
        
        // Genera PDF direttamente con pdfkit
        const chunks = [];
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {});
        
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        doc.fontSize(12);
        
        if (paragraphs.length > 0) {
          paragraphs.forEach((para, idx) => {
            if (idx > 0) doc.moveDown(1);
            doc.text(para);
          });
        } else {
          doc.text(content);
        }
        
        doc.end();
        await new Promise(resolve => doc.on('end', resolve));
        
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;
        
        results.push({ 
          url: dataUrl,
          name: f.originalFilename?.replace(/\.odt$/i, '.pdf') || 'converted.pdf',
          type: 'application/pdf'
        });
      } catch (e) {
        console.error('Errore conversione ODT→PDF:', e);
        throw new Error(`Errore conversione: ${e.message || 'Errore sconosciuto'}`);
      }
      
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('odt-to-pdf error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione nativa ODT→PDF (illimitata, gratuita)'
    });
  }
}

