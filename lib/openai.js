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

// Vision API - Analizza immagini come ChatGPT
export async function analyzeImageWithVision(imageBuffer, imageMimeType, query = 'Cosa contiene questa immagine? Descrivi tutto ciò che vedi.') {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
  }

  try {
    // Converti il buffer in base64
    const base64Image = imageBuffer.toString('base64');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4o supporta vision
      messages: [
        {
          role: 'system',
          content: 'Sei un assistente AI esperto nell\'analisi di immagini. Descrivi in dettaglio tutto ciò che vedi nell\'immagine, inclusi testo, oggetti, persone, scene, colori e qualsiasi altro dettaglio rilevante. Rispondi sempre in italiano.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: query
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageMimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error in vision API:', error);
    
    if (error.status === 401) {
      throw new Error('Chiave API OpenAI non valida. Verifica la configurazione.');
    } else if (error.status === 429) {
      throw new Error('Limite di rate raggiunto. Riprova tra qualche secondo.');
    } else if (error.status === 400 && error.message?.includes('image')) {
      throw new Error('Formato immagine non supportato o immagine troppo grande.');
    }
    
    throw new Error(`Errore nell'analisi dell'immagine: ${error.message}`);
  }
}

// Estrazione testo da PDF con OpenAI Responses API (gpt-4o) usando input_file
// Ritorna SOLO la stringa di testo estratto (no IDs, no oggetti)
export async function extractTextFromPdfWithOpenAI(filePath) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
  }

  const fs = await import('fs');
  
  let uploadedFile = null;
  try {
    console.log('Caricamento PDF su OpenAI (Responses API):', filePath);
    
    // 1) Carica il file su OpenAI come user_data
    uploadedFile = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'user_data'
    });

    console.log('File caricato su OpenAI:', uploadedFile.id);

    // 2) Richiesta al modello GPT-4o per estrazione testo dal file caricato
    const response = await openai.responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: 'Estrai tutto il testo e le informazioni rilevanti da questo documento. Rispondi SOLO con il testo estratto, senza commenti.' },
            { type: 'input_file', file_id: uploadedFile.id }
          ]
        }
      ],
      max_output_tokens: 8000,
      temperature: 0.1
    });

    // 3) Prendi solo testo
    const extractedText = (response.output_text || '').toString().trim();
    console.log(`Testo estratto da PDF: ${extractedText.length} caratteri`);
    
    if (!extractedText) {
      throw new Error('Nessun testo estratto dal PDF');
    }

    return extractedText;

  } catch (error) {
    console.error('Error in PDF text extraction (Responses API):', error);
    
    if (error.status === 401) {
      throw new Error('Chiave API OpenAI non valida. Verifica la configurazione.');
    } else if (error.status === 429) {
      throw new Error('Limite di rate raggiunto. Riprova tra qualche secondo.');
    } else if (error.status === 400) {
      throw new Error('Errore nell\'analisi del PDF con Responses API. Il file potrebbe essere troppo grande o danneggiato.');
    }
    
    throw new Error(`Errore nell'estrazione del testo PDF: ${error.message}`);
  } finally {
    // 4) Prova a rimuovere il file caricato (se l'SDK lo supporta)
    try {
      if (uploadedFile && uploadedFile.id) {
        if (openai.files?.delete) {
          await openai.files.delete(uploadedFile.id);
        } else if (openai.files?.del) {
          await openai.files.del(uploadedFile.id);
        }
        console.log('File rimosso da OpenAI:', uploadedFile.id);
      }
    } catch (delError) {
      console.warn('Errore rimozione file da OpenAI (ignorato):', delError?.message || delError);
    }
  }
}