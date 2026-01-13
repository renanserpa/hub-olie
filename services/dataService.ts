import { supabaseService as realSupabaseService } from './supabaseService';

// The application now operates exclusively in SUPABASE mode.
// This service acts as a clean entry point to the real Supabase implementation.
export const dataService = realSupabaseService;
