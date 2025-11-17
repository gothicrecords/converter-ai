import { getServiceSupabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId } = req.query;
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

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID required' });
    }

    // Get all messages in conversation
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Fetch file details for references
    const allFileIds = messages
      .flatMap(msg => msg.file_references || [])
      .filter((id, index, self) => self.indexOf(id) === index);

    let filesMap = {};
    if (allFileIds.length > 0) {
      const { data: files } = await supabase
        .from('files')
        .select('id, original_filename, filename')
        .in('id', allFileIds);

      if (files) {
        filesMap = files.reduce((acc, file) => {
          acc[file.id] = file;
          return acc;
        }, {});
      }
    }

    // Attach file details to messages
    const messagesWithFiles = messages.map(msg => ({
      ...msg,
      file_references: (msg.file_references || [])
        .map(id => filesMap[id])
        .filter(Boolean),
    }));

    res.status(200).json({
      success: true,
      messages: messagesWithFiles,
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to load chat history' });
  }
}
