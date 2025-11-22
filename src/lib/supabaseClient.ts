
import { createClient } from '@supabase/supabase-js';

// CONFIGURAÇÃO DE RESGATE (HARDCODED)
// Eliminamos qualquer tentativa de ler process.env ou import.meta.env para evitar erros de runtime.
const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("🔌 [Supabase] Inicializando Cliente de Resgate (v24)...");

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // Chave atualizada para 'v24' para garantir um 'hard reset' no armazenamento local do navegador
        storageKey: 'olie_hub_auth_v24_rescue', 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    }
});
