import formidable from 'formidable';
import { imagesToPdf } from '../../utils/pdf';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const form = formidable({ multiples: true, keepExtensions: false });

  try {
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });

    const imgs = [];
    const add = (f) => {
      if (!f) return;
      if (Array.isArray(f)) return f.forEach(add);
      imgs.push(f);
    };
    add(files.image);
    add(files.images);

    if (!imgs.length) return res.status(400).json({ error: 'Nessuna immagine inviata' });

    const buffers = await Promise.all(
      imgs.map(async (f) => {
        const data = await fsReadFile(f.filepath);
        return data;
      })
    );

    const pdfBytes = await imagesToPdf(buffers);
    const base64 = Buffer.from(pdfBytes).toString('base64');
    return res.status(200).json({ url: `data:application/pdf;base64,${base64}` });
  } catch (e) {
    console.error('jpg-to-pdf error', e);
    return res.status(500).json({ error: 'Conversione fallita', details: e?.message || e });
  }
}

function fsReadFile(path) {
  return new Promise((resolve, reject) => {
    import('fs').then(({ readFile }) => readFile(path, (e, d) => (e ? reject(e) : resolve(d))));
  });
}
