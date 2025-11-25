import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { EmptyState, ErrorState } from '../../../components/shared/FeedbackStates';
import { Skeleton } from '../../../components/shared/Skeleton';
import { Table, TableSkeleton } from '../../../components/shared/Table';
import { Modal } from '../../../components/shared/Modal';
import { formatDate } from '../../../lib/utils/format';
import { useToast } from '../../../contexts/ToastContext';
import { useCustomers } from '../hooks/useCustomers';
import { useDeleteCustomer } from '../hooks/useDeleteCustomer';
import { Customer } from '../../../types';

const CustomersListPage: React.FC = () => {
  const { data, loading, error, refetch } = useCustomers();
  const { remove, loading: deleting, error: deleteError } = useDeleteCustomer();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [contactFilter, setContactFilter] = useState<'all' | 'email' | 'phone'>('all');
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

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

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return data
      .filter((customer) => {
        if (contactFilter === 'email') return Boolean(customer.email);
        if (contactFilter === 'phone') return Boolean(customer.phone);
        return true;
      })
      .filter((customer) => {
        if (!term) return true;
        return (
          customer.name.toLowerCase().includes(term) ||
          (customer.email || '').toLowerCase().includes(term) ||
          customer.id.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [contactFilter, data, search]);

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      await remove(customerToDelete.id);
      await refetch();
      showToast('Cliente excluído com sucesso', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir cliente';
      showToast('Erro ao excluir cliente', 'error', message);
    } finally {
      setCustomerToDelete(null);
    }
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

    if (!filteredCustomers.length) {
      return (
        <EmptyState
          title="Nenhum cliente encontrado"
          description="Ajuste a busca ou cadastre um novo cliente para começar."
          actionLabel="Cadastrar cliente"
          onAction={() => refetch()}
        />
      );
    }

    return (
      <Table
        data={filteredCustomers}
        columns={[
          { key: 'name', label: 'Nome' },
          {
            key: 'email',
            label: 'Email',
            render: (value) => value || '—',
          },
          {
            key: 'phone',
            label: 'Telefone',
            render: (value) => value || '—',
          },
          {
            key: 'created_at',
            label: 'Criado em',
            render: (value) => formatDate(value as string),
          },
          {
            key: 'id',
            label: 'Ações',
            render: (_, row) => (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link className="font-semibold text-blue-600" to={`/customers/${row.id}`}>
                  Editar
                </Link>
                <button
                  type="button"
                  className="font-semibold text-red-600 hover:underline disabled:opacity-60"
                  onClick={() => setCustomerToDelete(row as Customer)}
                  disabled={deleting}
                >
                  Excluir
                </button>
              </div>
            ),
          },
        ]}
        emptyMessage="Nenhum cliente cadastrado"
      />
    );
  };

  return (
    <main className="space-y-4" aria-labelledby="customers-heading">
      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Clientes</p>
            <h1 id="customers-heading" className="text-2xl font-semibold">
              Gestão de clientes
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Busque e edite dados de contato com feedbacks claros em cada ação.
            </p>
          </div>
          <div className="sm:pt-2">
            <Link to="/customers/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Novo cliente</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="customers-search" className="sr-only">
              Buscar clientes
            </label>
            <input
              id="customers-search"
              type="search"
              placeholder="Buscar por nome, email ou código"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="contact-filter" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Contato
            </label>
            <select
              id="contact-filter"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              value={contactFilter}
              onChange={(event) => setContactFilter(event.target.value as 'all' | 'email' | 'phone')}
            >
              <option value="all">Todos os contatos</option>
              <option value="email">Com email</option>
              <option value="phone">Com telefone</option>
            </select>
          </div>
        </div>
      </div>

      {renderContent()}

      <Modal
        open={Boolean(customerToDelete)}
        title="Confirmar exclusão"
        onClose={() => setCustomerToDelete(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Deseja remover o cliente
            {customerToDelete ? ` "${customerToDelete.name}"` : ''}? Essa ação não pode ser desfeita.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setCustomerToDelete(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmDelete} loading={deleting} variant="primary">
              Confirmar exclusão
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default CustomersListPage;
