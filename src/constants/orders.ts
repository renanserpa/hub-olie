import { Order } from '../types';

export type OrderStatus = Order['status'];

export interface OrderStatusMeta {
  label: string;
  badgeClass: string;
  textClass: string;
}

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  draft: {
    label: 'Em orçamento',
    badgeClass: 'bg-amber-50 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800',
    textClass: 'text-amber-700 dark:text-amber-200',
  },
  confirmed: {
    label: 'Confirmado',
    badgeClass: 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800',
    textClass: 'text-blue-700 dark:text-blue-100',
  },
  fulfilled: {
    label: 'Concluído',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800',
    textClass: 'text-emerald-700 dark:text-emerald-100',
  },
  cancelled: {
    label: 'Cancelado',
    badgeClass: 'bg-rose-50 dark:bg-rose-900/40 border-rose-200 dark:border-rose-800',
    textClass: 'text-rose-700 dark:text-rose-100',
  },
};

export const ORDER_STATUS_FILTERS: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'draft', label: ORDER_STATUS_META.draft.label },
  { key: 'confirmed', label: ORDER_STATUS_META.confirmed.label },
  { key: 'fulfilled', label: ORDER_STATUS_META.fulfilled.label },
  { key: 'cancelled', label: ORDER_STATUS_META.cancelled.label },
];
