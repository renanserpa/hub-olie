
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// MODO DE RESGATE - CREDENCIAIS DIRETAS
// Eliminamos qualquer leitura de import.meta.env para evitar erros de build/runtime
// ============================================================================

const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("🚀 [Supabase] Inicializando em Modo de Resgate (Hardcoded Credentials)");

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // Mudamos a chave para garantir que o navegador não use sessões velhas corrompidas
        storageKey: 'olie_hub_rescue_session_v99',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});
