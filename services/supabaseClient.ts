
import { createClient } from "@supabase/supabase-js";

// Hardcoded values to fix environment variable issues in this execution context.
const supabaseUrl = "https://ijheukynkppcswgtrnwd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

let client;

try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("ERRO CRÍTICO: As constantes do Supabase (URL/ANON_KEY) não estão definidas no código-fonte.");
      // Instead of throwing, we log error but allow app to mount (so ErrorBoundary can catch downstream or UI can show error)
    } else {
      console.log("🛰️ SUPABASE mode active. Initializing Supabase client.");
      client = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: true },
      });
    }
} catch (e) {
    console.error("Falha fatal ao inicializar cliente Supabase:", e);
}

// Export safe client (might be undefined if initialization failed, but won't crash app load)
export const supabase = client as any;
