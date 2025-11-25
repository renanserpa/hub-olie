import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, Triangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  description?: string;
  type?: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, description?: string) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const getStyles = (type: ToastType = 'info') => {
  switch (type) {
    case 'success':
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        ring: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/70 dark:bg-emerald-900/40',
      };
    case 'error':
      return {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        ring: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800/70 dark:bg-red-900/30',
      };
    case 'warning':
      return {
        icon: <Triangle className="h-5 w-5 text-amber-500" />,
        ring: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/70 dark:bg-amber-900/40',
      };
    default:
      return {
        icon: <Info className="h-5 w-5 text-blue-500" />,
        ring: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800/70 dark:bg-blue-900/30',
      };
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', description?: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type, description }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  const value = useMemo(() => ({ toasts, showToast, remove }), [toasts, showToast, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const style = getStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur ${style.ring}`}
            >
              <div className="mt-0.5">{style.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">{toast.message}</p>
                {toast.description ? (
                  <p className="mt-1 text-xs leading-snug text-slate-700 dark:text-slate-200/80">{toast.description}</p>
                ) : null}
                <button className="mt-2 text-xs font-medium text-blue-600 underline" onClick={() => remove(toast.id)}>
                  Fechar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
