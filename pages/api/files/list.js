// TODO: Enable when Supabase is configured
// import { getServiceSupabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  return res.status(503).json({ 
    error: 'File list API not yet configured. Supabase setup required.',
    files: []
  });
  
  /* TODO: Enable when Supabase is configured
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    // Get query parameters
    const { page = 1, limit = 20, search = '', fileType = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = supabase
      .from('files')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    // Apply filters
    if (search) {
      query = query.or(`filename.ilike.%${search}%,original_filename.ilike.%${search}%,extracted_text.ilike.%${search}%`);
    }

    if (fileType) {
      query = query.eq('file_type', fileType);
    }

    const { data: files, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      files: files || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });

  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: error.message || 'Failed to list files' });
  }
  */
}
