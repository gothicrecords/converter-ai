import formidable from 'formidable';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable();
  try {
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });

    if (!files?.file) return res.status(400).json({ error: 'Nessun DOCX inviato' });

    const apiKey = process.env.CONVERTAPI_SECRET;
    if (!apiKey) {
      return res.status(501).json({
        error: 'DOCX->PDF richiede CONVERTAPI_SECRET',
        hint: 'Aggiungi la variabile di ambiente CONVERTAPI_SECRET per abilitare la conversione via ConvertAPI',
      });
    }

    const { default: ConvertAPI } = await import('convertapi');
    const convertapi = new ConvertAPI(apiKey);
    const docPath = files.file.filepath;

    const result = await convertapi.convert('pdf', { File: docPath }, 'docx');
    const file = result?.files?.[0];
    if (!file?.Url) throw new Error('ConvertAPI response invalid');

    return res.status(200).json({ url: file.Url });
  } catch (e) {
    console.error('docx-to-pdf error', e);
    return res.status(500).json({ error: 'Conversione fallita', details: e?.message || e });
  }
}
