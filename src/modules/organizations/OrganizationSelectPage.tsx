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
    <main
      className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6"
      aria-labelledby="org-select-heading"
      role="main"
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-wide text-slate-500">Organizações</p>
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <h3 className="font-semibold">{org.name}</h3>
                <p className="text-xs text-slate-500">ID: {org.id}</p>
                <Button className="mt-3 w-full" onClick={() => handleSelect(org)}>
      </div>
    </main>
  );
};

export default OrganizationSelectPage;
