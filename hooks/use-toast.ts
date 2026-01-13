// A simple event-based toast system to avoid context providers.
type ToastPayload = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export const TOAST_EVENT = 'show-toast';

/**
 * Dispatches a global event to show a toast notification.
 * @param payload - The content of the toast.
 */
export const toast = (payload: ToastPayload) => {
  document.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: payload }));
};