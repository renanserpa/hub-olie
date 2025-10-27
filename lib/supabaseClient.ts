import { createClient } from '@supabase/supabase-js';

// NOTE: Replace with your actual Supabase URL and Anon Key from environment variables.
// This placeholder configuration will not work for the Omnichannel module.
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-public-anon-key';

if (supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-public-anon-key')) {
    const warningStyle = 'background: #fffbe6; color: #f59e0b; font-size: 14px; padding: 16px; border-radius: 8px; border: 1px solid #fde68a;';
    console.log('%c⚠️ Supabase client is not configured. Please add your Supabase URL and Anon Key to make the Omnichannel module work.', warningStyle);
}

// The database schema is inferred from the types in `types.ts`.
// For a production app, you would generate types from your Supabase schema.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
