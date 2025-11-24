import React from 'react';

const LogisticsPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Logística</p>
        <h1 className="text-2xl font-semibold">Status logístico</h1>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Integrações logísticas serão configuradas aqui. Use esta página para acompanhar entregas e coletas.
      </p>
    </div>
  );
};

export default LogisticsPage;
