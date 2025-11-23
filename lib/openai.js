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

// Generate embeddings in batch for an array of texts
export async function generateEmbeddingsBatch(texts) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
  }

  if (!Array.isArray(texts) || texts.length === 0) return [];

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts.map(t => (t || '').toString().substring(0, 8000)),
    });

    return response.data.map(d => d.embedding);
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw new Error(`Failed to generate batch embeddings: ${error.message}`);
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
                url: `data:${imageMimeType};base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.2
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

// DALL-E 3 - Get image URL only (faster, for streaming)
export async function getImageUrlFromDALLE(prompt, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
  }

  try {
    const size = options.size || '1024x1024';
    const quality = options.quality || 'standard';
    const style = options.style || 'vivid';

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: size,
      quality: quality,
      style: style,
      n: 1,
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('Nessuna immagine generata da DALL-E');
    }

    return imageUrl;
  } catch (error) {
    console.error('Error getting image URL from DALL-E:', error);
    console.error('Error details:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      code: error.code,
      response: error.response?.data || error.response
    });
    
    if (error.status === 401) {
      throw new Error('Chiave API OpenAI non valida. Verifica la configurazione.');
    } else if (error.status === 429) {
      throw new Error('Limite di rate raggiunto. Riprova tra qualche secondo.');
    } else if (error.status === 400) {
      const errorMessage = error.message || error.response?.data?.error?.message || 'Prompt non valido o contenuto non consentito';
      throw new Error(`Errore nella generazione: ${errorMessage}`);
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Errore di connessione con OpenAI. Verifica la tua connessione internet.');
    }
    
    throw new Error(`Errore nella generazione dell'immagine: ${error.message || 'Errore sconosciuto'}`);
  }
}

// DALL-E 3 - Generazione immagini (download completo, per backward compatibility)
export async function generateImageWithDALLE(prompt, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
  }

  try {
    const imageUrl = await getImageUrlFromDALLE(prompt, options);

    // Download the image and return as buffer
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text().catch(() => 'Unknown error');
      throw new Error(`Errore nel download dell'immagine generata: ${imageResponse.status} ${imageResponse.statusText}. ${errorText}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    // Re-throw errors from getImageUrlFromDALLE
    throw error;
  }
}

// DALL-E 3 - Upscale/Miglioramento immagine usando variante
export async function upscaleImageWithDALLE(imageBuffer, imageMimeType, enhancementPrompt = null) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.');
  }

  try {
    // 1. Analizza l'immagine con Vision API per creare un prompt descrittivo
    const analysisPrompt = enhancementPrompt || 'Descrivi in dettaglio questa immagine, includendo tutti i dettagli visivi, colori, composizione, stile e qualità. La descrizione sarà usata per creare una versione migliorata ad alta risoluzione.';
    
    const imageDescription = await analyzeImageWithVision(
      imageBuffer, 
      imageMimeType, 
      analysisPrompt
    );

    // 2. Crea un prompt per DALL-E che migliora l'immagine
    const enhancementPromptText = `Crea una versione migliorata e ad alta risoluzione di questa immagine: ${imageDescription}. Mantieni fedeltà ai dettagli originali ma migliora la qualità, la nitidezza e la risoluzione.`;

    // 3. Genera immagine migliorata con DALL-E 3 in alta risoluzione
    const enhancedImageBuffer = await generateImageWithDALLE(enhancementPromptText, {
      size: '1792x1024', // Formato landscape per alta risoluzione
      quality: 'hd',
      style: 'natural'
    });

    return enhancedImageBuffer;
  } catch (error) {
    console.error('Error upscaling image with DALL-E:', error);
    throw new Error(`Errore nel miglioramento dell'immagine: ${error.message}`);
  }
}
