
import { createClient } from '@supabase/supabase-js';

// CREDENCIAIS DE FALLBACK (Modo de Recuperação)
// Usadas caso as variáveis de ambiente não estejam carregadas corretamente pelo Vite
const FALLBACK_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

// Função auxiliar para acessar variáveis de ambiente de forma segura
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env[key];
  } catch (e) {
    return undefined;
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || FALLBACK_URL;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || FALLBACK_KEY;

// Não lançamos erro aqui para permitir que a UI de diagnóstico carregue
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ Aviso: Credenciais do Supabase não encontradas. O cliente pode não funcionar corretamente.");
}

// Inicialização do Cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'olie_hub_auth_v8', // Chave única para evitar conflitos de cache
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    }
});
