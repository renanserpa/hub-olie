import React from 'react';
import { Button } from '../../ui/Button';
import { MaterialList } from "./MaterialList";
import { MaterialGroupList } from "./MaterialGroupList";
import { MaterialDialog } from './MaterialDialog';
import { MaterialGroupDialog } from './MaterialGroupDialog';

export function MaterialTabs() {
  const [activeTab, setActiveTab] = React.useState('materials');

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
             <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('materials')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'materials' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-textPrimary'}`}>
                        Materiais Básicos
                    </button>
                    <button onClick={() => setActiveTab('groups')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'groups' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-textPrimary'}`}>
                        Grupos de Suprimento
                    </button>
                </nav>
            </div>
            {activeTab === 'materials' ? <MaterialDialog /> : <MaterialGroupDialog />}
        </div>
      {activeTab === 'materials' && <MaterialList />}
      {activeTab === 'groups' && <MaterialGroupList />}
    </div>
  );
}