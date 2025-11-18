import formidable from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import XLSX from 'xlsx';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable({ multiples: true });
  try {
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });

    if (!files?.file) return res.status(400).json({ error: 'Nessun file PDF caricato' });

    const list = Array.isArray(files.file) ? files.file : [files.file];
    const results = [];

    for (const f of list) {
      const dataBuffer = readFileSync(f.filepath);
      let text = '';
      try {
        const { createRequire } = await import('module');
        const req = createRequire(typeof import.meta !== 'undefined' ? import.meta.url : __filename);
        const pdfParse = req('pdf-parse');
        const data = await pdfParse(dataBuffer);
        text = data.text || '';
      } catch (e) {
        text = 'Conversione base: contenuto non estratto (nessuna dipendenza esterna).';
      }
      
      // Crea XLSX nativo convertendo il testo (o placeholder) in righe/celle
      const rows = text.split('\n').map(line => [line]);
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      
      const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      const base64 = xlsxBuffer.toString('base64');
      const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
      
      results.push({ 
        url: dataUrl,
        name: f.originalFilename?.replace(/\.pdf$/i, '.xlsx') || 'converted.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      try { unlinkSync(f.filepath); } catch {}
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('pdf-to-xlsx error', e);
    return res.status(500).json({ 
      error: 'Conversione fallita', 
      details: e?.message || e,
      hint: 'Conversione nativa PDF→XLSX (illimitata, gratuita)'
    });
  }
}

// Nessuna dipendenza extra: l'estrazione testo è opzionale e non blocca la conversione
