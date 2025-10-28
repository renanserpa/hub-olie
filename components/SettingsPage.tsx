import React from 'react';
import { Settings } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Settings className="text-primary" size={28} />
            <h1 className="text-3xl font-bold text-textPrimary">Configurações</h1>
          </div>
          <p className="text-textSecondary mt-1">
            Gerencie as configurações globais da plataforma. (Módulo em refatoração)
          </p>
        </div>
      </div>
      <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
        <p>O módulo de configurações está sendo aprimorado.</p>
      </div>
    </div>
  );
};

export default SettingsPage;