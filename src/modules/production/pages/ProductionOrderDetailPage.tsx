import React from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '../../../components/shared/Skeleton';
import { useProductionOrder } from '../hooks/useProductionOrder';

const ProductionOrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data, loading, error } = useProductionOrder(id);

  if (loading) return <Skeleton className="h-32 w-full" />;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!data) return <p className="text-sm">Ordem não encontrada.</p>;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Produção</p>
        <h1 className="text-2xl font-semibold">{data.reference}</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs uppercase text-slate-500">Status</p>
          <h3 className="text-xl font-semibold">{data.status}</h3>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs uppercase text-slate-500">Início planejado</p>
          <h3 className="text-xl font-semibold">{new Date(data.planned_start).toLocaleString('pt-BR')}</h3>
        </div>
      </div>
    </div>
  );
};

export default ProductionOrderDetailPage;
