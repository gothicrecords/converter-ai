import { generateEmbedding, generateSummary, generateTags, classifyDocument } from '../../lib/openai.js';
import { getServiceSupabase } from '../../lib/supabase.js';

// Chunk text into smaller pieces for embeddings
export function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  const words = text.split(/\s+/);
  
  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push({
        text: chunk,
        index: chunks.length,
        wordCount: chunk.split(/\s+/).length,
      });
    }
  }
  
  return chunks;
}

// Index a single file
export async function indexFile(fileId, extractedText) {
  try {
    const supabase = getServiceSupabase();

    // 1. Generate summary
    console.log(`Generating summary for file ${fileId}...`);
    const summary = await generateSummary(extractedText);

    // 2. Generate tags
    console.log(`Generating tags for file ${fileId}...`);
    const tags = await generateTags(extractedText);

    // 3. Classify document
    console.log(`Classifying file ${fileId}...`);
    const categories = await classifyDocument(extractedText);

    // 4. Update file with AI metadata
    const { error: updateError } = await supabase
      .from('files')
      .update({
        summary,
        tags,
        categories,
        processing_status: 'completed',
      })
      .eq('id', fileId);

    if (updateError) throw updateError;

    // 5. Generate embeddings for chunks
    console.log(`Generating embeddings for file ${fileId}...`);
    const chunks = chunkText(extractedText);
    
    for (const chunk of chunks) {
      try {
        const embedding = await generateEmbedding(chunk.text);

        const { error: embeddingError } = await supabase
          .from('file_embeddings')
          .insert({
            file_id: fileId,
            chunk_index: chunk.index,
            content: chunk.text,
            embedding,
          });

        if (embeddingError) {
          console.error(`Error inserting embedding for chunk ${chunk.index}:`, embeddingError);
        }
      } catch (chunkError) {
        console.error(`Error processing chunk ${chunk.index}:`, chunkError);
      }
    }

    console.log(`Successfully indexed file ${fileId} with ${chunks.length} chunks`);

    return {
      success: true,
      summary,
      tags,
      categories,
      chunksIndexed: chunks.length,
    };
  } catch (error) {
    console.error('Indexing error:', error);

    // Update file status to failed
    const supabase = getServiceSupabase();
    await supabase
      .from('files')
      .update({
        processing_status: 'failed',
        error_message: error.message,
      })
      .eq('id', fileId);

    throw error;
  }
}

// Search files using semantic search
export async function semanticSearch(userId, query, limit = 10) {
  try {
    const supabase = getServiceSupabase();

    // 1. Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Search for similar chunks using vector similarity
    // Note: This requires pgvector extension
    const { data: results, error } = await supabase.rpc('search_file_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit,
      user_id_filter: userId,
    });

    if (error) throw error;

    // 3. Group results by file and aggregate scores
    const fileScores = {};
    results.forEach((result) => {
      if (!fileScores[result.file_id]) {
        fileScores[result.file_id] = {
          fileId: result.file_id,
          filename: result.filename,
          fileType: result.file_type,
          chunks: [],
          totalScore: 0,
          maxScore: 0,
        };
      }

      fileScores[result.file_id].chunks.push({
        content: result.content,
        similarity: result.similarity,
        chunkIndex: result.chunk_index,
      });

      fileScores[result.file_id].totalScore += result.similarity;
      fileScores[result.file_id].maxScore = Math.max(
        fileScores[result.file_id].maxScore,
        result.similarity
      );
    });

    // 4. Sort by relevance
    const rankedFiles = Object.values(fileScores)
      .sort((a, b) => b.maxScore - a.maxScore)
      .slice(0, limit);

    return rankedFiles;
  } catch (error) {
    console.error('Semantic search error:', error);
    throw error;
  }
}

export default {
  chunkText,
  indexFile,
  semanticSearch,
};
