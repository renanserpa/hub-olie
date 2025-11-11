import React, { useState } from 'react';
import { Users, SlidersHorizontal, Sparkles, Puzzle, ImageIcon, BarChart, Cpu } from 'lucide-react';
import TabLayout from './ui/TabLayout';
import { useOlie } from '../contexts/OlieContext';
import TeamsAndPermissionsTabContent from './settings/TeamsAndPermissionsTabContent';
import { GovernancePanel } from './settings/GovernancePanel';
import IntegrationsTabContent from './IntegrationsTabContent';
import AppearanceTabContent from './AppearanceTabContent';
import PlaceholderContent from './PlaceholderContent';
import InitializerPanel from '../modules/Settings/Initializer/InitializerPanel';
import OperationalParamsTabContent from './settings/OperationalParamsTabContent';

const AuditTabContent: React.FC = () => <PlaceholderContent title="Logs de Auditoria" requiredTable="system_audit" icon={BarChart}><p className="mt-1 text-sm text-textSecondary">Visualize um registro de todas as ações importantes realizadas no sistema.</p></PlaceholderContent>;

const SETTINGS_TABS_BASE = [
  { id: 'teams', label: 'Equipes & Permissões', icon: Users, scope: 'Settings' },
  { id: 'parameters', label: 'Parâmetros Globais', icon: SlidersHorizontal, scope: 'Settings' },
  { id: 'governance', label: 'Governança IA', icon: Sparkles, scope: 'Settings' },
  { id: 'integrations', label: 'Integrações', icon: Puzzle, scope: 'Settings' },
  { id: 'appearance', label: 'Aparência', icon: ImageIcon, scope: 'Settings' },
  { id: 'audit', label: 'Auditoria', icon: BarChart, scope: 'Settings' },
];

const SettingsPage: React.FC = () => {
    const { can } = useOlie();
    const [activeTab, setActiveTab] = useState('teams');

    const SETTINGS_TABS = [...SETTINGS_TABS_BASE];
    if (can('Initializer', 'read')) {
        SETTINGS_TABS.push({ id: 'initializer', label: 'Initializer', icon: Cpu, scope: 'Initializer' });
    }
    
    const visibleTabs = SETTINGS_TABS.filter(tab => can(tab.scope, 'read'));

    const handleTabChange = (tabId: string) => setActiveTab(tabId);
    
    const renderMainContent = () => {
        switch (activeTab) {
            case 'teams': return <TeamsAndPermissionsTabContent />;
            case 'parameters': return <OperationalParamsTabContent />;
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
            <div className="mb-6"><TabLayout tabs={visibleTabs} activeTab={activeTab} onTabChange={handleTabChange} /></div>
            <div>{renderMainContent()}</div>
        </div>
    );
};

export default SettingsPage;
