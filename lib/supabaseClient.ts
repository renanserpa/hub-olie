import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://qrfvdoecpmcnlpxklcsu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZnZkb2VjcG1jbmxweGtsY3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU2OTEsImV4cCI6MjA3NjAzMTY5MX0.dpX90AmxL_JrxkYacPFkzQzhmCETDTa21Up5TdQgLLk";


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    fetch: async (...args: Parameters<typeof fetch>) => {
      try {
        const response = await fetch(...args);
        if (!response.ok) {
           const errorBody = await response.clone().text().catch(() => 'Could not read error body');
           console.error('❌ Supabase fetch error response:', { 
             status: response.status, 
             statusText: response.statusText, 
             body: errorBody 
           });
        }
        return response;
      } catch (e: any) {
        // This is the most important catch for network-level errors like CORS
        console.error(
          "🔥 Supabase fetch failed catastrophically:",
          e.message,
          "\nOrigin:",
          window.location.origin,
          "\nVerify that it is added to Allowed Origins in Supabase's Auth settings."
        );
        
        // Re-throw the original error so that application logic can handle it
        throw e;
      }
    },
  },
});

// Initial connectivity log
console.log('🔌 Supabase client initialized. Connectivity will be tested on first data fetch.');
