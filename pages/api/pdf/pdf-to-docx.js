import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import pdfParse from 'pdf-parse';
import { Document, Packer, Paragraph, TextRun } from 'docx';

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
          if (err.message && err.message.includes('options.allowEmptyFiles')) {
            return reject(new Error('Il file caricato è vuoto. Carica un file con contenuto.'));
          }
          return reject(err);
        }
        resolve({ fields, files });
      });
    });

    if (!files?.file) return res.status(400).json({ error: 'Nessun PDF inviato' });
    
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
        // Estrai testo dal PDF
        const data = await pdfParse(dataBuffer);
        const text = data.text || 'Il PDF non contiene testo estraibile.';
        
        // Dividi il testo in paragrafi
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        
        // Crea documento DOCX
        const docxParagraphs = paragraphs.length > 0 
          ? paragraphs.map(p => new Paragraph({
              children: [new TextRun(p.trim())],
              spacing: { after: 200 }
            }))
          : [new Paragraph({
              children: [new TextRun(text)]
            })];
        
        const doc = new Document({
          sections: [{
            properties: {},
            children: docxParagraphs
          }]
        });
        
        // Genera buffer DOCX
        const docxBuffer = await Packer.toBuffer(doc);
        const base64 = docxBuffer.toString('base64');
        const dataUrl = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`;
        
        results.push({ 
          url: dataUrl,
          name: f.originalFilename?.replace(/\.pdf$/i, '.docx') || 'converted.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
      } catch (e) {
        console.error('Errore conversione PDF→DOCX:', e);
        throw new Error(`Errore conversione: ${e.message || 'Errore sconosciuto'}`);
      }
      
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('pdf-to-docx error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione nativa PDF→DOCX (illimitata, gratuita)'
    });
  }
}
