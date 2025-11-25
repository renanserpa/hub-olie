import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { Table, TableSkeleton } from '../../../components/shared/Table';
import { useCustomers } from '../hooks/useCustomers';
import { useDeleteCustomer } from '../hooks/useDeleteCustomer';
import { ErrorState } from '../../../components/shared/FeedbackStates';
import { useToast } from '../../../contexts/ToastContext';

const CustomersListPage: React.FC = () => {
  const { data, loading, error, refetch } = useCustomers();
  const { remove, loading: deleting, error: deleteError } = useDeleteCustomer();
  const { showToast } = useToast();

  useEffect(() => {
    if (error) {
      showToast('Erro ao carregar clientes', 'error', error);
    }
  }, [error, showToast]);

  useEffect(() => {
    if (deleteError) {
      showToast('Erro ao excluir cliente', 'error', deleteError);
    }
  }, [deleteError, showToast]);

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      await refetch();
      showToast('Cliente excluído com sucesso', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir cliente';
      showToast('Erro ao excluir cliente', 'error', message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Clientes</p>
          <h1 className="text-2xl font-semibold">CRM</h1>
        </div>
        <Link to="/customers/new">
          <Button>Novo cliente</Button>
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
            { key: 'name', label: 'Nome' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Telefone' },
            {
              key: 'id',
              label: 'Ações',
              render: (_, row) => (
                <div className="flex gap-2 text-sm">
                  <Link className="text-blue-600" to={`/customers/${row.id}`}>
                    Editar
                  </Link>
                  <button className="text-red-500" onClick={() => handleDelete(row.id)} disabled={deleting}>
                    Excluir
                  </button>
                </div>
              ),
            },
          ]}
          emptyMessage="Nenhum cliente cadastrado"
        />
      )}
    </div>
  );
};

export default CustomersListPage;
