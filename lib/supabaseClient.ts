
import { createClient } from "@supabase/supabase-js";

// Função auxiliar para acessar variáveis de ambiente de forma segura
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
     // @ts-ignore
     return import.meta.env[key];
  }
  return undefined;
};

// Hardcoded values to fix environment variable issues in this execution context.
const FALLBACK_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || FALLBACK_URL;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || FALLBACK_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERRO CRÍTICO: Variáveis de ambiente SUPABASE ausentes.");
  throw new Error("SUPABASE_URL ou SUPABASE_ANON_KEY não configuradas no ambiente.");
}

// Cria o cliente diretamente.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { 
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
});
