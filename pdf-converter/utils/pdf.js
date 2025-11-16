import { PDFDocument, rgb } from 'pdf-lib';

export async function imagesToPdf(imageBuffers) {
  const pdfDoc = await PDFDocument.create();

  for (const buf of imageBuffers) {
    // Try JPEG first, fallback to PNG
    let img;
    try {
      img = await pdfDoc.embedJpg(buf);
    } catch {
      img = await pdfDoc.embedPng(buf);
    }
    const { width, height } = img.size();
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(img, { x: 0, y: 0, width, height });
  }

  return await pdfDoc.save({ useObjectStreams: true });
}
