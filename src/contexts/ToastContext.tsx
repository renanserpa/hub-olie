import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ toasts, push, remove }), [toasts, push, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-6 right-6 space-y-3 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 transition-all`}
          >
            <div className="font-semibold text-sm">{toast.title}</div>
            {toast.description && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{toast.description}</p>}
            <button className="text-xs text-blue-500 mt-2" onClick={() => remove(toast.id)}>
              Fechar
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
