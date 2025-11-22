// Test endpoint per verificare che il token HF_API_TOKEN funzioni
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = process.env.HF_API_TOKEN;
    
    if (!token) {
      return res.status(500).json({
        error: 'Token non configurato',
        message: 'HF_API_TOKEN non è presente nelle variabili d\'ambiente',
        tokenPresent: false
      });
    }

    // Test con un modello semplice
    const testModel = 'google/flan-t5-base';
    const testPrompt = 'Hello';
    
    console.log('Testing HF token with model:', testModel);
    console.log('Token prefix:', token.substring(0, 10) + '...');
    
    const response = await fetch(`https://router.huggingface.co/models/${testModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: testPrompt,
        parameters: {
          max_new_tokens: 20,
        },
      }),
    });

    const status = response.status;
    let responseData;
    
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = await response.text();
    }

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'Token funziona correttamente!',
        tokenPresent: true,
        tokenPrefix: token.substring(0, 10) + '...',
        model: testModel,
        responseStatus: status,
        responsePreview: typeof responseData === 'string' 
          ? responseData.substring(0, 100) 
          : JSON.stringify(responseData).substring(0, 100)
      });
    } else {
      return res.status(200).json({
        success: false,
        error: 'Errore nella chiamata API',
        tokenPresent: true,
        tokenPrefix: token.substring(0, 10) + '...',
        model: testModel,
        responseStatus: status,
        errorDetails: typeof responseData === 'string' 
          ? responseData.substring(0, 200) 
          : JSON.stringify(responseData).substring(0, 200)
      });
    }
  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      error: 'Errore durante il test',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

