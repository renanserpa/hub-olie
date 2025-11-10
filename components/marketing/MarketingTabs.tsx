import React, { useState } from 'react';
import { Megaphone, Users, LayoutTemplate, BarChart2, Wrench } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MarketingCampaign, MarketingSegment, MarketingTemplate } from '../../types';
import CampaignList from './CampaignList';
import DashboardPanel from './DashboardPanel';
import MarketingSettingsTab from './MarketingSettingsTab';

type MarketingTab = 'campaigns' | 'settings' | 'dashboard';

interface MarketingTabsProps {
  campaigns: MarketingCampaign[];
  segments: MarketingSegment[];
  templates: MarketingTemplate[];
  isLoading: boolean;
  onNewSegment: () => void;
  onEditSegment: (segment: MarketingSegment) => void;
}

const TABS: { id: MarketingTab, label: string, icon: React.ElementType }[] = [
    { id: 'campaigns', label: 'Campanhas', icon: Megaphone },
    { id: 'settings', label: 'Dados Mestres', icon: Wrench },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
];

const MarketingTabs: React.FC<MarketingTabsProps> = (props) => {
    const [activeTab, setActiveTab] = useState<MarketingTab>('campaigns');
    
    const renderContent = () => {
        switch (activeTab) {
            case 'campaigns':
                return <CampaignList campaigns={props.campaigns} isLoading={props.isLoading} />;
            case 'settings':
                return <MarketingSettingsTab {...props} />;
            case 'dashboard':
                return <DashboardPanel />;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm focus:outline-none',
                                    tab.id === activeTab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-textSecondary hover:text-textPrimary'
                                )}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>
            </div>
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default MarketingTabs;