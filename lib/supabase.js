// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role (for API routes)
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
};

// Upload file to Supabase Storage
export const uploadFile = async (bucket, path, fileBuffer) => {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileBuffer, { upsert: true });
  
  if (error) throw error;
  return data;
};

// Delete file from Supabase Storage
export const deleteFile = async (bucket, path) => {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) throw error;
  return data;
};
