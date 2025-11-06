import { createClient } from "@supabase/supabase-js";
import { runtime } from './runtime';

// FIX: Property 'env' does not exist on type 'ImportMeta'. Hardcoded values are used as a workaround.
const supabaseUrl = "https://ijheukynkppcswgtrnwd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

let supabaseInstance: any;

if (runtime.mode !== 'SANDBOX') {
    if (!supabaseUrl || !supabaseAnonKey) {
      const errorMessage = "ERRO CRÍTICO: As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não estão definidas. Configure-as no painel do Vercel.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    console.log("🛰️ SUPABASE mode active. Initializing Supabase client.");
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
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