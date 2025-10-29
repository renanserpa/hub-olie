import React, { useState } from 'react';
import { Megaphone, Users, LayoutTemplate, BarChart2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MarketingCampaign, MarketingSegment, MarketingTemplate } from '../../types';
import CampaignList from './CampaignList';
import SegmentManager from './SegmentManager';
import TemplateEditor from './TemplateEditor';
import DashboardPanel from './DashboardPanel';

type MarketingTab = 'campaigns' | 'segments' | 'templates' | 'dashboard';

interface MarketingTabsProps {
  campaigns: MarketingCampaign[];
  segments: MarketingSegment[];
  templates: MarketingTemplate[];
  isLoading: boolean;
}

const TABS: { id: MarketingTab, label: string, icon: React.ElementType }[] = [
    { id: 'campaigns', label: 'Campanhas', icon: Megaphone },
    { id: 'segments', label: 'Segmentos', icon: Users },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
];

const MarketingTabs: React.FC<MarketingTabsProps> = ({ campaigns, segments, templates, isLoading }) => {
    const [activeTab, setActiveTab] = useState<MarketingTab>('campaigns');
    
    const renderContent = () => {
        switch (activeTab) {
            case 'campaigns':
                return <CampaignList campaigns={campaigns} isLoading={isLoading} />;
            case 'segments':
                return <SegmentManager segments={segments} isLoading={isLoading} />;
            case 'templates':
                return <TemplateEditor templates={templates} isLoading={isLoading} />;
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