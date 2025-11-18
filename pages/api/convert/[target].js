import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import pdfParse from 'pdf-parse';
import htmlPdf from 'html-pdf-node';
import SVGtoPDF from 'svg-to-pdfkit';
import zlib from 'zlib';
import tarStream from 'tar-stream';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import mammoth from 'mammoth';
import { marked } from 'marked';
import Epub from 'epub-gen';
import ttf2eotConv from 'ttf2eot';
import { path7za } from '7zip-bin';
import { execFile } from 'child_process';

export const config = { api: { bodyParser: false } };

function toDataUrl(buffer, mime) {
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { target } = req.query;
  const form = formidable({ multiples: false, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload error' });
    const file = files.file;
    if (!file) return res.status(400).json({ error: 'File missing' });
    try {
      const inputPath = file.filepath;
      const originalName = file.originalFilename || 'file';
      const inputBuffer = fs.readFileSync(inputPath);
      const inputExt = (path.extname(originalName) || '').replace('.', '').toLowerCase();
      const lowerTarget = String(target).toLowerCase();

      function finalizeName(name) {
        const ext = `.${lowerTarget}`;
        if (name.toLowerCase().endsWith(ext)) return name;
        const replaced = name.replace(/\.[^/.]+$/, ext);
        return replaced.toLowerCase().endsWith(ext) ? replaced : name + ext;
      }

      let outputBuffer = null;
      let mime = 'application/octet-stream';

      // Optional options
      const width = fields.width ? parseInt(String(fields.width)) : undefined;
      const height = fields.height ? parseInt(String(fields.height)) : undefined;
      const quality = fields.quality ? parseInt(String(fields.quality)) : 80;
      const vwidth = fields.vwidth ? parseInt(String(fields.vwidth)) : undefined;
      const vheight = fields.vheight ? parseInt(String(fields.vheight)) : undefined;
      const vbitrate = fields.vbitrate ? String(fields.vbitrate) : undefined;
      const abitrate = fields.abitrate ? String(fields.abitrate) : undefined;

      // IMAGE CONVERSIONS via sharp
      const imageTargets = ['png','jpg','jpeg','webp','tiff','bmp','avif','heif','gif'];
      if (imageTargets.includes(lowerTarget)) {
        let pipeline = sharp(inputBuffer, { failOn: 'none' });
        if (width || height) pipeline = pipeline.resize({ width, height, fit: 'inside' });
        if (lowerTarget === 'jpg' || lowerTarget === 'jpeg') {
          outputBuffer = await pipeline.jpeg({ quality }).toBuffer();
          mime = 'image/jpeg';
        } else if (lowerTarget === 'png') {
          outputBuffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
          mime = 'image/png';
        } else if (lowerTarget === 'webp') {
          outputBuffer = await pipeline.webp({ quality }).toBuffer();
          mime = 'image/webp';
        } else if (lowerTarget === 'avif') {
          outputBuffer = await pipeline.avif({ quality }).toBuffer();
          mime = 'image/avif';
        } else if (lowerTarget === 'heif') {
          // heif container (may encode HEIC/HEIF depending on libvips build)
          outputBuffer = await pipeline.heif({ quality }).toBuffer();
          mime = 'image/heif';
        } else if (lowerTarget === 'tiff') {
          outputBuffer = await pipeline.tiff().toBuffer();
          mime = 'image/tiff';
        } else if (lowerTarget === 'bmp') {
          outputBuffer = await pipeline.bmp().toBuffer();
          mime = 'image/bmp';
        } else if (lowerTarget === 'gif') {
          // Animated GIFs will be flattened to first frame
          outputBuffer = await pipeline.gif().toBuffer();
          mime = 'image/gif';
        }
      }

      // PDF generation
      if (!outputBuffer && lowerTarget === 'pdf') {
        // Handle HTML with headless Chrome, else basic PDF with pdfkit
        if (inputExt === 'html' || inputExt === 'htm') {
          const fileObj = { content: inputBuffer.toString('utf8') };
          const pdfBuffer = await htmlPdf.generatePdf(fileObj, { format: 'A4' });
          outputBuffer = Buffer.from(pdfBuffer);
          mime = 'application/pdf';
        } else if (inputExt === 'csv') {
          // Simple table rendering from CSV using pdfkit
          const doc = new PDFDocument({ margin: 36 });
          const chunks = [];
          doc.on('data', d => chunks.push(d));
          doc.on('error', () => {});
          const text = inputBuffer.toString('utf8');
          const rows = text.split(/\r?\n/).filter(Boolean).map(line => line.split(','));
          const colWidths = [];
          const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0);
          for (let c = 0; c < maxCols; c++) colWidths[c] = Math.floor((doc.page.width - doc.page.margins.left - doc.page.margins.right) / maxCols);
          let y = doc.y;
          const rowHeight = 20;
          rows.forEach((cols, ri) => {
            let x = doc.page.margins.left;
            cols.forEach((cell, ci) => {
              const w = colWidths[ci] || 80;
              doc.rect(x, y, w, rowHeight).strokeOpacity(0.3).stroke();
              doc.fontSize(10).fillColor('#000').text(cell, x + 4, y + 4, { width: w - 8, height: rowHeight - 8, ellipsis: true });
              x += w;
            });
            y += rowHeight;
            if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
              doc.addPage();
              y = doc.y;
            }
          });
          doc.end();
          await new Promise(resolve => doc.on('end', resolve));
          outputBuffer = Buffer.concat(chunks);
          mime = 'application/pdf';
        } else if (inputExt === 'svg') {
          const doc = new PDFDocument({ autoFirstPage: false });
          const chunks = [];
          doc.on('data', d => chunks.push(d));
          doc.on('error', () => {});
          doc.addPage({ size: 'A4' });
          const svgStr = inputBuffer.toString('utf8');
          SVGtoPDF(doc, svgStr, 0, 0, { preserveAspectRatio: 'xMidYMid meet' });
          doc.end();
          await new Promise(resolve => doc.on('end', resolve));
          outputBuffer = Buffer.concat(chunks);
          mime = 'application/pdf';
        } else if (['png','jpg','jpeg','webp','bmp','gif','tiff'].includes(inputExt)) {
          const doc = new PDFDocument({ autoFirstPage: false });
          const chunks = [];
          doc.on('data', d => chunks.push(d));
          doc.on('error', () => {});
          const img = sharp(inputBuffer);
          const meta = await img.metadata();
          const pageWidth = (meta.width || 800);
          const pageHeight = (meta.height || 600);
          doc.addPage({ size: [pageWidth, pageHeight] });
          const tmpPath = inputPath + '.tmpimg';
          fs.writeFileSync(tmpPath, inputBuffer);
          doc.image(tmpPath, 0, 0, { width: pageWidth, height: pageHeight });
          doc.end();
          await new Promise(resolve => doc.on('end', resolve));
          outputBuffer = Buffer.concat(chunks);
          fs.unlinkSync(tmpPath);
          mime = 'application/pdf';
        } else {
          // Text-like pdf
          const doc = new PDFDocument({ margin: 48 });
          const chunks = [];
          doc.on('data', d => chunks.push(d));
          doc.on('error', () => {});
          const content = inputBuffer.toString('utf8');
          doc.fontSize(12).text(content);
          doc.end();
          await new Promise(resolve => doc.on('end', resolve));
          outputBuffer = Buffer.concat(chunks);
          mime = 'application/pdf';
        }
      }

      // TXT extraction
      if (!outputBuffer && lowerTarget === 'txt') {
        if (inputExt === 'pdf') {
          try {
            const parsed = await pdfParse(inputBuffer);
            outputBuffer = Buffer.from(parsed.text || '');
          } catch (e) {
            outputBuffer = Buffer.from('');
          }
        } else if (inputExt === 'docx') {
          try {
            const { value } = await mammoth.extractRawText({ buffer: inputBuffer });
            outputBuffer = Buffer.from(value || '');
          } catch {
            outputBuffer = Buffer.from('');
          }
        } else {
          outputBuffer = Buffer.from(inputBuffer.toString('utf8'));
        }
        mime = 'text/plain';
      }

      // CSV/XLSX
      if (!outputBuffer && lowerTarget === 'csv' && ['xlsx', 'xls', 'ods'].includes(inputExt)) {
        const wb = XLSX.read(inputBuffer, { type: 'buffer' });
        const firstSheet = wb.SheetNames[0];
        const csv = XLSX.utils.sheet_to_csv(wb.Sheets[firstSheet]);
        outputBuffer = Buffer.from(csv, 'utf8');
        mime = 'text/csv';
      }
      if (!outputBuffer && lowerTarget === 'xlsx' && ['csv','txt','ods','xls'].includes(inputExt)) {
        if (inputExt === 'csv' || inputExt === 'txt') {
          const text = inputBuffer.toString('utf8');
          const rows = text.split(/\r?\n/).filter(Boolean).map(line => line.split(','));
          const ws = XLSX.utils.aoa_to_sheet(rows);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          outputBuffer = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
        } else {
          const wb = XLSX.read(inputBuffer, { type: 'buffer' });
          outputBuffer = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
        }
        mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      // DOCX -> HTML/PDF
      if (!outputBuffer && (lowerTarget === 'html' || lowerTarget === 'pdf') && inputExt === 'docx') {
        try {
          const { value: html } = await mammoth.convertToHtml({ buffer: inputBuffer });
          if (lowerTarget === 'html') {
            outputBuffer = Buffer.from(html, 'utf8');
            mime = 'text/html';
          } else {
            const fileObj = { content: html };
            const pdfBuffer = await htmlPdf.generatePdf(fileObj, { format: 'A4' });
            outputBuffer = Buffer.from(pdfBuffer);
            mime = 'application/pdf';
          }
        } catch {}
      }

      // MD -> HTML/PDF
      if (!outputBuffer && (lowerTarget === 'html' || lowerTarget === 'pdf') && inputExt === 'md') {
        const html = marked.parse(inputBuffer.toString('utf8'));
        if (lowerTarget === 'html') {
          outputBuffer = Buffer.from(html, 'utf8');
          mime = 'text/html';
        } else {
          const fileObj = { content: html };
          const pdfBuffer = await htmlPdf.generatePdf(fileObj, { format: 'A4' });
          outputBuffer = Buffer.from(pdfBuffer);
          mime = 'application/pdf';
        }
      }

      // ZIP (package the input file)
      if (!outputBuffer && lowerTarget === 'zip') {
        const zip = new JSZip();
        zip.file(originalName, inputBuffer);
        outputBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        mime = 'application/zip';
      }

      // ZIP extraction -> TGZ repack (single-file API)
      if (!outputBuffer && (lowerTarget === 'tgz' || lowerTarget === 'tar' || lowerTarget === 'gz') && inputExt === 'zip') {
        const zip = await JSZip.loadAsync(inputBuffer);
        // Build a tar from all entries
        const pack = tarStream.pack();
        const tarChunks = [];
        const finalizePack = async () => {
          pack.finalize();
          for await (const c of pack) tarChunks.push(c);
          return Buffer.concat(tarChunks);
        };
        const entries = Object.keys(zip.files);
        for (const name of entries) {
          const entry = zip.files[name];
          if (entry.dir) continue;
          const fileBuf = await entry.async('nodebuffer');
          pack.entry({ name, size: fileBuf.length }, fileBuf);
        }
        const tarBuf = await finalizePack();
        if (lowerTarget === 'tar') {
          outputBuffer = tarBuf;
          mime = 'application/x-tar';
        } else if (lowerTarget === 'gz' || lowerTarget === 'tgz') {
          outputBuffer = zlib.gzipSync(tarBuf);
          mime = 'application/gzip';
        }
      }

      // 7Z creation using bundled 7z binary
      if (!outputBuffer && lowerTarget === '7z') {
        const tmpDir = path.dirname(inputPath);
        const inFile = path.join(tmpDir, `in_${Date.now()}_${originalName}`);
        fs.writeFileSync(inFile, inputBuffer);
        const outPath = path.join(tmpDir, `out_${Date.now()}.7z`);
        await new Promise((resolve, reject) => {
          execFile(path7za, ['a', outPath, inFile], (err) => {
            if (err) reject(err); else resolve();
          });
        });
        outputBuffer = fs.readFileSync(outPath);
        try { fs.unlinkSync(inFile); fs.unlinkSync(outPath); } catch {}
        mime = 'application/x-7z-compressed';
      }

      // TAR/GZ/TGZ creation from single file
      if (!outputBuffer && lowerTarget === 'tar') {
        const pack = tarStream.pack();
        const chunks = [];
        pack.entry({ name: originalName, size: inputBuffer.length }, inputBuffer);
        pack.finalize();
        for await (const c of pack) chunks.push(c);
        outputBuffer = Buffer.concat(chunks);
        mime = 'application/x-tar';
      }
      if (!outputBuffer && (lowerTarget === 'gz' || lowerTarget === 'tgz')) {
        const tarBuf = lowerTarget === 'tgz' ? (() => {
          const p = tarStream.pack();
          const arr = [];
          p.entry({ name: originalName, size: inputBuffer.length }, inputBuffer);
          p.finalize();
          return new Promise(async resolve => {
            for await (const c of p) arr.push(c);
            resolve(Buffer.concat(arr));
          });
        })() : Promise.resolve(inputBuffer);
        const src = await tarBuf;
        outputBuffer = zlib.gzipSync(src);
        mime = 'application/gzip';
      }

      // FONT: TTF -> WOFF/WOFF2
      if (!outputBuffer && (lowerTarget === 'woff' || lowerTarget === 'woff2') && inputExt === 'ttf') {
        if (lowerTarget === 'woff') {
          const { buffer } = ttf2woff(new Uint8Array(inputBuffer));
          outputBuffer = Buffer.from(buffer);
          mime = 'font/woff';
        } else {
          const buf = ttf2woff2(inputBuffer);
          outputBuffer = Buffer.from(buf);
          mime = 'font/woff2';
        }
      }
      // FONT: TTF -> EOT
      if (!outputBuffer && lowerTarget === 'eot' && inputExt === 'ttf') {
        const eot = ttf2eotConv(new Uint8Array(inputBuffer)).buffer;
        outputBuffer = Buffer.from(eot);
        mime = 'application/vnd.ms-fontobject';
      }

      // AUDIO/VIDEO via ffmpeg (best effort)
      const audioTargets = ['mp3','wav','m4a','flac','ogg','weba','aac'];
      const videoTargets = ['mp4','webm','avi','mkv','mov','flv'];
      if (!outputBuffer && (audioTargets.includes(lowerTarget) || videoTargets.includes(lowerTarget))) {
        try {
          ffmpeg.setFfmpegPath(ffmpegStatic);
          const tmpDir = path.dirname(inputPath);
          const outPath = path.join(tmpDir, `out_${Date.now()}.${lowerTarget}`);
          await new Promise((resolve, reject) => {
            let cmd = ffmpeg(inputPath).output(outPath).on('end', resolve).on('error', reject);
            if (videoTargets.includes(lowerTarget)) {
              if (lowerTarget === 'mp4') cmd = cmd.videoCodec('libx264').audioCodec('aac').outputOptions(['-movflags faststart']);
              if (lowerTarget === 'webm') cmd = cmd.videoCodec('libvpx-vp9').audioCodec('libopus');
              if (vwidth || vheight) {
                const w = vwidth || -1; const h = vheight || -1;
                cmd = cmd.outputOptions([`-vf`, `scale=${w}:${h}:force_original_aspect_ratio=decrease`]);
              }
              if (vbitrate) cmd = cmd.videoBitrate(vbitrate);
              if (abitrate) cmd = cmd.audioBitrate(abitrate);
            } else {
              if (lowerTarget === 'mp3') cmd = cmd.audioCodec('libmp3lame').audioBitrate('192k');
              if (lowerTarget === 'm4a' || lowerTarget === 'aac') cmd = cmd.audioCodec('aac').audioBitrate('192k');
              if (lowerTarget === 'flac') cmd = cmd.audioCodec('flac');
              if (lowerTarget === 'wav') cmd = cmd.audioCodec('pcm_s16le');
              if (lowerTarget === 'ogg' || lowerTarget === 'weba') cmd = cmd.audioCodec('libopus');
              if (abitrate) cmd = cmd.audioBitrate(abitrate);
            }
            cmd.run();
          });
          outputBuffer = fs.readFileSync(outPath);
          try { fs.unlinkSync(outPath); } catch {}
          if (audioTargets.includes(lowerTarget)) {
            if (lowerTarget === 'mp3') mime = 'audio/mpeg';
            else if (lowerTarget === 'wav') mime = 'audio/wav';
            else if (lowerTarget === 'm4a' || lowerTarget === 'aac') mime = 'audio/aac';
            else if (lowerTarget === 'flac') mime = 'audio/flac';
            else if (lowerTarget === 'ogg' || lowerTarget === 'weba') mime = 'audio/ogg';
          } else {
            if (lowerTarget === 'mp4') mime = 'video/mp4';
            else if (lowerTarget === 'webm') mime = 'video/webm';
            else if (lowerTarget === 'avi') mime = 'video/x-msvideo';
            else if (lowerTarget === 'mkv') mime = 'video/x-matroska';
            else if (lowerTarget === 'mov') mime = 'video/quicktime';
            else if (lowerTarget === 'flv') mime = 'video/x-flv';
          }
        } catch {}
      }

      // SVG → PNG
      if (!outputBuffer && (lowerTarget === 'png') && inputExt === 'svg') {
        outputBuffer = await sharp(inputBuffer).png().toBuffer();
        mime = 'image/png';
      }

      // SVGZ -> SVG
      if (!outputBuffer && lowerTarget === 'svg' && inputExt === 'svgz') {
        outputBuffer = zlib.gunzipSync(inputBuffer);
        mime = 'image/svg+xml';
      }

      // CBZ from image or HTMLZ/TXTZ from text/html
      if (!outputBuffer && (lowerTarget === 'cbz' || lowerTarget === 'htmlz' || lowerTarget === 'txtz')) {
        const zip = new JSZip();
        if (lowerTarget === 'cbz') {
          // Pack single image as page01
          zip.file('page01' + (path.extname(originalName) || '.jpg'), inputBuffer);
        } else if (lowerTarget === 'htmlz') {
          const html = inputExt === 'md' ? marked.parse(inputBuffer.toString('utf8')) : inputBuffer.toString('utf8');
          zip.file('index.html', html);
        } else if (lowerTarget === 'txtz') {
          const txt = inputBuffer.toString('utf8');
          zip.file('index.txt', txt);
        }
        outputBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        mime = 'application/zip';
      }

      // JAR (zip with .jar extension)
      if (!outputBuffer && lowerTarget === 'jar') {
        const zip = new JSZip();
        zip.file(originalName, inputBuffer);
        outputBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        mime = 'application/java-archive';
      }

      // EPUB from HTML/MD/TXT (single chapter)
      if (!outputBuffer && lowerTarget === 'epub' && ['html','htm','md','txt'].includes(inputExt)) {
        const html = inputExt === 'md' ? marked.parse(inputBuffer.toString('utf8'))
                    : inputExt === 'txt' ? `<pre>${inputBuffer.toString('utf8')}</pre>`
                    : inputBuffer.toString('utf8');
        const tmpOut = path.join(path.dirname(inputPath), `out_${Date.now()}.epub`);
        await new Epub({
          title: path.basename(originalName, path.extname(originalName)),
          author: 'MegaPixelAI',
          content: [{ title: 'Chapter 1', data: html }]
        }, tmpOut).promise;
        outputBuffer = fs.readFileSync(tmpOut);
        try { fs.unlinkSync(tmpOut); } catch {}
        mime = 'application/epub+zip';
      }

      // If still not handled, return original buffer but with forced extension
      const name = finalizeName(originalName);
      const dataUrl = toDataUrl(outputBuffer || inputBuffer, mime);
      return res.status(200).json({ name, dataUrl });
    } catch (e) {
      return res.status(500).json({ error: 'Conversion failed', details: e.message });
    }
  });
}
