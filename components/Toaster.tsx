import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { TOAST_EVENT } from '../hooks/use-toast';

interface ToastProps {
  id: number;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const handleShowToast = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail;
    const newToast = {
      ...detail,
      id: Date.now(),
    };
    setToasts(currentToasts => [newToast, ...currentToasts]);

    setTimeout(() => {
      removeToast(newToast.id);
    }, 5000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    document.addEventListener(TOAST_EVENT, handleShowToast);
    return () => {
      document.removeEventListener(TOAST_EVENT, handleShowToast);
    };
  }, [handleShowToast]);

  return (
    <div className="fixed bottom-0 right-0 p-4 sm:p-6 space-y-3 z-[100] w-full max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'relative w-full p-4 pr-10 rounded-xl shadow-lg flex items-start gap-3 animate-toast-in',
            {
              'bg-card border dark:bg-dark-card dark:border-dark-border': toast.variant !== 'destructive',
              'bg-red-500 border-red-600 text-white': toast.variant === 'destructive',
            }
          )}
        >
          {toast.variant === 'destructive' ? (
            <XCircle className="h-5 w-5 mt-0.5" />
          ) : (
            <CheckCircle className="h-5 w-5 mt-0.5 text-primary" />
          )}
          <div className="flex-1">
            <p className="font-semibold">{toast.title}</p>
            {toast.description && <p className="text-sm opacity-90 mt-1">{toast.description}</p>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toaster;