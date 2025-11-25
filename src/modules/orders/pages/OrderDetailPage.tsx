import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { useOrder } from '../hooks/useOrder';
import { EmptyState, ErrorState, LoadingState } from '../../../components/shared/FeedbackStates';
import { useToast } from '../../../contexts/ToastContext';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data, loading, error, refetch } = useOrder(id);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      showToast('Erro ao carregar pedido', 'error', error);
    }
  }, [error, showToast]);

  if (loading) return <LoadingState message="Carregando pedido..." />;
  if (error) return <ErrorState description={error} onAction={refetch} />;
  if (!data)
    return (
      <EmptyState
        title="Pedido não encontrado"
        description="Verifique se o link está correto ou volte para a lista de pedidos."
        actionLabel="Voltar para pedidos"
        onAction={() => navigate('/orders')}
      />
    );

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
          <p className="text-sm text-slate-500">Status: {data.status}</p>
          <p className="text-sm text-slate-500">Criado em: {new Date(data.created_at).toLocaleString('pt-BR')}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs uppercase text-slate-500">Valor</p>
          <h3 className="text-xl font-semibold">R$ {data.total.toLocaleString('pt-BR')}</h3>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
