
import { createClient } from '@supabase/supabase-js';

// CREDENCIAIS HARDCODED (Para garantir conexão imediata)
const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("🔌 [Supabase] Inicializando cliente...");

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // MUDANÇA CRÍTICA: Alterei a chave para 'olie_v2_fresh' para ignorar caches antigos corrompidos
        storageKey: 'olie_v2_fresh', 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    }
});
