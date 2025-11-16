import { PDFDocument } from 'pdf-lib';

export async function imagesToPdf(imageBuffers) {
  const pdfDoc = await PDFDocument.create();

  for (const buf of imageBuffers) {
    let embedded;
    try {
      embedded = await pdfDoc.embedJpg(buf);
    } catch {
      embedded = await pdfDoc.embedPng(buf);
    }
    const { width, height } = embedded.size();
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embedded, { x: 0, y: 0, width, height });
  }

  return await pdfDoc.save({ useObjectStreams: true });
}
