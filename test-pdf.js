// Script per creare un PDF di test con testo
import PDFDocument from 'pdfkit';
import fs from 'fs';

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test-traduzione.pdf'));

doc.fontSize(16).text('Ciao, questo è un documento di test.', 100, 100);
doc.moveDown();
doc.fontSize(12).text('Questo PDF contiene del testo in italiano che può essere estratto e tradotto.');
doc.moveDown();
doc.text('Il tool di traduzione dovrebbe essere in grado di:');
doc.moveDown(0.5);
doc.text('1. Estrarre questo testo usando pdf-parse');
doc.text('2. Tradurlo nella lingua scelta (es. inglese)');
doc.text('3. Creare un nuovo PDF con la traduzione');
doc.moveDown();
doc.text('Buon test!');

doc.end();

console.log('PDF di test creato: test-traduzione.pdf');
