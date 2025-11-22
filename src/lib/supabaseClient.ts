
import { createClient } from '@supabase/supabase-js';

// CREDENCIAIS DE RESGATE (HARDCODED)
// Utilizadas para garantir acesso imediato ignorando falhas de leitura de .env
const RESCUE_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const RESCUE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("🔌 [Supabase] Inicializando Cliente de Resgate (v22)...");

export const supabase = createClient(RESCUE_URL, RESCUE_KEY, {
    auth: {
        // Chave atualizada para 'v22' para invalidar caches anteriores do navegador
        storageKey: 'olie_hub_auth_v22_rescue', 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    }
});
