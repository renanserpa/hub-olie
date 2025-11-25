import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { useApp } from '../../contexts/AppContext';
import { Organization } from '../../types';
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (organizations.length === 1) {
      selectOrganization(organizations[0]);
      navigate('/', { replace: true });
    }
  }, [organizations, navigate, selectOrganization]);

  if (loading) {
    return <LoadingState message="Carregando organizações..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
    showToast('Organização selecionada', 'success');
    navigate('/', { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-wide text-slate-500">Organizações</p>
        <h1 className="mt-1 text-2xl font-semibold">Selecione uma organização</h1>
        {organizations.length ? (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <h3 className="font-semibold">{org.name}</h3>
                <p className="text-xs text-slate-500">ID: {org.id}</p>
                <Button className="mt-3 w-full" onClick={() => handleSelect(org)}>
                  Entrar
                </Button>
              </div>
            ))}
          </div>
        ) : (
        )}
      </div>
    </div>
  );
};

export default OrganizationSelectPage;
