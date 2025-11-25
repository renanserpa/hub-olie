import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { ErrorState } from '../../components/shared/ErrorState';
import { Skeleton } from '../../components/shared/Skeleton';
import { ORDER_STATUS_FILTERS, ORDER_STATUS_META, OrderStatus } from '../../constants';
import { formatCurrency, formatDate } from '../../lib/utils/format';
import { useOrders } from '../orders/hooks/useOrders';
import { useProductionOrders } from '../production/hooks/useProductionOrders';
import { Order } from '../../types';

type PeriodFilter = '7d' | '30d' | 'all';

const PERIOD_FILTERS: { key: PeriodFilter; label: string }[] = [
  { key: '7d', label: 'Últimos 7 dias' },
  { key: '30d', label: 'Últimos 30 dias' },
  { key: 'all', label: 'Todo o período' },
];

const DashboardCard: React.FC<{ title: string; value: string; helper?: string }> = ({ title, value, helper }) => (
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

  const matchesPeriod = (order: Order, filter: PeriodFilter): boolean => {
    if (filter === 'all') return true;
    const createdAt = new Date(order.created_at);
    if (Number.isNaN(createdAt.getTime())) return false;
    const now = new Date();
    const days = filter === '7d' ? 7 : 30;
    const threshold = new Date(now);
    threshold.setDate(now.getDate() - days);
    return createdAt >= threshold;
  };

  const filteredOrders = useMemo(() => {
    return ordersData.filter((order) => {
      const periodMatches = matchesPeriod(order, periodFilter);
      const statusMatches = statusFilter === 'all' || order.status === statusFilter;
      return periodMatches && statusMatches;
    });
  }, [ordersData, periodFilter, statusFilter]);

  const activeOrdersCount = filteredOrders.filter((order) => order.status !== 'fulfilled' && order.status !== 'cancelled').length;
  const budgetOrdersCount = filteredOrders.filter((order) => order.status === 'draft').length;
  const activeProductionCount = productionData.filter((prod) => prod.status !== 'completed').length;
  const pipelineRevenue = filteredOrders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + (order.total || 0), 0);

  const overdueOrdersCount = filteredOrders.filter((order) => {
    if (!order.due_date) return false;
    const dueDate = new Date(order.due_date);
    if (Number.isNaN(dueDate.getTime())) return false;
    return dueDate < new Date() && order.status !== 'fulfilled' && order.status !== 'cancelled';
  }).length;

  const latestOrders = useMemo(() => {
    return [...filteredOrders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [filteredOrders]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={handleRetry} actionLabel="Ver pedidos" actionHref="/orders" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Visão geral</p>
          <h1 className="text-2xl font-semibold">Dashboard operacional</h1>
        </div>
        <Link to="/orders">
          <Button variant="secondary">Ir para pedidos</Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Período</p>
            <div className="flex gap-2">
              {PERIOD_FILTERS.map((option) => (
                <Button
                  key={option.key}
                  variant={periodFilter === option.key ? 'primary' : 'secondary'}
                  onClick={() => setPeriodFilter(option.key)}
                  className="px-3 py-1.5 text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
            <div className="flex gap-2">
              {ORDER_STATUS_FILTERS.map((option) => (
                <Button
                  key={option.key}
                  variant={statusFilter === option.key ? 'primary' : 'secondary'}
                  onClick={() => setStatusFilter(option.key)}
                  className="px-3 py-1.5 text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : (
          <>
            <DashboardCard title="Pedidos ativos" value={activeOrdersCount.toString()} helper="Em andamento" />
            <DashboardCard title="Pedidos em orçamento" value={budgetOrdersCount.toString()} helper="Aguardando aprovação" />
            <DashboardCard title="Produção ativa" value={activeProductionCount.toString()} helper="Ordens não concluídas" />
            <DashboardCard title="Receita em pipeline" value={formatCurrency(pipelineRevenue)} helper="Pedidos não cancelados" />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Últimos pedidos</h2>
            <Link to="/orders">
              <Button variant="secondary" className="px-3 py-1.5 text-xs">
                Ver todos
              </Button>
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : latestOrders.length ? (
              latestOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div>
                    <p className="text-sm font-semibold">{order.customer_name}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <StatusBadge status={order.status} />
                      <span>Criado em {formatDate(order.created_at)}</span>
                      {order.due_date && <span>Entrega {formatDate(order.due_date)}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-slate-500">ID {order.id}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-600">Nenhum pedido encontrado para os filtros atuais.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Alertas</h2>
          <div className="mt-3 space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900/60 dark:bg-amber-950/40">
                  <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-100">Pedidos atrasados</p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-200">Considera pedidos com due date passada</p>
                  </div>
                  <span className="text-lg font-semibold text-amber-800 dark:text-amber-100">{overdueOrdersCount}</span>
                </div>
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
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
