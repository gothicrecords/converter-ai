import stripe from '../../../lib/stripe';

export default async function handler(req, res) {
  console.log('[Stripe Checkout] Request received:', {
    method: req.method,
    url: req.url,
    path: req.url,
    hasBody: !!req.body
  });

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('[Stripe Checkout] Method not allowed:', req.method);
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    // Verifica che Stripe sia configurato
    if (!stripe) {
      console.error('Stripe non inizializzato');
      return res.status(500).json({ 
        success: false,
        error: 'Stripe non configurato correttamente',
        code: 'STRIPE_NOT_CONFIGURED'
      });
    }

    const { priceId, userId, userEmail } = req.body;

    // Validazione input
    if (!priceId) {
      return res.status(400).json({ 
        success: false,
        error: 'priceId è richiesto',
        code: 'MISSING_PRICE_ID'
      });
    }

    if (!userEmail) {
      return res.status(400).json({ 
        success: false,
        error: 'userEmail è richiesto',
        code: 'MISSING_EMAIL'
      });
    }

    // Verifica che NEXT_PUBLIC_URL sia configurato
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Verifica che il price ID esista in Stripe
    let price;
    try {
      price = await stripe.prices.retrieve(priceId);
      console.log('[Stripe Checkout] Price retrieved:', {
        id: price.id,
        active: price.active,
        product: price.product
      });
      
      if (!price.active) {
        throw new Error(`Il price ID ${priceId} non è attivo in Stripe`);
      }
    } catch (priceError) {
      console.error('[Stripe Checkout] Price retrieval error:', priceError);
      if (priceError.type === 'StripeInvalidRequestError' && priceError.code === 'resource_missing') {
        return res.status(400).json({
          success: false,
          error: `Price ID non valido: ${priceId}. Verifica che il price ID sia corretto e attivo nel tuo account Stripe.`,
          code: 'INVALID_PRICE_ID',
          details: process.env.NODE_ENV === 'development' ? priceError.message : undefined
        });
      }
      throw priceError;
    }

    // Crea la sessione di checkout Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId || 'unknown',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          userId: userId || 'unknown',
        },
      },
    });

    if (!session || !session.url) {
      throw new Error('Stripe non ha restituito un URL di checkout valido');
    }

    res.status(200).json({ 
      success: true,
      url: session.url 
    });
  } catch (error) {
    console.error('[Stripe Checkout] Error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    });

    // Gestione errori specifici di Stripe
    if (error.type === 'StripeInvalidRequestError') {
      if (error.code === 'resource_missing') {
        return res.status(400).json({
          success: false,
          error: `Risorsa Stripe non trovata: ${error.message}`,
          code: 'STRIPE_RESOURCE_MISSING',
          details: process.env.NODE_ENV === 'development' ? {
            message: error.message,
            code: error.code,
            param: error.param
          } : undefined
        });
      }
      
      return res.status(400).json({
        success: false,
        error: `Errore nella richiesta a Stripe: ${error.message}`,
        code: 'STRIPE_INVALID_REQUEST',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          param: error.param
        } : undefined
      });
    }

    res.status(500).json({ 
      success: false,
      error: error.message || 'Errore durante la creazione della sessione di checkout',
      code: 'CHECKOUT_ERROR',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        type: error.type,
        code: error.code
      } : undefined
    });
  }
}
