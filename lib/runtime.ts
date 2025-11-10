export type RuntimeMode = 'SANDBOX' | 'SUPABASE';

// This is the master switch. To reconnect to the live Supabase backend,
// change this to 'SUPABASE' and redeploy.
// FIX: Changed to a const object to provide a more robust and conventional
// way of managing runtime configuration, preventing accidental reassignment.
export const runtime: { mode: RuntimeMode } = {
  mode: 'SANDBOX',
};

/**
 * Checks if the application is currently running in Sandbox (offline) mode.
 * @returns {boolean} True if in SANDBOX mode, false otherwise.
 */
export const isSandbox = (): boolean => runtime.mode === 'SANDBOX';