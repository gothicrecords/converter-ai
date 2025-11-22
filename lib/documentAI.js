// Sistema AI completo per analisi documenti con OpenAI GPT-4
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { chatCompletion } from './openai.js';

// pdf-parse ha problemi ESM/CJS con Turbopack, usiamo solo pdfjs-dist

// Storage in-memory per i documenti caricati (in produzione si può usare database)
const documentStore = new Map(); // { fileId: { text, chunks, metadata } }

/**
 * Estrae testo da un documento
 * @param {Buffer} buffer - Buffer del file
 * @param {string} mimeType - Tipo MIME del file
 * @param {string} filename - Nome del file
 * @param {string} [filepath] - Percorso opzionale del file (utile per OCR)
 */
export async function extractTextFromDocument(buffer, mimeType, filename, filepath = null) {
  try {
    let text = '';
    let metadata = {
      filename,
      mimeType,
      pages: 0,
      wordCount: 0,
    };

    if (mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
      // PDF: usa OpenAI file upload + GPT extraction (tutto lato server OpenAI)
      const { extractTextFromPdfWithOpenAI } = await import('./openai.js');
      console.log(`Analizzando PDF con OpenAI file upload: ${filename}`);
      
      // Salva temporaneamente il file per l'upload
      const fs = await import('fs');
      const path = await import('path');
      const os = await import('os');
      
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${filename}`);
      
      try {
        // Scrivi il buffer su file temporaneo
        fs.writeFileSync(tempFilePath, buffer);
        
        // Estrai testo con OpenAI (file upload -> GPT risponde con SOLO testo)
        text = await extractTextFromPdfWithOpenAI(tempFilePath);
        
        // Assicurati che sia una stringa pulita
        text = (text || "").toString().trim();
        metadata.analysisMethod = 'openai-file-upload';
        
        if (!text || text.length === 0) {
          throw new Error('Nessun testo estratto dal PDF tramite OpenAI');
        }
        
        console.log(`PDF analizzato con OpenAI: ${text.length} caratteri estratti`);
      } finally {
        // Pulisci file temporaneo
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (cleanupError) {
          console.warn('Errore pulizia file temporaneo:', cleanupError);
        }
      }
    }
    else if (mimeType.includes('wordprocessingml') || filename.toLowerCase().endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      
      // Pulisci il testo
      text = text.replace(/\s+/g, ' ').trim();
    }
    else if (mimeType.includes('spreadsheet') || filename.toLowerCase().match(/\.(xlsx|xls|csv)$/i)) {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheets = workbook.SheetNames;
      
      // Estrai testo da tutte le celle
      const allText = [];
      for (const sheetName of sheets) {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        
        for (const row of sheetData) {
          if (Array.isArray(row)) {
            const rowText = row.filter(cell => cell && cell.toString().trim()).join(' ');
            if (rowText.trim()) {
              allText.push(`[${sheetName}] ${rowText}`);
            }
          }
        }
      }
      
      text = allText.join('\n');
    }
    else if (mimeType.startsWith('text/') || filename.toLowerCase().endsWith('.txt')) {
      text = buffer.toString('utf-8');
    }
    else if (mimeType.startsWith('image/') || filename.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp|bmp)$/i)) {
      // Usa OpenAI Vision API come ChatGPT (più intelligente) + OCR come fallback
      try {
        const { analyzeImageWithVision } = await import('./openai.js');
        console.log(`Analizzando immagine con OpenAI Vision API: ${filename}`);
        
        try {
          // Prova prima con OpenAI Vision API (come ChatGPT)
          const visionText = await analyzeImageWithVision(
            buffer, 
            mimeType,
            'Analizza questa immagine in dettaglio. Descrivi tutto ciò che vedi, incluso qualsiasi testo presente, oggetti, persone, scene, colori e dettagli rilevanti. Se c\'è del testo, trascrivilo accuratamente.'
          );
          
          text = visionText;
          console.log(`Vision API completato: ${text.length} caratteri estratti`);
          
          // Aggiungi metadata per indicare che è stato usato Vision API
          metadata.analysisMethod = 'openai-vision';
        } catch (visionError) {
          console.log('Vision API fallito, provo con OCR:', visionError.message);
          
          // Fallback a OCR tradizionale
          const Tesseract = (await import('tesseract.js')).default;
          const imageSource = filepath || buffer;
          
          try {
            const result = await Tesseract.recognize(imageSource, 'ita+eng', {
              logger: (m) => {
                if (m.status === 'recognizing text') {
                  console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
              }
            });
            
            text = result.data.text.trim();
            metadata.analysisMethod = 'ocr-tesseract';
          } catch (ocrError) {
            // Se anche OCR fallisce, prova con createWorker
            console.log('OCR semplice fallito, provo con createWorker:', ocrError.message);
            
            const worker = await Tesseract.createWorker('ita+eng', 1, {
              logger: (m) => {
                if (m.status === 'recognizing text') {
                  console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
              }
            });
            
            try {
              const result = await worker.recognize(imageSource);
              text = result.data.text.trim();
              metadata.analysisMethod = 'ocr-tesseract-worker';
            } finally {
              await worker.terminate();
            }
          }
        }
        
        if (!text || text.length === 0) {
          throw new Error('Nessun contenuto estratto dall\'immagine. L\'immagine potrebbe essere vuota o non contenere testo leggibile.');
        }
        
        console.log(`Analisi immagine completata: ${text.length} caratteri estratti (metodo: ${metadata.analysisMethod || 'unknown'})`);
      } catch (imageError) {
        console.error('Errore analisi immagine completo:', imageError);
        throw new Error(`Errore nell'analisi dell'immagine: ${imageError.message}`);
      }
    }
    else {
      throw new Error(`Tipo di file non supportato: ${mimeType}`);
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Nessun testo estratto dal documento');
    }

    metadata.wordCount = text.split(/\s+/).length;

    return { text, metadata };
  } catch (error) {
    console.error('Errore estrazione testo:', error);
    throw new Error(`Errore nell'estrazione del testo: ${error.message}`);
  }
}

/**
 * Divide il testo in chunk intelligenti per la ricerca semantica
 * Genera anche embeddings per ogni chunk (ricerca semantica vera)
 */
export async function createTextChunks(text, chunkSize = 1000, overlap = 200) {
  const sentences = text.split(/[.!?]+\s+/).filter(s => s.trim().length > 10);
  const chunks = [];
  
  let currentChunk = '';
  let currentLength = 0;

  for (const sentence of sentences) {
    const sentenceLength = sentence.length;
    
    if (currentLength + sentenceLength > chunkSize && currentChunk.trim()) {
      // Salva il chunk corrente
      chunks.push({
        text: currentChunk.trim(),
        startIndex: text.indexOf(currentChunk.trim()),
        endIndex: text.indexOf(currentChunk.trim()) + currentChunk.length,
      });

      // Crea nuovo chunk con overlap (ultime parole del chunk precedente)
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(overlap / 10));
      currentChunk = overlapWords.join(' ') + ' ' + sentence + ' ';
      currentLength = currentChunk.length;
    } else {
      currentChunk += sentence + '. ';
      currentLength += sentenceLength + 2;
    }
  }

  // Aggiungi l'ultimo chunk
  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      startIndex: text.indexOf(currentChunk.trim()),
      endIndex: text.length,
    });
  }

  const finalChunks = chunks.length > 0 ? chunks : [{ text: text.trim(), startIndex: 0, endIndex: text.length }];
  
  // Genera embeddings per ogni chunk (ricerca semantica)
  const { generateEmbedding } = await import('./openai.js');
  
  for (const chunk of finalChunks) {
    try {
      chunk.embedding = await generateEmbedding(chunk.text);
    } catch (embError) {
      console.warn('Errore generazione embedding per chunk:', embError);
      chunk.embedding = null; // Fallback a ricerca TF-IDF se embedding fallisce
    }
  }
  
  return finalChunks;
}

