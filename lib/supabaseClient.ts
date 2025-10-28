import { createClient } from '@supabase/supabase-js'

// FOR DEVELOPMENT: The user has provided these keys to make the app work.
// IN PRODUCTION: These must be replaced with environment variables for security.
const supabaseUrl = 'https://qrfvdoecpmcnlpxklcsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZnZkb2VjcG1jbmxweGtsY3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU2OTEsImV4cCI6MjA3NjAzMTY5MX0.dpX90AmxL_JrxkYacPFkzQzhmCETDTa21Up5TdQgLLk';

if (!supabaseUrl || !supabaseKey) {
    // This provides a clear error message in the console if the keys are missing.
    throw new Error("Supabase URL and Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);