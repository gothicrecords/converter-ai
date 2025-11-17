const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    const sessionResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_sessions?session_token=eq.${sessionToken}&select=user_id,expires_at`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const sessions = await sessionResponse.json();
    if (!sessions || sessions.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const session = sessions[0];

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await fetch(
        `${SUPABASE_URL}/rest/v1/user_sessions?session_token=eq.${sessionToken}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      );

      return res.status(401).json({ error: 'Session expired' });
    }

    // Get user data
    const userResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${session.user_id}&select=id,email,name,created_at,images_processed,tools_used,has_discount,plan,updated_at`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const users = await userResponse.json();
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ success: true, user: users[0] });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
