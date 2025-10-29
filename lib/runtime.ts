export type RuntimeMode = 'SANDBOX' | 'SUPABASE';

// This is the master switch. To reconnect to the live Supabase backend,
// change this to 'SUPABASE' and redeploy.
export const RUNTIME: RuntimeMode = 'SANDBOX';

/**
 * Checks if the application is currently running in Sandbox (offline) mode.
 * @returns {boolean} True if in SANDBOX mode, false otherwise.
 */
export const isSandbox = (): boolean => RUNTIME === 'SANDBOX';
