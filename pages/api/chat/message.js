import { chatCompletion } from '../../../lib/openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant for MegaPixelAI, a platform for AI-powered document and image processing tools. Help users with their questions about documents, images, and file processing. Be concise and helpful.',
      },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Call OpenAI via our helper
    const aiResponse = await chatCompletion(messages, {
      temperature: 0.7,
      max_tokens: 500,
    });

    return res.status(200).json({
      success: true,
      message: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message,
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
