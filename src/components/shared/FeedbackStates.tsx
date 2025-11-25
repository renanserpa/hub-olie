import React from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface FeedbackProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const LoadingState: React.FC<{ message?: string; className?: string }> = ({ message, className }) => (
  <div className={`flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className || ''}`}>
    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
    <p className="mt-3 text-sm text-slate-600 dark:text-slate-200">{message || 'Carregando dados...'}</p>
  </div>
);

export const ErrorState: React.FC<FeedbackProps> = ({
  title = 'Não foi possível carregar',
  description = 'Ocorreu um erro ao buscar as informações.',
  actionLabel = 'Tentar novamente',
  onAction,
  className,
}) => (
  <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50/70 p-6 text-center shadow-sm dark:border-red-900/50 dark:bg-red-950/40 ${className || ''}`}>
    <AlertCircle className="h-6 w-6 text-red-500" />
    <div>
      <p className="text-sm font-semibold text-red-700 dark:text-red-200">{title}</p>
      {description ? <p className="text-xs text-red-600 dark:text-red-300">{description}</p> : null}
    </div>
    {onAction ? (
      <Button variant="secondary" onClick={onAction} className="mt-1">
        {actionLabel}
      </Button>
    ) : null}
  </div>
);

export const EmptyState: React.FC<FeedbackProps> = ({
  title = 'Nenhum registro encontrado',
  description,
  actionLabel,
  onAction,
  className,
}) => (
  <div className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/60 ${className || ''}`}>
    <Inbox className="h-6 w-6 text-slate-400" />
    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
    {description ? <p className="text-xs text-slate-500 dark:text-slate-300">{description}</p> : null}
    {onAction ? (
      <Button variant="secondary" onClick={onAction} className="mt-1">
        {actionLabel}
      </Button>
    ) : null}
  </div>
);
