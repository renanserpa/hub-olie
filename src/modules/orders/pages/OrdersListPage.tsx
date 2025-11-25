import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { Table, TableSkeleton } from '../../../components/shared/Table';
import { useOrders } from '../hooks/useOrders';
import { ErrorState } from '../../../components/shared/FeedbackStates';
import { useToast } from '../../../contexts/ToastContext';

const OrdersListPage: React.FC = () => {
  const { data, loading, error, refetch } = useOrders();
  const { showToast } = useToast();

  useEffect(() => {
    if (error) {
      showToast('Erro ao carregar pedidos', 'error', error);
    }
  }, [error, showToast]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Pedidos</p>
          <h1 className="text-2xl font-semibold">Lista de pedidos</h1>
        </div>
        <Link to="/orders/new">
          <Button>Novo pedido</Button>
        </Link>
      </div>

      {loading ? (
        <TableSkeleton rows={4} columns={4} />
      ) : error ? (
        <ErrorState description={error} onAction={refetch} />
      ) : (
        <Table
          data={data}
          columns={[
            { key: 'customer_name', label: 'Cliente' },
            { key: 'status', label: 'Status' },
            {
              key: 'total',
              label: 'Total',
              render: (value) => `R$ ${Number(value).toLocaleString('pt-BR')}`,
            },
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
          emptyMessage="Nenhum pedido encontrado"
        />
      )}
    </div>
  );
};

export default OrdersListPage;
