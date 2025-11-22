
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DE EMERGÊNCIA ---
// Credenciais hardcoded para eliminar falhas de leitura de variáveis de ambiente (.env)
// ou erros de build no Vite.
const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("🔌 [Supabase] Inicializando cliente (Modo Resgate v12)...");

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // CRÍTICO: Alterar esta chave invalida o cache antigo do navegador.
        // Isso resolve problemas de loop de login infinito causados por tokens velhos.
        storageKey: 'olie_hub_rescue_v12', 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Desativado para evitar conflitos de rota
    },
    global: {
        headers: { 'x-application-name': 'olie-hub-ops' }
    }
});
