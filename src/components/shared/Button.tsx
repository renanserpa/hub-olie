import React from 'react';
import clsx from 'clsx';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
}

export const Button: React.FC<Props> = ({ variant = 'primary', loading, className, children, ...rest }) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all',
        variant === 'primary' && 'bg-slate-900 text-white hover:bg-slate-800',
        variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        variant === 'ghost' && 'bg-transparent text-slate-700 hover:bg-slate-100',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
      {children}
    </button>
  );
};
