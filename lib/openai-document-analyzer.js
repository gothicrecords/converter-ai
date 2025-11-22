// Analisi documenti con OpenAI File API
// Gestisce PDF, immagini, DOCX, XLSX, ecc. usando OpenAI
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analizza un documento usando OpenAI File API
 * Supporta: PDF, immagini (JPG, PNG, WEBP, GIF), DOCX, XLSX, TXT
 * 
 * @param {string} filePath - Percorso del file da analizzare
 * @param {string} filename - Nome del file originale
 * @param {string} mimeType - Tipo MIME del file
 * @param {string} question - Domanda opzionale per l'analisi (default: estrai tutto il testo)
 * @returns {Promise<{text: string, metadata: object}>}
 */
export async function analyzeDocumentWithOpenAI(filePath, filename, mimeType, question = null) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY non configurata. Configura la variabile d\'ambiente.');
  }

  try {
    // Determina il prompt in base al tipo di file
    let analysisPrompt = question || 'Estrai tutto il testo e il contenuto da questo documento. Se è un\'immagine, descrivi tutto ciò che vedi, incluso qualsiasi testo presente. Se è un documento, estrai tutto il testo mantenendo la struttura quando possibile.';
    
    // Per immagini, usa un prompt più dettagliato
    if (mimeType.startsWith('image/')) {
      analysisPrompt = question || `Analizza questa immagine in dettaglio. Descrivi:
- Tutto il testo presente (trascrivilo accuratamente)
- Oggetti, persone, scene visibili
- Colori, layout, struttura
- Qualsiasi informazione rilevante

Se c'è del testo, trascrivilo completamente e accuratamente.`;
    }

    // Per immagini, usa Vision API direttamente
    if (mimeType.startsWith('image/')) {
      const fileBuffer = fs.readFileSync(filePath);
      const base64Image = fileBuffer.toString('base64');
      const imageUrl = `data:${mimeType};base64,${base64Image}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Sei un assistente esperto nell\'analisi di immagini. Estrai e descrivi tutto il contenuto in modo accurato e completo, incluso qualsiasi testo presente. Rispondi sempre in italiano.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high' // Alta risoluzione per testo e dettagli
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.2,
      });

      const cleaned = (completion.choices[0].message.content || "").toString().trim();

      return {
        text: cleaned,
        metadata: {
          filename,
          mimeType,
          model: 'gpt-4o-vision',
          analyzedAt: new Date().toISOString(),
        }
      };
    }

    // Per documenti (PDF, DOCX, ecc.), usa Responses API
    let uploadedFile = null;
    
    try {
      console.log(`Caricando documento su OpenAI: ${filename}, tipo: ${mimeType}`);

      // 1. Carica il file
      uploadedFile = await openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: 'user_data'
      });

      console.log(`File caricato su OpenAI: ${uploadedFile.id}`);

      // 2. Analizza il file con Responses API
      const response = await openai.responses.create({
        model: 'gpt-4o',
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: analysisPrompt
              },
              {
                type: 'input_file',
                file_id: uploadedFile.id
              }
            ]
          }
        ]
      });

      const extractedText = (response.output_text || "").toString().trim();

      if (!extractedText || extractedText.length === 0) {
        throw new Error('Nessun testo estratto dal documento');
      }

      console.log(`Documento analizzato: ${extractedText.length} caratteri estratti`);

      // 3. Pulisci: elimina file
      try {
        if (uploadedFile?.id) {
          await openai.files.del(uploadedFile.id);
          console.log(`File ${uploadedFile.id} eliminato`);
        }
      } catch (cleanupError) {
        console.warn('Errore cleanup OpenAI:', cleanupError);
      }

      return {
        text: extractedText,
        metadata: {
          filename,
          mimeType,
          fileId: uploadedFile.id,
          model: 'gpt-4o',
          analyzedAt: new Date().toISOString(),
        }
      };
    } catch (analysisError) {
      console.error('Errore analisi documento:', analysisError);
      
      // Pulisci file in caso di errore
      try {
        if (uploadedFile?.id) {
          await openai.files.del(uploadedFile.id).catch(() => {});
        }
      } catch (cleanupError) {
        console.warn('Errore cleanup dopo errore:', cleanupError);
      }
      
      throw analysisError;
    }
  } catch (error) {
    console.error('Errore analisi documento con OpenAI:', error);
    
    if (error.status === 401) {
      throw new Error('Chiave API OpenAI non valida. Verifica OPENAI_API_KEY.');
    } else if (error.status === 429) {
      throw new Error('Limite di rate OpenAI raggiunto. Riprova tra qualche secondo.');
    } else if (error.message?.includes('file')) {
      throw new Error(`Errore nel caricamento del file su OpenAI: ${error.message}`);
    }
    
    throw new Error(`Errore nell'analisi del documento: ${error.message}`);
  }
}

/**
 * Analizza un documento con prompt personalizzato
 */
export async function analyzeDocumentWithCustomPrompt(filePath, filename, mimeType, customPrompt) {
  return await analyzeDocumentWithOpenAI(filePath, filename, mimeType, customPrompt);
}

