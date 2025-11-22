
import { createClient } from '@supabase/supabase-js';

// CREDENCIAIS HARDCODED (Modo Rescue v21)
const PROJECT_URL = "https://ijheukynkppcswgtrnwd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

console.log("🔌 [Supabase] Cliente inicializado (Rescue v21).");
console.log("🎯 Target URL:", PROJECT_URL);

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        // Atualizado para v21 para invalidar caches anteriores
        storageKey: 'olie_hub_auth_v21_rescue', 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    }
});
