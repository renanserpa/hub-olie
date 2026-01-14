// FIX: Changed import from '../lib/supabase' to './supabaseService' to fix missing property errors in hooks and components.
import { supabaseService as realSupabaseService } from './supabaseService';

// The application now operates exclusively in SUPABASE mode.
// This service acts as a clean entry point to the real Supabase implementation in services/supabaseService.
export const dataService = realSupabaseService;