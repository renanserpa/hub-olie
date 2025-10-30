import React from 'react';
import { LayoutDashboard, ArrowRightLeft, FileText, BarChart2, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

type FinanceTab = 'overview' | 'transactions' | 'payables_receivables' | 'reports' | 'settings';

interface FinanceTabsProps {
  activeTab: string;
  onTabChange: (tab: FinanceTab) => void;
}

const TABS: { id: FinanceTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', icon: ArrowRightLeft },
    { id: 'payables_receivables', label: 'Contas P/R', icon: FileText },
    { id: 'reports', label: 'Relatórios', icon: BarChart2 },
    { id: 'settings', label: 'Configurações', icon: Settings },
];

const FinanceTabs: React.FC<FinanceTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="border-b border-border dark:border-dark-border">
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
                                : 'border-transparent text-textSecondary dark:text-dark-textSecondary hover:text-textPrimary dark:hover:text-dark-textPrimary'
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

export default FinanceTabs;
