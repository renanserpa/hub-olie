import React from 'react';
import { useInventoryItems } from './hooks/useInventoryItems';
import { useInventoryMovements } from './hooks/useInventoryMovements';
import { Table } from '../../components/shared/Table';
import { Skeleton } from '../../components/shared/Skeleton';

const InventoryPage: React.FC = () => {
  const items = useInventoryItems();
  const movements = useInventoryMovements();

  if (items.loading || movements.loading) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Estoque</p>
        <h1 className="text-2xl font-semibold">Visão geral</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Itens</h2>
          <Table
            data={items.data}
            columns={[
              { key: 'name', label: 'Nome' },
              { key: 'sku', label: 'SKU' },
              { key: 'quantity', label: 'Quantidade' },
            ]}
            emptyMessage="Nenhum item"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Movimentações</h2>
          <Table
            data={movements.data}
            columns={[
              { key: 'type', label: 'Tipo' },
              { key: 'quantity', label: 'Qtd' },
              { key: 'created_at', label: 'Data' },
              { key: 'note', label: 'Observação' },
            ]}
            emptyMessage="Sem movimentações"
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
