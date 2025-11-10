import React, { useState } from 'react';
import TabLayout from '../ui/TabLayout';
import SuppliersTabContent from '../settings/suppliers/SuppliersTabContent';
import { MaterialGroupList } from '../settings/materials/MaterialGroupList';
import { MaterialGroupDialog } from '../settings/materials/MaterialGroupDialog';
import { Users, Box } from 'lucide-react';

const SETTINGS_TABS = [
    { id: 'suppliers', label: 'Fornecedores', icon: Users },
    { id: 'groups', label: 'Grupos de Suprimento', icon: Box },
];

const PurchasingSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('suppliers');

    const renderContent = () => {
        switch (activeTab) {
            case 'suppliers':
                return <SuppliersTabContent />;
            case 'groups':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <MaterialGroupDialog />
                        </div>
                        <MaterialGroupList />
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div>
            <TabLayout tabs={SETTINGS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default PurchasingSettings;
