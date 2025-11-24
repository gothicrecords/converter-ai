const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token provided' });
    }

    const { toolName } = req.body;

    if (!toolName) {
      return res.status(400).json({ error: 'Tool name is required' });
    }

    // Verify session
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
    if (!sessions || sessions.length === 0 || new Date(sessions[0].expires_at) < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const session = sessions[0];

    // Get current user data
    const userResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${session.user_id}&select=images_processed,tools_used`,
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

    const user = users[0];

    // Update stats
    const toolsUsed = user.tools_used || [];
    if (!toolsUsed.includes(toolName)) {
      toolsUsed.push(toolName);
    }

    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${session.user_id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          images_processed: user.images_processed + 1,
          tools_used: toolsUsed,
          updated_at: new Date().toISOString()
        })
      }
    );

    const updatedUsers = await updateResponse.json();

    res.status(200).json({
      success: true,
      user: updatedUsers[0]
    });

  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
