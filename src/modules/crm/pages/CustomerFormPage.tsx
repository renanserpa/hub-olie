import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/shared/Button';
import { ErrorState, LoadingState } from '../../../components/shared/FeedbackStates';
import { useApp } from '../../../contexts/AppContext';
import { useToast } from '../../../contexts/ToastContext';
import { Customer } from '../../../types';
import { useCustomers } from '../hooks/useCustomers';
import { isMockMode, supabase, upsertMockCustomer } from '../../../lib/supabase/client';
import { isValidEmail, normalizePhoneDigits } from '../../../lib/utils/format';

const CustomerFormPage: React.FC = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { organization } = useApp();
  const { data, loading, error: customersError, refetch } = useCustomers();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const customer = useMemo(() => data.find((c) => c.id === id), [data, id]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

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

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError(null);
      return true;
    }
    if (!isValidEmail(value)) {
      setEmailError('Informe um e-mail válido.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePhone = (value: string) => {
    const digits = normalizePhoneDigits(value);
    if (!digits) {
      setPhoneError(null);
      return true;
    }
    if (digits.length < 10) {
      setPhoneError('Informe um telefone válido com DDD.');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) {
      setFormError('Selecione uma organização para continuar.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const payload: Customer = {
        id: id || crypto.randomUUID(),
        organization_id: organization.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        created_at: customer?.created_at || new Date().toISOString(),
      };

      if (isMockMode) {
        const result = await upsertMockCustomer(payload);
        if (result.error) throw result.error;
      } else {
        const { error } = await supabase.from('customers').upsert(payload);
        if (error) throw error;
      }

      showToast(id ? 'Cliente atualizado com sucesso' : 'Cliente criado com sucesso', 'success');
      navigate('/customers');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar cliente';
      setFormError(message);
      showToast('Erro ao salvar cliente', 'error', message);
    } finally {
      setSaving(false);
    }
  };

  if (isEditing && loading) return <LoadingState message="Carregando cliente..." />;
  if (isEditing && customersError) return <ErrorState description={customersError} onAction={refetch} />;
  if (isEditing && !customer && !loading) return <ErrorState description="Cliente não encontrado." onAction={() => navigate('/customers')} />;

  return (
    <main className="space-y-4" aria-labelledby="customer-form-heading">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Clientes</p>
          <h1 id="customer-form-heading" className="text-2xl font-semibold">
            {isEditing ? 'Editar cliente' : 'Novo cliente'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Preencha os dados do contato para manter o CRM organizado.
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} aria-label="Formulário de cliente">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="customer-name">
            Nome
          </label>
          <input
            id="customer-name"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Nome completo"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="customer-email">
              Email
            </label>
            <input
              id="customer-email"
              placeholder="contato@email.com"
            />
            {emailError ? (
              <p
                id="customer-email-error"
                className="mt-1 text-sm text-red-500"
                role="alert"
                aria-live="assertive"
              >
                {emailError}
              </p>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="customer-phone">
              Telefone
            </label>
            <input
              id="customer-phone"
              placeholder="(11) 99999-9999"
            />
            {phoneError ? (
              <p
                id="customer-phone-error"
                className="mt-1 text-sm text-red-500"
                role="alert"
                aria-live="assertive"
              >
                {phoneError}
              </p>
            ) : null}
          </div>
        </div>
        {formError ? (
          <p className="text-sm text-red-500" role="alert" aria-live="assertive">
            {formError}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/customers')}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            {isEditing ? 'Salvar alterações' : 'Criar cliente'}
          </Button>
        </div>
      </form>
    </main>
  );
};

export default CustomerFormPage;
