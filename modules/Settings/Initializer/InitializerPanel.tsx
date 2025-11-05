import React from 'react';
import { useInitializer } from './useInitializer';
import { Button } from '../../../components/ui/Button';

export default function InitializerPanel() {
  const { status, reload, hardReload, isAdminGeral } = useInitializer();

  return (
    <div className="p-6 space-y-4 bg-card rounded-lg">
      <h1 className="text-xl font-semibold">System Initializer (Settings)</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Ambiente: <b>{status.env}</b> — Supabase: 
        {status.supabaseConnected ? 
          <span className="text-green-600 ml-1">Conectado</span> : 
          <span className="text-red-600 ml-1">Offline</span>}
      </p>

      {status.warnings && status.warnings.length > 0 && (
        <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-lg text-xs text-yellow-800">
          <b>Avisos:</b>
          <ul className="list-disc ml-5 mt-1">
            {status.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <section className="mt-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Módulos detectados</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {status.modulesDetected.map((m) => (
            <div key={m} className="px-3 py-2 bg-secondary dark:bg-dark-secondary rounded-md text-textPrimary dark:text-dark-textPrimary">{m}</div>
          ))}
        </div>
      </section>

      <section className="mt-6 text-sm">
        <div><b>Última Sincronização:</b> {status.lastSync ? new Date(status.lastSync).toLocaleString('pt-BR') : 'N/A'}</div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Configurações Carregadas</h2>
        <pre className="bg-secondary dark:bg-dark-secondary text-xs p-4 rounded-lg overflow-x-auto max-h-48">
          {JSON.stringify(status.settings, null, 2)}
        </pre>
      </section>

      <section className="mt-6 flex gap-2 border-t pt-4">
        <Button onClick={reload} variant="outline">
          Recarregar
        </Button>
        <Button
          onClick={hardReload}
          disabled={!isAdminGeral}
          variant="destructive"
          title={isAdminGeral ? 'Executa boot crítico (AdminGeral)' : 'Apenas AdminGeral pode executar'}
        >
          Hard Reload (Admin)
        </Button>
      </section>
    </div>
  );
}
