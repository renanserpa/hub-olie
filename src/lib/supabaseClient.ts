
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DE RESGATE (HARDCODED) ---
// Eliminamos qualquer dependência de variáveis de ambiente para garantir a conexão.
const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("🔌 [Supabase] Inicializando cliente em modo RESGATE (v31)...");

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // CRÍTICO: Alteramos a chave para invalidar qualquer cache corrompido no navegador
        storageKey: 'olie_hub_auth_v31_rescue',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Desativado para evitar loops de redirecionamento
    },
    // Aumenta o timeout para conexões lentas
    global: {
        headers: { 'x-application-name': 'olie-hub-ops' },
    },
});