/**
 * Calcola cosine similarity tra due vettori di embedding
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  
  return dot / (magA * magB);
}

/**
 * Calcola TF-IDF per ricerca semantica semplice (fallback se embedding non disponibile)
 */
function calculateTFIDF(text, query) {
  const textWords = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  
  if (queryWords.length === 0) return 0;

  let score = 0;
  const textWordCount = {};
  textWords.forEach(word => {
    textWordCount[word] = (textWordCount[word] || 0) + 1;
  });

  queryWords.forEach(queryWord => {
    const wordCount = textWordCount[queryWord] || 0;
    if (wordCount > 0) {
      // TF: frequenza del termine nel documento
      const tf = wordCount / textWords.length;
      // IDF: inversa della frequenza (più raro = più importante)
      const idf = Math.log(textWords.length / (wordCount + 1)) + 1;
      score += tf * idf;
    }
  });

  return score / queryWords.length;
}

/**
 * Ricerca semantica nel documento usando embeddings (cosine similarity)
 * Fallback a TF-IDF se embeddings non disponibili
 */
export async function semanticSearch(documentText, chunks, query, topK = 5) {
  if (!chunks || chunks.length === 0) {
    return [];
  }

  // Genera embedding per la query
  const { generateEmbedding } = await import('./openai.js');
  let queryEmbedding = null;
  
  try {
    queryEmbedding = await generateEmbedding(query);
  } catch (embError) {
    console.warn('Errore generazione embedding query, uso TF-IDF:', embError);
  }

  // Calcola score per ogni chunk
  const scoredChunks = chunks.map((chunk, index) => {
    let semanticScore = 0;
    
    // Usa cosine similarity se embeddings disponibili
    if (queryEmbedding && chunk.embedding) {
      semanticScore = cosineSimilarity(queryEmbedding, chunk.embedding);
    } else {
      // Fallback a TF-IDF
      semanticScore = calculateTFIDF(chunk.text, query) / 10; // Normalizza per essere simile a cosine
    }
    
    // Bonus per match esatti
    const lowerChunk = chunk.text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let exactMatchBonus = 0;
    if (lowerChunk.includes(lowerQuery)) {
      exactMatchBonus = 0.1;
    }
    
    // Bonus per parole chiave comuni
    const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const matchingWords = queryWords.filter(word => lowerChunk.includes(word)).length;
    const keywordBonus = (matchingWords / queryWords.length) * 0.05;

    const totalScore = semanticScore + exactMatchBonus + keywordBonus;

    return {
      ...chunk,
      score: totalScore,
      index,
    };
  });

  // Ordina per score e ritorna i top K (anche con score bassi)
  const sortedChunks = scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  
  console.log('Top chunk scores:', sortedChunks.map(c => c.score.toFixed(4)));
  
  // Ritorna anche risultati con score bassi (meglio di niente)
  return sortedChunks.filter(chunk => chunk.score >= 0);
}

