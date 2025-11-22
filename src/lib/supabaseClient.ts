
import { createClient } from '@supabase/supabase-js';

// CREDENCIAIS HARDCODED (Modo Rescue - Acesso Prioritário)
// Isso elimina qualquer erro de leitura de variáveis de ambiente (.env) que esteja causando tela branca.
const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("🔌 [Supabase] Inicializando Cliente de Resgate...");

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // Alteramos a chave para 'rescue_v20' para invalidar qualquer sessão anterior que esteja travando o loop de login
        storageKey: 'olie_hub_v20_rescue', 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    }
});
