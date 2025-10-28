import { createClient } from '@supabase/supabase-js'

// Use environment variables with a fallback for local development or environments
// where env vars are not set. This is a security and flexibility improvement.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrfvdoecpmcnlpxklcsu.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZnZkb2VjcG1jbmxweGtsY3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU2OTEsImV4cCI6MjA3NjAzMTY5MX0.dpX90AmxL_JrxkYacPFkzQzhmCETDTa21Up5TdQgLLk';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL and Key must be provided.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    // FIX: Changed spread operator to correctly pass arguments to fetch.
    fetch: async (...args: [RequestInfo | URL, RequestInit | undefined]) => {
      try {
        const response = await fetch(args[0], args[1]);
        if (!response.ok) {
           console.error('Supabase fetch error response:', response.status, response.statusText, await response.clone().json().catch(() => response.text()));
        }
        return response;
      } catch (e: any) {
        console.error('Supabase fetch failed catastrophically:', e);
        // Return a Response object to avoid crashing the client
        return new Response(JSON.stringify({ error: String(e?.message || e) }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    },
  },
});

// Connectivity test that runs in development environments
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // FIX: Refactored to use async/await to avoid promise chaining issues with .catch.
  (async () => {
    try {
      const r = await supabase
        .from('products') // Using 'products' as it's a known existing table from schema.json
        .select('id')
        .limit(1);

      if (r.error) {
        console.error('❌ Supabase teste falhou:', r.error);
      } else {
        console.log(`✅ Supabase conectado: ${r.status} (recebido ${r.data?.length ?? 0} produto)`);
      }
    } catch (err) {
      console.error('❌ Supabase teste falhou (catch):', err);
    } finally {
      console.log('🔌 Supabase connectivity test completed', {
        origin: window.location.origin,
        url: SUPABASE_URL,
      });
    }
  })();
}
