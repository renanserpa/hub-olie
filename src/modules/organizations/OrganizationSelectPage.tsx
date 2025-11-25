import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { EmptyState, LoadingState } from '../../components/shared/FeedbackStates';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { devLog } from '../../lib/utils/log';
import { Organization } from '../../types';

const OrganizationSelectPage: React.FC = () => {
  const { user, organizations, selectOrganization, loading } = useApp();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (import.meta.env.DEV) {
      devLog('OrgSelect', 'Organizações carregadas', { count: organizations.length });
    }
    if (organizations.length === 1) {
      if (import.meta.env.DEV) {
        devLog('OrgSelect', 'Apenas uma organização, selecionando automaticamente', {
          id: organizations[0].id,
          name: organizations[0].name,
        });
      }
      selectOrganization(organizations[0]);
      if (import.meta.env.DEV) {
        devLog('OrgSelect', 'Redirecionando após seleção automática', { path: '/' });
      }
      navigate('/', { replace: true });
    }
  }, [organizations, navigate, selectOrganization]);

  if (loading) {
    return <LoadingState message="Carregando organizações..." />;
  }

  if (!user) {
    if (import.meta.env.DEV) {
      devLog('OrgSelect', 'Usuário ausente, redirecionando para login');
    }
    return <Navigate to="/login" replace />;
  }

  const handleSelect = (org: Organization) => {
    if (import.meta.env.DEV) {
      devLog('OrgSelect', 'Organização selecionada', { id: org.id, name: org.name });
    }
    selectOrganization(org);
    showToast('Organização selecionada', 'success');
    if (import.meta.env.DEV) {
      devLog('OrgSelect', 'Redirecionando após seleção', { path: '/' });
    }
    navigate('/', { replace: true });
  };

  if (!organizations.length) {
    if (import.meta.env.DEV) {
      devLog('OrgSelect', 'Nenhuma organização encontrada');
    }
    return <EmptyState description="Nenhuma organização disponível." />;
  }

  return (
    <main
      className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6"
      aria-labelledby="org-select-heading"
      role="main"
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-wide text-slate-500">Organizações</p>
        <h1 id="org-select-heading" className="text-2xl font-semibold">
          Selecione uma organização
        </h1>
        <div className="mt-4 grid gap-4">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <h3 className="font-semibold">{org.name}</h3>
              <p className="text-xs text-slate-500">ID: {org.id}</p>
              <Button className="mt-3 w-full" onClick={() => handleSelect(org)}>
                Selecionar
              </Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default OrganizationSelectPage;
