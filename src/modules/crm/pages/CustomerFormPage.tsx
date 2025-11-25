import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { useCustomers } from '../hooks/useCustomers';
import { isMockMode, supabase, upsertMockCustomer } from '../../../lib/supabase/client';
import { useApp } from '../../../contexts/AppContext';
import { Customer } from '../../../types';
import { ErrorState, LoadingState } from '../../../components/shared/FeedbackStates';
import { useToast } from '../../../contexts/ToastContext';

const CustomerFormPage: React.FC = () => {
  const { id } = useParams();
  const { organization } = useApp();
  const { data, loading, error: customersError, refetch } = useCustomers();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const customer = useMemo(() => data.find((c) => c.id === id), [data, id]);

  const [name, setName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
    }
  }, [customer]);

  useEffect(() => {
    if (customersError) {
      showToast('Erro ao carregar clientes', 'error', customersError);
    }
  }, [customersError, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    setSaving(true);
    setFormError(null);
    try {
      const payload: Customer = {
        id: id || crypto.randomUUID(),
        organization_id: organization.id,
        name,
        email,
        phone,
        created_at: customer?.created_at || new Date().toISOString(),
      };
      if (isMockMode) {
        const result = await upsertMockCustomer(payload);
        if (result.error) throw result.error;
      } else {
        const { error } = await supabase.from('customers').upsert(payload);
        if (error) throw error;
      }
      navigate('/customers');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar cliente';
      setFormError(message);
      showToast('Erro ao salvar cliente', 'error', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Carregando cliente..." />;
  if (customersError) return <ErrorState description={customersError} onAction={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Clientes</p>
          <h1 className="text-2xl font-semibold">{id ? 'Editar cliente' : 'Novo cliente'}</h1>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Nome</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Telefone</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        {formError && <p className="text-sm text-red-500">{formError}</p>}
        <Button type="submit" loading={saving}>
          Salvar
        </Button>
      </form>
    </div>
  );
};

export default CustomerFormPage;
