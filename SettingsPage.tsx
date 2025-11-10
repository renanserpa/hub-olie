import React, { useState } from 'react';
import { Settings, Puzzle, Image as ImageIcon, Shield, Loader2, Cpu, Building, Users, SlidersHorizontal, BarChart, Sparkles } from 'lucide-react';
import TabLayout from './ui/TabLayout';
import IntegrationsTabContent from './IntegrationsTabContent';
import AppearanceTabContent from './AppearanceTabContent';
import SecurityTabContent from './SecurityTabContent';
import { useSettings } from '../hooks/useSettings';
import { useOlie } from '../contexts/OlieContext';
import InitializerPanel from '../modules/Settings/Initializer/InitializerPanel';
import PlaceholderContent from './PlaceholderContent';
import TeamsAndPermissionsTabContent from './settings/TeamsAndPermissionsTabContent';
import SystemTabContent from '../components/SystemTabContent';
import { GovernancePanel } from './settings/GovernancePanel';

const AuditTabContent: React.FC = () => <PlaceholderContent title="Logs de Auditoria" requiredTable="system_audit" icon={BarChart}><p className="mt-1 text-sm text-textSecondary">Visualize um registro de todas as ações importantes realizadas no sistema.</p></PlaceholderContent>;


const SETTINGS_TABS_BASE = [
  { id: 'teams', label: 'Equipes & Permissões', icon: Users, scope: 'Settings' },
  { id: 'parameters', label: 'Parâmetros Globais', icon: SlidersHorizontal, scope: 'Settings' },
  { id: 'governance', label: 'Governança IA', icon: Sparkles, scope: 'Settings' },
  { id: 'integrations', label: 'Integrações', icon: Puzzle, scope: 'Settings' },
  { id: 'appearance', label: 'Aparência', icon: ImageIcon, scope: 'Settings' },
  { id: 'audit', label: 'Logs de Auditoria', icon: BarChart, scope: 'Settings' },
];

const SettingsPage: React.FC = () => {
    const { can } = useOlie();
    const [activeTab, setActiveTab] = useState('teams');
    const { settingsData, isLoading, isAdmin } = useSettings();

    const SETTINGS_TABS = [...SETTINGS_TABS_BASE];
    if (can('Initializer', 'read')) {
        SETTINGS_TABS.push({ id: 'initializer', label: 'Initializer', icon: Cpu, scope: 'Initializer' });
    }

    const handleTabChange = (tabId: string) => setActiveTab(tabId);
    
    const renderMainContent = () => {
        if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
        if (!settingsData) return <div className="text-center text-red-500">Falha ao carregar configurações.</div>;

        switch (activeTab) {
            case 'teams': return <TeamsAndPermissionsTabContent />;
            case 'parameters': return <SystemTabContent initialSettings={settingsData?.sistema || []} isAdmin={isAdmin} />;
            case 'governance': return <div className="max-w-3xl mx-auto"><GovernancePanel /></div>;
            case 'integrations': return <IntegrationsTabContent />;
            case 'appearance': return <AppearanceTabContent />;
            case 'audit': return <AuditTabContent />;
            case 'initializer': return <InitializerPanel />;
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