/**
 * Genera risposta intelligente basata sul contenuto del documento usando OpenAI GPT-4
 * @param {string} query - Domanda dell'utente
 * @param {Array} relevantChunks - Chunk rilevanti dal documento
 * @param {string} documentText - Testo completo del documento
 * @param {string} conversationContext - Contesto della conversazione (opzionale)
 */
export async function generateAnswer(query, relevantChunks, documentText, conversationContext = '', documentMetadata = {}) {
  if (!relevantChunks || relevantChunks.length === 0) {
    return {
      answer: "Non ho trovato informazioni rilevanti nel documento per rispondere alla tua domanda. Prova a formulare la domanda in modo diverso o carica un documento più pertinente.",
      confidence: 0,
      sources: [],
    };
  }

  // Combina i chunk più rilevanti - SOLO TESTO (no oggetti, no IDs)
  const combinedContext = relevantChunks
    .map((chunk, idx) => `[Sezione ${idx + 1}]\n${chunk.text}`)
    .join('\n\n---\n\n');

  // Usa OpenAI GPT-4 per generare una risposta intelligente
  const confidence = Math.min(relevantChunks[0].score * 10, 1.0);
  
  try {
    // Costruisci il prompt con contesto della conversazione se disponibile
    let contextSection = '';
    if (conversationContext && conversationContext.trim()) {
      contextSection = `\n\n**CONTESTO DELLA CONVERSAZIONE PRECEDENTE:**
${conversationContext}

Usa questo contesto per capire meglio la domanda e fornire una risposta coerente con la conversazione.`;
    }

    const messages = [
      {
        role: 'system',
        content: `Sei un assistente AI esperto nell'analisi di documenti. Segui un ragionamento interno SILENTE (non mostrarlo) con i passi: 1) Identifica concetti chiave 2) Seleziona parti rilevanti 3) Sintetizza relazioni 4) Verifica contraddizioni o assenze 5) Struttura risposta finale. Poi produci SOLO l'output formattato.

OBIETTIVI:
1. Analisi accurata delle sezioni fornite
2. Risposta logica e coerente basata esclusivamente sul contenuto
3. Struttura chiara e professionale in italiano
4. Citazione delle fonti/Sezioni rilevanti
5. Nessuna invenzione: se manca l'informazione, dichiaralo e suggerisci cosa servirebbe

FORMATTA LA RISPOSTA CON LE SEZIONI (usa markdown semplice):
**Risposta**: sintesi principale diretta alla domanda.
**Dettagli**: approfondisci punti chiave organizzati.
**Fonti**: elenco puntato con sezione e breve estratto.
**Limiti**: cosa non è presente o ambiguo.
**Suggerimenti**: eventuali passi successivi o chiarimenti da richiedere.

Regole:
- Non includere il ragionamento interno.
- Non scusarti a meno che il contenuto sia realmente assente.
- Mantieni tono professionale, conciso ma completo.`
      },
      {
        role: 'user',
        content: `Analizza il seguente contenuto estratto dal documento e rispondi alla domanda dell'utente in modo completo e accurato.

**CONTENUTO DEL DOCUMENTO:**
${combinedContext}${contextSection}

**DOMANDA DELL'UTENTE:**
${query}

**ISTRUZIONI:**
- Rispondi basandoti SOLO sul contenuto fornito sopra
- Se la risposta richiede informazioni non presenti, dillo chiaramente
- Cita o fai riferimento alle sezioni rilevanti quando possibile
- Fornisci una risposta completa e ben strutturata
- Considera il contesto della conversazione se fornito per una risposta più pertinente`
      }
    ];
    
    let answer = await chatCompletion(messages, {
      model: 'gpt-4o-mini', // Modello veloce e economico
      temperature: 0.2, // Bassa temperatura per risposte più accurate e consistenti
      max_tokens: 1200, // Aumentato per risposte più complete
      top_p: 0.9,
      frequency_penalty: 0.1, // Riduce ripetizioni
      presence_penalty: 0.1 // Incentiva varietà
    });
    answer = answer.trim();
    // Post-processing: se il modello ha prodotto solo una frase debole/apologetica, arricchisci con estratti
    const isWeak = /mi dispiace|non posso/i.test(answer) && answer.length < 120;
    if (isWeak) {
      const enriched = `**Risposta**: Informazioni limitate nel testo fornito.
**Dettagli**:\n${relevantChunks.slice(0,3).map(c=>'- '+c.text.substring(0,200).replace(/\n+/g,' ')+ (c.text.length>200?'...':'' )).join('\n')}\n**Fonti**:\n${relevantChunks.map((c,i)=>`- Sezione ${i+1} (score ${c.score.toFixed(3)})`).join('\n')}\n**Limiti**: Il documento sembra contenere testo estremamente breve o generico.\n**Suggerimenti**: Carica un documento più esteso oppure specifica meglio la domanda.`;
      answer = enriched;
    }
    return {
      answer,
      confidence,
      sources: relevantChunks.map(c => ({
        filename: documentMetadata?.originalFilename || documentMetadata?.filename || 'Documento',
        text: c.text.substring(0, 150) + '...',
        score: c.score.toFixed(3),
      })),
    };
  } catch (error) {
    console.error('Errore nella generazione della risposta con OpenAI:', error);
    // Fallback a risposta semplice se OpenAI fallisce
    const contextText = relevantChunks[0].text;
    return {
      answer: `Basandomi sul documento:\n\n${contextText}\n\n${relevantChunks.length > 1 ? '\nInformazioni aggiuntive:\n' + relevantChunks.slice(1, 3).map((c, i) => `• ${c.text.substring(0, 200)}...`).join('\n') : ''}`,
      confidence,
      sources: relevantChunks.map(c => ({
        filename: documentMetadata?.originalFilename || documentMetadata?.filename || 'Documento',
        text: c.text.substring(0, 150) + '...',
        score: c.score.toFixed(3),
      })),
    };
  }
}

