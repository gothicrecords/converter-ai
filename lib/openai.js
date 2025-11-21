import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate embeddings for text
export async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Chat completion
export async function chatCompletion(messages, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error in chat completion:', error);
    throw error;
  }
}

// Generate summary
export async function generateSummary(text, maxLength = 200) {
  throw new Error('OpenAI not configured. Install openai package to enable.');
  /* TODO: Enable when dependencies are installed
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

  const response = await chatCompletion(messages, { temperature: 0.5 });
  return response.choices[0].message.content;
  */
}

// Generate tags
export async function generateTags(text, count = 5) {
  throw new Error('OpenAI not configured. Install openai package to enable.');
  /* TODO: Enable when dependencies are installed
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

  const response = await chatCompletion(messages, { temperature: 0.3, maxTokens: 100 });
  const tagsText = response.choices[0].message.content;
  
  return tagsText
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
    .slice(0, count);
  */
}

// Classify document
export async function classifyDocument(text) {
  throw new Error('OpenAI not configured. Install openai package to enable.');
  /* TODO: Enable when dependencies are installed
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

  const response = await chatCompletion(messages, { temperature: 0.2, maxTokens: 50 });
  const categoriesText = response.choices[0].message.content;
  
  return categoriesText
    .split(',')
    .map(cat => cat.trim().toLowerCase())
    .filter(cat => categories.includes(cat));
  */
}

export default openai;
