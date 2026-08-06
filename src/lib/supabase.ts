import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  const metaEnv = (import.meta as any)?.env;
  if (metaEnv && metaEnv[key]) {
    return metaEnv[key];
  }
  if (typeof process !== 'undefined' && process?.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL') || '';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY') || '';
const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY') || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('example.supabase.co')
);

// Anonymous client for public/client operations
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
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
    if (error && error.code !== 'PGRST301' && error.code !== '42P01') {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase project!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect to Supabase.' };
  }
}

// Google Sign In via Supabase Auth
export async function signInWithGoogle() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please add SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  const redirectTo = window.location.origin + '/login';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });
  if (error) throw error;
  return data;
}

// Forgot Password Email via Supabase Auth
export async function sendForgotPasswordEmail(email: string) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  const redirectTo = window.location.origin + '/reset-password';
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo
  });
  if (error) throw error;
  return data;
}

// Update User Password via Supabase Auth
export async function updateSupabasePassword(newPassword: string) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
  return data;
}

