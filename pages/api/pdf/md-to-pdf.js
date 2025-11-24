import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import { marked } from 'marked';
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

    if (!files?.file) return res.status(400).json({ error: 'Nessun file Markdown inviato' });
    
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
        // Converti Markdown in testo formattato
        const mdContent = dataBuffer.toString('utf8');
        const html = marked.parse(mdContent);
        
        // Estrai testo dall'HTML
        let text = html
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n')
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
        
        const lines = text.split('\n');
        doc.fontSize(12);
        
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('#')) {
            // Header
            const level = trimmed.match(/^#+/)?.[0].length || 1;
            doc.fontSize(18 - (level * 2)).text(trimmed.replace(/^#+\s*/, ''), { underline: level <= 2 });
            doc.moveDown(1);
            doc.fontSize(12);
          } else if (trimmed) {
            doc.text(trimmed);
            doc.moveDown(0.5);
          } else {
            doc.moveDown(0.5);
          }
        });
        
        doc.end();
        await new Promise(resolve => doc.on('end', resolve));
        
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;
        
        results.push({ 
          url: dataUrl,
          name: f.originalFilename?.replace(/\.(md|markdown)$/i, '.pdf') || 'converted.pdf',
          type: 'application/pdf'
        });
      } catch (e) {
        console.error('Errore conversione MD→PDF:', e);
        throw new Error(`Errore conversione: ${e.message || 'Errore sconosciuto'}`);
      }
      
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('md-to-pdf error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione nativa Markdown→PDF (illimitata, gratuita)'
    });
  }
}

