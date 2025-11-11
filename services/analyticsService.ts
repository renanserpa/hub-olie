// services/analyticsService.ts
import { supabase } from '../lib/supabaseClient';

export type LoginEventName =
  | 'login_success'
  | 'login_failure'
  | 'password_reset_request'
  | 'magic_link_request'
  | 'google_login_request' // Keep for consistency
  | '2fa_challenge'
  | '2fa_success'
  | '2fa_failure';

export type LoginMethod = 'password' | 'magic_link' | 'google' | 'other';


export const trackLoginEvent = async (
  event_name: LoginEventName,
  payload?: { method?: LoginMethod; metadata?: Record<string, any> }
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const eventData = {
      event_name,
      method: payload?.method ?? null,
      user_id: user?.id ?? null,
      metadata: payload?.metadata ?? null
    };

    const { error } = await supabase.from('analytics_login_events').insert(eventData);

    if (error) {
        throw error;
    }

    console.log(`[Analytics] Tracked event: ${event_name}`);
  } catch (error) {
    console.warn(`[Analytics] Failed to track event '${event_name}':`, (error as Error).message);
  }
};
