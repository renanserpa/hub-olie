import React, { useState } from 'react';
import { Workflow, Loader2 } from 'lucide-react';
import { useProduction } from '../hooks/useProduction';
import ProductionOrderDetailPanel from './production/ProductionOrderDetailPanel';
import { Card } from './ui/Card';
import { Material } from '../types';
import TabLayout from './ui/TabLayout';
import ProductionKanban from './production/ProductionKanban';
import ProductionTimeline from './production/ProductionTimeline';
import ProductionQualityPanel from './production/ProductionQualityPanel';
import ProductionKpiRow from './production/ProductionKpiRow';

const PRODUCTION_TABS = [
    { id: 'orders', label: 'Ordens', icon: Workflow },
    { id: 'timeline', label: 'Timeline', icon: Workflow }, // Replace with better icon
    { id: 'quality', label: 'Qualidade', icon: Workflow }, // Replace with better icon
];

const ProductionPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('orders');
    
    const {
        allOrders,
        allMaterials,
        isLoading,
        selectedOrder,
        setSelectedOrderId,
        kpis,
        updateTaskStatus,
        createQualityCheck
    } = useProduction();

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;
        }

        switch(activeTab) {
            case 'orders':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-8">
                            <ProductionKanban orders={allOrders} onCardClick={setSelectedOrderId} />
                        </div>
                        <div className="lg:col-span-4">
                             {selectedOrder ? (
                                <ProductionOrderDetailPanel 
                                    order={selectedOrder} 
                                    allMaterials={allMaterials as Material[]}
                                    key={selectedOrder.id} 
                                    onUpdateTaskStatus={updateTaskStatus}
                                />
                            ) : !isLoading ? (
                                <Card className="sticky top-20 h-[calc(100vh-18rem)] flex items-center justify-center">
                                    <div className="text-center text-textSecondary">
                                        <p>Selecione uma OP para ver os detalhes</p>
                                    </div>
                                </Card>
                            ) : null}
                        </div>
                    </div>
                );
            case 'timeline':
                return <ProductionTimeline orders={allOrders} />;
            case 'quality':
                return <ProductionQualityPanel checks={[]} onCreate={createQualityCheck} />;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                 <div>
                    <div className="flex items-center gap-3">
                        <Workflow className="text-primary" size={28}/>
                        <h1 className="text-3xl font-bold text-textPrimary">Produção</h1>
                    </div>
                    <p className="text-textSecondary mt-1">Controle o chão de fábrica, da matéria-prima ao produto acabado.</p>
                </div>
            </div>
            
            <div className="mb-6">
                <ProductionKpiRow kpis={kpis} />
            </div>

            <TabLayout tabs={PRODUCTION_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default ProductionPage;