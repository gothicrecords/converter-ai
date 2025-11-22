-- Tabella per documenti e embeddings
-- Supporta sia pgvector (se disponibile) che fallback JSONB

-- Crea tabella documenti
CREATE TABLE IF NOT EXISTS document_embeddings (
  id SERIAL PRIMARY KEY,
  file_id VARCHAR(255) UNIQUE NOT NULL,
  filename VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  embedding JSONB, -- Usa JSONB per compatibilità (pgvector opzionale)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS document_embeddings_file_id_idx ON document_embeddings (file_id);
CREATE INDEX IF NOT EXISTS document_embeddings_filename_idx ON document_embeddings (filename);
CREATE INDEX IF NOT EXISTS document_embeddings_created_at_idx ON document_embeddings (created_at);

-- Indice GIN per ricerca nei metadata
CREATE INDEX IF NOT EXISTS document_embeddings_metadata_idx ON document_embeddings USING GIN (metadata);

-- Indice GIN per ricerca nel contenuto (full-text search opzionale)
CREATE INDEX IF NOT EXISTS document_embeddings_content_gin_idx ON document_embeddings USING GIN (to_tsvector('italian', content));

-- Se pgvector è disponibile, aggiungi colonna VECTOR e indice
-- ALTER TABLE document_embeddings ADD COLUMN IF NOT EXISTS embedding_vector vector(1536);
-- CREATE INDEX IF NOT EXISTS document_embeddings_embedding_vector_idx ON document_embeddings USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);

