import { getSession } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token provided' });
    }

    // Find session and verify it's not expired
    const session = await getSession(sessionToken);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Return user data from session (already joined with users table)
    res.status(200).json({
      success: true,
      user: {
        id: session.user_id,
        email: session.email,
        name: session.name,
        images_processed: session.images_processed,
        tools_used: session.tools_used,
        has_discount: session.has_discount,
        plan: session.plan
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
