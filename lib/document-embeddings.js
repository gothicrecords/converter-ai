// Gestione embeddings e ricerca semantica con Neon (PostgreSQL)
import { query } from './db.js';
import { generateEmbedding } from './openai.js';

/**
 * Inizializza le tabelle per documenti e embeddings
 */
export async function initDocumentTables() {
  try {
    // Crea tabella documenti se non esiste
    // Usa JSONB per embedding (compatibile con Neon, pgvector opzionale)
    await query(`
      CREATE TABLE IF NOT EXISTS document_embeddings (
        id SERIAL PRIMARY KEY,
        file_id VARCHAR(255) UNIQUE NOT NULL,
        filename VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        embedding JSONB, -- Usa JSONB per compatibilità (pgvector opzionale)
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indici per performance (senza pgvector, usiamo ricerca manuale)
    // Se pgvector è disponibile in futuro, si può aggiungere un indice vettoriale

    // Crea indice per filename per ricerche rapide
    await query(`
      CREATE INDEX IF NOT EXISTS document_embeddings_filename_idx 
      ON document_embeddings (filename)
    `);

    // Crea indice per file_id
    await query(`
      CREATE INDEX IF NOT EXISTS document_embeddings_file_id_idx 
      ON document_embeddings (file_id)
    `);

    console.log('Tabelle documenti inizializzate con successo');
  } catch (error) {
    console.error('Errore inizializzazione tabelle documenti:', error);
    throw error;
  }
}

/**
 * Salva documento con embedding nel database
 * @param {string} fileId - ID univoco del file
 * @param {string} filename - Nome del file
 * @param {string} content - Testo estratto dal documento
 * @param {object} metadata - Metadati aggiuntivi
 * @returns {Promise<object>}
 */
export async function saveDocumentEmbedding(fileId, filename, content, metadata = {}) {
  try {
    // Genera embedding per il contenuto
    console.log(`Generando embedding per documento: ${filename} (${content.length} caratteri)`);
    const embedding = await generateEmbedding(content);
    
    // Salva embedding come JSONB (compatibile con Neon)
    const embeddingJson = JSON.stringify(embedding);
    
    // Verifica se il documento esiste già
    const existing = await query(
      'SELECT id FROM document_embeddings WHERE file_id = $1',
      [fileId]
    );

    if (existing.length > 0) {
      // Aggiorna documento esistente
      await query(`
        UPDATE document_embeddings 
        SET 
          filename = $1,
          content = $2,
          embedding = $3::jsonb,
          metadata = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE file_id = $5
      `, [filename, content, embeddingJson, JSON.stringify(metadata), fileId]);
      
      console.log(`Documento ${fileId} aggiornato nel database`);
      return { fileId, updated: true };
    } else {
      // Inserisci nuovo documento
      await query(`
        INSERT INTO document_embeddings (file_id, filename, content, embedding, metadata)
        VALUES ($1, $2, $3, $4::jsonb, $5)
      `, [fileId, filename, content, embeddingJson, JSON.stringify(metadata)]);
      
      console.log(`Documento ${fileId} salvato nel database`);
      return { fileId, created: true };
    }
  } catch (error) {
    console.error('Errore salvataggio embedding:', error);
    throw error;
  }
}

/**
 * Calcola cosine similarity tra due vettori
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vettori devono avere la stessa lunghezza');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Ricerca semantica nei documenti
 * @param {string} queryText - Testo della query
 * @param {number} topK - Numero di risultati da restituire (default: 5)
 * @param {Array<string>} fileIds - Opzionale: limita la ricerca a specifici fileIds
 * @returns {Promise<Array>}
 */
export async function semanticSearch(queryText, topK = 5, fileIds = null) {
  try {
    console.log(`Ricerca semantica: "${queryText}" (topK: ${topK})`);
    
    // Genera embedding per la query
    const queryEmbedding = await generateEmbedding(queryText);
    
    // Ottieni tutti i documenti (o solo quelli specificati)
    let documents;
    if (fileIds && fileIds.length > 0) {
      const placeholders = fileIds.map((_, i) => `$${i + 1}`).join(',');
      documents = await query(
        `SELECT * FROM document_embeddings WHERE file_id IN (${placeholders})`,
        fileIds
      );
    } else {
      documents = await query('SELECT * FROM document_embeddings');
    }
    
    if (documents.length === 0) {
      console.log('Nessun documento trovato nel database');
      return [];
    }
    
    console.log(`Trovati ${documents.length} documenti da analizzare`);
    
    // Calcola similarity per ogni documento
    const scoredDocuments = documents.map(doc => {
      let docEmbedding;
      
      // Estrai embedding dal database (JSONB)
      if (doc.embedding) {
        // Se è già un array
        if (Array.isArray(doc.embedding)) {
          docEmbedding = doc.embedding;
        } else if (typeof doc.embedding === 'string') {
          // Se è una stringa JSON
          try {
            docEmbedding = JSON.parse(doc.embedding);
          } catch {
            return null; // Embedding non valido
          }
        } else if (typeof doc.embedding === 'object') {
          // Se è già un oggetto JSONB
          docEmbedding = doc.embedding;
        } else {
          return null; // Tipo non supportato
        }
      } else if (doc.metadata) {
        // Prova a estrarre dai metadata (fallback)
        const metadata = typeof doc.metadata === 'string' ? JSON.parse(doc.metadata) : doc.metadata;
        if (metadata.embedding) {
          docEmbedding = metadata.embedding;
        } else {
          return null; // Nessun embedding disponibile
        }
      } else {
        return null; // Nessun embedding disponibile
      }
      
      // Verifica che sia un array valido
      if (!Array.isArray(docEmbedding) || docEmbedding.length === 0) {
        return null;
      }
      
      // Calcola similarity
      const score = cosineSimilarity(queryEmbedding, docEmbedding);
      
      return {
        fileId: doc.file_id,
        filename: doc.filename,
        content: doc.content,
        score,
        metadata: typeof doc.metadata === 'string' ? JSON.parse(doc.metadata) : doc.metadata,
      };
    }).filter(doc => doc !== null); // Rimuovi documenti senza embedding
    
    // Ordina per score e prendi i top K
    scoredDocuments.sort((a, b) => b.score - a.score);
    const topResults = scoredDocuments.slice(0, topK);
    
    console.log(`Ricerca completata: ${topResults.length} risultati trovati`);
    if (topResults.length > 0) {
      console.log(`Top score: ${topResults[0].score.toFixed(4)}`);
    }
    
    return topResults;
  } catch (error) {
    console.error('Errore ricerca semantica:', error);
    throw error;
  }
}

/**
 * Ottieni documento per fileId
 */
export async function getDocumentByFileId(fileId) {
  try {
    const results = await query(
      'SELECT * FROM document_embeddings WHERE file_id = $1',
      [fileId]
    );
    
    if (results.length === 0) {
      return null;
    }
    
    const doc = results[0];
    return {
      fileId: doc.file_id,
      filename: doc.filename,
      content: doc.content,
      metadata: typeof doc.metadata === 'string' ? JSON.parse(doc.metadata) : doc.metadata,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    };
  } catch (error) {
    console.error('Errore recupero documento:', error);
    throw error;
  }
}

/**
 * Rimuovi documento dal database
 */
export async function removeDocument(fileId) {
  try {
    await query(
      'DELETE FROM document_embeddings WHERE file_id = $1',
      [fileId]
    );
    console.log(`Documento ${fileId} rimosso dal database`);
    return true;
  } catch (error) {
    console.error('Errore rimozione documento:', error);
    throw error;
  }
}

/**
 * Ottieni statistiche sui documenti
 */
export async function getDocumentStats() {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_documents,
        SUM(LENGTH(content)) as total_characters,
        AVG(LENGTH(content)) as avg_content_length
      FROM document_embeddings
    `);
    
    const fileList = await query(`
      SELECT file_id, filename, LENGTH(content) as content_length, created_at
      FROM document_embeddings
      ORDER BY created_at DESC
    `);
    
    return {
      totalDocuments: parseInt(stats[0]?.total_documents || 0),
      totalCharacters: parseInt(stats[0]?.total_characters || 0),
      avgContentLength: parseFloat(stats[0]?.avg_content_length || 0),
      documents: fileList.map(doc => ({
        fileId: doc.file_id,
        filename: doc.filename,
        contentLength: parseInt(doc.content_length || 0),
        createdAt: doc.created_at,
      })),
    };
  } catch (error) {
    console.error('Errore recupero statistiche:', error);
    return {
      totalDocuments: 0,
      totalCharacters: 0,
      avgContentLength: 0,
      documents: [],
    };
  }
}

