import React, { useEffect, useMemo, useState } from 'react';
import { useInventoryItems } from './hooks/useInventoryItems';
import { useInventoryMovements } from './hooks/useInventoryMovements';
import { Table, TableSkeleton } from '../../components/shared/Table';
import { ErrorState } from '../../components/shared/FeedbackStates';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../lib/utils/format';

const InventoryPage: React.FC = () => {
  const items = useInventoryItems();
  const movements = useInventoryMovements();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');

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

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items.data;

    return items.data.filter((item) =>
      [item.name, item.sku].some((value) => value.toLowerCase().includes(term)),
    );
  }, [items.data, search]);

  const filteredMovements = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return movements.data;

    return movements.data.filter((movement) =>
      [movement.note || '', movement.type, movement.id].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [movements.data, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Estoque</p>
          <h1 className="text-2xl font-semibold">Visão geral</h1>
        </div>
        <div className="w-full sm:w-64">
          <label htmlFor="inventory-search" className="sr-only">
            Buscar itens e movimentações
          </label>
          <input
            id="inventory-search"
            type="search"
            placeholder="Buscar por nome, SKU ou observação"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {items.error || movements.error ? (
        <ErrorState
          description={items.error || movements.error || 'Erro ao carregar estoque'}
          onAction={() => {
            items.refetch();
            movements.refetch();
          }}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Itens</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Acompanhe o saldo por SKU.</p>
            </div>
          </div>
          {items.loading ? (
            <TableSkeleton rows={4} columns={3} />
          ) : (
            <Table
              data={filteredItems}
              columns={[
                { key: 'name', label: 'Nome' },
                { key: 'sku', label: 'SKU' },
                { key: 'quantity', label: 'Quantidade' },
              ]}
              emptyMessage={
                search ? 'Nenhum item encontrado para a busca atual.' : 'Nenhum item cadastrado no estoque.'
              }
            />
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Movimentações</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Entradas e saídas recentes.</p>
            </div>
          </div>
          {movements.loading ? (
            <TableSkeleton rows={4} columns={4} />
          ) : (
            <Table
              data={filteredMovements}
              columns={[
                { key: 'type', label: 'Tipo' },
                { key: 'quantity', label: 'Qtd' },
                {
                  key: 'created_at',
                  label: 'Data',
                  render: (value) => formatDate(value as string),
                },
                { key: 'note', label: 'Observação' },
              ]}
              emptyMessage={
                search
                  ? 'Nenhuma movimentação encontrada para a busca atual.'
                  : 'Sem movimentações registradas ainda.'
              }
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default InventoryPage;
