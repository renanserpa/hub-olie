import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { isMockMode } from '../../lib/supabase/client';
import { devLog } from '../../lib/utils/log';

export const DebugPage: React.FC = () => {
  const { user, organization, organizations, bootstrapDurationMs } = useApp();
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (isDev) {
      devLog('DebugPage', 'Página de debug montada');
    }
  }, [isDev]);

  return (
    <main className="space-y-4">
      {!isDev && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          Esta página é destinada apenas para uso em desenvolvimento.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Ambiente</h2>
          <div className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-200">
            <p>
              <span className="font-semibold">Modo:</span> {import.meta.env.MODE}
            </p>
            <p>
              <span className="font-semibold">Mock mode:</span> {isMockMode ? 'Ativo' : 'Desativado'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Usuário</h2>
          <div className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-200">
            {user ? (
              <>
                <p>
                  <span className="font-semibold">ID:</span> {user.id}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                {user.name && (
                  <p>
                    <span className="font-semibold">Nome:</span> {user.name}
                  </p>
                )}
              </>
            ) : (
              <p>Nenhum usuário logado</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Organização ativa</h2>
          <div className="mt-3 text-sm text-slate-700 dark:text-slate-200">
            {organization ? (
              <>
                <p>
                  <span className="font-semibold">ID:</span> {organization.id}
                </p>
                <p>
                  <span className="font-semibold">Nome:</span> {organization.name}
                </p>
              </>
            ) : (
              <p>Nenhuma organização selecionada</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Organizações disponíveis</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <p>
              <span className="font-semibold">Total:</span> {organizations.length}
            </p>
            <div className="space-y-1">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <p className="font-semibold">{org.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{org.id}</p>
                </div>
              ))}
              {!organizations.length && <p className="text-sm">Nenhuma organização registrada</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Bootstrap / Diagnóstico</h2>
        <div className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-200">
          {typeof bootstrapDurationMs === 'number' ? (
            <p>
              <span className="font-semibold">Duração do bootstrap (ms):</span> {bootstrapDurationMs}
            </p>
          ) : (
            <p>Duração de bootstrap ainda não exposta pelo contexto.</p>
          )}
        </div>
      </div>
    </main>
  );
};
