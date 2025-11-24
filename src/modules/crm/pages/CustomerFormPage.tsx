import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { useCustomers } from '../hooks/useCustomers';
import { Skeleton } from '../../../components/shared/Skeleton';
import { supabase, isMock, fetchMockTable } from '../../../lib/supabase/client';
import { useApp } from '../../../contexts/AppContext';
import { Customer } from '../../../types';

const CustomerFormPage: React.FC = () => {
  const { id } = useParams();
  const { organization } = useApp();
  const { data, loading } = useCustomers();
  const navigate = useNavigate();
  const customer = data.find((c) => c.id === id);

  const [name, setName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    setSaving(true);
    setError(null);
    try {
      const payload: Customer = {
        id: id || crypto.randomUUID(),
        organization_id: organization.id,
        name,
        email,
        phone,
        created_at: customer?.created_at || new Date().toISOString(),
      };
      if (isMock) {
        const { data } = await fetchMockTable<Customer>('customers', organization.id);
        if (data) {
          const idx = data.findIndex((row) => row.id === payload.id);
          if (idx >= 0) data[idx] = payload;
          else data.push(payload);
        }
      } else {
        const { error } = await supabase.from('customers').upsert(payload);
        if (error) throw error;
      }
      navigate('/crm/customers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cliente');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-32 w-full" />;

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
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" loading={saving}>
          Salvar
        </Button>
      </form>
    </div>
  );
};

export default CustomerFormPage;
