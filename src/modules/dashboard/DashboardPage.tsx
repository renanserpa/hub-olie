import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Skeleton } from '../../components/shared/Skeleton';
import { formatCurrency, formatDate } from '../../lib/utils/format';
import { useOrders } from '../orders/hooks/useOrders';
import { useProductionOrders } from '../production/hooks/useProductionOrders';

type StatCardProps = {
  title: string;
  value: string;
  helper?: string;
  loading?: boolean;
  error?: string | null;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, helper, loading, error }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
    {loading ? (
      <Skeleton className="mt-2 h-7 w-20" />
    ) : (
      <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
    )}
    {error ? (
      <p className="text-xs text-red-600">{error}</p>
    ) : helper ? (
      <p className="text-xs text-slate-500">{helper}</p>
    ) : null}
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

  const activeOrders = useMemo(
    () => ordersData.filter((order) => order.status !== 'fulfilled' && order.status !== 'cancelled'),
    [ordersData]
  );

  const quotes = useMemo(() => ordersData.filter((order) => order.status === 'draft'), [ordersData]);

  const activeProduction = useMemo(
    () => productionData.filter((item) => item.status === 'in_progress'),
    [productionData]
  );

  const pipelineRevenue = useMemo(
    () =>
      ordersData
        .filter((order) => order.status === 'confirmed')
        .reduce((sum, order) => sum + (order.total || 0), 0),
    [ordersData]
  );

  const latestOrders = useMemo(() => {
    return [...ordersData]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [ordersData]);

  const revenueData = useMemo(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const buckets = new Map<string, { date: string; total: number }>();

    ordersData
      .filter((order) => order.status !== 'cancelled' && order.status !== 'draft')
      .forEach((order) => {
        const createdAt = new Date(order.created_at);
        if (Number.isNaN(createdAt.getTime()) || createdAt < startDate) return;

        const dateKey = createdAt.toISOString().slice(0, 10);
        const entry = buckets.get(dateKey) || { date: dateKey, total: 0 };
        entry.total += order.total || 0;
        buckets.set(dateKey, entry);
      });

    return Array.from(buckets.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(({ date, total }) => ({
        name: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        value: total,
      }));
  }, [ordersData]);

  return (
    <main className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pedidos ativos"
          value={activeOrders.length.toString()}
          helper="Pedidos em andamento"
          loading={ordersLoading}
          error={ordersError ? 'Não foi possível carregar pedidos.' : null}
        />
        <StatCard
          title="Orçamentos"
          value={quotes.length.toString()}
          helper="Pedidos em orçamento"
          loading={ordersLoading}
          error={ordersError ? 'Não foi possível carregar pedidos.' : null}
        />
        <StatCard
          title="Produção ativa"
          value={activeProduction.length.toString()}
          helper="Ordens em execução"
          loading={productionLoading}
          error={productionError ? 'Não foi possível carregar produção.' : null}
        />
        <StatCard
          title="Receita em pipeline"
          value={formatCurrency(pipelineRevenue)}
          helper="Pedidos confirmados em aberto"
          loading={ordersLoading}
          error={ordersError ? 'Não foi possível carregar pedidos.' : null}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Receita</p>
              <h2 className="text-lg font-semibold">Últimos 30 dias</h2>
            </div>
            <button
              type="button"
              onClick={() => refetchOrders()}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Atualizar
            </button>
          </div>

          {ordersLoading ? (
            <Skeleton className="mt-6 h-60" />
          ) : ordersError ? (
            <p className="mt-6 text-sm text-red-600">Não foi possível carregar pedidos.</p>
          ) : revenueData.length === 0 ? (
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">
              Nenhum dado de receita nos últimos 30 dias.
            </p>
          ) : (
            <div className="mt-6 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
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

          {ordersLoading ? (
            <div className="mt-4 space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : ordersError ? (
            <div className="mt-4 text-sm text-red-600">
              <p>Não foi possível carregar pedidos.</p>
              <button className="mt-2 text-xs font-semibold text-blue-600" onClick={() => refetchOrders()}>
                Tentar novamente
              </button>
            </div>
          ) : !latestOrders.length ? (
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
      </div>
    </main>
  );
};

export default DashboardPage;
