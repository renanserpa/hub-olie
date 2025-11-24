import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { useUpsertOrder } from '../hooks/useUpsertOrder';
import { useOrder } from '../hooks/useOrder';
import { Skeleton } from '../../../components/shared/Skeleton';
import { useApp } from '../../../contexts/AppContext';

const OrderFormPage: React.FC = () => {
  const { id } = useParams();
  const { organization } = useApp();
  const { data, loading: loadingOrder } = useOrder(id);
  const [customerName, setCustomerName] = useState('');
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<'draft' | 'confirmed' | 'fulfilled' | 'cancelled'>('draft');
  const { upsert, loading, error } = useUpsertOrder();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (data) {
      setCustomerName(data.customer_name);
      setTotal(data.total);
      setStatus(data.status);
    }
  }, [data]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!organization) return;
    await upsert({
      id: id || crypto.randomUUID(),
      organization_id: organization.id,
      customer_name: customerName,
      status,
      total,
      created_at: data?.created_at || new Date().toISOString(),
    });
    navigate('/orders');
  };

  if (loadingOrder) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Pedidos</p>
          <h1 className="text-2xl font-semibold">{id ? 'Editar pedido' : 'Novo pedido'}</h1>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Cliente</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Total</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={total}
              onChange={(e) => setTotal(Number(e.target.value))}
              min={0}
              step={0.01}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="draft">Rascunho</option>
              <option value="confirmed">Confirmado</option>
              <option value="fulfilled">Atendido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" loading={loading}>
          Salvar
        </Button>
      </form>
    </div>
  );
};

export default OrderFormPage;
