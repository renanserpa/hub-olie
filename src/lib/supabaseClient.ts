
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURAÇÃO DE CONEXÃO DIRETA (RESCUE MODE)
// ============================================================================
// As credenciais são inseridas diretamente para contornar falhas de leitura
// de variáveis de ambiente em containeres ou ambientes sandboxed.
// ============================================================================

const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("🔌 [Supabase] Inicializando Cliente em Modo Direto...");

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // MUDANÇA CRÍTICA: Esta chave única força o navegador a criar uma nova sessão limpa,
        // ignorando qualquer dado corrompido em 'olie_hub_auth' ou versões anteriores.
        storageKey: 'olie_hub_v26_rescue', 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    }
});
