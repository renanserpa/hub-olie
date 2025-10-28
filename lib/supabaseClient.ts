import { createClient } from '@supabase/supabase-js'

// Use environment variables for Supabase credentials as required for production.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseKey) {
    // This provides a clear error message in the console if the keys are missing.
    throw new Error("Supabase URL and Key must be provided in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);