// TODO: Enable when Supabase is configured
// import { getServiceSupabase } from '../../../lib/supabase';
// import { parseFile } from '../../../services/parser/fileParser';
// import { indexFile } from '../../../ai/indexing/indexer';
// import sharp from 'sharp';

export default async function handler(req, res) {
  return res.status(503).json({ 
    error: 'File processing API not yet configured. Supabase setup required.' 
  });
  
  /* TODO: Enable when Supabase is configured
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID required' });
    }

    const supabase = getServiceSupabase();

    // Get file record
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Update status to processing
    await supabase
      .from('files')
      .update({ processing_status: 'processing' })
      .eq('id', fileId);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('files')
      .download(file.storage_path);

    if (downloadError) {
      throw new Error('Failed to download file');
    }

    // Convert to buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Parse file based on type
    const parseResult = await parseFile(buffer, file.mime_type);

    // Extract text
    const extractedText = parseResult.text || '';
    const extractedTables = parseResult.tables || [];
    const extractedImages = parseResult.images || [];

    // Generate thumbnail for images
    let thumbnailUrl = null;
    if (file.mime_type.startsWith('image/')) {
      try {
        const thumbnail = await sharp(buffer)
          .resize(200, 200, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer();

        const thumbnailPath = `${file.user_id}/thumbnails/thumb_${file.filename}.jpg`;
        
        await supabase.storage
          .from('thumbnails')
          .upload(thumbnailPath, thumbnail, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        const { data: thumbData } = supabase.storage
          .from('thumbnails')
          .getPublicUrl(thumbnailPath);

        thumbnailUrl = thumbData.publicUrl;
      } catch (thumbError) {
        console.error('Thumbnail generation error:', thumbError);
      }
    }

    // Update file with extracted data
    await supabase
      .from('files')
      .update({
        extracted_text: extractedText,
        extracted_tables: extractedTables,
        extracted_images: extractedImages,
        thumbnail_url: thumbnailUrl,
      })
      .eq('id', fileId);

    // Index file with AI (async - don't wait)
    if (extractedText && extractedText.length > 50) {
      // Run indexing in background
      indexFile(fileId, extractedText).catch(err => {
        console.error('Indexing error:', err);
      });
    } else {
      // No text to index, mark as completed
      await supabase
        .from('files')
        .update({ processing_status: 'completed' })
        .eq('id', fileId);
    }

    res.status(200).json({
      success: true,
      file: {
        id: fileId,
        textLength: extractedText.length,
        tablesCount: extractedTables.length,
        imagesCount: extractedImages.length,
        thumbnailUrl,
      },
    });

  } catch (error) {
    console.error('Processing error:', error);

    // Update file status to failed
    const supabase = getServiceSupabase();
    await supabase
      .from('files')
      .update({
        processing_status: 'failed',
        error_message: error.message,
      })
      .eq('id', req.body.fileId);

    res.status(500).json({ error: error.message || 'Processing failed' });
  }
  */
}
