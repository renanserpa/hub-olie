import React, { useEffect } from 'react';
import { useOrders } from '../orders/hooks/useOrders';
import { useProductionOrders } from '../production/hooks/useProductionOrders';
import { useInventoryItems } from '../inventory/hooks/useInventoryItems';
import { LoadingState, ErrorState } from '../../components/shared/FeedbackStates';
import { useToast } from '../../contexts/ToastContext';

const DashboardCard: React.FC<{ title: string; value: string; helper?: string }> = ({ title, value, helper }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
    <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
    <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
    {helper && <p className="text-xs text-slate-500">{helper}</p>}
  </div>
);

const DashboardPage: React.FC = () => {
  const orders = useOrders();
  const production = useProductionOrders();
  const inventory = useInventoryItems();
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

  if (orders.loading || production.loading || inventory.loading) {
    return <LoadingState message="Carregando visão geral..." />;
  }

  if (orders.error || production.error || inventory.error) {
    return (
      <ErrorState
        description={orders.error || production.error || inventory.error || 'Erro ao carregar dashboard'}
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

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Pedidos" value={orders.data.length.toString()} helper="Em todas as etapas" />
        <DashboardCard title="Ordens de produção" value={production.data.length.toString()} helper="Planejadas e em execução" />
        <DashboardCard title="Itens em estoque" value={inventory.data.length.toString()} helper="Itens cadastrados" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Pedidos recentes</h2>
        <div className="mt-3 space-y-2 text-sm">
          {orders.data.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-xs text-slate-500">Status: {order.status}</p>
                </div>
                <p className="font-semibold">R$ {order.total.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          ))}
          {!orders.data.length && <p className="text-sm text-slate-600">Nenhum pedido cadastrado.</p>}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
