import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return undefined;
};

// Tenta ler do ambiente primeiro
const envUrl = getEnv('VITE_SUPABASE_URL');
const envKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Fallback Hardcoded (Útil apenas para debug/sandbox local sem .env)
// TODO: Remover estes valores antes do deploy final para produção
const FALLBACK_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

const supabaseUrl = envUrl || FALLBACK_URL;
const supabaseAnonKey = envKey || FALLBACK_KEY;

if (!envUrl) {
  console.warn("⚠️ [Supabase] Variáveis de ambiente VITE_SUPABASE_* não encontradas. Usando fallback.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Usamos uma chave persistente específica para evitar conflitos com outras apps em localhost
        storageKey: 'olie_hub_auth_v14_secure', 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    }
});