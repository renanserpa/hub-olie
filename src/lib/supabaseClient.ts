// src/lib/supabaseClient.ts

import { createClient, SupabaseClient } from "@supabase/supabase-js";

type ViteEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

// Em Vite, import.meta.env é substituído no build.
// Em alguns ambientes de preview, import.meta.env pode ser undefined.
// Por isso usamos (import.meta as any)?.env ?? {} para evitar TypeError.
const env = ((import.meta as any)?.env ?? {}) as ViteEnv;

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured: boolean =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: {
        storageKey: "oliehub-auth",
      },
    })
  : null;