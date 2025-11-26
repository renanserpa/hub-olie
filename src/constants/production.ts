import { ProductionOrder } from '../types';

export type ProductionStatus = ProductionOrder['status'];

export interface ProductionStatusMeta {
  label: string;
  badgeClass: string;
  textClass: string;
}

export const PRODUCTION_STATUS_META: Record<ProductionStatus, ProductionStatusMeta> = {
  planned: {
    label: 'Planejada',
    badgeClass: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800',
    textClass: 'text-slate-700 dark:text-slate-200',
  },
  in_progress: {
    label: 'Em produção',
    badgeClass: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
    textClass: 'text-amber-700 dark:text-amber-100',
  },
  blocked: {
    label: 'Bloqueada',
    badgeClass: 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800',
    textClass: 'text-rose-700 dark:text-rose-100',
  },
  completed: {
    label: 'Concluída',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
    textClass: 'text-emerald-700 dark:text-emerald-100',
  },
};

export const PRODUCTION_STATUS_COLUMNS: { key: ProductionStatus; label: string }[] = [
  { key: 'planned', label: PRODUCTION_STATUS_META.planned.label },
  { key: 'in_progress', label: PRODUCTION_STATUS_META.in_progress.label },
  { key: 'blocked', label: PRODUCTION_STATUS_META.blocked.label },
  { key: 'completed', label: PRODUCTION_STATUS_META.completed.label },
];
