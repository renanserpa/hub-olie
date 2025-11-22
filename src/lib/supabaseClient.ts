
import { createClient } from '@supabase/supabase-js';

// MODO DE RESGATE: Credenciais estáticas para garantir conexão imediata
// Eliminamos qualquer verificação de import.meta.env que possa falhar no build
const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // Alterado para v30 para invalidar qualquer cache anterior que esteja causando loop
        storageKey: 'olie_hub_auth_v30_rescue',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false // Desativado para evitar loops de redirecionamento
    }
});
