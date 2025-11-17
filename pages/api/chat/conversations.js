import { getServiceSupabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const supabase = getServiceSupabase();
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // GET: List user's conversations
  if (req.method === 'GET') {
    try {
      const { data: conversations, error } = await supabase
        .from('chat_messages')
        .select('conversation_id, created_at, content, role')
        .eq('user_id', user.id)
        .not('conversation_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation and get first message as title
      const conversationMap = new Map();
      
      conversations.forEach(msg => {
        if (!conversationMap.has(msg.conversation_id)) {
          conversationMap.set(msg.conversation_id, {
            id: msg.conversation_id,
            title: msg.role === 'user' ? msg.content.substring(0, 60) + '...' : 'New Conversation',
            lastMessage: msg.content.substring(0, 100),
            lastMessageAt: msg.created_at,
            messageCount: 1,
          });
        } else {
          const conv = conversationMap.get(msg.conversation_id);
          conv.messageCount++;
          if (new Date(msg.created_at) > new Date(conv.lastMessageAt)) {
            conv.lastMessageAt = msg.created_at;
            conv.lastMessage = msg.content.substring(0, 100);
          }
        }
      });

      const conversationsList = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

      res.status(200).json({
        success: true,
        conversations: conversationsList,
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: 'Failed to load conversations' });
    }
  }

  // POST: Create new conversation
  else if (req.method === 'POST') {
    try {
      const conversationId = crypto.randomUUID();
      
      res.status(200).json({
        success: true,
        conversationId,
      });
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  }

  // DELETE: Delete conversation
  else if (req.method === 'DELETE') {
    try {
      const { conversationId } = req.query;

      if (!conversationId) {
        return res.status(400).json({ error: 'Conversation ID required' });
      }

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId);

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