/**
 * Salva documento nello storage (con embeddings per ricerca semantica)
 */
export async function storeDocument(fileId, text, metadata = {}) {
  console.log(`storeDocument called for ${fileId}, text length: ${text.length}`);
  
  const chunks = await createTextChunks(text);
  
  console.log(`Created ${chunks.length} chunks for document ${fileId}`);
  
  const documentData = {
    text,
    chunks,
    metadata: {
      ...metadata,
      filename: metadata.filename || metadata.originalFilename || 'Unknown',
      storedAt: new Date().toISOString(),
      chunkCount: chunks.length,
    },
  };
  
  documentStore.set(fileId, documentData);
  
  console.log(`Document ${fileId} stored. Store size now: ${documentStore.size}`);
  console.log(`Store keys:`, Array.from(documentStore.keys()));

  return {
    fileId,
    chunkCount: chunks.length,
    wordCount: text.split(/\s+/).length,
  };
}

/**
 * Recupera documento dallo storage
 */
export function getDocument(fileId) {
  return documentStore.get(fileId);
}

/**
 * Rimuovi documento dallo storage
 */
export function removeDocument(fileId) {
  return documentStore.delete(fileId);
}

/**
 * Cerca in tutti i documenti (async per embeddings)
 */
export async function searchAllDocuments(query, fileIds = null) {
  console.log('searchAllDocuments called with query:', query, 'fileIds:', fileIds);
  console.log('documentStore size:', documentStore.size);
  console.log('documentStore keys:', Array.from(documentStore.keys()));
  
  const documents = fileIds && fileIds.length > 0
    ? fileIds.map(id => {
        const data = documentStore.get(id);
        console.log(`Looking for fileId ${id}:`, data ? 'found' : 'NOT FOUND');
        return { id, data };
      }).filter(d => d.data)
    : Array.from(documentStore.entries()).map(([id, data]) => {
        console.log(`Document ${id}:`, data ? 'found' : 'NOT FOUND');
        return { id, data };
      });

  console.log(`Found ${documents.length} documents to search`);

  if (documents.length === 0) {
    console.log('No documents found to search in');
    return [];
  }

  const allResults = [];

  for (const { id, data } of documents) {
    if (!data || !data.chunks || !data.chunks.length) {
      console.log(`Document ${id} has no chunks, skipping`);
      continue;
    }

    console.log(`Searching in document ${id} (${data.chunks.length} chunks)`);
    const results = await semanticSearch(data.text, data.chunks, query, 5);
    
    if (results.length > 0) {
      console.log(`Found ${results.length} relevant chunks in document ${id}`);
      allResults.push({
        fileId: id,
        filename: data.metadata?.originalFilename || data.metadata?.filename || 'Unknown',
        results,
        topScore: results[0].score,
      });
    } else {
      console.log(`No relevant chunks found in document ${id}`);
    }
  }

  console.log(`Total search results: ${allResults.length}`);

  // Ordina per score migliore
  return allResults.sort((a, b) => b.topScore - a.topScore);
}

