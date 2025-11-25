import React, { useEffect } from 'react';
import { useInventoryItems } from './hooks/useInventoryItems';
import { useInventoryMovements } from './hooks/useInventoryMovements';
import { Table, TableSkeleton } from '../../components/shared/Table';
import { ErrorState, LoadingState } from '../../components/shared/FeedbackStates';
import { useToast } from '../../contexts/ToastContext';

const InventoryPage: React.FC = () => {
  const items = useInventoryItems();
  const movements = useInventoryMovements();
  const { showToast } = useToast();

  useEffect(() => {
    if (items.error) {
      showToast('Erro ao carregar itens de estoque', 'error', items.error);
    }
  }, [items.error, showToast]);

  useEffect(() => {
    if (movements.error) {
      showToast('Erro ao carregar movimentações', 'error', movements.error);
    }
  }, [movements.error, showToast]);

  if (items.loading || movements.loading) return <LoadingState message="Carregando estoque..." />;

  if (items.error || movements.error)
    return (
      <ErrorState
        description={items.error || movements.error || 'Erro ao carregar estoque'}
        onAction={() => {
          items.refetch();
          movements.refetch();
        }}
      />
    );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Estoque</p>
        <h1 className="text-2xl font-semibold">Visão geral</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Itens</h2>
          {items.loading ? (
            <TableSkeleton rows={4} columns={3} />
          ) : (
            <Table
              data={items.data}
              columns={[
                { key: 'name', label: 'Nome' },
                { key: 'sku', label: 'SKU' },
                { key: 'quantity', label: 'Quantidade' },
              ]}
              emptyMessage="Nenhum item"
            />
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold">Movimentações</h2>
          {movements.loading ? (
            <TableSkeleton rows={4} columns={4} />
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
