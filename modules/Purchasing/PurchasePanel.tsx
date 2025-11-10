// modules/Purchasing/PurchasePanel.tsx
import React, { useState } from 'react';
import { FileText, Wrench, BarChart2, Users, Box } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Supplier, PurchaseOrder, MaterialGroup } from '../../types';
import PurchaseOrdersTab from '../../components/purchases/PurchaseOrdersTab';
import PurchaseMetrics from '../../components/purchases/PurchaseMetrics';
import TabLayout from '../../components/ui/TabLayout';
import SupplierManagement from './settings/SupplierManagement';
import SupplyGroupsManagement from './settings/SupplyGroupsManagement';

type PurchasesTab = 'pos' | 'settings' | 'metrics';
type SettingsSubTab = 'suppliers' | 'groups';

const MAIN_TABS: { id: PurchasesTab, label: string, icon: React.ElementType }[] = [
    { id: 'pos', label: 'Pedidos de Compra', icon: FileText },
    { id: 'settings', label: 'Dados Mestres', icon: Wrench },
    { id: 'metrics', label: 'Métricas', icon: BarChart2 },
];

const SETTINGS_SUB_TABS: { id: SettingsSubTab, label: string, icon: React.ElementType }[] = [
    { id: 'suppliers', label: 'Fornecedores', icon: Users },
    { id: 'groups', label: 'Grupos de Suprimento', icon: Box },
];

interface PurchasePanelProps {
    activeTab: string;
    onTabChange: (tab: PurchasesTab) => void;
    suppliers: Supplier[];
    supplyGroups: MaterialGroup[];
    purchaseOrders: (PurchaseOrder & { supplier?: Supplier, items: any[] })[];
    onNewPOClick: () => void;
    onReceivePOClick: () => void;
    selectedPO: (PurchaseOrder & { supplier?: Supplier, items: any[] }) | null;
    onSelectPO: (id: string | null) => void;
    isSaving: boolean;
    isLoadingItems: boolean;
}

const PurchasePanel: React.FC<PurchasePanelProps> = (props) => {
    const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsSubTab>('suppliers');

    const renderContent = () => {
        switch (props.activeTab) {
            case 'pos':
                return <PurchaseOrdersTab 
                            purchaseOrders={props.purchaseOrders}
                            selectedPO={props.selectedPO}
                            onSelectPO={props.onSelectPO}
                            onNewClick={props.onNewPOClick}
                            onReceiveClick={props.onReceivePOClick}
                            isSaving={props.isSaving}
                            isLoadingItems={props.isLoadingItems}
                        />;
            case 'settings':
                return (
                    <div>
                         <TabLayout tabs={SETTINGS_SUB_TABS} activeTab={activeSettingsTab} onTabChange={(id) => setActiveSettingsTab(id as SettingsSubTab)} />
                        <div className="mt-6">
                            {activeSettingsTab === 'suppliers' && <SupplierManagement />}
                            {activeSettingsTab === 'groups' && <SupplyGroupsManagement />}
                        </div>
                    </div>
                );
            case 'metrics':
                return <PurchaseMetrics />;
            default:
                return null;
        }
    };

    return (
        <div>
            <TabLayout tabs={MAIN_TABS} activeTab={props.activeTab} onTabChange={props.onTabChange as any} />
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default PurchasePanel;