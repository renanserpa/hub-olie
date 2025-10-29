import React from 'react';
import { Settings, Puzzle } from 'lucide-react';
import TabLayout from './ui/TabLayout';
import IntegrationsTabContent from './IntegrationsTabContent';

const SETTINGS_TABS = [
  { id: 'integrations', label: 'Integrações', icon: Puzzle },
  // Add other tabs here as they are re-enabled
];

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('integrations');

  const renderContent = () => {
    switch (activeTab) {
      case 'integrations':
        return <IntegrationsTabContent />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Settings className="text-primary" size={28} />
            <h1 className="text-3xl font-bold text-textPrimary">Configurações</h1>
          </div>
          <p className="text-textSecondary mt-1">
            Gerencie as integrações e configurações globais da plataforma.
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <TabLayout
          tabs={SETTINGS_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default SettingsPage;