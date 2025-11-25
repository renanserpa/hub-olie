import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../components/shared/FeedbackStates';
import { Skeleton } from '../../components/shared/Skeleton';
import { formatCurrency, formatDate } from '../../lib/utils/format';
import { useOrders } from '../orders/hooks/useOrders';
import { useProductionOrders } from '../production/hooks/useProductionOrders';

const StatCard: React.FC<{ title: string; value: string; helper?: string }> = ({ title, value, helper }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
    <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
    {helper && <p className="text-xs text-slate-500">{helper}</p>}
  </div>
);

const DashboardPage: React.FC = () => {
  const {
    data: ordersData,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useOrders();
  const {
    data: productionData,
    loading: productionLoading,
    error: productionError,
    refetch: refetchProduction,
  } = useProductionOrders();

  const isLoading = ordersLoading || productionLoading;
  const errorMessage = ordersError || productionError;

  const latestOrders = useMemo(() => {
    return [...ordersData]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [ordersData]);

  const totalRevenue = useMemo(() => {
    return ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
  }, [ordersData]);

  const activeProductionCount = useMemo(() => {
    return productionData.filter((item) => item.status === 'planned' || item.status === 'in_progress').length;
  }, [productionData]);

  if (isLoading) {
    return (
      <main className="space-y-4" aria-busy>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </main>
    );
  }

  if (errorMessage) {
    return <ErrorState description={errorMessage} onAction={() => { refetchOrders(); refetchProduction(); }} />;
  }

  return (
    <main className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Pedidos" value={ordersData.length.toString()} helper="Registros totais" />
        <StatCard title="Receita" value={formatCurrency(totalRevenue)} helper="Soma de pedidos" />
        <StatCard title="Produção ativa" value={activeProductionCount.toString()} helper="Planejadas ou em execução" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Pedidos</p>
            <h2 className="text-lg font-semibold">Últimos pedidos</h2>
          </div>
          <Link className="text-sm font-semibold text-blue-600" to="/orders">
            Ver todos
          </Link>
        </div>

        {!latestOrders.length ? (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Nenhum pedido encontrado.</p>
        ) : (
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {latestOrders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">{order.customer_name}</p>
                  <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(order.total)}</p>
                  <p className="text-xs uppercase text-slate-500">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default DashboardPage;
