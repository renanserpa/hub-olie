import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrfvdoecpmcnlpxklcsu.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZnZkb2VjcG1jbmxweGtsY3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU2OTEsImV4cCI6MjA3NjAzMTY5MX0.dpX90AmxL_JrxkYacPFkzQzhmCETDTa21Up5TdQgLLk';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL and Key must be provided in environment variables or hardcoded.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    // FIX: A spread argument must either have a tuple type or be passed to a rest parameter.
    fetch: async (...args: Parameters<typeof fetch>) => {
      try {
        const response = await fetch(...args);
        if (!response.ok) {
           const errorBody = await response.clone().json().catch(() => response.text());
           console.error('Supabase fetch error response:', { 
             status: response.status, 
             statusText: response.statusText, 
             body: errorBody 
           });
        }
        return response;
      } catch (e: any) {
        // This is the most important catch for network-level errors like CORS
        const errorMessage = `Supabase fetch failed catastrophically. This is often a CORS or network issue. 
        - Check the browser's console for a CORS error message.
        - Ensure this app's origin (${window.location.origin}) is in the 'Allowed Origins' list in your Supabase project's Auth settings.
        - Verify your network connection.
        Original Error: ${e.message}`;
        
        console.error(errorMessage, e);

        // Re-throw a more informative error to be caught by the connectivity test or query handlers
        throw new Error(errorMessage);
      }
    },
  },
});

// Connectivity test that runs in development-like environments
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (async () => {
    try {
      const { data, error, status } = await supabase
        .from('products')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Supabase teste falhou:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
      } else {
        console.log(`✅ Supabase conectado: ${status} (recebido ${data?.length ?? 0} produto)`);
      }
    } catch (err) {
      // This will catch the re-thrown error from the fetch wrapper
      console.error('❌ Supabase teste falhou (catch):', err);
    } finally {
      console.log('🔌 Supabase connectivity test completed', {
        origin: window.location.origin,
        url: SUPABASE_URL.substring(0, 30) + '...', // Log truncated URL for brevity
      });
    }
  })();
}