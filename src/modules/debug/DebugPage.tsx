import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { isMockMode } from '../../lib/supabase/client';
import { devLog } from '../../lib/utils/log';

export const DebugPage: React.FC = () => {
  const { user, organization, organizations, bootstrapDurationMs } = useApp();

  useEffect(() => {
    if (import.meta.env.DEV) {
      devLog('DebugPage', 'Página de debug montada');
    }
  }, []);

  const renderEnvironment = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">Ambiente</h2>
      <dl className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Modo</dt>
          <dd className="font-mono">{import.meta.env.MODE}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">NODE_ENV</dt>
          <dd className="font-mono">{import.meta.env.NODE_ENV}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Mock mode</dt>
          <dd className="font-mono">{isMockMode ? 'Ativo' : 'Desativado'}</dd>
        </div>
      </dl>
    </div>
  );

  const renderUser = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">Usuário</h2>
      {user ? (
        <dl className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">ID</dt>
            <dd className="font-mono">{user.id}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-mono">{user.email}</dd>
          </div>
          {user.name && (
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Nome</dt>
              <dd className="font-mono">{user.name}</dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Nenhum usuário logado</p>
      )}
    </div>
  );

  const renderActiveOrganization = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">Organização ativa</h2>
      {organization ? (
        <dl className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">ID</dt>
            <dd className="font-mono">{organization.id}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Nome</dt>
            <dd className="font-mono">{organization.name}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Nenhuma organização selecionada</p>
      )}
    </div>
  );

  const renderOrganizationsList = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">Organizações disponíveis</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Total: {organizations.length}</p>
      {organizations.length ? (
        <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
          {organizations.map((org) => (
            <li key={org.id} className="flex items-center justify-between">
              <span className="text-slate-500">{org.id}</span>
              <span className="font-medium">{org.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Nenhuma organização disponível</p>
      )}
    </div>
  );

  const renderBootstrap = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">Bootstrap / Diagnóstico</h2>
      {typeof bootstrapDurationMs === 'number' ? (
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
          Duração do bootstrap: <span className="font-mono font-semibold">{bootstrapDurationMs}ms</span>
        </p>
      ) : (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Duração de bootstrap ainda não exposta pelo contexto.
        </p>
      )}
    </div>
  );

  return (
    <main className="space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Esta página é destinada apenas para uso em desenvolvimento.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {renderEnvironment()}
        {renderUser()}
        {renderActiveOrganization()}
        {renderOrganizationsList()}
        {renderBootstrap()}
      </div>
    </main>
  );
};
