
import { createClient } from '@supabase/supabase-js';

// --- CREDENCIAIS DE ACESSO (Hardcoded para Garantia de Funcionamento) ---
// Em produção, estas devem vir de import.meta.env, mas para destravar o acesso
// estamos definindo diretamente aqui.
const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("🔌 [Supabase] Inicializando cliente com credenciais diretas...");

// Criação do cliente Supabase
export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Opcional: Ajuste de storage se houver problemas com cookies
        // storage: window.localStorage, 
    }
});

// Teste de sanidade simples no console
supabase.auth.onAuthStateChange((event, session) => {
    console.log(`🔐 [Supabase Auth] Evento: ${event}`, session ? "Sessão Ativa" : "Sem Sessão");
});
