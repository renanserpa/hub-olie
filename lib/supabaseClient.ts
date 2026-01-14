import { createClient } from '@supabase/supabase-js';

// FIX: Cast import.meta to any to resolve Property 'env' does not exist on type 'ImportMeta' errors.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "🚨 [CRITICAL] Missing Environment Variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be defined in your .env file."
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://missing-url.supabase.co',
  supabaseAnonKey || 'missing-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  }
);