import React from 'react';
import { Button } from './shared/Button';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AppTour: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Bem-vindo ao OlieHub</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Este tour rápido destaca os módulos principais: Dashboard, Pedidos, CRM, Produção, Estoque, Logística e Finanças.
          Use o menu lateral para navegar. Você pode reabrir este tour em Configurações.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};
