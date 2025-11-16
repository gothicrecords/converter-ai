import fetch from 'node-fetch';
import FormData from 'form-data';

(async () => {
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
  const buffer = Buffer.from(pngBase64, 'base64');

  const form = new FormData();
  form.append('image', buffer, { filename: '1x1.png', contentType: 'image/png' });

  try {
    const res = await fetch('http://localhost:3000/api/upscale', {
      method: 'POST',
      body: form
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log(text);
  } catch (err) {
    console.error('Test upload error:', err);
    process.exit(1);
  }
})();
