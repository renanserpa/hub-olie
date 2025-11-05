import React, { useState } from 'react';
import { Settings, Puzzle, Monitor, Image as ImageIcon, Shield, Loader2, Cpu } from 'lucide-react';
import TabLayout from './ui/TabLayout';
import IntegrationsTabContent from './IntegrationsTabContent';
import SystemTabContent from './SystemTabContent';
import AppearanceTabContent from './AppearanceTabContent';
import SecurityTabContent from './SecurityTabContent';
import { useSettings } from '../hooks/useSettings';
import { useOlie } from '../contexts/OlieContext';
import InitializerPanel from '../modules/Settings/Initializer/InitializerPanel';

const SETTINGS_TABS_BASE = [
  { id: 'integrations', label: 'Integrações', icon: Puzzle, scope: 'Settings' },
  { id: 'system', label: 'Sistema', icon: Monitor, scope: 'Settings' },
  { id: 'appearance', label: 'Aparência', icon: ImageIcon, scope: 'Settings' },
  { id: 'security', label: 'Segurança', icon: Shield, scope: 'Settings' },
];

const SettingsPage: React.FC = () => {
    const { can } = useOlie();
    const [activeTab, setActiveTab] = useState('integrations');
    const { settingsData, isLoading, isAdmin } = useSettings();

    const SETTINGS_TABS = [...SETTINGS_TABS_BASE];
    if (can('Initializer', 'read')) {
        SETTINGS_TABS.splice(1, 0, { id: 'initializer', label: 'Initializer', icon: Cpu, scope: 'Initializer' });
    }

    const handleTabChange = (tabId: string) => setActiveTab(tabId);
    
    const renderMainContent = () => {
        if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
        if (!settingsData) return <div className="text-center text-red-500">Falha ao carregar configurações.</div>;

        switch (activeTab) {
            case 'integrations': return <IntegrationsTabContent />;
            case 'initializer': return <InitializerPanel />;
            case 'system': return <SystemTabContent initialSettings={settingsData.sistema} isAdmin={isAdmin} />;
            case 'appearance': return <AppearanceTabContent />;
            case 'security': return <SecurityTabContent />;
            default: return null;
        }
    };

    return (
        <div>
            <div className="mb-6"><TabLayout tabs={SETTINGS_TABS} activeTab={activeTab} onTabChange={handleTabChange} /></div>
            <div>{renderMainContent()}</div>
        </div>
    );
};

export default SettingsPage;