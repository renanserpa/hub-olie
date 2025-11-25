import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { EmptyState, ErrorState, LoadingState } from '../../../components/shared/FeedbackStates';
import { useToast } from '../../../contexts/ToastContext';
import { PRODUCTION_STATUS_META } from '../../../constants/production';
import { formatDate } from '../../../lib/utils/format';
import { useProductionOrder } from '../hooks/useProductionOrder';

const ProductionOrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data, loading, error, refetch } = useProductionOrder(id);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      showToast('Erro ao carregar ordem', 'error', error);
    }
  }, [error, showToast]);

  if (loading) return <LoadingState message="Carregando ordem de produção..." />;
  if (error) return <ErrorState description={error} onAction={refetch} />;
  if (!data)
    return (
      <EmptyState
        title="Ordem não encontrada"
        description="Verifique se a referência está correta ou retorne à lista de produção."
        actionLabel="Voltar para produção"
        onAction={() => navigate('/production')}
      />
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Produção</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Ordem de Produção {data.code}</h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
                PRODUCTION_STATUS_META[data.status].badgeClass
              } ${PRODUCTION_STATUS_META[data.status].textClass}`}
            >
              {PRODUCTION_STATUS_META[data.status].label}
            </span>
          </div>
        </div>
        <Link to="/production" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto">
            <div className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para produção</span>
            </div>
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase text-slate-500">Dados da OP</p>
          <div className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Código</span>
              <span className="font-semibold">{data.code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Criada em</span>
              <span className="font-semibold">{formatDate(data.created_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Início planejado</span>
              <span className="font-semibold">{formatDate(data.planned_start_date)}</span>
            </div>
            {data.planned_end_date && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Entrega prevista</span>
                <span className="font-semibold">{formatDate(data.planned_end_date)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase text-slate-500">Pedido relacionado</p>
          <div className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            {data.order_id ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pedido</span>
                <Link
                  to={`/orders/${data.order_id}`}
                  className="font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-300"
                >
                  {data.order_id}
                </Link>
              </div>
            ) : (
              <p className="text-slate-500">Sem pedido vinculado</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Status</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
                  PRODUCTION_STATUS_META[data.status].badgeClass
                } ${PRODUCTION_STATUS_META[data.status].textClass}`}
              >
                {PRODUCTION_STATUS_META[data.status].label}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase text-slate-500">Detalhes</p>
          <div className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Prioridade</span>
              <span className="font-semibold">{data.priority}</span>
            </div>
            <p className="text-slate-500">
              {data.description || 'Mais detalhes em breve para acompanhar esta OP.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionOrderDetailPage;
