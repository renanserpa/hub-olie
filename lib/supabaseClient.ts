
import { createClient } from '@supabase/supabase-js';

// Hardcoded fallbacks for sandbox/demo environment where .env might not be present
// NOTE: Em produção, certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estejam definidos no .env
const FALLBACK_URL = "https://placeholder-project.supabase.co"; 
const FALLBACK_KEY = "public-anon-key";

// Função auxiliar para acessar variáveis de ambiente de forma segura
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
     // @ts-ignore
     return import.meta.env[key];
  }
  return undefined;
};

let supabaseUrl = getEnv('VITE_SUPABASE_URL');
let supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Se não encontrar nas variáveis de ambiente, tenta usar as credenciais conhecidas do prompt anterior
// ou fallbacks seguros para não quebrar a aplicação antes do render.
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ Variáveis de ambiente Supabase não encontradas. Tentando credenciais hardcoded...");
    // Tentativa de usar as credenciais fornecidas anteriormente pelo usuário
    supabaseUrl = "https://ijheukynkppcswgtrnwd.supabase.co";
    supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";
}

// Inicializa o cliente Supabase
// NÃO LANÇAMOS ERRO AQUI para evitar Tela Branca da Morte (White Screen of Death).
// O erro será tratado na UI quando a conexão falhar.
export const supabase = createClient(supabaseUrl || FALLBACK_URL, supabaseAnonKey || FALLBACK_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    }
});
