import stripe from '../../../lib/stripe';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscriptionId } = req.body;

    // Crea il portale di gestione subscription
    const session = await stripe.billingPortal.sessions.create({
      customer: subscriptionId,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    res.status(500).json({ error: error.message });
  }
}
