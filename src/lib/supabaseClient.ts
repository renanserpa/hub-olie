
import { createClient } from '@supabase/supabase-js';

// CREDENCIAIS HARDCODED (V8.0 - Fix Definitivo)
// Ignoramos variáveis de ambiente para garantir que o código rode no seu ambiente atual sem .env
const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("🔌 [Supabase] Inicializando cliente (v8.0)...");

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // MUDANÇA CRÍTICA: Alterei a chave para 'olie_v8_fresh' para invalidar qualquer cache anterior
        storageKey: 'olie_v8_fresh', 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    }
});