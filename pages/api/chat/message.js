import { getServiceSupabase } from '../../../lib/supabase';
import { chatCompletion } from '../../../lib/openai';
import { semanticSearch } from '../../../ai/indexing/indexer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, fileIds = [], conversationId } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const supabase = getServiceSupabase();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Save user message
    const { data: userMessage, error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        conversation_id: conversationId || null,
        role: 'user',
        content: message,
        file_references: fileIds,
      })
      .select()
      .single();

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
      throw new Error('Failed to save message');
    }

    // Perform semantic search on user's files
    let relevantContext = [];
    let referencedFiles = [];

    try {
      const searchResults = await semanticSearch(user.id, message, 5);
      
      if (searchResults && searchResults.length > 0) {
        relevantContext = searchResults.map(result => ({
          filename: result.filename,
          content: result.chunk_text,
          relevance: result.similarity,
        }));

        // Get unique file IDs
        const fileIdsFromSearch = [...new Set(searchResults.map(r => r.file_id))];
        
        // Fetch file details
        const { data: files } = await supabase
          .from('files')
          .select('id, original_filename, filename')
          .in('id', fileIdsFromSearch);

        referencedFiles = files || [];
      }
    } catch (searchError) {
      console.error('Semantic search error:', searchError);
      // Continue without search results
    }

    // If specific files were requested, fetch their content
    if (fileIds.length > 0) {
      const { data: requestedFiles } = await supabase
        .from('files')
        .select('id, original_filename, filename, extracted_text, summary')
        .in('id', fileIds)
        .eq('user_id', user.id);

      if (requestedFiles) {
        requestedFiles.forEach(file => {
          if (file.extracted_text) {
            relevantContext.push({
              filename: file.original_filename,
              content: file.summary || file.extracted_text.substring(0, 2000),
              relevance: 1.0,
            });
          }
          if (!referencedFiles.find(f => f.id === file.id)) {
            referencedFiles.push(file);
          }
        });
      }
    }

    // Build context for AI
    let contextPrompt = '';
    if (relevantContext.length > 0) {
      contextPrompt = '\n\nRelevant information from your files:\n\n';
      relevantContext.forEach((ctx, idx) => {
        contextPrompt += `[Document ${idx + 1}: ${ctx.filename}]\n${ctx.content}\n\n`;
      });
    }

    // Get conversation history
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .eq('conversation_id', conversationId || userMessage.conversation_id)
      .order('created_at', { ascending: true })
      .limit(10);

    // Build messages for AI
    const messages = [
      {
        role: 'system',
        content: `You are an AI assistant helping users understand and work with their documents. 
You have access to the user's uploaded files and can answer questions about them.
Be concise, helpful, and cite specific documents when referencing information.
If you don't have relevant information in the provided context, say so clearly.${contextPrompt}`
      },
      ...(history || []).slice(0, -1), // Exclude the last message (current user message)
      { role: 'user', content: message }
    ];

    // Get AI response
    const aiResponse = await chatCompletion(messages, {
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Save AI message
    const { data: assistantMessage, error: assistantMsgError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        conversation_id: conversationId || userMessage.conversation_id,
        role: 'assistant',
        content: aiResponse,
        file_references: referencedFiles.map(f => f.id),
      })
      .select()
      .single();

    if (assistantMsgError) {
      console.error('Error saving assistant message:', assistantMsgError);
    }

    // Log usage
    await supabase
      .from('usage_logs')
      .insert({
        user_id: user.id,
        action_type: 'chat_message',
        tokens_used: Math.ceil(aiResponse.length / 4), // Rough estimate
        metadata: {
          conversation_id: conversationId || userMessage.conversation_id,
          files_referenced: referencedFiles.length,
        },
      });

    res.status(200).json({
      success: true,
      message: {
        ...assistantMessage,
        file_references: referencedFiles,
      },
      conversationId: conversationId || userMessage.conversation_id,
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process chat message',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
