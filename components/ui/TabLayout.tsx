import React from 'react';
import { cn } from '../../lib/utils';

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface TabLayoutProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabLayout: React.FC<TabLayoutProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div>
        <nav className="flex space-x-2 p-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        'flex items-center gap-2 whitespace-nowrap py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                        tab.id === activeTab
                        ? 'bg-card text-primary shadow-sm'
                        : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-white/60'
                    )}
                    >
                    <Icon className="w-4 h-4"/>
                    {tab.label}
                </button>
            )
        })}
        </nav>
    </div>
  );
};

export default TabLayout;