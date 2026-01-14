import { supabaseService as realSupabaseService } from '../lib/supabase';

// The application now operates exclusively in SUPABASE mode.
// This service acts as a clean entry point to the real Supabase implementation in lib/supabase.
export const dataService = realSupabaseService;
