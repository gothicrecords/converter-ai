import formidable from 'formidable';
import FormData from 'form-data';
import { createReadStream } from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable({ multiples: true });
  try {
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });

    if (!files?.file) return res.status(400).json({ error: 'Nessun DOCX inviato' });

    const apiKey = process.env.CONVERTAPI_SECRET;
    if (!apiKey) {
      return res.status(501).json({
        error: 'DOCX->PDF richiede CONVERTAPI_SECRET',
        hint: 'Aggiungi la variabile di ambiente CONVERTAPI_SECRET per ConvertAPI',
      });
    }

    const urlBase = `https://v2.convertapi.com/convert/docx/to/pdf?Secret=${encodeURIComponent(apiKey)}`;
    const list = Array.isArray(files.file) ? files.file : [files.file];
    const results = [];
    for (const f of list) {
      const fd = new FormData();
      fd.append('File', createReadStream(f.filepath));
      const r = await fetch(urlBase, { method: 'POST', body: fd, headers: fd.getHeaders?.() });
      if (!r.ok) throw new Error(`ConvertAPI HTTP ${r.status}`);
      const data = await r.json();
      const file = (data?.Files || data?.files || [])[0];
      if (!file?.Url) throw new Error('ConvertAPI response invalid');
      results.push({ name: f.originalFilename || 'file.docx', url: file.Url, type: 'application/pdf' });
    }

    if (results.length === 1) return res.status(200).json({ url: results[0].url });
    return res.status(200).json({ urls: results });
  } catch (e) {
    console.error('docx-to-pdf error', e);
    return res.status(500).json({ error: 'Conversione fallita', details: e?.message || e });
  }
}
