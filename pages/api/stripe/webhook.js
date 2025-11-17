import stripe from '../../../lib/stripe';
import { buffer } from 'micro';

// Disabilita il body parser di Next.js per ricevere raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gestisci gli eventi Stripe
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment successful:', session);
        
        // Qui aggiorna il database utente con subscription attiva
        const userId = session.metadata.userId;
        const subscriptionId = session.subscription;
        
        // TODO: Aggiorna database
        // await updateUserSubscription(userId, subscriptionId, 'active');
        
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription);
        
        // TODO: Aggiorna stato subscription nel database
        
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription canceled:', deletedSubscription);
        
        // TODO: Revoca accesso Pro dell'utente
        
        break;

      case 'invoice.payment_failed':
        const invoice = event.data.object;
        console.log('Payment failed:', invoice);
        
        // TODO: Notifica utente del pagamento fallito
        
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
