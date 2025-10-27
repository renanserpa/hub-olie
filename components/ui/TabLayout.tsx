import React from 'react';
import { cn } from '../../lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface TabLayoutProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  subTabs?: Tab[];
  activeSubTab?: string | null;
  onSubTabChange?: (subTabId: string) => void;
}

const TabLayout: React.FC<TabLayoutProps> = ({
  tabs,
  activeTab,
  onTabChange,
  subTabs,
  activeSubTab,
  onSubTabChange,
}) => {
  return (
    <div>
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                tab.id === activeTab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {subTabs && onSubTabChange && (
        <div className="bg-secondary border-b border-border">
            <nav className="flex space-x-2 p-2" aria-label="Sub-tabs">
                {subTabs.map((subTab) => (
                    <button
                        key={subTab.id}
                        onClick={() => onSubTabChange(subTab.id)}
                        className={cn(
                            'px-3 py-1.5 rounded-md font-medium text-sm transition-colors',
                            subTab.id === activeSubTab
                            ? 'bg-background text-primary shadow-sm'
                            : 'text-textSecondary hover:bg-background/60'
                        )}
                    >
                        {subTab.label}
                    </button>
                ))}
            </nav>
        </div>
      )}
    </div>
  );
};

export default TabLayout;
