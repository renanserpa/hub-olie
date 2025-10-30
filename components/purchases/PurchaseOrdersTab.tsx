import React from 'react';
import { PurchaseOrder } from '../../types';
import POList from './POList';
import PODetailPanel from './PODetailPanel';
import { Card } from '../ui/Card';
import POFilters from './POFilters';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';

interface PurchaseOrdersTabProps {
    purchaseOrders: (PurchaseOrder & { supplier?: any, items: any[] })[];
    selectedPO: (PurchaseOrder & { supplier?: any, items: any[] }) | null;
    onSelectPO: (id: string | null) => void;
    onNewClick: () => void;
    onReceiveClick: () => void;
    isSaving: boolean;
}

const PurchaseOrdersTab: React.FC<PurchaseOrdersTabProps> = ({ purchaseOrders, selectedPO, onSelectPO, onNewClick, onReceiveClick, isSaving }) => {
    // This is a simplified state for now. In a real app, this would come from a hook.
    const [filters, setFilters] = React.useState({ search: '', status: [] });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-3">
                <POFilters filters={filters} onFiltersChange={setFilters} />
                 <div className="mt-4">
                    <Button onClick={onNewClick} className="w-full">
                        <Plus className="w-4 h-4 mr-2"/>
                        Novo Pedido de Compra
                    </Button>
                </div>
            </div>
            <div className="lg:col-span-4 min-w-0">
                <POList
                    purchaseOrders={purchaseOrders}
                    selectedPOId={selectedPO?.id || null}
                    onSelectPO={onSelectPO}
                />
            </div>
            <div className="lg:col-span-5">
                {selectedPO ? (
                    <PODetailPanel po={selectedPO} key={selectedPO.id} onReceiveClick={onReceiveClick} isSaving={isSaving}/>
                ) : (
                    <Card className="sticky top-20 h-[calc(100vh-18rem)] flex items-center justify-center">
                        <div className="text-center text-textSecondary">
                            <p>Selecione um Pedido de Compra para ver os detalhes</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default PurchaseOrdersTab;