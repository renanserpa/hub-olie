import { createClient } from "@supabase/supabase-js";
import { isSandbox } from './runtime';

const SUPABASE_URL = "https://qrfvdoecpmcnlpxklcsu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZnZkb2VjcG1jbmxweGtsY3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU2OTEsImV4cCI6MjA3NjAzMTY5MX0.dpX90AmxL_JrxkYacPFkzQzhmCETDTa21Up5TdQgLLk";

let supabaseInstance: any;

if (!isSandbox()) {
    console.log("🛰️ SUPABASE mode active. Initializing Supabase client.");
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true },
    });
} else {
    console.log("🧱 SANDBOX mode active. Supabase client is neutralized.");
    // Create a mock client to prevent errors if it's ever called accidentally (e.g., in authService)
    const mockSupabase = {
      from: () => mockSupabase,
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
      eq: () => mockSupabase,
      in: () => mockSupabase,
      single: () => Promise.resolve({ data: null, error: null }),
      order: () => mockSupabase,
      channel: () => ({
        on: () => ({
          subscribe: () => ({ unsubscribe: () => {} }),
        }),
      }),
      removeChannel: () => {},
      auth: {
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error("Cannot sign in in Sandbox mode.") }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: new Error("No session in Sandbox mode.") }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      }
    };
    supabaseInstance = mockSupabase;
}

export const supabase = supabaseInstance;
