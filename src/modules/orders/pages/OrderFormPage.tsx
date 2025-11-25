import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { useUpsertOrder } from '../hooks/useUpsertOrder';
import { useOrder } from '../hooks/useOrder';
import { useApp } from '../../../contexts/AppContext';
import { OrderStatus } from '../../../constants/orders';
import { useToast } from '../../../contexts/ToastContext';
import { ErrorState, LoadingState } from '../../../components/shared/FeedbackStates';

const OrderFormPage: React.FC = () => {
  const { id } = useParams();
  const { organization } = useApp();
  const { data, loading: loadingOrder, error: loadError, refetch } = useOrder(id);
  const [customerName, setCustomerName] = useState('');
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<OrderStatus>('draft');
  const { upsert, loading, error } = useUpsertOrder();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setCustomerName(data.customer_name);
      setTotal(data.total);
      setStatus(data.status);
    }
  }, [data]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!organization) return;
    setFormError(null);
    try {
      await upsert({
        id: id || crypto.randomUUID(),
        organization_id: organization.id,
        customer_name: customerName,
        status,
        total,
        created_at: data?.created_at || new Date().toISOString(),
      });
      showToast(id ? 'Pedido atualizado com sucesso.' : 'Pedido criado com sucesso.', 'success');
      navigate('/orders');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar pedido';
      setFormError(message);
      showToast('Erro ao salvar pedido', 'error', message);
    }
  };

  useEffect(() => {
    if (loadError) {
      showToast('Erro ao carregar pedido', 'error', loadError);
    }
  }, [loadError, showToast]);

  if (loadingOrder) return <LoadingState message="Carregando pedido..." />;
  if (loadError) return <ErrorState description={loadError} onAction={refetch} />;

  return (
    <main className="space-y-4" aria-labelledby="order-form-heading">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Pedidos</p>
          <h1 id="order-form-heading" className="text-2xl font-semibold">
            {id ? 'Editar pedido' : 'Novo pedido'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Preencha os dados do cliente e o status para controlar o fluxo de produção.
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} aria-label="Formulário de pedido">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="order-customer">
            Nome do cliente
          </label>
          <input
            id="order-customer"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="order-total">
              Valor total
            </label>
            <input
              id="order-total"
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={total}
              onChange={(e) => setTotal(Number(e.target.value))}
              min={0}
              step={0.01}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="order-status">
              Status do pedido
            </label>
            <select
              id="order-status"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
            >
              <option value="draft">Rascunho</option>
              <option value="confirmed">Confirmado</option>
              <option value="fulfilled">Atendido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}
        {error && !formError && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? 'Salvando...' : id ? 'Salvar alterações' : 'Criar pedido'}
        </Button>
      </form>
    </main>
  );
};

export default OrderFormPage;
