// Sistema AI completo per analisi documenti con OpenAI GPT-4
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { chatCompletion } from './openai.js';

// pdf-parse disabilitato: problemi ESM/CJS con Turbopack; usiamo solo pdfjs-dist

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
      // Usa pdf-parse per Node.js (più compatibile) o pdfjs-dist con polyfill
      try {
        // Prova prima con pdf-parse (più semplice e compatibile con Node.js)
        try {
          const pdfParse = (await import('pdf-parse')).default;
          const pdfData = await pdfParse(buffer);
          text = pdfData.text;
          metadata.pages = pdfData.numpages || 0;
          
          if (!text || text.trim().length === 0) {
            throw new Error('Nessun testo estratto dal PDF');
          }
          
          // Pulisci il testo
          text = text.replace(/\s+/g, ' ').trim();
        } catch (pdfParseError) {
          // Fallback a pdfjs-dist con configurazione Node.js
          console.log('pdf-parse fallito, provo con pdfjs-dist:', pdfParseError.message);
          
          // Configura pdfjs-dist per Node.js
          const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
          
          // Imposta il worker per Node.js (non necessario per estrazione testo)
          // pdfjsLib.GlobalWorkerOptions.workerSrc = null; // Disabilita worker in Node.js
          
          const getDocument = pdfjsLib.getDocument;
          if (!getDocument) {
            throw new Error('pdfjs-dist getDocument non disponibile');
          }
          
          // Usa la versione Node.js-friendly
          const loadingTask = getDocument({
            data: buffer,
            useSystemFonts: true,
            verbosity: 0, // Riduce i log
          });
          
          const pdf = await loadingTask.promise;
          metadata.pages = pdf.numPages || 0;
          
          // Estrai testo da tutte le pagine in parallelo per velocità
          const pagePromises = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            pagePromises.push(
              pdf.getPage(i).then(page => 
                page.getTextContent().then(content => {
                  const strings = (content.items || []).map((item) => (item.str || ''));
                  return { pageNum: i, text: strings.join(' ') };
                })
              )
            );
          }
          
          const pageResults = await Promise.all(pagePromises);
          const combinedText = pageResults
            .sort((a, b) => a.pageNum - b.pageNum)
            .map(p => p.text)
            .join('\n');
          text = (combinedText || '').replace(/\s+/g, ' ').trim();
          
          if (!text || text.length === 0) {
            throw new Error('Nessun testo estratto dal PDF');
          }
        }
      } catch (pdfError) {
        console.error('Errore estrazione PDF completo:', pdfError);
        throw new Error(`Errore nell'estrazione del testo PDF: ${pdfError.message}`);
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
      // Usa OCR per estrarre testo dalle immagini
      try {
        const Tesseract = (await import('tesseract.js')).default;
        console.log(`Eseguendo OCR su immagine: ${filename}`);
        
        // Usa filepath se disponibile (più efficiente), altrimenti usa il buffer
        const imageSource = filepath || buffer;
        
        // Prova prima con il metodo semplice (più veloce)
        try {
          const result = await Tesseract.recognize(imageSource, 'ita+eng', {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
              }
            }
          });
          
          text = result.data.text.trim();
        } catch (simpleError) {
          // Se il metodo semplice fallisce, prova con createWorker
          console.log('Metodo semplice fallito, provo con createWorker:', simpleError.message);
          
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
          } finally {
            // Termina il worker per liberare risorse
            await worker.terminate();
          }
        }
        
        if (!text || text.length === 0) {
          throw new Error('Nessun testo trovato nell\'immagine. Assicurati che l\'immagine contenga testo leggibile.');
        }
        
        console.log(`OCR completato: ${text.length} caratteri estratti`);
      } catch (ocrError) {
        console.error('Errore OCR completo:', ocrError);
        throw new Error(`Errore OCR sull'immagine: ${ocrError.message}`);
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
 */
export function createTextChunks(text, chunkSize = 1000, overlap = 200) {
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

  return chunks.length > 0 ? chunks : [{ text: text.trim(), startIndex: 0, endIndex: text.length }];
}

/**
 * Calcola TF-IDF per ricerca semantica semplice
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
 * Ricerca semantica nel documento
 */
export function semanticSearch(documentText, chunks, query, topK = 5) {
  if (!chunks || chunks.length === 0) {
    return [];
  }

  // Calcola score per ogni chunk
  const scoredChunks = chunks.map((chunk, index) => {
    const tfidfScore = calculateTFIDF(chunk.text, query);
    
    // Bonus per match esatti
    const lowerChunk = chunk.text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let exactMatchBonus = 0;
    if (lowerChunk.includes(lowerQuery)) {
      exactMatchBonus = 0.5;
    }
    
    // Bonus per parole chiave comuni
    const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const matchingWords = queryWords.filter(word => lowerChunk.includes(word)).length;
    const keywordBonus = (matchingWords / queryWords.length) * 0.3;

    const totalScore = tfidfScore + exactMatchBonus + keywordBonus;

    return {
      ...chunk,
      score: totalScore,
      index,
    };
  });

  // Ordina per score e ritorna i top K
  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(chunk => chunk.score > 0);
}

/**
 * Genera risposta intelligente basata sul contenuto del documento usando OpenAI GPT-4
 * @param {string} query - Domanda dell'utente
 * @param {Array} relevantChunks - Chunk rilevanti dal documento
 * @param {string} documentText - Testo completo del documento
 * @param {string} conversationContext - Contesto della conversazione (opzionale)
 */
export async function generateAnswer(query, relevantChunks, documentText, conversationContext = '') {
  if (!relevantChunks || relevantChunks.length === 0) {
    return {
      answer: "Non ho trovato informazioni rilevanti nel documento per rispondere alla tua domanda. Prova a formulare la domanda in modo diverso o carica un documento più pertinente.",
      confidence: 0,
      sources: [],
    };
  }

  // Combina i chunk più rilevanti
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
        content: `Sei un assistente AI esperto nell'analisi di documenti. Il tuo compito è:

1. **Analizzare il contenuto**: Leggi attentamente le sezioni del documento fornite
2. **Rispondere con precisione**: Basati ESCLUSIVAMENTE sul contenuto fornito, senza inventare informazioni
3. **Essere completo**: Fornisci risposte dettagliate e ben strutturate
4. **Citare le fonti**: Quando possibile, fai riferimento alle parti specifiche del documento
5. **Essere onesto**: Se le informazioni non sono presenti, dillo esplicitamente
6. **Linguaggio naturale**: Rispondi in modo chiaro, professionale e in italiano (a meno che l'utente non chieda diversamente)
7. **Coerenza conversazionale**: Considera il contesto della conversazione precedente per risposte più pertinenti

IMPORTANTE:
- Non inventare informazioni che non sono nel documento
- Se la domanda richiede informazioni non presenti, suggerisci cosa potrebbe essere utile
- Usa un linguaggio chiaro e accessibile
- Struttura le risposte con paragrafi e punti elenco quando appropriato
- Se c'è un contesto conversazionale, usalo per capire meglio l'intento della domanda`
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
    
    const answer = await chatCompletion(messages, {
      model: 'gpt-4o-mini', // Modello veloce e economico
      temperature: 0.2, // Bassa temperatura per risposte più accurate e consistenti
      max_tokens: 1200, // Aumentato per risposte più complete
      top_p: 0.9,
      frequency_penalty: 0.1, // Riduce ripetizioni
      presence_penalty: 0.1 // Incentiva varietà
    });

    return {
      answer: answer.trim(),
      confidence,
      sources: relevantChunks.map(c => ({
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
        text: c.text.substring(0, 150) + '...',
        score: c.score.toFixed(3),
      })),
    };
  }
}

