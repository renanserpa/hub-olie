import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { useApp } from '../../contexts/AppContext';
import { Organization } from '../../types';

const OrganizationSelectPage: React.FC = () => {
  const { organizations, selectOrganization, user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (organizations.length === 1) {
      selectOrganization(organizations[0]);
      navigate('/', { replace: true });
    }
  }, [organizations, navigate, selectOrganization]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSelect = (org: Organization) => {
    selectOrganization(org);
    navigate('/', { replace: true });
  };

  return (
    <main
      className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6"
      aria-labelledby="org-select-heading"
      role="main"
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-wide text-slate-500">Organizações</p>
        <h1 id="org-select-heading" className="mt-1 text-2xl font-semibold">
          Escolha o ateliê para trabalhar
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Selecione a unidade onde você quer organizar pedidos e produção. Você pode mudar depois.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2" role="list">
          {organizations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800">
              Nenhum ateliê encontrado para sua conta. Peça para um administrador adicionar você a uma organização.
            </div>
          ) : (
            organizations.map((org) => (
              <div
                key={org.id}
                role="listitem"
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <h3 className="font-semibold">{org.name}</h3>
                <p className="text-xs text-slate-500">ID: {org.id}</p>
                <Button className="mt-3 w-full" onClick={() => handleSelect(org)}>
                  Entrar no ateliê
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default OrganizationSelectPage;
