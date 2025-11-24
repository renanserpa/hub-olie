import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { Table } from '../../../components/shared/Table';
import { useCustomers } from '../hooks/useCustomers';
import { useDeleteCustomer } from '../hooks/useDeleteCustomer';
import { Skeleton } from '../../../components/shared/Skeleton';

const CustomersListPage: React.FC = () => {
  const { data, loading, error } = useCustomers();
  const { remove, loading: deleting } = useDeleteCustomer();

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Clientes</p>
          <h1 className="text-2xl font-semibold">CRM</h1>
        </div>
        <Link to="/crm/customers/new">
          <Button>Novo cliente</Button>
        </Link>
      </div>

      {loading && <Skeleton className="h-32 w-full" />}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && (
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
                  <Link className="text-blue-600" to={`/crm/customers/${row.id}`}>
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
