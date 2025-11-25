import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../orders/hooks/useOrders';
import { useProductionOrders } from '../production/hooks/useProductionOrders';
import { Order } from '../../types';

type PeriodFilter = '7d' | '30d' | 'all';

const PERIOD_FILTERS: { key: PeriodFilter; label: string }[] = [
  { key: '7d', label: 'Últimos 7 dias' },
  { key: '30d', label: 'Últimos 30 dias' },
  { key: 'all', label: 'Todo o período' },
];

  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
    <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
    {helper && <p className="text-xs text-slate-500">{helper}</p>}
  </div>
);

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const meta = ORDER_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.badgeClass} ${meta.textClass}`}
    >
      {meta.label}
    </span>
  );
};

const DashboardPage: React.FC = () => {
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useOrders();
  const { data: productionData, loading: productionLoading, error: productionError } = useProductionOrders();

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const isLoading = ordersLoading || productionLoading;
  const errorMessage = ordersError || productionError;

    return createdAt >= threshold;
  };

  const filteredOrders = useMemo(() => {
    return ordersData.filter((order) => {
  const latestOrders = useMemo(() => {
    return [...filteredOrders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [filteredOrders]);

  }


  // -----------------------------
  // Render UI
  // -----------------------------
  return (
          <div className="mt-3 space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm dark:border-blue-900/60 dark:bg-blue-950/40">
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-100">Ordens em produção</p>
                    <p className="text-xs text-blue-700/80 dark:text-blue-200">Planejadas ou em execução</p>
                  </div>
                  <span className="text-lg font-semibold text-blue-800 dark:text-blue-100">{activeProductionCount}</span>
                </div>
              </>
            )}
          </div>
  );
};

export default DashboardPage;
