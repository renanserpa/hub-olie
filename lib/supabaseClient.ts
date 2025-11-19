
import { createClient } from '@supabase/supabase-js';

// Hardcoded fallbacks for sandbox/demo environment where .env might not be present
const FALLBACK_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

// Função auxiliar para acessar variáveis de ambiente de forma segura
// Evita o erro "Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')"
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
     // @ts-ignore
     return import.meta.env[key];
  }
  // Fallback para ambientes onde import.meta.env pode não estar definido imediatamente
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || FALLBACK_URL;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || FALLBACK_KEY;

// Tratamento de erro robusto
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERRO CRÍTICO: Variáveis de ambiente SUPABASE ausentes ou inacessíveis.");
  // Em desenvolvimento, isso ajuda a identificar o problema rapidamente
  // Em produção, você pode querer um fallback ou página de erro dedicada
  throw new Error("SUPABASE_URL ou SUPABASE_ANON_KEY não configuradas. Verifique o arquivo .env e o vite.config.ts.");
}

// Inicializa o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'olie_hub_auth', // Usa uma chave de storage customizada
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    }
});
