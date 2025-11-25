import React, { useEffect, useMemo, useState } from 'react';
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
  const [search, setSearch] = useState('');

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

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter((order) =>
      [order.code, order.status].some((value) => value.toLowerCase().includes(term)),
    );
  }, [orders, search]);

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
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <div className="w-full sm:w-56">
            <label htmlFor="production-search" className="sr-only">
              Buscar ordens de produção
            </label>
            <input
              id="production-search"
              type="search"
              placeholder="Buscar por código ou status"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Button onClick={handleCreate} loading={creating} className="w-full sm:w-auto">
            Nova ordem
          </Button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={3} columns={3} />
      ) : error ? (
        <ErrorState description={error} onAction={refetch} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="Nenhuma ordem de produção"
          description={
            search
              ? 'Ajuste a busca ou limpe o filtro para visualizar as ordens.'
              : 'Crie uma nova OP para começar a acompanhar a produção.'
          }
          actionLabel="Nova ordem"
          onAction={handleCreate}
        />
      ) : (
        <ProductionKanbanBoard
          orders={filteredOrders}
          onDropStatus={handleDropStatus}
          onDragStart={handleDragStart}
        />
      )}
    </div>
  );
};

export default ProductionOrdersListPage;
