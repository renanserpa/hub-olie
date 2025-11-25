import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { Table, TableSkeleton } from '../../../components/shared/Table';
import { useProductionOrders } from '../hooks/useProductionOrders';
import { useCreateProductionOrder } from '../hooks/useCreateProductionOrder';
import { useApp } from '../../../contexts/AppContext';
import { ErrorState } from '../../../components/shared/FeedbackStates';
import { useToast } from '../../../contexts/ToastContext';

const ProductionOrdersListPage: React.FC = () => {
  const { data, loading, error, refetch } = useProductionOrders();
  const { create, loading: creating } = useCreateProductionOrder();
  const { organization } = useApp();
  const { showToast } = useToast();

  useEffect(() => {
    if (error) {
      showToast('Erro ao carregar ordens de produção', 'error', error);
    }
  }, [error, showToast]);

  const handleCreate = async () => {
    if (!organization) return;
    try {
      await create({
        organization_id: organization.id,
        reference: `OP-${Math.floor(Math.random() * 1000)}`,
        status: 'planned',
        planned_start: new Date().toISOString(),
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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Produção</p>
          <h1 className="text-2xl font-semibold">Ordens de produção</h1>
        </div>
        <Button onClick={handleCreate} loading={creating}>
          Nova ordem
        </Button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} columns={4} />
      ) : error ? (
        <ErrorState description={error} onAction={refetch} />
      ) : (
        <Table
          data={data}
          columns={[
            { key: 'reference', label: 'Referência' },
            { key: 'status', label: 'Status' },
            { key: 'planned_start', label: 'Início planejado' },
            {
              key: 'id',
              label: 'Ação',
              render: (_, row) => (
                <Link className="text-blue-600" to={`/production/${row.id}`}>
                  Detalhes
                </Link>
              ),
            },
          ]}
          emptyMessage="Nenhuma ordem cadastrada"
        />
      )}
    </div>
  );
};

export default ProductionOrdersListPage;
