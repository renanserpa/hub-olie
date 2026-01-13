import React from 'react';
import { LayoutDashboard, ShoppingCart, Workflow, Package, Truck, DollarSign, Megaphone } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnalyticsModule } from '../../types';

interface AnalyticsTabsProps {
  activeTab: AnalyticsModule;
  onTabChange: (tab: AnalyticsModule) => void;
}

const TABS: { id: AnalyticsModule; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'orders', label: 'Vendas', icon: ShoppingCart },
    { id: 'production', label: 'Produção', icon: Workflow },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'logistics', label: 'Logística', icon: Truck },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
];

const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="border-b border-border">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
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

export default AnalyticsTabs;
