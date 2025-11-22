
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURAÇÃO DE CLIENTE SUPABASE (MODO DIRETO)
// ============================================================================
// As credenciais são definidas estaticamente para garantir a conexão
// e eliminar erros de leitura de variáveis de ambiente (VITE_*) neste ambiente.
// ============================================================================

const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("✅ [Supabase] Cliente inicializado (Credenciais Diretas).");

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // Chave de armazenamento atualizada para v27 para garantir sessão limpa
        storageKey: 'olie_hub_v27_final', 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    }
});