/**
 * Salva documento nello storage
 */
export function storeDocument(fileId, text, metadata = {}) {
  console.log(`storeDocument called for ${fileId}, text length: ${text.length}`);
  
  const chunks = createTextChunks(text);
  
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
 * Cerca in tutti i documenti
 */
export function searchAllDocuments(query, fileIds = null) {
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
    const results = semanticSearch(data.text, data.chunks, query, 5);
    
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
    // Un solo documento - usa generateAnswer
    return await generateAnswer(query, topChunks, document.text, conversationContext);
  } else {
    // Multiple documenti - combina informazioni da più fonti
    const confidence = Math.min(primaryChunk.score * 10, 1.0);
    
    try {
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
          content: `Sei un assistente AI esperto nell'analisi di documenti multipli. Il tuo compito è:

1. **Sintetizzare informazioni**: Combina informazioni da DIVERSI documenti per rispondere in modo completo
2. **Citare le fonti**: Indica sempre da quale documento proviene ogni informazione (es: "Secondo il documento 'X'...")
3. **Trovare connessioni**: Identifica relazioni e pattern tra i documenti quando rilevanti
4. **Essere completo**: Fornisci una risposta che integri le informazioni da tutti i documenti pertinenti
5. **Essere preciso**: Basati SOLO sul contenuto fornito, senza inventare informazioni
6. **Linguaggio chiaro**: Rispondi in italiano in modo professionale e ben strutturato
7. **Coerenza conversazionale**: Considera il contesto della conversazione precedente per risposte più pertinenti

IMPORTANTE:
- Cita sempre il nome del documento quando fai riferimento a informazioni specifiche
- Se ci sono contraddizioni tra documenti, menzionale
- Struttura la risposta in modo logico e facile da seguire
- Se c'è un contesto conversazionale, usalo per capire meglio l'intento della domanda`
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
      
      const answer = await chatCompletion(messages, {
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 1500, // Aumentato per risposte multi-documento più complete
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });
      
      return {
        answer: answer.trim(),
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

