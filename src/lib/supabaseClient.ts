
import { createClient } from '@supabase/supabase-js';

// CREDENCIAIS FORNECIDAS - HARDCODED PARA GARANTIR ACESSO IMEDIATO
const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("🔌 [Supabase] Inicializando Cliente com Credenciais Hardcoded...");

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // Alterando a chave para garantir que o navegador não use sessões antigas/corrompidas
        storageKey: 'olie_hub_v25_final', 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    }
});
