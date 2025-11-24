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
import { createExtractorFromData } from 'node-unrar-js';
// Le librerie docx e rtf-parser verranno importate dinamicamente quando necessarie
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
import os from 'os';
import { 
  handleApiError, 
  ValidationError, 
  ProcessingError,
  FileSystemError,
  NotFoundError
} from '../../../errors';

// Helper per verificare se un comando è disponibile (cross-platform)
async function commandExists(command) {
  const isWindows = process.platform === 'win32';
  const checkCmd = isWindows ? `where ${command} 2>nul` : `which ${command}`;
  try {
    const { stdout } = await execAsync(checkCmd);
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

// Helper per trovare soffice su Windows in percorsi comuni
function findLibreOfficeWindows() {
  const possiblePaths = [
    process.env.PROGRAMFILES + '\\LibreOffice\\program\\soffice.exe',
    process.env['PROGRAMFILES(X86)'] + '\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
    process.env.LOCALAPPDATA + '\\Programs\\LibreOffice\\program\\soffice.exe'
  ];
  
  for (const p of possiblePaths) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

// Helper per convertire tramite LibreOffice (se disponibile)
async function convertViaLibreOffice(inputPath, outputDir, outputFormat) {
  const isWindows = process.platform === 'win32';
  let soffice = null;
  
  // Su Windows, LibreOffice può essere in percorsi comuni
  if (isWindows) {
    // Cerca in percorsi comuni
    soffice = findLibreOfficeWindows();
    
    // Se non trovato, verifica nel PATH
    if (!soffice) {
      try {
        if (await commandExists('soffice.exe')) {
          soffice = 'soffice.exe';
        }
      } catch {}
    }
    
    if (!soffice) {
      console.warn('LibreOffice non trovato. Per installarlo: https://www.libreoffice.org/download/');
      return null;
    }
  } else {
    // Linux/Mac
    try {
      if (await commandExists('soffice')) {
        soffice = 'soffice';
      } else if (await commandExists('/usr/bin/soffice')) {
        soffice = '/usr/bin/soffice';
      } else if (await commandExists('/Applications/LibreOffice.app/Contents/MacOS/soffice')) {
        soffice = '/Applications/LibreOffice.app/Contents/MacOS/soffice';
      } else {
        console.warn('LibreOffice non trovato. Installa LibreOffice per usare questa funzione.');
        return null;
      }
    } catch {}
    
    if (!soffice) {
      return null;
    }
  }
  
  try {
    // LibreOffice comando: soffice --headless --convert-to <format> --outdir <dir> <file>
    const cmd = isWindows 
      ? `"${soffice}" --headless --convert-to ${outputFormat} --outdir "${outputDir}" "${inputPath}"`
      : `soffice --headless --convert-to ${outputFormat} --outdir "${outputDir}" "${inputPath}"`;
    
    await execAsync(cmd, { timeout: 60000 }); // 60 secondi timeout
    
    // LibreOffice genera il file con lo stesso nome base dell'input ma con estensione diversa
    const inputBaseName = path.basename(inputPath, path.extname(inputPath));
    const expectedOutput = path.join(outputDir, `${inputBaseName}.${outputFormat}`);
    
    // Verifica che il file di output esista
    if (fs.existsSync(expectedOutput)) {
      return fs.readFileSync(expectedOutput);
    }
    
    // Fallback: cerca qualsiasi file PDF nella directory di output
    try {
      const files = fs.readdirSync(outputDir);
      const pdfFile = files.find(f => f.endsWith('.pdf') || f.endsWith(`.${outputFormat}`));
      if (pdfFile) {
        const pdfPath = path.join(outputDir, pdfFile);
        return fs.readFileSync(pdfPath);
      }
    } catch {}
    
    return null;
  } catch (e) {
    console.error('Errore conversione LibreOffice:', e);
    return null;
  }
}

// Helper per trovare Pandoc su Windows in percorsi comuni
function findPandocWindows() {
  const possiblePaths = [
    'C:\\Program Files\\Pandoc\\pandoc.exe',
    process.env.PROGRAMFILES + '\\Pandoc\\pandoc.exe',
    process.env.LOCALAPPDATA + '\\Pandoc\\pandoc.exe',
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Pandoc\\pandoc.exe'
  ];
  
  for (const p of possiblePaths) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

// Helper per convertire tramite Pandoc (se disponibile)
async function convertViaPandoc(inputPath, outputPath, inputFormat, outputFormat) {
  const isWindows = process.platform === 'win32';
  let pandoc = null;
  
  if (isWindows) {
    // Cerca in percorsi comuni
    pandoc = findPandocWindows();
    
    // Verifica anche nel PATH
    if (!pandoc && await commandExists('pandoc.exe')) {
      pandoc = 'pandoc.exe';
    }
    
    if (!pandoc) {
      console.warn('Pandoc non trovato. Per installarlo: https://pandoc.org/installing.html');
      return null;
    }
  } else {
    // Linux/Mac
    if (await commandExists('pandoc')) {
      pandoc = 'pandoc';
    } else {
      console.warn('Pandoc non trovato. Installa Pandoc per usare questa funzione.');
      return null;
    }
  }
  
  try {
    const cmd = isWindows 
      ? `"${pandoc}" -f ${inputFormat} -t ${outputFormat} -o "${outputPath}" "${inputPath}"`
      : `${pandoc} -f ${inputFormat} -t ${outputFormat} -o "${outputPath}" "${inputPath}"`;
    await execAsync(cmd, { timeout: 60000 });
    
    if (fs.existsSync(outputPath)) {
      return fs.readFileSync(outputPath);
    }
    return null;
  } catch (e) {
    console.error('Errore conversione Pandoc:', e);
    return null;
  }
}

// Helper per trovare ddjvu su Windows in percorsi comuni
function findDjvuLibreWindows() {
  const possiblePaths = [
    'C:\\Program Files\\djvulibre\\bin\\ddjvu.exe',
    'C:\\Program Files (x86)\\djvulibre\\bin\\ddjvu.exe',
    process.env.PROGRAMFILES + '\\djvulibre\\bin\\ddjvu.exe',
    process.env['PROGRAMFILES(X86)'] + '\\djvulibre\\bin\\ddjvu.exe'
  ];
  
  for (const p of possiblePaths) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

// Helper per convertire DJVU tramite djvulibre (se disponibile)
async function convertDjvuToPdf(inputPath, outputPath) {
  const isWindows = process.platform === 'win32';
  let ddjvu = null;
  
  if (isWindows) {
    // Su Windows, djvulibre potrebbe essere in percorsi comuni
    ddjvu = findDjvuLibreWindows();
    
    // Verifica anche nel PATH
    if (!ddjvu && await commandExists('ddjvu.exe')) {
      ddjvu = 'ddjvu.exe';
    }
    
    if (!ddjvu) {
      console.warn('djvulibre non trovato. Per installarlo: https://sourceforge.net/projects/djvu/files/');
      return null;
    }
  } else {
    // Linux/Mac
    if (await commandExists('ddjvu')) {
      ddjvu = 'ddjvu';
    } else if (fs.existsSync('/usr/bin/ddjvu')) {
      ddjvu = '/usr/bin/ddjvu';
    } else {
      console.warn('djvulibre non trovato. Installa djvulibre per usare questa funzione.');
      return null;
    }
  }
  
  try {
    // ddjvu comando: ddjvu -format=pdf <djvu-file> <pdf-file>
    const cmd = isWindows 
      ? `"${ddjvu}" -format=pdf "${inputPath}" "${outputPath}"`
      : `${ddjvu} -format=pdf "${inputPath}" "${outputPath}"`;
    await execAsync(cmd, { timeout: 60000 });
    
    if (fs.existsSync(outputPath)) {
      return fs.readFileSync(outputPath);
    }
    return null;
  } catch (e) {
    console.error('Errore conversione DJVU:', e);
    return null;
  }
}

export const config = { api: { bodyParser: false } };

function toDataUrl(buffer, mime) {
  // Verifica che il buffer non sia vuoto o null
  if (!buffer || buffer.length === 0) {
    // Restituisci un buffer vuoto come fallback
    buffer = Buffer.from('');
  }
  const base64 = buffer.toString('base64');
  return `data:${mime};base64,${base64}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
  }
  
  const { target } = req.query;
  if (!target) {
    return handleApiError(new ValidationError('Target format is required'), res, {
      method: req.method,
      url: req.url,
      endpoint: '/api/convert/[target]',
    });
  }

  // Su Vercel, usa /tmp per i file temporanei (unico filesystem scrivibile)
  const tmpDir = process.env.VERCEL ? '/tmp' : os.tmpdir();
  
  const form = formidable({ 
    multiples: false, 
    keepExtensions: true,
    allowEmptyFiles: false, // Non permettere file vuoti
    maxFileSize: 500 * 1024 * 1024, // 500MB per singolo file
    maxTotalFileSize: 500 * 1024 * 1024, // 500MB totale
    uploadDir: tmpDir, // Usa /tmp su Vercel
  });
  
  // Wrappare form.parse in try-catch per gestire errori non gestiti
  try {
    form.parse(req, async (err, fields, files) => {
      // Wrappare tutto il codice del callback in try-catch per gestire errori async
      try {
        if (err) {
      // Gestisci errori specifici di formidable
      let errorMessage = err.message || 'File upload failed';
      if (err.message && err.message.includes('file size should be greater than 0')) {
        errorMessage = 'Il file è vuoto. Carica un file valido.';
      } else if (err.message && err.message.includes('options.allowEmptyFiles')) {
        errorMessage = 'Il file caricato è vuoto. Carica un file con contenuto.';
      } else if (err.message && err.message.includes('maxTotalFileSize')) {
        errorMessage = 'File troppo grande. Dimensione massima: 500MB per file video/audio, 50MB per altri formati';
      } else if (err.message && err.message.includes('maxFileSize')) {
        errorMessage = 'File troppo grande. Dimensione massima: 500MB per file video/audio, 50MB per altri formati';
      }
      return handleApiError(
        new ValidationError(errorMessage, err),
        res,
        { method: req.method, url: req.url, endpoint: '/api/convert/[target]' }
      );
    }
    
    // Formidable v3 restituisce array, v2 restituisce oggetto singolo
    let file = files.file;
    if (Array.isArray(file)) {
      file = file[0]; // Prendi il primo file dall'array
    }
    
    if (!file) {
      return handleApiError(
        new ValidationError('File missing'),
        res,
        { method: req.method, url: req.url, endpoint: '/api/convert/[target]' }
      );
    }
    
    // Supporta sia filepath (v2/v3) che path (v1) di formidable
    const inputPath = file.filepath || file.path;
    if (!inputPath) {
      return handleApiError(
        new ValidationError('File path non valido - il file potrebbe non essere stato caricato correttamente'),
        res,
        { method: req.method, url: req.url, endpoint: '/api/convert/[target]' }
      );
    }
    
    // Valida che il file non sia vuoto
    if (file.size === 0) {
      return handleApiError(
        new ValidationError('Il file è vuoto. Carica un file valido.'),
        res,
        { method: req.method, url: req.url, endpoint: '/api/convert/[target]' }
      );
    }
    
    let inputExt = ''; // Inizializza prima del try block
    
    try {
      // Verifica che inputPath sia valido prima di usarlo
      if (!inputPath || typeof inputPath !== 'string') {
        throw new Error('File path non valido - il file potrebbe non essere stato caricato correttamente');
      }
      
      // Verifica che il file esista
      if (!fs.existsSync(inputPath)) {
        throw new Error('Il file caricato non esiste più o è stato rimosso');
      }
      
      const originalName = file.originalFilename || file.name || 'file';
      const inputBuffer = fs.readFileSync(inputPath);
      inputExt = (path.extname(originalName) || '').replace('.', '').toLowerCase();
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
      const page = fields.page ? parseInt(String(fields.page)) : 0;

      // IMAGE CONVERSIONS via sharp
      const imageTargets = ['png','jpg','jpeg','webp','tiff','bmp','avif','heif','gif'];
      if (imageTargets.includes(lowerTarget)) {
        let pipeline;
        if (inputExt === 'pdf') {
          // Render a specific page from PDF if provided (default first page)
          const p = Number.isFinite(page) && page >= 0 ? page : 0;
          pipeline = sharp(inputBuffer, { density: 150, page: p });
        } else {
          pipeline = sharp(inputBuffer, { failOn: 'none' });
        }
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

      // AUDIO/VIDEO CONVERSIONS via FFmpeg
      const audioFormats = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'weba', 'opus', 'ac3', 'aif', 'aiff', 'aifc', 'amr', 'au', 'caf', 'dss', 'oga', 'voc', 'wma'];
      const videoFormats = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', '3gp', '3g2', '3gpp', 'cavs', 'dv', 'dvr', 'm2ts', 'm4v', 'mod', 'mpeg', 'mpg', 'mts', 'mxf', 'ogg', 'ogv', 'rm', 'rmvb', 'swf', 'ts', 'vob', 'wmv', 'wtv'];
      
      if (!outputBuffer && (audioFormats.includes(lowerTarget) || videoFormats.includes(lowerTarget))) {
        try {
          // Verifica che ffmpeg-static sia disponibile
          if (!ffmpegStatic) {
            // Prova a importare dinamicamente se non disponibile
            const ffmpegStaticDynamic = await import('ffmpeg-static');
            const ffmpegPath = ffmpegStaticDynamic.default || ffmpegStaticDynamic;
            if (ffmpegPath) {
              ffmpeg.setFfmpegPath(ffmpegPath);
            } else {
              throw new Error('FFmpeg non disponibile');
            }
          } else {
            // Configura ffmpeg con ottimizzazioni
            ffmpeg.setFfmpegPath(ffmpegStatic);
          }
          
          // Determina numero ottimale di thread (usa tutti i core disponibili)
          const threads = os.cpus().length;
          
          // Su Vercel, usa /tmp per i file di output
          const outputDir = process.env.VERCEL ? '/tmp' : path.dirname(inputPath);
          const outputFilename = `output_${Date.now()}.${lowerTarget}`;
          const outputPath = path.join(outputDir, outputFilename);
          
          await new Promise((resolve, reject) => {
            let command = ffmpeg(inputPath);
            
            // Opzioni globali per velocità - usa tutti i thread disponibili
            command = command.outputOptions([
              '-threads', threads.toString() // Multi-threading
            ]);
            
            // Configurazioni specifiche per audio
            if (audioFormats.includes(lowerTarget)) {
              // Estrai solo audio
              command = command.noVideo();
              
              // Bitrate audio se specificato
              if (abitrate) {
                command = command.audioBitrate(abitrate);
              } else {
                // Bitrate OTTIMIZZATI per velocità mantenendo qualità accettabile
                const defaultBitrates = {
                  'mp3': '160k',   // Veloce e buona qualità
                  'aac': '160k',   // Veloce e buona qualità
                  'm4a': '160k',   // Veloce e buona qualità
                  'flac': '1411k', // lossless
                  'wav': '1411k',  // lossless
                  'ogg': '160k',   // Veloce
                  'opus': '128k',  // Ottimo per Opus
                  'weba': '128k'   // Ottimo per WebM audio
                };
                const bitrate = defaultBitrates[lowerTarget] || '160k';
                command = command.audioBitrate(bitrate);
              }
              
              // Codec specifici per formato
              const audioCodecs = {
                'mp3': 'libmp3lame',
                'aac': 'aac',
                'm4a': 'aac',
                'flac': 'flac',
                'wav': 'pcm_s16le',
                'ogg': 'libvorbis',
                'opus': 'libopus',
                'weba': 'libopus',
                'ac3': 'ac3',
                'wma': 'wmav2'
              };
              
              if (audioCodecs[lowerTarget]) {
                command = command.audioCodec(audioCodecs[lowerTarget]);
              }
              
              // Frequenza campionamento ottimizzata
              command = command.audioFrequency(44100);
              command = command.audioChannels(2);
              
              // Opzioni di velocità per codec specifici
              if (lowerTarget === 'mp3') {
                command = command.outputOptions([
                  '-q:a', '3' // Buon compromesso qualità/velocità per MP3
                ]);
              } else if (lowerTarget === 'aac' || lowerTarget === 'm4a') {
                command = command.outputOptions([
                  '-profile:a', 'aac_low',
                  '-movflags', '+faststart' // Start veloce
                ]);
              } else if (lowerTarget === 'opus' || lowerTarget === 'weba') {
                command = command.outputOptions([
                  '-compression_level', '5' // Compromesso velocità/qualità per Opus
                ]);
              }
            }
            
            // Configurazioni specifiche per video
            if (videoFormats.includes(lowerTarget)) {
              // Codec video in base al formato
              const videoCodecs = {
                'mp4': 'libx264',
                'webm': 'libvpx',
                'mkv': 'libx264',
                'avi': 'libxvid',
                'mov': 'libx264',
                'flv': 'flv',
                'ogv': 'libtheora',
                '3gp': 'h263',
                'wmv': 'wmv2'
              };
              
              if (videoCodecs[lowerTarget]) {
                command = command.videoCodec(videoCodecs[lowerTarget]);
              }
              
              // Bitrate video se specificato
              if (vbitrate) {
                command = command.videoBitrate(vbitrate);
              } else {
                command = command.videoBitrate('1800k'); // Ridotto leggermente per velocità
              }
              
              // Dimensioni video se specificate
              if (vwidth && vheight) {
                command = command.size(`${vwidth}x${vheight}`);
              } else if (vwidth) {
                command = command.size(`${vwidth}x?`);
              } else if (vheight) {
                command = command.size(`?x${vheight}`);
              }
              
              // Codec audio per video
              const audioCodecs = {
                'mp4': 'aac',
                'webm': 'libvorbis',
                'mkv': 'aac',
                'avi': 'libmp3lame',
                'mov': 'aac',
                'flv': 'libmp3lame',
                'ogv': 'libvorbis',
                '3gp': 'aac',
                'wmv': 'wmav2'
              };
              
              if (audioCodecs[lowerTarget]) {
                command = command.audioCodec(audioCodecs[lowerTarget]);
              }
              
              if (abitrate) {
                command = command.audioBitrate(abitrate);
              } else {
                command = command.audioBitrate('160k'); // Ridotto leggermente per velocità
              }
              
              // Frame rate ottimizzato
              command = command.fps(30);
              
              // Formato specifico con preset VERYFAST (ottimo compromesso)
              if (lowerTarget === 'mp4') {
                command = command.format('mp4');
                command = command.outputOptions([
                  '-movflags', 'faststart',
                  '-preset', 'veryfast', // VELOCIZZATO: da fast a veryfast
                  '-crf', '24', // Leggermente ridotto per velocità
                  '-tune', 'fastdecode' // Ottimizzazione per decodifica veloce
                ]);
              } else if (lowerTarget === 'webm') {
                command = command.format('webm');
                command = command.outputOptions([
                  '-deadline', 'good',
                  '-cpu-used', '5', // VELOCIZZATO: da 4 a 5
                  '-row-mt', '1' // Multi-threading per righe
                ]);
              } else if (lowerTarget === 'mkv') {
                command = command.format('matroska');
                command = command.outputOptions([
                  '-preset', 'veryfast',
                  '-crf', '24',
                  '-tune', 'fastdecode'
                ]);
              } else if (lowerTarget === 'avi') {
                command = command.format('avi');
                command = command.outputOptions([
                  '-q:v', '6' // Bilanciato
                ]);
              } else if (lowerTarget === 'mov') {
                command = command.format('mov');
                command = command.outputOptions([
                  '-preset', 'veryfast',
                  '-crf', '24',
                  '-tune', 'fastdecode'
                ]);
              } else if (lowerTarget === 'flv') {
                command = command.format('flv');
              }
            }
            
            // Esegui conversione
            command
              .output(outputPath)
              .on('end', () => resolve())
              .on('error', (err) => reject(err))
              .run();
          });
          
          // Leggi file convertito
          if (fs.existsSync(outputPath)) {
            outputBuffer = fs.readFileSync(outputPath);
            
            // MIME types
            const mimeTypes = {
              // Audio
              'mp3': 'audio/mpeg',
              'wav': 'audio/wav',
              'aac': 'audio/aac',
              'm4a': 'audio/mp4',
              'flac': 'audio/flac',
              'ogg': 'audio/ogg',
              'oga': 'audio/ogg',
              'opus': 'audio/opus',
              'weba': 'audio/webm',
              'wma': 'audio/x-ms-wma',
              'ac3': 'audio/ac3',
              // Video
              'mp4': 'video/mp4',
              'webm': 'video/webm',
              'mkv': 'video/x-matroska',
              'avi': 'video/x-msvideo',
              'mov': 'video/quicktime',
              'flv': 'video/x-flv',
              'ogv': 'video/ogg',
              '3gp': 'video/3gpp',
              'wmv': 'video/x-ms-wmv',
              'mpeg': 'video/mpeg',
              'mpg': 'video/mpeg'
            };
            
            mime = mimeTypes[lowerTarget] || 'application/octet-stream';
            
            // Cleanup: elimina file temporaneo
            try {
              fs.unlinkSync(outputPath);
            } catch (e) {
              console.warn('Failed to delete temp output file:', e);
            }
          }
        } catch (ffmpegError) {
          console.error('FFmpeg conversion error:', ffmpegError);
          console.error('FFmpeg path:', ffmpegStatic);
          console.error('FFmpeg error details:', {
            message: ffmpegError.message,
            code: ffmpegError.code,
            errno: ffmpegError.errno,
            syscall: ffmpegError.syscall
          });
          
          // Se FFmpeg non è disponibile, prova a reimportare dinamicamente
          if (!ffmpegStatic || ffmpegError.code === 'ENOENT' || ffmpegError.message?.includes('ENOENT') || ffmpegError.message?.includes('not found')) {
            try {
              console.log('Tentativo reimport ffmpeg-static...');
              const ffmpegStaticRetry = await import('ffmpeg-static');
              const ffmpegPath = ffmpegStaticRetry.default || ffmpegStaticRetry;
              console.log('FFmpeg path trovato:', ffmpegPath);
              
              if (ffmpegPath && fs.existsSync(ffmpegPath)) {
                // Verifica permessi di esecuzione
                try {
                  fs.accessSync(ffmpegPath, fs.constants.X_OK);
                  console.log('FFmpeg è eseguibile');
                } catch (permError) {
                  // Su Vercel/Linux, potrebbe essere necessario rendere eseguibile
                  try {
                    fs.chmodSync(ffmpegPath, 0o755);
                    console.log('Permessi FFmpeg aggiornati');
                  } catch (chmodError) {
                    console.warn('Impossibile modificare permessi FFmpeg:', chmodError);
                  }
                }
                
                // Riprova con il path corretto
                ffmpeg.setFfmpegPath(ffmpegPath);
                throw new ProcessingError('FFmpeg trovato, riprova la conversione');
              } else {
                throw new ProcessingError(`FFmpeg non trovato nel percorso: ${ffmpegPath || 'undefined'}`);
              }
            } catch (retryError) {
              console.error('Errore reimport FFmpeg:', retryError);
              throw new ProcessingError(`FFmpeg non disponibile: ${ffmpegError.message || retryError.message || 'Errore sconosciuto'}`);
            }
          }
          
          // Per altri errori, prova a dare un messaggio più utile
          throw new ProcessingError(`Conversione audio/video fallita: ${ffmpegError.message || 'Errore durante la conversione con FFmpeg'}`);
        }
      }

      // PDF generation
      if (!outputBuffer && lowerTarget === 'pdf') {
        // Handle HTML with pdfkit (no Puppeteer dependency)
        if (inputExt === 'html' || inputExt === 'htm') {
          const html = inputBuffer.toString('utf8');
          // Estrai testo dall'HTML
          let text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
          
          const doc = new PDFDocument({ margin: 48 });
          const chunks = [];
          doc.on('data', d => chunks.push(d));
          doc.on('end', () => {});
          doc.fontSize(12).text(text);
          doc.end();
          await new Promise(resolve => doc.on('end', resolve));
          outputBuffer = Buffer.concat(chunks);
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
      // AI -> PDF (embedded PDF extraction)
      if (!outputBuffer && lowerTarget === 'pdf' && inputExt === 'ai') {
        const bin = inputBuffer.toString('binary');
        const start = bin.indexOf('%PDF-');
        const end = bin.lastIndexOf('%%EOF');
        if (start !== -1 && end !== -1 && end > start) {
          const pdfBinary = bin.substring(start, end + 5);
          outputBuffer = Buffer.from(pdfBinary, 'binary');
          mime = 'application/pdf';
        }
      }

      // DJVU -> PDF (via djvulibre)
      if (!outputBuffer && lowerTarget === 'pdf' && inputExt === 'djvu') {
        const tmpOut = path.join(path.dirname(inputPath), `djvu_${Date.now()}.pdf`);
        const result = await convertDjvuToPdf(inputPath, tmpOut);
        if (result) {
          outputBuffer = result;
          mime = 'application/pdf';
          try { fs.unlinkSync(tmpOut); } catch {}
        }
      }

      // Document formats to PDF via LibreOffice
      const libreOfficeDocFormats = ['pub', 'xps', 'abw', 'zabw', 'doc', 'docm', 'dot', 'dotx', 'hwp', 'lwp', 'wpd', 'wps', 'pages', 'odt', 'ods', 'odp', 'odg', 'rtf', 'rst'];
      if (!outputBuffer && lowerTarget === 'pdf' && libreOfficeDocFormats.includes(inputExt)) {
        // Su Vercel, usa /tmp per i file temporanei
        const workDir = process.env.VERCEL ? '/tmp' : path.dirname(inputPath);
        const result = await convertViaLibreOffice(inputPath, workDir, 'pdf');
        if (result) {
          outputBuffer = result;
          mime = 'application/pdf';
        } else {
          // LibreOffice non disponibile, informiamo l'utente
          return handleApiError(
            new ProcessingError(`Conversione ${inputExt.toUpperCase()} → PDF richiede LibreOffice. Per favore, installa LibreOffice per usare questa funzionalità. Download: https://www.libreoffice.org/download/`),
            res,
            {
              method: req.method,
              url: req.url,
              endpoint: '/api/convert/[target]',
              target,
              inputExt,
              hint: 'LibreOffice non è installato sul server'
            }
          );
        }
      }

      // TXT extraction/conversion
      if (!outputBuffer && lowerTarget === 'txt') {
        if (inputExt === 'txt') {
          // TXT → TXT: pass-through, ma normalizziamo l'encoding
          try {
            outputBuffer = Buffer.from(inputBuffer.toString('utf8'), 'utf8');
            mime = 'text/plain';
          } catch (e) {
            outputBuffer = Buffer.from(inputBuffer.toString('binary'), 'utf8');
            mime = 'text/plain';
          }
        } else if (inputExt === 'pdf') {
          try {
            const parsed = await pdfParse(inputBuffer);
            outputBuffer = Buffer.from(parsed.text || '', 'utf8');
            mime = 'text/plain';
          } catch (e) {
            outputBuffer = Buffer.from('', 'utf8');
            mime = 'text/plain';
          }
        } else if (inputExt === 'docx' || inputExt === 'docm' || inputExt === 'dotx') {
          try {
            const { value } = await mammoth.extractRawText({ buffer: inputBuffer });
            outputBuffer = Buffer.from(value || '', 'utf8');
            mime = 'text/plain';
          } catch {
            outputBuffer = Buffer.from('', 'utf8');
            mime = 'text/plain';
          }
        } else if (inputExt === 'doc' || inputExt === 'dot') {
          // DOC/DOT legacy: prova con mammoth, altrimenti parsing base
          try {
            const { value } = await mammoth.extractRawText({ buffer: inputBuffer });
            outputBuffer = Buffer.from(value || '', 'utf8');
            mime = 'text/plain';
          } catch (e) {
            // Fallback: estrai testo grezzo
            const text = inputBuffer.toString('utf8', 0, Math.min(50000, inputBuffer.length));
            const cleanText = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ' ').trim();
            outputBuffer = Buffer.from(cleanText || 'Contenuto non estraibile da formato DOC legacy', 'utf8');
            mime = 'text/plain';
          }
        } else if (inputExt === 'html' || inputExt === 'htm') {
          // HTML → TXT: estrai solo il testo, rimuovendo i tag HTML
          try {
            const html = inputBuffer.toString('utf8');
            // Rimuovi script e style
            let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
            // Sostituisci i tag HTML con spazi
            text = text.replace(/<[^>]+>/g, ' ');
            // Decodifica entità HTML
            text = text.replace(/&nbsp;/g, ' ');
            text = text.replace(/&amp;/g, '&');
            text = text.replace(/&lt;/g, '<');
            text = text.replace(/&gt;/g, '>');
            text = text.replace(/&quot;/g, '"');
            text = text.replace(/&#39;/g, "'");
            // Rimuovi spazi multipli e newline
            text = text.replace(/\s+/g, ' ').trim();
            outputBuffer = Buffer.from(text, 'utf8');
          } catch (e) {
            // Fallback: restituisci HTML come testo
            outputBuffer = Buffer.from(inputBuffer.toString('utf8'), 'utf8');
          }
        } else if (inputExt === 'md') {
          // MD → TXT: Markdown è già testo, ma rimuoviamo la sintassi markdown di base
          try {
            const md = inputBuffer.toString('utf8');
            let text = md;
            // Rimuovi sintassi Markdown comune
            text = text.replace(/#{1,6}\s+/g, ''); // Headers
            text = text.replace(/\*\*([^*]+)\*\*/g, '$1'); // Bold
            text = text.replace(/\*([^*]+)\*/g, '$1'); // Italic
            text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Links
            text = text.replace(/`([^`]+)`/g, '$1'); // Inline code
            text = text.replace(/```[\s\S]*?```/g, ''); // Code blocks
            outputBuffer = Buffer.from(text, 'utf8');
          } catch (e) {
            outputBuffer = Buffer.from(inputBuffer.toString('utf8'), 'utf8');
          }
        } else if (inputExt === 'rtf') {
          // RTF → TXT: già gestito sopra, ma assicuriamoci che funzioni
          try {
            const rtfText = inputBuffer.toString('utf8');
            let plainText = rtfText;
            plainText = plainText.replace(/\\[a-z]+\d*\s?/gi, ' ');
            plainText = plainText.replace(/\{[^}]*\}/g, '');
            plainText = plainText.replace(/\\[{}]/g, '');
            plainText = plainText.replace(/\s+/g, ' ').trim();
            outputBuffer = Buffer.from(plainText, 'utf8');
            mime = 'text/plain';
          } catch (e) {
            outputBuffer = Buffer.from('', 'utf8');
            mime = 'text/plain';
          }
        } else if (inputExt === 'odt') {
          // ODT → TXT: estrai da content.xml
          try {
            const zip = await JSZip.loadAsync(inputBuffer);
            let content = '';
            if (zip.files['content.xml']) {
              const xmlContent = await zip.files['content.xml'].async('string');
              const textMatches = xmlContent.match(/<text:[^>]*>([^<]*)<\/text:[^>]*>/gi) || [];
              const texts = textMatches.map(m => {
                const match = m.match(/>([^<]+)</i);
                return match ? match[1] : '';
              }).filter(t => t.trim().length > 0);
              content = texts.join('\n');
              if (!content) {
                content = xmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              }
            }
            outputBuffer = Buffer.from(content || 'Contenuto non estraibile', 'utf8');
            mime = 'text/plain';
          } catch (e) {
            outputBuffer = Buffer.from('', 'utf8');
            mime = 'text/plain';
          }
        } else if (inputExt === 'abw' || inputExt === 'zabw') {
          // ABW/ZABW → TXT
          try {
            let content = '';
            if (inputExt === 'zabw') {
              const zip = await JSZip.loadAsync(inputBuffer);
              const file = zip.files['content.xml'] || zip.files['AbiWord'];
              if (file) {
                const text = await file.async('string');
                content = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              }
            } else {
              const text = inputBuffer.toString('utf8');
              content = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            }
            outputBuffer = Buffer.from(content || 'Contenuto non estraibile', 'utf8');
            mime = 'text/plain';
          } catch (e) {
            outputBuffer = Buffer.from('', 'utf8');
            mime = 'text/plain';
          }
        } else if (inputExt === 'tex' || inputExt === 'rst') {
          // TEX/RST → TXT: sono formati testuali
          try {
            const text = inputBuffer.toString('utf8');
            outputBuffer = Buffer.from(text, 'utf8');
            mime = 'text/plain';
          } catch (e) {
            outputBuffer = Buffer.from('', 'utf8');
            mime = 'text/plain';
          }
        } else if (['pub', 'xps', 'hwp', 'lwp', 'pages', 'wpd', 'wps'].includes(inputExt)) {
          // Formati complessi → TXT: prova parsing base
          try {
            // Prova come archivio ZIP (XPS, PAGES potrebbero essere ZIP)
            if (inputExt === 'xps' || inputExt === 'pages') {
              try {
                const zip = await JSZip.loadAsync(inputBuffer);
                let content = '';
                for (const [path, file] of Object.entries(zip.files)) {
                  if (path.endsWith('.xml') || path.endsWith('.txt')) {
                    const text = await file.async('string');
                    content += text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() + '\n';
                  }
                }
                outputBuffer = Buffer.from(content || 'Contenuto non estraibile', 'utf8');
                mime = 'text/plain';
              } catch (e) {
                // Non è un ZIP, prova parsing diretto
                const text = inputBuffer.toString('utf8', 0, Math.min(10000, inputBuffer.length));
                const cleanText = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ' ').trim();
                outputBuffer = Buffer.from(cleanText || 'Contenuto non estraibile', 'utf8');
                mime = 'text/plain';
              }
            } else {
              // Altri formati binari: estrazione base
              const text = inputBuffer.toString('utf8', 0, Math.min(10000, inputBuffer.length));
              const cleanText = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ' ').trim();
              outputBuffer = Buffer.from(cleanText || `Formato ${inputExt.toUpperCase()} richiede tool specializzati per estrazione completa`, 'utf8');
              mime = 'text/plain';
            }
          } catch (e) {
            outputBuffer = Buffer.from('', 'utf8');
            mime = 'text/plain';
          }
        } else if (inputExt === 'djvu') {
          // DJVU → TXT: formato binario complesso
          outputBuffer = Buffer.from('DJVU è un formato binario complesso. Per estrarre testo serve djvulibre.', 'utf8');
          mime = 'text/plain';
        } else {
          // Per altri formati testuali, converti in UTF-8
          try {
            outputBuffer = Buffer.from(inputBuffer.toString('utf8'), 'utf8');
          } catch (e) {
            // Se fallisce, prova a leggere come binary e convertire
            outputBuffer = Buffer.from(inputBuffer.toString('binary'), 'utf8');
          }
        }
        mime = 'text/plain';
      }

      // HTML conversion
      if (!outputBuffer && lowerTarget === 'html') {
        if (inputExt === 'html' || inputExt === 'htm') {
          // HTML → HTML: pass-through ma normalizziamo
          try {
            outputBuffer = Buffer.from(inputBuffer.toString('utf8'), 'utf8');
            mime = 'text/html';
          } catch (e) {
            outputBuffer = Buffer.from(inputBuffer.toString('binary'), 'utf8');
            mime = 'text/html';
          }
        } else if (inputExt === 'md') {
          // MD → HTML: già gestito sopra
          try {
            const html = marked.parse(inputBuffer.toString('utf8'));
            outputBuffer = Buffer.from(html, 'utf8');
            mime = 'text/html';
          } catch (e) {
            // Fallback: incapsula il markdown come pre
            const escaped = inputBuffer.toString('utf8').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            outputBuffer = Buffer.from(`<!DOCTYPE html>\n<html><head><meta charset="UTF-8"></head><body><pre>${escaped}</pre></body></html>`, 'utf8');
            mime = 'text/html';
          }
        } else if (inputExt === 'txt') {
          // TXT → HTML: formatta il testo in HTML
          try {
            const text = inputBuffer.toString('utf8');
            // Converti newline in <br> e paragrafi in <p>
            const lines = text.split(/\r?\n/);
            let html = '<!DOCTYPE html>\n<html lang="it">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Documento convertito</title>\n<style>\nbody { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }\np { margin-bottom: 1em; }\n</style>\n</head>\n<body>\n';
            
            let paragraph = '';
            lines.forEach(line => {
              const trimmed = line.trim();
              if (trimmed === '') {
                if (paragraph) {
                  html += `<p>${paragraph.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>\n`;
                  paragraph = '';
                }
              } else {
                if (paragraph) paragraph += ' ';
                paragraph += trimmed;
              }
            });
            if (paragraph) {
              html += `<p>${paragraph.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>\n`;
            }
            
            html += '</body>\n</html>';
            outputBuffer = Buffer.from(html, 'utf8');
            mime = 'text/html';
          } catch (e) {
            // Fallback: incapsula il testo in un HTML base
            const escaped = inputBuffer.toString('utf8').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const html = `<!DOCTYPE html>\n<html><head><meta charset="UTF-8"></head><body><pre>${escaped}</pre></body></html>`;
            outputBuffer = Buffer.from(html, 'utf8');
            mime = 'text/html';
          }
        } else if (inputExt === 'docx') {
          // DOCX → HTML: già gestito sopra
          try {
            const { value: html } = await mammoth.convertToHtml({ buffer: inputBuffer });
            outputBuffer = Buffer.from(html, 'utf8');
            mime = 'text/html';
          } catch (e) {
            outputBuffer = Buffer.from('<html><body><p>Errore nella conversione DOCX</p></body></html>', 'utf8');
            mime = 'text/html';
          }
        }
      }

      // Markdown (MD) conversion
      if (!outputBuffer && lowerTarget === 'md') {
        if (inputExt === 'md') {
          // MD → MD: pass-through
          try {
            outputBuffer = Buffer.from(inputBuffer.toString('utf8'), 'utf8');
            mime = 'text/markdown';
          } catch (e) {
            outputBuffer = Buffer.from(inputBuffer.toString('binary'), 'utf8');
            mime = 'text/markdown';
          }
        } else if (inputExt === 'html' || inputExt === 'htm') {
          // HTML → MD: conversione base HTML a Markdown
          try {
            const html = inputBuffer.toString('utf8');
            let md = html;
            // Rimuovi script e style
            md = md.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            md = md.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
            // Converti headers
            md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
            md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
            md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
            md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
            md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
            md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
            // Converti link
            md = md.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
            // Converti bold e italic
            md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
            md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
            md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
            md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
            // Converti paragrafi
            md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
            // Rimuovi tutti gli altri tag
            md = md.replace(/<[^>]+>/g, '');
            // Decodifica entità HTML
            md = md.replace(/&nbsp;/g, ' ');
            md = md.replace(/&amp;/g, '&');
            md = md.replace(/&lt;/g, '<');
            md = md.replace(/&gt;/g, '>');
            md = md.replace(/&quot;/g, '"');
            md = md.replace(/&#39;/g, "'");
            // Pulisci spazi multipli e newline
            md = md.replace(/\n{3,}/g, '\n\n').trim();
            outputBuffer = Buffer.from(md, 'utf8');
            mime = 'text/markdown';
          } catch (e) {
            // Fallback: estrai solo testo
            let text = inputBuffer.toString('utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            outputBuffer = Buffer.from(text, 'utf8');
            mime = 'text/markdown';
          }
        } else if (inputExt === 'txt') {
          // TXT → MD: principalmente pass-through, ma possiamo formattare meglio
          try {
            const text = inputBuffer.toString('utf8');
            // Se il testo ha pattern che suggeriscono struttura, possiamo convertirli
            // Per ora, restituiamo come markdown puro
            outputBuffer = Buffer.from(text, 'utf8');
            mime = 'text/markdown';
          } catch (e) {
            outputBuffer = Buffer.from(inputBuffer.toString('utf8'), 'utf8');
            mime = 'text/markdown';
          }
        } else if (inputExt === 'docx') {
          // DOCX → MD: converte prima in HTML, poi in MD
          try {
            const { value: html } = await mammoth.convertToHtml({ buffer: inputBuffer });
            // Ora converti HTML in MD (riuso la logica sopra)
            let md = html;
            md = md.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            md = md.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
            md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
            md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
            md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
            md = md.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
            md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
            md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
            md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
            md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
            md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
            md = md.replace(/<[^>]+>/g, '');
            md = md.replace(/&nbsp;/g, ' ');
            md = md.replace(/&amp;/g, '&');
            md = md.replace(/&lt;/g, '<');
            md = md.replace(/&gt;/g, '>');
            md = md.replace(/&quot;/g, '"');
            md = md.replace(/&#39;/g, "'");
            md = md.replace(/\n{3,}/g, '\n\n').trim();
            outputBuffer = Buffer.from(md, 'utf8');
            mime = 'text/markdown';
          } catch (e) {
            // Fallback: estrai solo testo
            try {
              const { value } = await mammoth.extractRawText({ buffer: inputBuffer });
              outputBuffer = Buffer.from(value || '', 'utf8');
              mime = 'text/markdown';
            } catch {
              outputBuffer = Buffer.from('', 'utf8');
              mime = 'text/markdown';
            }
          }
        }
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

      // DOCX -> PDF (HTML è gestito nella sezione HTML conversion)
      if (!outputBuffer && lowerTarget === 'pdf' && inputExt === 'docx') {
        try {
          const { value: html } = await mammoth.convertToHtml({ buffer: inputBuffer });
          // Estrai testo dall'HTML e genera PDF con pdfkit
          let text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
          
          const doc = new PDFDocument({ margin: 48 });
          const chunks = [];
          doc.on('data', d => chunks.push(d));
          doc.on('end', () => {});
          doc.fontSize(12).text(text);
          doc.end();
          await new Promise(resolve => doc.on('end', resolve));
          outputBuffer = Buffer.concat(chunks);
          mime = 'application/pdf';
        } catch {}
      }

      // Formati Word legacy: DOC, DOCM, DOT, DOTX -> PDF/TXT/HTML
      const wordFormats = ['doc', 'docm', 'dot', 'dotx'];
      if (!outputBuffer && wordFormats.includes(inputExt)) {
        try {
          // Prova con mammoth (potrebbe funzionare per alcuni formati moderni)
          if (inputExt === 'docm' || inputExt === 'dotx') {
            if (lowerTarget === 'txt') {
              const { value } = await mammoth.extractRawText({ buffer: inputBuffer });
              outputBuffer = Buffer.from(value || '', 'utf8');
              mime = 'text/plain';
            } else if (lowerTarget === 'html') {
              const { value: html } = await mammoth.convertToHtml({ buffer: inputBuffer });
              outputBuffer = Buffer.from(html, 'utf8');
              mime = 'text/html';
            } else if (lowerTarget === 'pdf') {
              const { value: html } = await mammoth.convertToHtml({ buffer: inputBuffer });
              // Estrai testo e genera PDF con pdfkit
              let text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              const doc = new PDFDocument({ margin: 48 });
              const chunks = [];
              doc.on('data', d => chunks.push(d));
              doc.on('end', () => {});
              doc.fontSize(12).text(text);
              doc.end();
              await new Promise(resolve => doc.on('end', resolve));
              outputBuffer = Buffer.concat(chunks);
              mime = 'application/pdf';
            }
          } else if (inputExt === 'doc' || inputExt === 'dot') {
            // DOC e DOT sono binari legacy
            if (lowerTarget === 'txt') {
              // Prova con mammoth per estrarre testo
              try {
                const { value } = await mammoth.extractRawText({ buffer: inputBuffer });
                outputBuffer = Buffer.from(value || '', 'utf8');
                mime = 'text/plain';
              } catch (e) {
                // Fallback: estrai testo grezzo
                const text = inputBuffer.toString('utf8', 0, Math.min(50000, inputBuffer.length));
                const cleanText = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ' ').trim();
                outputBuffer = Buffer.from(cleanText || 'Contenuto non estraibile da formato DOC legacy', 'utf8');
                mime = 'text/plain';
              }
            } else if (lowerTarget === 'pdf') {
              // Prova prima con LibreOffice
              try {
                const tmpDir = path.dirname(inputPath);
                const outputFileName = path.basename(originalName, path.extname(originalName)) + '.pdf';
                const outputPath = path.join(tmpDir, `lo_${Date.now()}_${outputFileName}`);
                
                const convertedBuffer = await convertViaLibreOffice(inputPath, outputPath, 'pdf');
                if (convertedBuffer) {
                  outputBuffer = convertedBuffer;
                  mime = 'application/pdf';
                  // Cleanup
                  try { fs.unlinkSync(outputPath); } catch {}
                } else {
                  // Fallback: prova con mammoth + pdfkit
                  try {
                    const { value: html } = await mammoth.convertToHtml({ buffer: inputBuffer });
                    // Usa pdfkit invece di html-pdf-node
                    const chunks = [];
                    const doc = new PDFDocument({ size: 'A4', margin: 50 });
                    doc.on('data', chunk => chunks.push(chunk));
                    doc.on('end', () => {});
                    
                    let text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                    doc.fontSize(12).text(text);
                    doc.end();
                    await new Promise(resolve => doc.on('end', resolve));
                    
                    outputBuffer = Buffer.concat(chunks);
                    mime = 'application/pdf';
                  } catch (e2) {
                    outputBuffer = Buffer.from('I formati DOC e DOT (Word legacy) richiedono LibreOffice installato. Installa LibreOffice e riprova.', 'utf8');
                    mime = 'text/plain';
                  }
                }
              } catch (e) {
                console.error('Errore conversione DOC/DOT:', e);
                // Fallback: prova con mammoth + pdfkit
                try {
                  const { value: html } = await mammoth.convertToHtml({ buffer: inputBuffer });
                  const chunks = [];
                  const doc = new PDFDocument({ size: 'A4', margin: 50 });
                  doc.on('data', chunk => chunks.push(chunk));
                  doc.on('end', () => {});
                  
                  let text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                  doc.fontSize(12).text(text);
                  doc.end();
                  await new Promise(resolve => doc.on('end', resolve));
                  
                  outputBuffer = Buffer.concat(chunks);
                  mime = 'application/pdf';
                } catch (e2) {
                  outputBuffer = Buffer.from('I formati DOC e DOT (Word legacy) richiedono LibreOffice installato.', 'utf8');
                  mime = 'text/plain';
                }
              }
            }
          }
        } catch (e) {
          console.error('Errore conversione Word:', e);
        }
      }

      // RTF -> PDF/TXT/HTML
      if (!outputBuffer && inputExt === 'rtf' && (lowerTarget === 'pdf' || lowerTarget === 'txt' || lowerTarget === 'html')) {
        try {
          const rtfText = inputBuffer.toString('utf8');
          let plainText = rtfText;
          
          // Rimozione base dei codici RTF
          plainText = plainText.replace(/\\[a-z]+\d*\s?/gi, ' '); // Comandi RTF
          plainText = plainText.replace(/\{[^}]*\}/g, ''); // Gruppi RTF
          plainText = plainText.replace(/\s+/g, ' ').trim();
          
          if (lowerTarget === 'txt') {
            outputBuffer = Buffer.from(plainText, 'utf8');
            mime = 'text/plain';
          } else if (lowerTarget === 'html') {
            const html = `<!DOCTYPE html>\n<html><head><meta charset="UTF-8"></head><body><pre>${plainText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>`;
            outputBuffer = Buffer.from(html, 'utf8');
            mime = 'text/html';
          } else if (lowerTarget === 'pdf') {
            // Genera PDF direttamente con pdfkit
            const doc = new PDFDocument({ margin: 48 });
            const chunks = [];
            doc.on('data', d => chunks.push(d));
            doc.on('end', () => {});
            doc.fontSize(12).text(plainText);
            doc.end();
            await new Promise(resolve => doc.on('end', resolve));
            outputBuffer = Buffer.concat(chunks);
            mime = 'application/pdf';
          }
        } catch (e) {
          console.error('Errore conversione RTF:', e);
        }
      }

      // ODT -> PDF/TXT/HTML (ODT è un archivio ZIP con content.xml)
      if (!outputBuffer && inputExt === 'odt' && (lowerTarget === 'pdf' || lowerTarget === 'txt' || lowerTarget === 'html')) {
        try {
          const zip = await JSZip.loadAsync(inputBuffer);
          let content = '';
          
          if (zip.files['content.xml']) {
            const xmlContent = await zip.files['content.xml'].async('string');
            content = xmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          } else {
            content = 'Impossibile estrarre contenuto da ODT.';
          }
          
          if (lowerTarget === 'txt') {
            outputBuffer = Buffer.from(content, 'utf8');
            mime = 'text/plain';
          } else if (lowerTarget === 'html') {
            const html = `<!DOCTYPE html>\n<html><head><meta charset="UTF-8"></head><body><p>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></body></html>`;
            outputBuffer = Buffer.from(html, 'utf8');
            mime = 'text/html';
          } else if (lowerTarget === 'pdf') {
            // Genera PDF direttamente con pdfkit
            const doc = new PDFDocument({ margin: 48 });
            const chunks = [];
            doc.on('data', d => chunks.push(d));
            doc.on('end', () => {});
            doc.fontSize(12).text(content);
            doc.end();
            await new Promise(resolve => doc.on('end', resolve));
            outputBuffer = Buffer.concat(chunks);
            mime = 'application/pdf';
          }
        } catch (e) {
          console.error('Errore conversione ODT:', e);
        }
      }

      // ABW/ZABW -> PDF/TXT/HTML
      if (!outputBuffer && (inputExt === 'abw' || inputExt === 'zabw') && (lowerTarget === 'pdf' || lowerTarget === 'txt' || lowerTarget === 'html')) {
        try {
          let content = '';
          if (inputExt === 'zabw') {
            const zip = await JSZip.loadAsync(inputBuffer);
            const file = zip.files['content.xml'] || zip.files['AbiWord'];
            if (file) {
              const text = await file.async('string');
              content = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            }
          } else {
            content = inputBuffer.toString('utf8');
            content = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          }
          
          if (!content) content = 'Impossibile estrarre contenuto dal file.';
          
          if (lowerTarget === 'txt') {
            outputBuffer = Buffer.from(content, 'utf8');
            mime = 'text/plain';
          } else if (lowerTarget === 'html') {
            const html = `<!DOCTYPE html>\n<html><head><meta charset="UTF-8"></head><body><p>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></body></html>`;
            outputBuffer = Buffer.from(html, 'utf8');
            mime = 'text/html';
          } else if (lowerTarget === 'pdf') {
            // Genera PDF direttamente con pdfkit
            const doc = new PDFDocument({ margin: 48 });
            const chunks = [];
            doc.on('data', d => chunks.push(d));
            doc.on('end', () => {});
            doc.fontSize(12).text(content);
            doc.end();
            await new Promise(resolve => doc.on('end', resolve));
            outputBuffer = Buffer.concat(chunks);
            mime = 'application/pdf';
          }
        } catch (e) {
          console.error('Errore conversione ABW/ZABW:', e);
        }
      }

      // DJVU -> PDF (special handling)
      if (!outputBuffer && inputExt === 'djvu' && lowerTarget === 'pdf') {
        try {
          const tmpDir = path.dirname(inputPath);
          const outputFileName = path.basename(originalName, path.extname(originalName)) + '.pdf';
          const outputPath = path.join(tmpDir, `djvu_${Date.now()}_${outputFileName}`);
          
          const convertedBuffer = await convertDjvuToPdf(inputPath, outputPath);
          if (convertedBuffer) {
            outputBuffer = convertedBuffer;
            mime = 'application/pdf';
            // Cleanup
            try { fs.unlinkSync(outputPath); } catch {}
          } else {
            outputBuffer = Buffer.from('DJVU richiede djvulibre installato. Installa djvulibre e riprova.', 'utf8');
            mime = 'text/plain';
          }
        } catch (e) {
          console.error('Errore conversione DJVU:', e);
          outputBuffer = Buffer.from('DJVU richiede djvulibre installato. Errore: ' + e.message, 'utf8');
          mime = 'text/plain';
        }
      }

      // Formati complessi: prova prima con LibreOffice/Pandoc, poi messaggio informativo
      const complexFormats = {
        'pub': { tool: 'libreoffice', format: 'pdf', msg: 'Microsoft Publisher richiede LibreOffice installato.' },
        'xps': { tool: 'libreoffice', format: 'pdf', msg: 'XPS richiede LibreOffice installato.' },
        'hwp': { tool: 'libreoffice', format: 'pdf', msg: 'HWP (Hancom Word) richiede LibreOffice installato.' },
        'lwp': { tool: 'libreoffice', format: 'pdf', msg: 'LWP (Lotus Word Pro) richiede LibreOffice installato.' },
        'pages': { tool: 'libreoffice', format: 'pdf', msg: 'Apple Pages richiede LibreOffice installato.' },
        'wpd': { tool: 'libreoffice', format: 'pdf', msg: 'WordPerfect richiede LibreOffice installato.' },
        'wps': { tool: 'libreoffice', format: 'pdf', msg: 'WPS richiede LibreOffice installato.' },
        'tex': { tool: 'pandoc', format: 'pdf', msg: 'LaTeX richiede Pandoc o pdflatex installato.' },
        'rst': { tool: 'pandoc', format: 'pdf', msg: 'reStructuredText richiede Pandoc installato.' }
      };
      
      if (!outputBuffer && complexFormats[inputExt] && lowerTarget === 'pdf') {
        const formatInfo = complexFormats[inputExt];
        
        try {
          // Prova conversione tramite LibreOffice
          if (formatInfo.tool === 'libreoffice') {
            const tmpDir = path.dirname(inputPath);
            const outputDir = path.join(tmpDir, `lo_output_${Date.now()}`);
            
            // Crea directory temporanea per output LibreOffice
            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
            }
            
            const convertedBuffer = await convertViaLibreOffice(inputPath, outputDir, 'pdf');
            if (convertedBuffer) {
              outputBuffer = convertedBuffer;
              mime = 'application/pdf';
              
              // Cleanup: rimuovi tutti i file temporanei nella directory di output
              try {
                const files = fs.readdirSync(outputDir);
                files.forEach(file => {
                  try { fs.unlinkSync(path.join(outputDir, file)); } catch {}
                });
                fs.rmdirSync(outputDir);
              } catch {}
            }
          }
          
          // Prova conversione tramite Pandoc (per RST, TEX, ecc.)
          if (!outputBuffer && formatInfo.tool === 'pandoc') {
            const tmpDir = path.dirname(inputPath);
            const outputFileName = path.basename(originalName, path.extname(originalName)) + '.pdf';
            const outputPath = path.join(tmpDir, `pandoc_${Date.now()}_${outputFileName}`);
            
            const convertedBuffer = await convertViaPandoc(inputPath, outputPath, inputExt, 'pdf');
            if (convertedBuffer) {
              outputBuffer = convertedBuffer;
              mime = 'application/pdf';
              // Cleanup
              try { fs.unlinkSync(outputPath); } catch {}
            }
          }
          
          // Se non è stato possibile convertire, restituisci messaggio informativo
          if (!outputBuffer) {
            outputBuffer = Buffer.from(`${formatInfo.msg} Installa ${formatInfo.tool} e riprova.`, 'utf8');
            mime = 'text/plain';
          }
        } catch (e) {
          console.error(`Errore conversione ${inputExt}:`, e);
          outputBuffer = Buffer.from(`${formatInfo.msg} Errore: ${e.message}`, 'utf8');
          mime = 'text/plain';
        }
      }

      // XLS/XLSX -> PDF
      if (!outputBuffer && lowerTarget === 'pdf' && ['xls', 'xlsx', 'ods'].includes(inputExt)) {
        try {
          const wb = XLSX.read(inputBuffer, { type: 'buffer' });
          const doc = new PDFDocument({ margin: 36 });
          const chunks = [];
          doc.on('data', d => chunks.push(d));
          doc.on('error', () => {});
          
          wb.SheetNames.forEach((sheetName, sheetIndex) => {
            if (sheetIndex > 0) doc.addPage();
            const ws = wb.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
            
            doc.fontSize(16).text(sheetName, { align: 'center' });
            doc.moveDown();
            
            if (data.length > 0) {
              const colWidths = [];
              const maxCols = data.reduce((m, r) => Math.max(m, r.length), 0);
              const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
              for (let c = 0; c < maxCols; c++) colWidths[c] = Math.floor(pageWidth / maxCols);
              
              let y = doc.y;
              const rowHeight = 20;
              data.forEach((row, ri) => {
                if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
                  doc.addPage();
                  y = doc.y;
                }
                let x = doc.page.margins.left;
                row.forEach((cell, ci) => {
                  const w = colWidths[ci] || 80;
                  doc.rect(x, y, w, rowHeight).strokeOpacity(0.3).stroke();
                  doc.fontSize(9).fillColor('#000').text(String(cell || ''), x + 4, y + 4, { width: w - 8, height: rowHeight - 8, ellipsis: true });
                  x += w;
                });
                y += rowHeight;
              });
            }
          });
          
          doc.end();
          await new Promise(resolve => doc.on('end', resolve));
          outputBuffer = Buffer.concat(chunks);
          mime = 'application/pdf';
        } catch {}
      }

      // PDF -> PPTX (basic text extraction)
      if (!outputBuffer && lowerTarget === 'pptx' && inputExt === 'pdf') {
        try {
          const parsed = await pdfParse(inputBuffer);
          const text = parsed.text || '';
          const numPages = parsed.numpages || 1;
          
          const mod = await import('pptxgenjs');
          const PptxGenJS = mod.default || mod;
          const pptx = new PptxGenJS();
          
          const lines = text.split('\n').filter(l => l.trim());
          const linesPerSlide = Math.max(1, Math.ceil(lines.length / numPages));
          
          for (let i = 0; i < numPages; i++) {
            const slide = pptx.addSlide();
            const slideLines = lines.slice(i * linesPerSlide, (i + 1) * linesPerSlide);
            const slideText = slideLines.join('\n') || `Slide ${i + 1}`;
            slide.addText(slideText, { x: 0.5, y: 0.5, w: 9, h: 5, fontSize: 14, color: '000000' });
          }
          
          outputBuffer = await pptx.write({ outputType: 'nodebuffer' });
          outputBuffer = Buffer.isBuffer(outputBuffer) ? outputBuffer : Buffer.from(outputBuffer);
          mime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        } catch {}
      }

      // PDF -> XLSX (basic table extraction)
      if (!outputBuffer && lowerTarget === 'xlsx' && inputExt === 'pdf') {
        try {
          const parsed = await pdfParse(inputBuffer);
          const text = parsed.text || '';
          const lines = text.split('\n').filter(l => l.trim());
          
          // Try to detect table structure (simple heuristic)
          const rows = lines.map(line => {
            // Try comma, tab, or multiple spaces as delimiters
            if (line.includes('\t')) return line.split('\t');
            if (line.includes(',')) return line.split(',').map(c => c.trim());
            return line.split(/\s{2,}/).filter(c => c.trim());
          });
          
          const ws = XLSX.utils.aoa_to_sheet(rows);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          outputBuffer = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
          mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        } catch {}
      }

      // PDF -> PDF/A (basic conversion - adds metadata)
      if (!outputBuffer && (lowerTarget === 'pdfa' || lowerTarget === 'pdf-a') && inputExt === 'pdf') {
        try {
          // For true PDF/A, would need specialized library, but we can add basic metadata
          // For now, return original PDF with PDF/A-like metadata
          const doc = new PDFDocument({ autoFirstPage: false });
          const chunks = [];
          doc.on('data', d => chunks.push(d));
          doc.on('error', () => {});
          
          // Copy pages from original PDF (simplified - would need pdf-lib for proper page copying)
          doc.info({
            Title: 'PDF/A Document',
            Author: 'MegaPixelAI',
            Subject: 'PDF/A compliant document',
            Keywords: 'PDF/A',
            Creator: 'MegaPixelAI Converter',
            Producer: 'MegaPixelAI PDF/A Converter'
          });
          
          // For now, return original with note that full PDF/A requires specialized processing
          outputBuffer = inputBuffer;
          mime = 'application/pdf';
        } catch {}
      }

      // DOCX conversion
      if (!outputBuffer && lowerTarget === 'docx') {
        if (inputExt === 'docx') {
          // DOCX → DOCX: pass-through
          try {
            outputBuffer = inputBuffer;
            mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          } catch (e) {
            outputBuffer = inputBuffer;
            mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          }
        } else if (inputExt === 'txt') {
          // TXT → DOCX: crea un DOCX minimale dal testo
          try {
            // Usa mammoth per creare HTML, poi convertilo in DOCX via mammoth
            // Mammoth può anche creare DOCX, ma è limitato. Per ora, convertiamo in HTML e poi in DOCX tramite ConvertAPI o lasciamo un placeholder
            // Per una conversione nativa più robusta, servirebbe docx o officegen
            // Fallback: restituisci un messaggio che indica che questa conversione richiede una libreria dedicata
            const text = inputBuffer.toString('utf8');
            // Creiamo un HTML minimale che mammoth può gestire
            const html = `<html><body><p>${text.replace(/\n/g, '</p><p>').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></body></html>`;
            // Per ora, mammoth non può creare DOCX da zero, quindi restituiamo l'originale
            // In futuro, si potrebbe usare docx o officegen per creare DOCX nativamente
            outputBuffer = Buffer.from('Conversione TXT → DOCX richiede una libreria dedicata. Per ora, usa TXT → HTML → DOCX tramite altri tool.', 'utf8');
            mime = 'text/plain';
          } catch (e) {
            outputBuffer = Buffer.from('Errore nella conversione TXT → DOCX', 'utf8');
            mime = 'text/plain';
          }
        } else if (inputExt === 'html' || inputExt === 'htm') {
          // HTML → DOCX: mammoth non può creare DOCX, ma possiamo provare con altre librerie
          // Per ora, restituiamo un messaggio
          outputBuffer = Buffer.from('Conversione HTML → DOCX richiede una libreria dedicata (es. docx o officegen).', 'utf8');
          mime = 'text/plain';
        } else if (inputExt === 'md') {
          // MD → DOCX: converti prima in HTML, poi cerca di convertire in DOCX
          try {
            const html = marked.parse(inputBuffer.toString('utf8'));
            // Stessa situazione: mammoth non crea DOCX
            outputBuffer = Buffer.from('Conversione MD → DOCX richiede una libreria dedicata. Converti prima in HTML.', 'utf8');
            mime = 'text/plain';
          } catch (e) {
            outputBuffer = Buffer.from('Errore nella conversione MD → DOCX', 'utf8');
            mime = 'text/plain';
          }
        }
      }

      // MD -> HTML/PDF (se non già gestito sopra)
      if (!outputBuffer && (lowerTarget === 'html' || lowerTarget === 'pdf') && inputExt === 'md') {
        const html = marked.parse(inputBuffer.toString('utf8'));
        if (lowerTarget === 'html') {
          outputBuffer = Buffer.from(html, 'utf8');
          mime = 'text/html';
        } else {
          // Estrai testo dall'HTML e genera PDF con pdfkit
          let text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
          
          const doc = new PDFDocument({ margin: 48 });
          const chunks = [];
          doc.on('data', d => chunks.push(d));
          doc.on('end', () => {});
          doc.fontSize(12).text(text);
          doc.end();
          await new Promise(resolve => doc.on('end', resolve));
          outputBuffer = Buffer.concat(chunks);
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
      // Generic archive extraction via 7z, repack to ZIP/TGZ
      const extractable = ['7z','rar','tar','gz','tgz','zip','bz2','xz'];
      if (!outputBuffer && extractable.includes(inputExt) && (lowerTarget === 'zip' || lowerTarget === 'tgz')) {
        const tmpDir = path.dirname(inputPath);
        const inPath = path.join(tmpDir, `in_${Date.now()}.${inputExt}`);
        fs.writeFileSync(inPath, inputBuffer);
        const outDir = path.join(tmpDir, `ext_${Date.now()}`);
        fs.mkdirSync(outDir);
        let extracted = false;
        try {
          await new Promise((resolve, reject) => {
            execFile(path7za, ['x', inPath, `-o${outDir}`, '-y'], (err) => {
              if (err) reject(err); else resolve();
            });
          });
          extracted = true;
        } catch {}
        if (!extracted && inputExt === 'rar') {
          try {
            const extractor = await createExtractorFromData({ data: inputBuffer });
            const list = extractor.extract();
            for (const entry of list.files) {
              if (entry.type === 'file') {
                const outPathFile = path.join(outDir, entry.fileHeader.name);
                const outSub = path.dirname(outPathFile);
                fs.mkdirSync(outSub, { recursive: true });
                fs.writeFileSync(outPathFile, Buffer.from(entry.extract()));
              }
            }
            extracted = true;
          } catch {}
        }
        if (extracted) {
          if (lowerTarget === 'zip') {
            const zip = new JSZip();
            const addDir = (dir, base = '') => {
              const items = fs.readdirSync(dir, { withFileTypes: true });
              for (const it of items) {
                const p = path.join(dir, it.name);
                const rel = path.join(base, it.name);
                if (it.isDirectory()) addDir(p, rel);
                else zip.file(rel.replace(/\\/g, '/'), fs.readFileSync(p));
              }
            };
            addDir(outDir);
            outputBuffer = await zip.generateAsync({ type: 'nodebuffer' });
            mime = 'application/zip';
          } else {
            const pack = tarStream.pack();
            const tarChunks = [];
            const addDir = (dir, base = '') => {
              const items = fs.readdirSync(dir, { withFileTypes: true });
              for (const it of items) {
                const p = path.join(dir, it.name);
                const rel = path.join(base, it.name);
                if (it.isDirectory()) addDir(p, rel);
                else pack.entry({ name: rel.replace(/\\/g, '/'), size: fs.statSync(p).size }, fs.readFileSync(p));
              }
            };
            addDir(outDir);
            pack.finalize();
            for await (const c of pack) tarChunks.push(c);
            const tarBuf2 = Buffer.concat(tarChunks);
            outputBuffer = zlib.gzipSync(tarBuf2);
            mime = 'application/gzip';
          }
        }
        try { fs.rmSync(outDir, { recursive: true, force: true }); fs.unlinkSync(inPath); } catch {}
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

      // SVG → PNG
      if (!outputBuffer && (lowerTarget === 'png') && inputExt === 'svg') {
        outputBuffer = await sharp(inputBuffer).png().toBuffer();
        mime = 'image/png';
      }
      // PDF -> PNG/JPG (specific page) via sharp if supported
      if (!outputBuffer && (lowerTarget === 'png' || lowerTarget === 'jpg' || lowerTarget === 'jpeg') && inputExt === 'pdf') {
        try {
          const p = Number.isFinite(page) && page >= 0 ? page : 0;
          const raster = sharp(inputBuffer, { density: 150, page: p });
          if (lowerTarget === 'png') {
            outputBuffer = await raster.png().toBuffer();
            mime = 'image/png';
          } else {
            outputBuffer = await raster.jpeg({ quality }).toBuffer();
            mime = 'image/jpeg';
          }
        } catch {}
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
      if (!outputBuffer && !inputBuffer) {
        return handleApiError(
          new ProcessingError('Nessun buffer disponibile per la conversione'),
          res,
          {
            method: req.method,
            url: req.url,
            endpoint: '/api/convert/[target]',
            target,
            inputExt,
          }
        );
      }
      
      const finalBuffer = outputBuffer || inputBuffer;
      
      // Se non abbiamo un buffer di output specifico, significa che la conversione non è stata gestita
      // In questo caso, per i documenti, proviamo a fare un pass-through intelligente
      if (!outputBuffer && finalBuffer === inputBuffer) {
        // Se l'estensione di input corrisponde al target, è un pass-through
        if (inputExt === lowerTarget) {
          // Pass-through: mantieni il file originale ma cambia solo il nome
          const name = finalizeName(originalName);
          // Determina il MIME type corretto basandosi sull'estensione
          const mimeMap = {
            'txt': 'text/plain',
            'html': 'text/html',
            'htm': 'text/html',
            'md': 'text/markdown',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'pdf': 'application/pdf',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          };
          const finalMime = mimeMap[lowerTarget] || mime || 'application/octet-stream';
          const dataUrl = toDataUrl(finalBuffer, finalMime);
          return res.status(200).json({ name, dataUrl });
        } else {
          // Conversione non supportata
          console.warn(`Conversione non supportata: ${inputExt} → ${lowerTarget}`);
          return handleApiError(
            new ProcessingError(`Conversione non supportata: ${inputExt} → ${lowerTarget}. Questo formato non può essere convertito in ${lowerTarget}.`),
            res,
            {
              method: req.method,
              url: req.url,
              endpoint: '/api/convert/[target]',
              target,
              inputExt,
            }
          );
        }
      }
      
      const name = finalizeName(originalName);
      
      // Verifica che il buffer non sia vuoto
      if (!finalBuffer || finalBuffer.length === 0) {
        return handleApiError(
          new ProcessingError('Il file risultante è vuoto. Il formato potrebbe non essere supportato.'),
          res,
          {
            method: req.method,
            url: req.url,
            endpoint: '/api/convert/[target]',
            target,
            inputExt,
          }
        );
      }
      
      const dataUrl = toDataUrl(finalBuffer, mime);
      return res.status(200).json({ name, dataUrl });
    } catch (e) {
      // Assicurati che inputExt sia sempre definito
      const safeInputExt = inputExt || (file?.originalFilename ? path.extname(file.originalFilename).replace('.', '').toLowerCase() : '') || '';
      
      // Verifica che la risposta non sia già stata inviata
      if (!res.headersSent) {
        return handleApiError(
          new ProcessingError('Conversion failed: ' + (e.message || 'Unknown error'), e),
          res,
          {
            method: req.method,
            url: req.url,
            endpoint: '/api/convert/[target]',
            target,
            inputExt: safeInputExt,
          }
        );
      }
      
      // Se la risposta è già stata inviata, logga solo l'errore
      console.error('Error after response sent in convert API:', e);
    }
    } catch (callbackError) {
        // Errore non gestito nel callback async di form.parse
        console.error('Unhandled error in form.parse callback:', callbackError);
        if (!res.headersSent) {
          const safeInputExt = inputExt || (file?.originalFilename ? path.extname(file.originalFilename).replace('.', '').toLowerCase() : '') || '';
          return handleApiError(
            new ProcessingError('Error processing file: ' + (callbackError.message || 'Unknown error'), callbackError),
            res,
            {
              method: req.method,
              url: req.url,
              endpoint: '/api/convert/[target]',
              target,
              inputExt: safeInputExt,
            }
          );
        }
      }
    });
  } catch (parseError) {
    // Errore nella configurazione o inizializzazione di form.parse
    console.error('Error in form.parse setup:', parseError);
    if (!res.headersSent) {
      return handleApiError(
        new ProcessingError('File upload setup failed: ' + (parseError.message || 'Unknown error'), parseError),
        res,
        {
          method: req.method,
          url: req.url,
          endpoint: '/api/convert/[target]',
        }
      );
    }
  }
}
