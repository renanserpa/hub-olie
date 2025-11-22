
import { createClient } from '@supabase/supabase-js';

// CREDENCIAIS FORÇADAS - MODO DE RESGATE
// Isso elimina erros de leitura de variáveis de ambiente
const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

// Inicialização direta e incondicional
export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // MUDANÇA CRÍTICA: Chave nova para ignorar cache corrompido no localStorage
        storageKey: 'olie_hub_v27_rescue',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});
