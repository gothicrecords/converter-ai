// API per caricare e analizzare documenti
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { extractTextFromDocument, storeDocument } from '../../../lib/documentAI.js';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const isVercel = Boolean(process.env.VERCEL);
    const MAX_FILE_MB = isVercel ? Number(process.env.VERCEL_MAX_MB || 9) : 200;
    const MAX_FILES = isVercel ? Number(process.env.VERCEL_MAX_FILES || 3) : 10;

    const uploadDir = path.join(process.cwd(), 'uploads', 'chat');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      // Imposta limite massimo per file in base all'ambiente
      maxFileSize: MAX_FILE_MB * 1024 * 1024,
      multiples: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const fileArray = Array.isArray(files.files) ? files.files : [files.files].filter(Boolean);
    
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }

    if (fileArray.length > MAX_FILES) {
      return res.status(400).json({
        error: `Numero massimo di file per analisi superato: ${fileArray.length} > ${MAX_FILES}`,
        details: isVercel
          ? `Limite Vercel: ${MAX_FILES} file per richiesta (riduci o usa caricamento diretto su storage).`
          : `Carica al massimo ${MAX_FILES} file per volta.`,
        limit: MAX_FILES,
      });
    }

    // Verifica dimensione file (utile per errori di payload su Vercel)
    for (const f of fileArray) {
      const size = f.size || (f.filepath && fs.existsSync(f.filepath) ? fs.statSync(f.filepath).size : 0);
      if (size > MAX_FILE_MB * 1024 * 1024) {
        return res.status(413).json({
          error: `File troppo grande: ${(size / (1024 * 1024)).toFixed(1)}MB > ${MAX_FILE_MB}MB`,
          details: isVercel
            ? `Le funzioni serverless Vercel hanno un limite di payload. Usa file più piccoli, carica direttamente su storage (Vercel Blob/S3) o esegui in ambiente non serverless.`
            : `Riduci la dimensione del file o carica meno contenuti.`,
          limitMB: MAX_FILE_MB,
        });
      }
    }

    // Processa i file in parallelo per velocità (max 3 alla volta)
    const processFile = async (file) => {
      try {
        // Leggi il file come buffer
        const buffer = fs.readFileSync(file.filepath);
        const filename = file.originalFilename || file.newFilename;
        const mimeType = file.mimetype || 'application/octet-stream';

        // Estrai testo dal documento usando pdfjs-dist, mammoth, xlsx, ecc.
        console.log(`Processing file: ${filename} (${mimeType})`);
        let text, metadata;
        try {
          const result = await extractTextFromDocument(buffer, mimeType, filename, file.filepath);
          text = result.text;
          metadata = result.metadata || {};
          console.log(`Extracted text length: ${text ? text.length : 0} characters`);
        } catch (extractError) {
          console.error(`Error extracting text from ${filename}:`, extractError);
          return {
            filename,
            success: false,
            error: `Errore estrazione testo: ${extractError.message}`,
          };
        }

        if (!text || text.trim().length === 0) {
          console.warn(`No text extracted from ${filename}`);
          return {
            filename,
            success: false,
            error: 'Nessun testo estratto dal documento',
          };
        }

        // Genera ID unico per il file
        const fileId = uuidv4();

        console.log(`Storing document ${fileId} with filename ${filename}`);
        console.log(`Text length: ${text.length} characters`);

        // Salva nello store in-memory con embeddings (async)
        const storeResult = await storeDocument(fileId, text, {
          ...metadata,
          originalFilename: filename,
          filename,
          mimeType,
          uploadedAt: new Date().toISOString(),
          size: buffer.length,
        });

        console.log(`Document ${fileId} stored in memory with ${storeResult.chunkCount} chunks and embeddings`);

        // Pulisci il file temporaneo
        try {
          fs.unlinkSync(file.filepath);
        } catch (unlinkError) {
          console.warn('Errore eliminazione file temporaneo:', unlinkError);
        }

        return {
          fileId,
          filename,
          success: true,
          wordCount: storeResult.wordCount,
          chunkCount: storeResult.chunkCount,
          pages: metadata.pages || 0,
          size: buffer.length,
        };
      } catch (fileError) {
        console.error('Errore processamento file:', fileError);
        return {
          filename: file.originalFilename || file.newFilename,
          success: false,
          error: fileError.message || 'Errore durante il processamento',
        };
      }
    };

    // Processa tutti i file (riduci concorrenza su Vercel per evitare timeout)
    const BATCH_SIZE = isVercel ? 1 : 3;
    const results = [];
    
    for (let i = 0; i < fileArray.length; i += BATCH_SIZE) {
      const batch = fileArray.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(processFile));
      results.push(...batchResults);
    }

    const successCount = results.filter(r => r.success).length;

    console.log(`Upload completed: ${successCount} successful out of ${results.length} total files`);
    console.log('Results:', JSON.stringify(results, null, 2));

    return res.status(200).json({
      success: successCount > 0,
      files: results,
      message: `${successCount} file analizzati con successo`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Errore durante il caricamento',
      details: error.message,
    });
  }
}

