import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, PackageCheck, TimerReset, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrders } from '../orders/hooks/useOrders';
import { useProductionOrders } from '../production/hooks/useProductionOrders';
import { useInventoryItems } from '../inventory/hooks/useInventoryItems';
import { ErrorState, EmptyState } from '../../components/shared/FeedbackStates';
import { useToast } from '../../contexts/ToastContext';
import { Order } from '../../types';
import { Button } from '../../components/shared/Button';

type PeriodFilter = '7d' | '30d' | 'all';
type OrderStatusFilter = 'all' | Order['status'];

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
  { label: 'Todos', value: 'all' },
];

const STATUS_OPTIONS: { label: string; value: OrderStatusFilter }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Orçamento', value: 'draft' },
  { label: 'Confirmados', value: 'confirmed' },
  { label: 'Em produção', value: 'confirmed' },
  { label: 'Concluídos', value: 'fulfilled' },
];

const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  draft: 'Orçamento',
  confirmed: 'Confirmado',
  fulfilled: 'Concluído',
  cancelled: 'Cancelado',
};

const ORDER_STATUS_COLORS: Record<Order['status'], string> = {
  draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100',
  fulfilled: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100',
  cancelled: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(value || 0);

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
      if (period === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (period === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return null;
    })();

    return orders.data.filter((order) => {
      const dateToCompare = new Date((order as any).order_date || order.created_at);
      if (startDate && dateToCompare < startDate) return false;
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      return true;
    });
  }, [orders.data, period, statusFilter]);

  const activeOrdersCount = useMemo(
    () => filteredOrders.filter((order) => order.status !== 'fulfilled' && order.status !== 'cancelled').length,
    [filteredOrders]
  );

  const quoteOrdersCount = useMemo(
    () => filteredOrders.filter((order) => order.status === 'draft').length,
    [filteredOrders]
  );

  const productionInProgress = useMemo(
    () => production.data.filter((po) => po.status === 'in_progress'),
    [production.data]
  );

  const pipelineRevenue = useMemo(
    () =>
      filteredOrders
        .filter((order) => order.status !== 'cancelled' && order.status !== 'fulfilled')
        .reduce((sum, order) => sum + (order.total || 0), 0),
    [filteredOrders]
  );

  const overdueOrders = useMemo(() => {
    const today = new Date();
    return filteredOrders.filter((order) => {
      const dueDateValue = (order as any).due_date;
      if (!dueDateValue) return false;
      const dueDate = new Date(dueDateValue);
      const isFinished = order.status === 'fulfilled' || order.status === 'cancelled';
      return !isFinished && dueDate < today;
    });
  }, [filteredOrders]);

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

  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="h-8 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-8 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-8 w-28 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>
    </div>
  );

  if (loadingState) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Fase 1</p>
          <h1 className="text-2xl font-semibold">Dashboard operacional</h1>
        </div>
      </div>

      {anyError ? (
        <ErrorState
          description={anyError || 'Erro ao carregar dashboard'}
          onAction={() => {
            orders.refetch();
            production.refetch();
            inventory.refetch();
          }}
        />
      ) : (
        <>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Período</p>
                {PERIOD_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={period === option.value ? 'primary' : 'secondary'}
                    className="h-8 whitespace-nowrap rounded-full px-3 text-xs"
                    onClick={() => setPeriod(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                {STATUS_OPTIONS.map((option) => (
                  <Button
                    key={`${option.value}-${option.label}`}
                    variant={statusFilter === option.value ? 'primary' : 'secondary'}
                    className="h-8 whitespace-nowrap rounded-full px-3 text-xs"
                    onClick={() => setStatusFilter(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Filtros aplicados apenas em memória, sem alterar os dados na base.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Pedidos ativos"
              value={activeOrdersCount.toString()}
              helper="Todos exceto concluídos/cancelados"
              icon={<PackageCheck className="h-8 w-8 text-slate-400" />}
            />
            <DashboardCard
              title="Em orçamento"
              value={quoteOrdersCount.toString()}
              helper="Pedidos aguardando confirmação"
              icon={<TimerReset className="h-8 w-8 text-slate-400" />}
            />
            <DashboardCard
              title="Produção ativa"
              value={productionInProgress.length.toString()}
              helper="OPs com status Em andamento"
              icon={<TimerReset className="h-8 w-8 text-slate-400" />}
            />
            <DashboardCard
              title="Receita em pipeline"
              value={formatCurrency(pipelineRevenue)}
              helper="Pedidos não cancelados e não concluídos"
              icon={<TrendingUp className="h-8 w-8 text-slate-400" />}
            />
            <DashboardCard
              title="Pedidos atrasados"
              value={overdueOrders.length.toString()}
              helper="Com due date anterior a hoje"
              icon={<AlertCircle className="h-8 w-8 text-slate-400" />}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Últimos pedidos</h2>
                <p className="text-xs text-slate-500">Considera filtros ativos</p>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                {latestOrders.length ? (
                  latestOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <Link to={`/orders/${order.id}`} className="block truncate font-semibold hover:underline">
                            {order.customer_name}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${ORDER_STATUS_COLORS[order.status]}`}
                            >
                              {ORDER_STATUS_LABELS[order.status]}
                            </span>
                            <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <p className="whitespace-nowrap text-sm font-semibold">{formatCurrency(order.total)}</p>
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
                        <div className="min-w-0 space-y-1">
                          <p className="truncate font-medium">{op.code}</p>
                          <p className="text-xs text-slate-500">Status: {op.status}</p>
                        </div>
                        {op.planned_end_date && (
                          <p className="whitespace-nowrap text-xs text-slate-500">
                            Entrega: {new Date(op.planned_end_date).toLocaleDateString('pt-BR')}
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
        </>
      )}
    </div>
  );
};

export default DashboardPage;
