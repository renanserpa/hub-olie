import React from 'react';
import { LayoutDashboard, DollarSign, Workflow, ShoppingCart, Truck, ShoppingBasket, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ExecutiveModule } from '../../types';

interface ExecutiveTabsProps {
  activeTab: ExecutiveModule;
  onTabChange: (tab: ExecutiveModule) => void;
}

const TABS: { id: ExecutiveModule; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'production', label: 'Produção', icon: Workflow },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart },
    { id: 'logistics', label: 'Logística', icon: Truck },
    { id: 'purchasing', label: 'Compras', icon: ShoppingBasket },
    { id: 'ai_insights', label: 'IA & Relatórios', icon: Sparkles },
];

const ExecutiveTabs: React.FC<ExecutiveTabsProps> = ({ activeTab, onTabChange }) => {
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

export default ExecutiveTabs;