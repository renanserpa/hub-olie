import React from 'react';
import { PackageSearch, Boxes, Send, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

type LogisticsTab = 'queue' | 'picking' | 'shipment' | 'settings';

interface LogisticsTabsProps {
  activeTab: LogisticsTab;
  onTabChange: (tab: LogisticsTab) => void;
}

const TABS: { id: LogisticsTab, label: string, icon: React.ElementType }[] = [
    { id: 'queue', label: 'Fila & Ondas', icon: PackageSearch },
    { id: 'picking', label: 'Picking & Packing', icon: Boxes },
    { id: 'shipment', label: 'Expedição', icon: Send },
    { id: 'settings', label: 'Configurações', icon: Settings },
];

const LogisticsTabs: React.FC<LogisticsTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="border-b border-border">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
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
    );
};

export default LogisticsTabs;