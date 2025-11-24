import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { Table } from '../../../components/shared/Table';
import { useProductionOrders } from '../hooks/useProductionOrders';
import { useCreateProductionOrder } from '../hooks/useCreateProductionOrder';
import { Skeleton } from '../../../components/shared/Skeleton';
import { useApp } from '../../../contexts/AppContext';

const ProductionOrdersListPage: React.FC = () => {
  const { data, loading, error } = useProductionOrders();
  const { create, loading: creating } = useCreateProductionOrder();
  const { organization } = useApp();

  const handleCreate = async () => {
    if (!organization) return;
    await create({
      organization_id: organization.id,
      reference: `OP-${Math.floor(Math.random() * 1000)}`,
      status: 'planned',
      planned_start: new Date().toISOString(),
    });
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

      {loading && <Skeleton className="h-32 w-full" />}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && (
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
