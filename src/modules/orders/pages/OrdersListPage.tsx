import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { useOrders } from '../hooks/useOrders';
import { ErrorState } from '../../../components/shared/FeedbackStates';
import { useToast } from '../../../contexts/ToastContext';
import { Table, TableSkeleton } from '../../../components/shared/Table';
import { ORDER_STATUS_META, OrderStatus } from '../../../constants/orders';
import { formatCurrency, formatDate } from '../../../lib/utils/format';

const OrdersListPage: React.FC = () => {
  const { data, loading, error, refetch } = useOrders();
  const { showToast } = useToast();

  useEffect(() => {
    if (error) {
      showToast('Erro ao carregar pedidos', 'error', error);
    }
  }, [error, showToast]);

  return (
    <main className="space-y-4" aria-labelledby="orders-heading">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Pedidos</p>
          <h1 id="orders-heading" className="text-2xl font-semibold">
            Lista de pedidos
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Acompanhe os pedidos do ateliê e avance para os detalhes com um clique.
          </p>
        </div>
        <Link to="/orders/new">
          <Button>Novo pedido</Button>
        </Link>
      </div>

      {loading ? (
        <TableSkeleton rows={4} columns={5} />
      ) : error ? (
        <ErrorState description={error} onAction={refetch} />
      ) : (
        <Table
          data={data}
          columns={[
            { key: 'customer_name', label: 'Cliente' },
            {
              key: 'status',
              label: 'Status',
              render: (value) => ORDER_STATUS_META[value as OrderStatus].label,
            },
            {
              key: 'total',
              label: 'Total',
              render: (value) => formatCurrency(Number(value)),
            },
            { key: 'created_at', label: 'Criado em', render: (value) => formatDate(value as string) },
            {
              key: 'id',
              label: 'Ação',
              render: (_, row) => (
                <Link className="text-blue-600" to={`/orders/${row.id}`}>
                  Detalhes
                </Link>
              ),
            },
          ]}
          emptyMessage="Nenhum pedido encontrado ainda. Cadastre o primeiro para acompanhar o fluxo."
        />
      )}
    </main>
  );
};

export default OrdersListPage;
