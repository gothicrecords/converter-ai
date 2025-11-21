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
