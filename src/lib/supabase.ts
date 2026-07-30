import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('example.supabase.co')
);

// Anonymous client for public/client operations
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Service Role client for administrative backend operations (bypasses RLS)
export const supabaseAdmin = (isSupabaseConfigured && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

export async function testSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, message: 'SUPABASE_URL and SUPABASE_ANON_KEY environment variables are missing.' };
  }
  try {
    const { error } = await supabase.from('_health_check').select('*').limit(1);
    // Ignore table missing errors as connection to postgrest is successful
    if (error && error.code !== 'PGRST301' && error.code !== '42P01') {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase project!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect to Supabase.' };
  }
}
