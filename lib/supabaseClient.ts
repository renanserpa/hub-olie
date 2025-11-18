
import { createClient } from "@supabase/supabase-js";

// Hardcoded values to fix environment variable issues in this execution context.
const supabaseUrl = "https://ijheukynkppcswgtrnwd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERRO CRÍTICO: As constantes do Supabase (URL/ANON_KEY) não estão definidas no código-fonte.");
}

// Create the client directly. If this fails, it throws immediately, which is better than a silent failure.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { 
        persistSession: true,
        autoRefreshToken: true,
    },
});
