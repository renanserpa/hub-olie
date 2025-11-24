import React from 'react';
import { Button } from '../../components/shared/Button';
import { useApp } from '../../contexts/AppContext';

const SettingsPage: React.FC = () => {
  const { selectOrganization } = useApp();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Configurações</p>
        <h1 className="text-2xl font-semibold">Preferências</h1>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <h3 className="font-semibold">Tour</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">Reinicie o tour rápido do produto.</p>
        <Button className="mt-2" onClick={() => localStorage.setItem('oh:tour', 'false')}>
          Reativar tour
        </Button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <h3 className="font-semibold">Organização</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">Volte para a seleção de organização.</p>
        <Button className="mt-2" onClick={() => selectOrganization(null as never)}>
          Trocar organização
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
