// API per caricare e analizzare documenti
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { extractTextFromDocument, storeDocument, getDocument, getDocumentStats } from '../../../lib/documentAI';
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
    const uploadDir = path.join(process.cwd(), 'uploads', 'chat');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
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

    // Processa i file in parallelo per velocità
    const processFile = async (file) => {
      try {
        // Leggi il file come buffer
        const buffer = fs.readFileSync(file.filepath);
        const filename = file.originalFilename || file.newFilename;
        const mimeType = file.mimetype || 'application/octet-stream';

        // Estrai testo dal documento
        console.log(`Processing file: ${filename} (${mimeType})`);
        let text, metadata;
        try {
          // Passa anche il filepath per le immagini (più efficiente per OCR)
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

        // Salva nel sistema
        const stored = storeDocument(fileId, text, {
          ...metadata,
          filename: filename, // Aggiungi anche filename per compatibilità
          originalFilename: filename,
          mimeType,
          uploadedAt: new Date().toISOString(),
          size: buffer.length,
        });

        console.log(`Document ${fileId} stored successfully. Chunks: ${stored.chunkCount}, Words: ${stored.wordCount}`);

        // Verifica che sia stato salvato
        const savedDoc = getDocument(fileId);
        const stats = getDocumentStats();
        
        console.log(`Verification - Document ${fileId} exists:`, savedDoc ? 'YES' : 'NO');
        console.log(`Total documents in store: ${stats.totalDocuments}`);
        console.log(`Document text length: ${savedDoc ? savedDoc.text.length : 0}`);
        console.log(`Document chunks: ${savedDoc ? savedDoc.chunks.length : 0}`);
        
        // Verifica doppia: se il documento non è stato salvato, prova a salvarlo di nuovo
        if (!savedDoc) {
          console.warn(`⚠️ Document ${fileId} not found after storage, attempting to re-save...`);
          const reStored = storeDocument(fileId, text, {
            ...metadata,
            filename: filename,
            originalFilename: filename,
            mimeType,
            uploadedAt: new Date().toISOString(),
            size: buffer.length,
          });
          console.log(`Re-stored document:`, reStored);
          
          // Verifica di nuovo
          const reSavedDoc = getDocument(fileId);
          if (!reSavedDoc) {
            console.error(`❌ CRITICAL: Document ${fileId} still not found after re-save!`);
            throw new Error(`Errore critico: documento non salvato correttamente nello store`);
          }
          console.log(`✅ Document re-saved successfully`);
        }

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
          wordCount: stored.wordCount,
          chunkCount: stored.chunkCount,
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

    // Processa tutti i file in parallelo (fino a 5 alla volta per non sovraccaricare)
    const BATCH_SIZE = 5;
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

