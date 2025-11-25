import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  actionLabel?: string;
  actionHref?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, actionLabel = 'Ir para pedidos', actionHref = '/orders' }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center dark:border-rose-900/60 dark:bg-rose-950/40">
      <p className="text-sm font-medium text-rose-700 dark:text-rose-100">{message}</p>
      <div className="mt-4 flex gap-2">
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
        {actionHref && (
          <Link to={actionHref}>
            <Button>{actionLabel}</Button>
          </Link>
        )}
      </div>
    </div>
  );
};
