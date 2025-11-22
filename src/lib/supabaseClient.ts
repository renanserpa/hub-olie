
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DE EMERGÊNCIA V13 ---
// Credenciais hardcoded para eliminar falhas de leitura de variáveis de ambiente.
const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("🔌 [Supabase] Inicializando cliente (Reset V13)...");

// Criação direta e segura do cliente
export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // MUDANÇA CRÍTICA: Nova chave para ignorar qualquer cache corrompido anterior
        storageKey: 'olie_hub_session_v13_clean', 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Desativar para evitar loops de redirecionamento
    }
});
