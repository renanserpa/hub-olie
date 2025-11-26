import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { EmptyState, ErrorState } from '../../../components/shared/FeedbackStates';
import { Skeleton } from '../../../components/shared/Skeleton';
import { Table, TableSkeleton } from '../../../components/shared/Table';
import { ORDER_STATUS_FILTERS, ORDER_STATUS_META, OrderStatus } from '../../../constants/orders';
import { formatCurrency, formatDate } from '../../../lib/utils/format';
import { useToast } from '../../../contexts/ToastContext';
import { useOrders } from '../hooks/useOrders';
import { Order } from '../../../types';

const OrdersListPage: React.FC = () => {
  const { data, loading, error, refetch } = useOrders();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (error) {
      showToast('Erro ao carregar pedidos', 'error', error);
    }
  }, [error, showToast]);

  const filteredOrders = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return data
      .filter((order) => (statusFilter === 'all' ? true : order.status === statusFilter))
      .filter((order) => {
        if (!searchTerm) return true;
        return (
          order.customer_name.toLowerCase().includes(searchTerm) ||
          order.id.toLowerCase().includes(searchTerm)
        );
      })
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [data, search, statusFilter]);

  const renderHeaderActions = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center gap-2">
        <label htmlFor="status-filter" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Status
        </label>
        <select
          id="status-filter"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as OrderStatus | 'all')}
        >
          {ORDER_STATUS_FILTERS.map((filter) => (
            <option key={filter.key} value={filter.key}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-1 items-center gap-2">
        <label htmlFor="orders-search" className="sr-only">
          Buscar pedidos
        </label>
        <input
          id="orders-search"
          type="search"
          placeholder="Buscar por cliente ou código"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <Link to="/orders/new" className="w-full sm:w-auto">
        <Button className="w-full sm:w-auto">Novo pedido</Button>
      </Link>
    </div>
  );

  const renderStatusBadge = (status: OrderStatus) => {
    const meta = ORDER_STATUS_META[status];
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${meta.badgeClass} ${meta.textClass}`}
      >
        {meta.label}
      </span>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <TableSkeleton rows={4} columns={5} />
        </div>
      );
    }

    if (error) {
      return <ErrorState description={error} onAction={refetch} />;
    }

      if (!filteredOrders.length) {
        return (
          <EmptyState
            title="Nenhum pedido encontrado."
            description="Ajuste os filtros ou cadastre um novo pedido."
            actionLabel="Cadastrar pedido"
            onAction={() => refetch()}
          />
        );
    }

    return (
      <Table
        data={filteredOrders}
        columns={[
          { key: 'customer_name', label: 'Cliente' },
          {
            key: 'status',
            label: 'Status',
            render: (value) => renderStatusBadge(value as OrderStatus),
          },
          {
            key: 'total',
            label: 'Total',
            render: (value) => formatCurrency(Number(value)),
          },
          {
            key: 'due_date',
            label: 'Entrega',
            render: (value) => formatDate(value as string),
          },
          {
            key: 'created_at',
            label: 'Criado em',
            render: (value) => formatDate(value as string),
          },
          {
            key: 'id',
            label: 'Ação',
            render: (_, row) => (
              <Link className="text-sm font-semibold text-blue-600" to={`/orders/${(row as Order).id}`}>
                Detalhes
              </Link>
            ),
          },
        ]}
        emptyMessage="Nenhum pedido encontrado."
      />
    );
  };

  return (
    <main className="space-y-4" aria-labelledby="orders-heading">
      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Pedidos</p>
            <h1 id="orders-heading" className="text-2xl font-semibold">
              Gestão de pedidos
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Visualize, filtre e detalhe os pedidos do ateliê.</p>
          </div>
          <div className="w-full sm:w-auto sm:pt-2">{renderHeaderActions}</div>
        </div>
      </div>

      {renderContent()}
    </main>
  );
};

export default OrdersListPage;
