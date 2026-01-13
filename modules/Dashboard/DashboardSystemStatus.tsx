import React from 'react';

interface SystemStatus {
    env: string;
    lastSync: string | null;
    supabaseConnected: boolean;
}

export default function DashboardSystemStatus({ status }: { status: SystemStatus }) {
  return (
    <section className="bg-secondary dark:bg-dark-secondary p-4 rounded-lg border border-border dark:border-dark-border text-sm">
      <h2 className="font-semibold mb-2 text-textPrimary dark:text-dark-textPrimary">Status do Sistema</h2>
      <ul className="text-textSecondary dark:text-dark-textSecondary grid grid-cols-3 gap-4">
        <li>Ambiente: <b className="text-textPrimary dark:text-dark-textPrimary">{status.env}</b></li>
        <li>Última sincronização: <b className="text-textPrimary dark:text-dark-textPrimary">{status.lastSync ? new Date(status.lastSync).toLocaleTimeString('pt-BR') : '—'}</b></li>
        <li>Supabase: {status.supabaseConnected ? <b className="text-green-600">Conectado</b> : <b className="text-red-600">Offline</b>}</li>
      </ul>
    </section>
  );
}
