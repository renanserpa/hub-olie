import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Leitura das variáveis de ambiente injetadas pelo Vite
// Casting para 'any' para evitar erros de tipagem se os tipos do Vite não estiverem no escopo global
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Verifica se as credenciais existem e não são strings vazias
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.length > 0 && 
  SUPABASE_ANON_KEY.length > 0
);

// Inicializa o cliente apenas se a configuração estiver válida.
// Caso contrário, exporta null para que os serviços possam tratar o erro graciosamente.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        storageKey: 'oliehub-auth-prod-v1', // Chave única para evitar conflitos de sessão
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: { 'x-application-name': 'olie-hub-ops' },
      },
    })
  : null;