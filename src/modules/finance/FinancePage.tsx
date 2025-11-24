import React from 'react';

const FinancePage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Finanças</p>
        <h1 className="text-2xl font-semibold">Painel financeiro</h1>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Configure conciliações, contas a receber e a pagar. Este módulo compartilha a mesma organização selecionada.
      </p>
    </div>
  );
};

export default FinancePage;
