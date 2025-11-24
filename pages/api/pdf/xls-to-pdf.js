import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import * as XLSX from 'xlsx';
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
    allowEmptyFiles: false // Non permettere file vuoti
  });
  try {
    const { files } = await new Promise((resolve, reject) => {
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

    if (!files?.file) return res.status(400).json({ error: 'Nessun file Excel inviato' });
    
    // Valida che il file non sia vuoto
    const fileList = Array.isArray(files.file) ? files.file : [files.file];
    for (const f of fileList) {
      if (f.size === 0) {
        return res.status(400).json({ error: 'Il file è vuoto. Carica un file valido.' });
      }
    }
    const results = [];

    for (const f of fileList) {
      // Leggi Excel e converti in PDF nativo
      const buffer = readFileSync(f.filepath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const pdfBuffer = await createPDFFromExcel(workbook);
      
      const base64 = pdfBuffer.toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64}`;
      
      results.push({ 
        url: dataUrl,
        name: f.originalFilename?.replace(/\.(xls|xlsx)$/i, '.pdf') || 'converted.pdf',
        type: 'application/pdf' 
      });
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url, name: results[0].name });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('xls-to-pdf error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione nativa XLSX→PDF (illimitata, gratuita)'
    });
  }
}

async function createPDFFromExcel(workbook) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ size: 'A4', margin: 30 });
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    // Converti ogni foglio Excel in una pagina PDF
    workbook.SheetNames.forEach((sheetName, idx) => {
      if (idx > 0) doc.addPage();
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      doc.fontSize(14).text(sheetName, { underline: true });
      doc.moveDown();
      
      // Tabella semplificata
      data.slice(0, 50).forEach((row) => {
        const rowText = row.join(' | ');
        doc.fontSize(8).text(rowText.substring(0, 100));
      });
    });
    
    doc.end();
  });
}
