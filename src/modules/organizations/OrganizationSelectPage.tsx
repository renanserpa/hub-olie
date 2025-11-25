import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { EmptyState, LoadingState } from '../../components/shared/FeedbackStates';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { Organization } from '../../types';
import { devLog } from '../../lib/utils/log';

const OrganizationSelectPage: React.FC = () => {
  const { user, organizations, selectOrganization, loading } = useApp();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (import.meta.env.DEV) {
      devLog('OrganizationSelectPage', 'Página montada');
    }
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) {
      devLog('OrganizationSelectPage', 'Render inicial ou mudança de estado', {
        loading,
        hasUser: !!user,
        orgCount: organizations.length,
      });
    }

    if (!loading && user && organizations.length === 1) {
      if (import.meta.env.DEV) {
        devLog('OrganizationSelectPage', 'Selecionando organização automaticamente', {
          orgId: organizations[0].id,
        });
      }

      selectOrganization(organizations[0]);
      navigate('/', { replace: true });
    }
  }, [navigate, organizations, selectOrganization, user, loading]);

  if (loading) {
    return <LoadingState message="Carregando organizações..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSelect = (org: Organization) => {
    if (import.meta.env.DEV) {
      devLog('OrganizationSelectPage', 'Organização selecionada', {
        orgId: org.id,
        target: '/',
      });
    }

    selectOrganization(org);
    showToast('Organização selecionada', 'success');
    navigate('/', { replace: true });
  };

  if (!organizations.length) {
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
