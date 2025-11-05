import React, { useState } from 'react';
import { Settings, Puzzle, Image as ImageIcon, Shield, Loader2, Cpu, Building, Users, SlidersHorizontal, BarChart } from 'lucide-react';
import TabLayout from './ui/TabLayout';
import IntegrationsTabContent from './IntegrationsTabContent';
import AppearanceTabContent from './AppearanceTabContent';
import SecurityTabContent from './SecurityTabContent';
import { useSettings } from '../hooks/useSettings';
import { useOlie } from '../contexts/OlieContext';
import InitializerPanel from '../modules/Settings/Initializer/InitializerPanel';
import PlaceholderContent from './PlaceholderContent';

// FIX: New placeholder components for the expanded settings sections.
const OrganizationTabContent: React.FC = () => <PlaceholderContent title="Dados da Organização" requiredTable="company_profile" icon={Building}><p className="mt-1 text-sm text-textSecondary">Gerencie os dados cadastrais da sua empresa, como CNPJ, endereço fiscal e contatos.</p></PlaceholderContent>;
const TeamsAndPermissionsTabContent: React.FC = () => <PlaceholderContent title="Equipes & Permissões" requiredTable="teams, user_roles" icon={Users}><p className="mt-1 text-sm text-textSecondary">Gerencie usuários, crie equipes e defina os níveis de acesso para cada função na plataforma.</p></PlaceholderContent>;
const OperationalParamsTabContent: React.FC = () => <PlaceholderContent title="Parâmetros Operacionais" requiredTable="system_settings (expanded)" icon={SlidersHorizontal}><p className="mt-1 text-sm text-textSecondary">Defina regras de negócio e parâmetros para os módulos de Produção, Financeiro e Logística.</p></PlaceholderContent>;
const AuditTabContent: React.FC = () => <PlaceholderContent title="Logs de Auditoria" requiredTable="system_audit" icon={BarChart}><p className="mt-1 text-sm text-textSecondary">Visualize um registro de todas as ações importantes realizadas no sistema.</p></PlaceholderContent>;


const SETTINGS_TABS_BASE = [
  // FIX: Added new tabs for a more robust settings module.
  { id: 'organization', label: 'Organização', icon: Building, scope: 'Settings' },
  { id: 'teams', label: 'Equipes & Permissões', icon: Users, scope: 'Settings' },
  { id: 'operational_params', label: 'Parâmetros', icon: SlidersHorizontal, scope: 'Settings' },
  { id: 'integrations', label: 'Integrações', icon: Puzzle, scope: 'Settings' },
  { id: 'appearance', label: 'Aparência', icon: ImageIcon, scope: 'Settings' },
  { id: 'security', label: 'Segurança & Auditoria', icon: Shield, scope: 'Settings' },
];

const SettingsPage: React.FC = () => {
    const { can } = useOlie();
    const [activeTab, setActiveTab] = useState('organization');
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
            case 'organization': return <OrganizationTabContent />;
            case 'teams': return <TeamsAndPermissionsTabContent />;
            case 'operational_params': return <OperationalParamsTabContent />;
            case 'integrations': return <IntegrationsTabContent />;
            case 'appearance': return <AppearanceTabContent />;
            case 'security': return <AuditTabContent />; // Replaced with a more specific audit placeholder
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