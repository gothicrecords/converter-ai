import { getServiceSupabase, uploadFile } from '../../../lib/supabase';
import { parseFile } from '../../../services/parser/fileParser';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session
    const supabase = getServiceSupabase();
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check storage limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('storage_used, storage_limit')
      .eq('id', user.id)
      .single();

    if (profile && profile.storage_used >= profile.storage_limit) {
      return res.status(403).json({ error: 'Storage limit exceeded' });
    }

    // Parse multipart form data
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalFilename || file.newFilename);
    const filename = `${timestamp}_${randomString}${ext}`;
    const storagePath = `${user.id}/${filename}`;

    // Upload to Supabase Storage
    await uploadFile('files', storagePath, fileBuffer);

    // Get file URL
    const { data: urlData } = supabase.storage
      .from('files')
      .getPublicUrl(storagePath);

    // Create file record in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        user_id: user.id,
        filename: filename,
        original_filename: file.originalFilename || file.newFilename,
        file_type: ext.substring(1),
        file_size: file.size,
        mime_type: file.mimetype,
        storage_path: storagePath,
        processing_status: 'pending',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save file record');
    }

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    res.status(200).json({
      success: true,
      file: fileRecord,
      url: urlData.publicUrl,
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
}
