// Hugging Face Inference API - Free and unlimited
// Using your existing HF_API_TOKEN from .env.local

// Generate embeddings for text (Not needed for chat)
export async function generateEmbedding(text) {
  throw new Error('Embeddings not needed for chat functionality.');
}

// Chat completion using Hugging Face (FREE and UNLIMITED)
export async function chatCompletion(messages, options = {}) {
  try {
    // Check if HF_API_TOKEN is configured
    if (!process.env.HF_API_TOKEN) {
      throw new Error('HF_API_TOKEN is not configured. Please set it in your environment variables.');
    }

    // Convert OpenAI format to HuggingFace format
    const prompt = messages.map(msg => {
      if (msg.role === 'system') return `System: ${msg.content}`;
      if (msg.role === 'user') return `User: ${msg.content}`;
      if (msg.role === 'assistant') return `Assistant: ${msg.content}`;
      return msg.content;
    }).join('\n') + '\nAssistant:';

    // Use simpler, more reliable models that work with the new endpoint
    // Try text-generation models that are commonly available
    const models = [
      'gpt2',  // Very reliable, always available
      'distilgpt2',  // Smaller, faster version
      'google/flan-t5-base'  // Question answering model
    ];
    
    let response;
    let lastError;
    
    for (const modelName of models) {
      // Use the new router.huggingface.co endpoint
      const modelUrl = `https://router.huggingface.co/models/${modelName}`;
      
      try {
        console.log(`Trying model: ${modelName}`);
        
        // Simplified request format that works with most models
        const requestBody = {
          inputs: prompt,
          parameters: {
            max_new_tokens: Math.min(options.max_tokens || 150, 200), // Limit tokens for simpler models
            temperature: Math.min(options.temperature || 0.7, 1.0),
            return_full_text: false,
            do_sample: true,
            top_p: 0.9,
          },
        };
        
        response = await fetch(modelUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HF_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        console.log(`Model ${modelName} response status:`, response.status);
        
        if (response.ok) {
          break; // Success, exit loop
        } else if (response.status === 503) {
          // Model is loading, try next
          console.log(`Model ${modelName} is loading (503), trying next...`);
          continue;
        } else {
          // Other error, try next model
          const errorText = await response.text();
          console.log(`Model ${modelName} error:`, response.status, errorText.substring(0, 100));
          lastError = `${response.status}: ${errorText.substring(0, 100)}`;
          continue;
        }
      } catch (error) {
        console.error(`Error with model ${modelName}:`, error.message);
        lastError = error.message;
        continue;
      }
    }
    
    if (!response || !response.ok) {
      // Get error details from last failed response
      let errorText = lastError || 'Unknown error';
      if (response && !response.ok) {
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          try {
            errorText = await response.text();
          } catch (e2) {
            errorText = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        
        // Handle specific errors
        if (response.status === 503 || (typeof errorText === 'string' && errorText.includes('loading'))) {
          throw new Error('Il modello AI è in caricamento. Riprova tra qualche secondo.');
        }
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('Errore di autenticazione. Verifica che il token HF_API_TOKEN sia corretto e abbia i permessi necessari.');
        }
      }
      
      throw new Error(`Tutti i modelli hanno fallito. Ultimo errore: ${errorText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const textData = await response.text();
      console.error('Failed to parse JSON response:', textData);
      throw new Error('Risposta non valida dal servizio AI.');
    }
    
    // Handle different response formats
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.trim();
    } else if (data.generated_text) {
      return data.generated_text.trim();
    } else if (data.error) {
      throw new Error(data.error);
    } else if (Array.isArray(data) && data[0]?.error) {
      throw new Error(data[0].error);
    }
    
    console.warn('Unexpected response format:', JSON.stringify(data).substring(0, 200));
    return 'Risposta ricevuta ma formato non riconosciuto.';
  } catch (error) {
    console.error('Error in chat completion:', error);
    
    // Re-throw with more context if it's not already a detailed error
    if (error.message && !error.message.includes('Errore')) {
      throw new Error(`Errore nella comunicazione con il servizio AI: ${error.message}`);
    }
    
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
