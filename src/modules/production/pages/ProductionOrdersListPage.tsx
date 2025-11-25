import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/shared/Button';
import { TableSkeleton } from '../../../components/shared/Table';
import { useProductionOrders } from '../hooks/useProductionOrders';
import { useCreateProductionOrder } from '../hooks/useCreateProductionOrder';
import { useApp } from '../../../contexts/AppContext';
import { EmptyState, ErrorState } from '../../../components/shared/FeedbackStates';
import { useToast } from '../../../contexts/ToastContext';
import { ProductionKanbanBoard } from '../components/ProductionKanbanBoard';
import { useUpdateProductionStatus } from '../hooks/useUpdateProductionStatus';
import { ProductionOrder } from '../../../types';

const ProductionOrdersListPage: React.FC = () => {
  const { data, loading, error, refetch } = useProductionOrders();
  const { updateStatus } = useUpdateProductionStatus();
  const { create, loading: creating } = useCreateProductionOrder();
  const { organization } = useApp();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [dragging, setDragging] = useState<ProductionOrder | null>(null);

  useEffect(() => {
    setOrders(data);
  }, [data]);

  useEffect(() => {
    if (error) {
      showToast('Erro ao carregar ordens de produção', 'error', error);
    }
  }, [error, showToast]);

  const handleDragStart = (order: ProductionOrder) => {
    setDragging(order);
  };

  const handleDropStatus = async (status: ProductionOrder['status']) => {
    if (!dragging || dragging.status === status) return;
    const previous = orders;
    setOrders((current) => current.map((o) => (o.id === dragging.id ? { ...o, status } : o)));
    try {
      await updateStatus(dragging.id, status);
      showToast('Status atualizado com sucesso', 'success');
      refetch();
    } catch (err) {
      setOrders(previous);
      const message = err instanceof Error ? err.message : 'Erro ao atualizar status';
      showToast('Erro ao atualizar status', 'error', message);
    } finally {
      setDragging(null);
    }
  };

  const handleCreate = async () => {
    if (!organization) return;
    try {
      await create({
        organization_id: organization.id,
        code: `OP-${Math.floor(Math.random() * 1000)}`,
        status: 'planned',
        priority: 0,
        planned_start_date: new Date().toISOString(),
      });
      showToast('Ordem de produção criada', 'success');
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar ordem';
      showToast('Erro ao criar ordem', 'error', message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Produção</p>
          <h1 className="text-2xl font-semibold">Ordens de produção</h1>
        </div>
        <Button onClick={handleCreate} loading={creating} className="w-full sm:w-auto">
          Nova ordem
        </Button>
      </div>

      {loading ? (
        <TableSkeleton rows={3} columns={3} />
      ) : error ? (
        <ErrorState description={error} onAction={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Nenhuma ordem de produção"
          description="Crie uma nova OP para começar a acompanhar a produção."
          actionLabel="Nova ordem"
          onAction={handleCreate}
        />
      ) : (
        <ProductionKanbanBoard orders={orders} onDropStatus={handleDropStatus} onDragStart={handleDragStart} />
      )}
    </div>
  );
};

export default ProductionOrdersListPage;
