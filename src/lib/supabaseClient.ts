
import { createClient } from '@supabase/supabase-js';

// Safe access to environment variables to prevent runtime errors if import.meta.env is missing
const getEnvVar = (key: string): string | undefined => {
  try {
    // @ts-ignore
    const env = import.meta.env;
    return env ? env[key] : undefined;
  } catch (e) {
    return undefined;
  }
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Fallback credentials (Safety net for demo/sandbox)
const FALLBACK_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

// Prioritize Env Vars, then Fallback
const finalUrl = supabaseUrl || FALLBACK_URL;
const finalKey = supabaseAnonKey || FALLBACK_KEY;

if (!finalUrl || !finalKey) {
  console.error("ERRO CRÍTICO: Variáveis de ambiente SUPABASE ausentes ou inacessíveis.");
  // We throw an error to stop execution if we can't connect to anything
  throw new Error("SUPABASE_URL ou SUPABASE_ANON_KEY não configuradas. Verifique o arquivo .env");
}

// Initialize Supabase Client
export const supabase = createClient(finalUrl, finalKey, {
    auth: {
        storageKey: 'olie_hub_auth_v17', // New key to ensure clean session
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    }
});
