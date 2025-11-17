import stripe from '../../../lib/stripe';
import { buffer } from 'micro';
import { updateUserStripeCustomer, updateUserSubscription, getUserByStripeCustomerId } from '../../../lib/db';

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
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        console.log('Payment successful:', { userId, customerId, subscriptionId });

        // Salva customer ID nel database
        if (userId && customerId) {
          await updateUserStripeCustomer(userId, customerId);
        }

        // Se c'è una subscription, aggiorna anche quella
        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await updateUserSubscription(
            userId,
            subscriptionId,
            subscription.status,
            new Date(subscription.current_period_end * 1000)
          );
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Trova utente dal customer ID
        const user = await getUserByStripeCustomerId(customerId);
        if (user) {
          await updateUserSubscription(
            user.id,
            subscription.id,
            subscription.status,
            new Date(subscription.current_period_end * 1000)
          );
          console.log('Subscription updated:', { userId: user.id, status: subscription.status });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const deletedSubscription = event.data.object;
        const customerId = deletedSubscription.customer;

        // Trova utente e cancella subscription
        const user = await getUserByStripeCustomerId(customerId);
        if (user) {
          await updateUserSubscription(user.id, null, 'canceled', null);
          console.log('Subscription canceled:', { userId: user.id });
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Trova utente e notifica del problema
        const user = await getUserByStripeCustomerId(customerId);
        if (user) {
          console.error('Payment failed for user:', user.id);
          // TODO: Invia email di notifica all'utente
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
