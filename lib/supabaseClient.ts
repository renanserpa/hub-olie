import { createClient } from "@supabase/supabase-js";
import { runtime } from './runtime';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: any;

if (runtime.mode !== 'SANDBOX') {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("ERRO: Variáveis de ambiente Supabase (NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY) não estão configuradas.");
    }
    console.log("🛰️ SUPABASE mode active. Initializing Supabase client.");
    supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: { persistSession: true },
    });
} else {
    console.log("🧱 SANDBOX mode active. Supabase client is neutralized.");
    // Create a mock client to prevent errors if it's ever called accidentally (e.g., in authService)
    const mockSupabase = {
      from: () => mockSupabase,
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
      eq: () => mockSupabase,
      in: () => mockSupabase,
      single: () => Promise.resolve({ data: null, error: null }),
      order: () => mockSupabase,
      channel: () => ({
        on: () => ({
          subscribe: () => ({ unsubscribe: () => {} }),
        }),
      }),
      removeChannel: () => {},
      auth: {
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error("Cannot sign in in Sandbox mode.") }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: new Error("No session in Sandbox mode.") }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      }
    };
    supabaseInstance = mockSupabase;
}

export const supabase = supabaseInstance;