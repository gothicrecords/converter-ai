// Sistema AI completo per analisi documenti - 100% gratuito e locale
// Nessuna API esterna richiesta!

import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

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
      // Usa pdfjs-dist esclusivamente per l'estrazione testo
      try {
        const pdfjsLib = await import('pdfjs-dist');
        const getDocument = pdfjsLib.getDocument || (pdfjsLib.default && pdfjsLib.default.getDocument);
        if (!getDocument) {
          throw new Error('pdfjs-dist getDocument non disponibile');
        }
        const loadingTask = getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        metadata.pages = pdf.numPages || 0;
        let combinedText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = (content.items || []).map((item) => (item.str || ''));
          combinedText += strings.join(' ') + '\n';
        }
        text = (combinedText || '').replace(/\s+/g, ' ').trim();
        if (!text || text.length === 0) {
          throw new Error('Nessun testo estratto dal PDF');
        }
      } catch (pdfError) {
        throw new Error(`Errore nell'estrazione del testo PDF con pdfjs-dist: ${pdfError.message}`);
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
        
        const result = await Tesseract.recognize(imageSource, 'ita+eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        });
        
        text = result.data.text.trim();
        
        if (!text || text.length === 0) {
          throw new Error('Nessun testo trovato nell\'immagine. Assicurati che l\'immagine contenga testo leggibile.');
        }
        
        console.log(`OCR completato: ${text.length} caratteri estratti`);
      } catch (ocrError) {
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
 * Genera risposta intelligente basata sul contenuto del documento
 */
export function generateAnswer(query, relevantChunks, documentText) {
  if (!relevantChunks || relevantChunks.length === 0) {
    return {
      answer: "Non ho trovato informazioni rilevanti nel documento per rispondere alla tua domanda. Prova a formulare la domanda in modo diverso o carica un documento più pertinente.",
      confidence: 0,
      sources: [],
    };
  }

  // Combina i chunk più rilevanti
  const combinedContext = relevantChunks
    .map((chunk, idx) => `[${idx + 1}] ${chunk.text}`)
    .join('\n\n');

  // Analizza la query per capire il tipo di risposta
  const lowerQuery = query.toLowerCase();
  let answerType = 'general';
  
  if (lowerQuery.includes('cosa') || lowerQuery.includes('what')) {
    answerType = 'explanation';
  } else if (lowerQuery.includes('quando') || lowerQuery.includes('when')) {
    answerType = 'temporal';
  } else if (lowerQuery.includes('dove') || lowerQuery.includes('where')) {
    answerType = 'location';
  } else if (lowerQuery.includes('chi') || lowerQuery.includes('who')) {
    answerType = 'person';
  } else if (lowerQuery.includes('perché') || lowerQuery.includes('why')) {
    answerType = 'reason';
  } else if (lowerQuery.includes('come') || lowerQuery.includes('how')) {
    answerType = 'process';
  } else if (lowerQuery.includes('quanto') || lowerQuery.includes('quanti') || lowerQuery.includes('how much')) {
    answerType = 'quantity';
  }

  // Genera risposta basata sul contesto
  let answer = '';
  const confidence = Math.min(relevantChunks[0].score * 10, 1.0);

  // Estrai informazioni specifiche dal contesto
  const contextText = relevantChunks[0].text;
  
  if (answerType === 'explanation' || answerType === 'general') {
    // Risposta esplicativa
    answer = `Basandomi sul documento, posso rispondere così:\n\n${contextText}\n\n`;
    
    if (relevantChunks.length > 1) {
      answer += `\nInformazioni aggiuntive:\n${relevantChunks.slice(1, 3).map((c, i) => `• ${c.text.substring(0, 200)}...`).join('\n')}`;
    }
  } else if (answerType === 'temporal') {
    // Cerca date/tempo nel contesto
    const datePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+\d{1,2},?\s+\d{4}/gi;
    const dates = contextText.match(datePattern);
    
    if (dates && dates.length > 0) {
      answer = `Secondo il documento, le informazioni temporali rilevanti sono:\n\n${contextText}\n\nDate menzionate: ${dates.slice(0, 3).join(', ')}`;
    } else {
      answer = `Secondo il documento:\n\n${contextText}`;
    }
  } else if (answerType === 'quantity') {
    // Cerca numeri nel contesto
    const numberPattern = /[\d,\.]+\s*(euro|€|dollari|\$|percento|%|unità|pezzi|kg|g|km|m|etc\.?)/gi;
    const numbers = contextText.match(numberPattern);
    
    if (numbers && numbers.length > 0) {
      answer = `Secondo il documento:\n\n${contextText}\n\nValori numerici rilevanti: ${numbers.slice(0, 5).join(', ')}`;
    } else {
      answer = `Basandomi sul documento:\n\n${contextText}`;
    }
  } else {
    // Risposta generica
    answer = `Secondo il documento:\n\n${contextText}`;
    
    if (relevantChunks.length > 1) {
      answer += `\n\nUlteriori dettagli:\n${relevantChunks.slice(1, 2).map(c => c.text.substring(0, 250)).join('\n\n')}`;
    }
  }

  // Aggiungi citazione se disponibile
  if (relevantChunks[0].startIndex !== undefined) {
    const snippet = documentText.substring(
      Math.max(0, relevantChunks[0].startIndex - 50),
      Math.min(documentText.length, relevantChunks[0].startIndex + relevantChunks[0].text.length + 50)
    );
    
    answer += `\n\n📄 Citazione dal documento:\n"${snippet.substring(0, 200)}..."`;
  }

  return {
    answer: answer.trim(),
    confidence,
    sources: relevantChunks.map(c => ({
      text: c.text.substring(0, 150) + '...',
      score: c.score.toFixed(3),
    })),
  };
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
 * Genera risposta combinando risultati da più documenti
 */
export function generateMultiDocumentAnswer(query, searchResults) {
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

  // Genera risposta combinata
  const primaryChunk = topChunks[0];
  const document = getDocument(primaryChunk.fileId);
  
  let answer = '';
  
  if (searchResults.length === 1) {
    // Un solo documento
    answer = generateAnswer(query, [primaryChunk], document.text).answer;
  } else {
    // Multipl documenti
    answer = `Basandomi sui ${searchResults.length} documenti caricati:\n\n`;
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

/**
 * Ottieni statistiche sui documenti caricati
 */
export function getDocumentStats() {
  const documents = Array.from(documentStore.values());
  
  return {
    totalDocuments: documentStore.size,
    totalWords: documents.reduce((sum, doc) => sum + (doc.text.split(/\s+/).length || 0), 0),
    totalChunks: documents.reduce((sum, doc) => sum + (doc.chunks?.length || 0), 0),
    documents: documents.map((doc, idx) => ({
      index: idx,
      filename: doc.metadata?.filename || 'Unknown',
      wordCount: doc.text.split(/\s+/).length,
      chunkCount: doc.chunks?.length || 0,
      storedAt: doc.metadata?.storedAt,
    })),
  };
}

