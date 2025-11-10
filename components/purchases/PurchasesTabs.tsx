import React from 'react';
import { Users, FileText, BarChart2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Supplier, PurchaseOrder } from '../../types';
import SuppliersTab from './SuppliersTab';
import PurchaseOrdersTab from './PurchaseOrdersTab';
import PurchaseMetrics from './PurchaseMetrics';

type PurchasesTab = 'suppliers' | 'pos' | 'metrics';

interface PurchasesTabsProps {
  activeTab: string;
  onTabChange: (tab: PurchasesTab) => void;
  suppliers: Supplier[];
  purchaseOrders: (PurchaseOrder & { supplier?: Supplier, items: any[] })[];
  onNewSupplierClick: () => void;
  onEditSupplierClick: (supplier: Supplier) => void;
  onNewPOClick: () => void;
  onReceivePOClick: () => void;
  selectedPO: (PurchaseOrder & { supplier?: Supplier, items: any[] }) | null;
  onSelectPO: (id: string | null) => void;
  isSaving: boolean;
  isLoadingItems: boolean;
}

const TABS: { id: PurchasesTab, label: string, icon: React.ElementType }[] = [
    { id: 'suppliers', label: 'Fornecedores', icon: Users },
    { id: 'pos', label: 'Pedidos de Compra', icon: FileText },
    { id: 'metrics', label: 'Métricas', icon: BarChart2 },
];

const PurchasesTabs: React.FC<PurchasesTabsProps> = (props) => {
    
    const renderContent = () => {
        switch (props.activeTab) {
            case 'suppliers':
                return <SuppliersTab 
                            suppliers={props.suppliers} 
                            onNewClick={props.onNewSupplierClick}
                            onEditClick={props.onEditSupplierClick}
                        />;
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
            case 'metrics':
                return <PurchaseMetrics />;
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
                                onClick={() => props.onTabChange(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm focus:outline-none',
                                    tab.id === props.activeTab
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

export default PurchasesTabs;