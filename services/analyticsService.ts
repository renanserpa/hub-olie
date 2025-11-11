// services/analyticsService.ts
import { dataService } from './dataService';

type LoginEvent = 
  | 'login_success'
  | 'login_failure'
  | 'magic_link_request'
  | 'google_login_request'
  | 'password_reset_request';

interface EventPayload {
  event_name: LoginEvent;
  user_email?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export const analyticsService = {
  trackEvent: async (event: LoginEvent, payload?: { email?: string; metadata?: Record<string, any> }) => {
    try {
      const eventData: Omit<EventPayload, 'id'> = {
        event_name: event,
        user_email: payload?.email,
        metadata: payload?.metadata,
        created_at: new Date().toISOString(),
      };
      // We assume a table 'analytics_login_events' exists.
      // This call will fail gracefully if it doesn't.
      await dataService.addDocument('analytics_login_events', eventData);
      console.log(`[Analytics] Tracked event: ${event}`);
    } catch (error) {
      console.warn(`[Analytics] Failed to track event '${event}':`, (error as Error).message);
    }
  },
};
