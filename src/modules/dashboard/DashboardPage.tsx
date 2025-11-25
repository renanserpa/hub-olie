import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, PackageCheck, TimerReset, AlertCircle } from 'lucide-react';
import { useOrders } from '../orders/hooks/useOrders';
import { useProductionOrders } from '../production/hooks/useProductionOrders';
import { useInventoryItems } from '../inventory/hooks/useInventoryItems';
import { LoadingState, ErrorState, EmptyState } from '../../components/shared/FeedbackStates';
import { useToast } from '../../contexts/ToastContext';
import { Order } from '../../types';
import { Button } from '../../components/shared/Button';

type PeriodFilter = 'today' | '7d' | '30d' | 'all';
type OrderStatusFilter = 'all' | Order['status'];

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: 'Todo período', value: 'all' },
];

const STATUS_OPTIONS: { label: string; value: OrderStatusFilter }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Orçamento', value: 'draft' },
  { label: 'Confirmados', value: 'confirmed' },
  { label: 'Atendidos', value: 'fulfilled' },
  { label: 'Cancelados', value: 'cancelled' },
];

const DashboardCard: React.FC<{ title: string; value: string; helper?: string; icon?: React.ReactNode }> = ({
  title,
  value,
  helper,
  icon,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
        <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
        {helper && <p className="text-xs text-slate-500">{helper}</p>}
      </div>
      {icon}
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const orders = useOrders();
  const production = useProductionOrders();
  const inventory = useInventoryItems();
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const { showToast } = useToast();

  useEffect(() => {
    if (orders.error) showToast('Erro ao carregar pedidos', 'error', orders.error);
  }, [orders.error, showToast]);

  useEffect(() => {
    if (production.error) showToast('Erro ao carregar produção', 'error', production.error);
  }, [production.error, showToast]);

  useEffect(() => {
    if (inventory.error) showToast('Erro ao carregar estoque', 'error', inventory.error);
  }, [inventory.error, showToast]);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startDate = (() => {
      if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (period === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (period === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return null;
    })();

    return orders.data.filter((order) => {
      const createdAt = new Date(order.created_at);
      if (startDate && createdAt < startDate) return false;
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      return true;
    });
  }, [orders.data, period, statusFilter]);

  const revenueTotal = useMemo(
    () =>
      filteredOrders
        .filter((order) => order.status === 'confirmed' || order.status === 'fulfilled')
        .reduce((sum, order) => sum + (order.total || 0), 0),
    [filteredOrders]
  );

  const overdueOrders = useMemo(() => {
    const now = new Date();
    const threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return filteredOrders.filter(
      (order) => order.status !== 'fulfilled' && order.status !== 'cancelled' && new Date(order.created_at) < threshold
    );
  }, [filteredOrders]);

  const productionInProgress = useMemo(
    () => production.data.filter((po) => po.status === 'in_progress'),
    [production.data]
  );

  const latestOrders = useMemo(
    () =>
      filteredOrders
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
    [filteredOrders]
  );

  const loadingState = orders.loading || production.loading || inventory.loading;
  const anyError = orders.error || production.error || inventory.error;

  if (loadingState) {
    return <LoadingState message="Carregando visão geral..." />;
  }

  if (anyError) {
    return (
      <ErrorState
        description={anyError || 'Erro ao carregar dashboard'}
        onAction={() => {
          orders.refetch();
          production.refetch();
          inventory.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Fase 1</p>
          <h1 className="text-2xl font-semibold">Dashboard operacional</h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Período</p>
          {PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={period === option.value ? 'primary' : 'secondary'}
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? 'primary' : 'secondary'}
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Pedidos no período"
          value={filteredOrders.length.toString()}
          helper="Pedidos filtrados"
          icon={<PackageCheck className="h-8 w-8 text-slate-400" />}
        />
        <DashboardCard
          title="Receita estimada"
          value={`R$ ${revenueTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          helper="Pedidos confirmados/atendidos"
          icon={<TrendingUp className="h-8 w-8 text-slate-400" />}
        />
        <DashboardCard
          title="OPs em produção"
          value={productionInProgress.length.toString()}
          helper="Status em andamento"
          icon={<TimerReset className="h-8 w-8 text-slate-400" />}
        />
        <DashboardCard
          title="Pedidos em atraso"
          value={overdueOrders.length.toString()}
          helper="Criados há 7+ dias sem conclusão"
          icon={<AlertCircle className="h-8 w-8 text-slate-400" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Pedidos recentes</h2>
          <div className="mt-3 space-y-2 text-sm">
            {latestOrders.length ? (
              latestOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{order.customer_name}</p>
                      <p className="text-xs text-slate-500">Status: {order.status}</p>
                    </div>
                    <p className="whitespace-nowrap font-semibold">
                      R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="Nenhum pedido no filtro"
                description="Ajuste o período ou status para visualizar pedidos."
                className="bg-white"
              />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Produção em andamento</h2>
          <div className="mt-3 space-y-2 text-sm">
            {productionInProgress.length ? (
              productionInProgress.slice(0, 5).map((op) => (
                <div
                  key={op.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{op.reference}</p>
                      <p className="text-xs text-slate-500">Status: {op.status}</p>
                    </div>
                    {op.planned_end && (
                      <p className="whitespace-nowrap text-xs text-slate-500">
                        Entrega: {new Date(op.planned_end).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="Nenhuma OP em produção"
                description="Assim que uma OP entrar em andamento ela aparecerá aqui."
                className="bg-white"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
