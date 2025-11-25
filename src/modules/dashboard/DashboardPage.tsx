import React from 'react';
import { useOrders } from '../orders/hooks/useOrders';
import { useProductionOrders } from '../production/hooks/useProductionOrders';
import { useInventoryItems } from '../inventory/hooks/useInventoryItems';
import { Skeleton } from '../../components/shared/Skeleton';

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

  if (orders.loading || production.loading || inventory.loading) {
    return <Skeleton className="h-40 w-full" />;
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
                  <p className="font-medium">{order.customer?.name || 'Não informado'}</p>
                  <p className="text-xs text-slate-500">Status: {order.status}</p>
                </div>
                <p className="font-semibold">R$ {order.total_gross_amount.toLocaleString('pt-BR')}</p>
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