/**
 * Genera risposta combinando risultati da più documenti usando OpenAI
 * @param {string} query - Domanda dell'utente
 * @param {Array} searchResults - Risultati della ricerca nei documenti
 * @param {string} conversationContext - Contesto della conversazione (opzionale)
 */
export async function generateMultiDocumentAnswer(query, searchResults, conversationContext = '') {
  if (!searchResults || searchResults.length === 0) {
    return {
      answer: "Non ho trovato informazioni rilevanti nei documenti caricati. Prova a formulare la domanda in modo diverso o carica documenti più pertinenti.",
      confidence: 0,
      sources: [],
    };
  }

  // Prendi i chunk migliori da tutti i documenti
  const topChunks = searchResults
    .flatMap(fileResult => 
      fileResult.results.map(r => ({
        ...r,
        filename: fileResult.filename,
        fileId: fileResult.fileId,
      }))
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (topChunks.length === 0) {
    return {
      answer: "Non ho trovato informazioni sufficienti per rispondere.",
      confidence: 0,
      sources: [],
    };
  }

  // Genera risposta combinata usando OpenAI
  const primaryChunk = topChunks[0];
  const document = getDocument(primaryChunk.fileId);
  
  if (searchResults.length === 1) {
    // Un solo documento - usa generateAnswer con metadata per filename
    return await generateAnswer(query, topChunks, document.text, conversationContext, document.metadata || {});
  } else {
    // Multiple documenti - combina informazioni da più fonti
    const confidence = Math.min(primaryChunk.score * 10, 1.0);
    
    try {
      // Combina SOLO testo dai documenti (no file IDs, no oggetti)
      const combinedContext = topChunks
        .map((chunk, idx) => `[Documento: "${chunk.filename}" - Sezione ${idx + 1}]\n${chunk.text}`)
        .join('\n\n---\n\n');
      
      // Costruisci il prompt con contesto della conversazione se disponibile
      let contextSection = '';
      if (conversationContext && conversationContext.trim()) {
        contextSection = `\n\n**CONTESTO DELLA CONVERSAZIONE PRECEDENTE:**
${conversationContext}

Usa questo contesto per capire meglio la domanda e fornire una risposta coerente con la conversazione.`;
      }

      const messages = [
        {
          role: 'system',
          content: `Sei un assistente AI esperto nell'analisi di documenti multipli. Usa ragionamento interno SILENTE (non mostrarlo) seguendo: 1) Mappa concetti per documento 2) Trova sovrapposizioni/contrasti 3) Sintetizza 4) Valuta completezza 5) Struttura output. Non mostrare i passi.

FORMATTA OUTPUT:
**Risposta** (sintesi diretta alla domanda)
**Analisi** (integrazione logica tra documenti, relazioni, eventuali differenze)
**Fonti** (elenco: Documento – breve estratto pertinente)
**Limiti** (informazioni mancanti, contraddizioni non risolte)
**Suggerimenti** (cosa potrebbe aiutare o prossimi passi)

Regole:
- Non inventare contenuto
- Non scusarti salvo assenza totale di informazioni
- Cita il nome del documento per ogni informazione specifica
- Indica contraddizioni se presenti.`
        },
        {
          role: 'user',
          content: `Analizza il contenuto estratto da ${searchResults.length} documenti diversi e rispondi alla domanda dell'utente sintetizzando le informazioni rilevanti.

**CONTENUTO DAI DOCUMENTI:**
${combinedContext}${contextSection}

**DOMANDA DELL'UTENTE:**
${query}

**ISTRUZIONI:**
- Combina informazioni da tutti i documenti rilevanti
- Cita sempre il nome del documento quando fai riferimento a informazioni specifiche
- Se ci sono informazioni correlate in più documenti, integrale in modo coerente
- Fornisci una risposta completa che risponda alla domanda utilizzando tutte le fonti pertinenti
- Considera il contesto della conversazione se fornito per una risposta più pertinente`
        }
      ];
      
      let answer = await chatCompletion(messages, {
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 1500, // Aumentato per risposte multi-documento più complete
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });
      answer = answer.trim();
      const isWeak = /mi dispiace|non posso/i.test(answer) && answer.length < 140;
      if (isWeak) {
        const enrichment = topChunks.slice(0,5).map((c,i)=>`- ${c.filename} [score ${c.score.toFixed(3)}]: ${c.text.substring(0,160).replace(/\n+/g,' ')}${c.text.length>160?'...':''}`).join('\n');
        answer = `**Risposta**: Informazioni limitate ma estratte dai documenti.
**Analisi**: I contenuti disponibili sono molto brevi; non emergono argomentazioni complesse.
**Fonti**:\n${enrichment}
**Limiti**: Poca profondità; serve testo aggiuntivo.
**Suggerimenti**: Carica versioni più complete dei documenti o specifica una domanda più dettagliata.`;
      }
      return {
        answer,
        confidence,
        sources: topChunks.slice(0, 3).map(c => ({
          filename: c.filename,
          text: c.text.substring(0, 100) + '...',
          score: c.score.toFixed(3),
        })),
      };
    } catch (error) {
      console.error('Errore nella generazione della risposta multi-documento con OpenAI:', error);
      // Fallback
      let answer = `Basandomi sui ${searchResults.length} documenti caricati:\n\n`;
      answer += `**Dal documento "${primaryChunk.filename}":**\n${primaryChunk.text}\n\n`;
      
      if (topChunks.length > 1) {
        const otherDocs = topChunks.slice(1, 3).filter(c => c.fileId !== primaryChunk.fileId);
        if (otherDocs.length > 0) {
          answer += `**Informazioni correlate da altri documenti:**\n`;
          otherDocs.forEach((chunk, idx) => {
            answer += `\n[${idx + 1}] Da "${chunk.filename}":\n${chunk.text.substring(0, 200)}...\n`;
          });
        }
      }
      
      const confidence = Math.min(primaryChunk.score * 10, 1.0);
      
      return {
        answer: answer.trim(),
        confidence,
        sources: topChunks.slice(0, 3).map(c => ({
          filename: c.filename,
          text: c.text.substring(0, 100) + '...',
          score: c.score.toFixed(3),
        })),
      };
    }
  }
}

/**
 * Ottieni tutti i documenti con i loro ID
 */
export function getAllDocuments() {
  return Array.from(documentStore.entries()).map(([fileId, doc]) => ({
    fileId,
    ...doc
  }));
}

/**
 * Ottieni statistiche sui documenti caricati
 */
export function getDocumentStats() {
  const documents = Array.from(documentStore.values());
  
  return {
    totalDocuments: documentStore.size,
    totalWords: documents.reduce((sum, doc) => sum + (doc.text.split(/\s+/).length || 0), 0),
    totalChunks: documents.reduce((sum, doc) => sum + (doc.chunks?.length || 0), 0),
    documents: Array.from(documentStore.entries()).map(([fileId, doc]) => ({
      fileId,
      index: Array.from(documentStore.keys()).indexOf(fileId),
      filename: doc.metadata?.filename || doc.metadata?.originalFilename || 'Unknown',
      wordCount: doc.text.split(/\s+/).length,
      chunkCount: doc.chunks?.length || 0,
      storedAt: doc.metadata?.storedAt,
    })),
  };
}

