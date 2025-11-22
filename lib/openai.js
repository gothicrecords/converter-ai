// OpenAI API integration with official SDK
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate embeddings for text
export async function generateEmbedding(text) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000), // Limit input size
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

// Chat completion using OpenAI GPT models
export async function chatCompletion(messages, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-4o-mini', // Fast and affordable
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      top_p: options.top_p || 1,
      frequency_penalty: options.frequency_penalty || 0,
      presence_penalty: options.presence_penalty || 0,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error in chat completion:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      throw new Error('Chiave API OpenAI non valida. Verifica la configurazione.');
    } else if (error.status === 429) {
      throw new Error('Limite di rate raggiunto. Riprova tra qualche secondo.');
    } else if (error.status === 500) {
      throw new Error('Errore del server OpenAI. Riprova più tardi.');
    }
    
    throw new Error(`Errore nella comunicazione con OpenAI: ${error.message}`);
  }
}

// Generate summary
export async function generateSummary(text, maxLength = 200) {
  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant that creates concise summaries.',
    },
    {
      role: 'user',
      content: `Summarize the following text in ${maxLength} words or less:\n\n${text}`,
    },
  ];

  return await chatCompletion(messages, { temperature: 0.5, max_tokens: 300 });
}

// Generate tags
export async function generateTags(text, count = 5) {
  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant that generates relevant tags for documents. Return only comma-separated tags, no explanations.',
    },
    {
      role: 'user',
      content: `Generate ${count} relevant tags for this document:\n\n${text.substring(0, 2000)}`,
    },
  ];

  const response = await chatCompletion(messages, { temperature: 0.3, max_tokens: 100 });
  
  return response
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
    .slice(0, count);
}

// Classify document
export async function classifyDocument(text) {
  const categories = [
    'contract', 'invoice', 'report', 'presentation', 
    'spreadsheet', 'image', 'code', 'email', 'article', 'other'
  ];

  const messages = [
    {
      role: 'system',
      content: `You are a document classifier. Classify the document into one or more of these categories: ${categories.join(', ')}. Return only category names, comma-separated.`,
    },
    {
      role: 'user',
      content: `Classify this document:\n\n${text.substring(0, 1000)}`,
    },
  ];

  const response = await chatCompletion(messages, { temperature: 0.2, max_tokens: 50 });
  
  return response
    .split(',')
    .map(cat => cat.trim().toLowerCase())
    .filter(cat => categories.includes(cat));
}
