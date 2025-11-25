import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { Skeleton } from '../../../components/shared/Skeleton';
import { ORDER_STATUS_META } from '../../../constants';
import { formatCurrency, formatDate } from '../../../lib/utils/format';
import { useOrder } from '../hooks/useOrder';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data, loading, error } = useOrder(id);

  if (loading) return <Skeleton className="h-32 w-full" />;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!data) return <p className="text-sm">Pedido não encontrado.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Pedidos</p>
          <h1 className="text-2xl font-semibold">Pedido {data.id}</h1>
        </div>
        <Link to={`/orders/${id}/edit`}>
          <Button variant="secondary">Editar</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs uppercase text-slate-500">Cliente</p>
          <h3 className="text-xl font-semibold">{data.customer_name}</h3>
          <p className="text-sm text-slate-500">Status: {ORDER_STATUS_META[data.status].label}</p>
          <p className="text-sm text-slate-500">Criado em: {formatDate(data.created_at)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs uppercase text-slate-500">Valor</p>
          <h3 className="text-xl font-semibold">{formatCurrency(data.total)}</h3>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
