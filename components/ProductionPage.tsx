import React from 'react';
import { Loader2, PackageOpen } from 'lucide-react';
import { useProduction, ProductionViewMode } from '../hooks/useProduction';
import { Material } from '../types';
import ProductionKanban from './production/ProductionKanban';
import ProductionKpiRow from './production/ProductionKpiRow';
import ProductionFilterBar from './production/ProductionFilterBar';
import ProductionDrawer from './production/ProductionDrawer';
import ProductionDialog from './production/ProductionDialog';
import ProductionOrderList from './production/ProductionOrderList';
import ProductionTable from './production/ProductionTable';

const ProductionPage: React.FC = () => {
    const {
        filteredOrders,
        allMaterials,
        allProducts,
        isLoading,
        isSaving,
        selectedOrder,
        setSelectedOrderId,
        kpis,
        updateTaskStatus,
        updateProductionOrderStatus,
        createQualityCheck,
        createProductionOrder,
        viewMode,
        setViewMode,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
    } = useProduction();

    const renderContent = () => {
        if (isLoading && filteredOrders.length === 0) {
            return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;
        }

        if (filteredOrders.length === 0) {
            return (
                 <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
                    <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-textPrimary">Nenhuma Ordem de Produção</h3>
                    <p className="mt-1 text-sm">Nenhuma OP corresponde aos filtros selecionados.</p>
                </div>
            );
        }

        switch(viewMode) {
            case 'list':
                return <ProductionOrderList orders={filteredOrders} onOrderClick={setSelectedOrderId} />;
            case 'table':
                return <ProductionTable orders={filteredOrders} onOrderSelect={setSelectedOrderId} />;
            case 'kanban':
            default:
                return <ProductionKanban orders={filteredOrders} onCardClick={setSelectedOrderId} onStatusChange={updateProductionOrderStatus} />;
        }
    };

    return (
        <div>
            <ProductionFilterBar 
                onNewOrderClick={() => setIsCreateDialogOpen(true)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />
            
            <div className="mb-6">
                <ProductionKpiRow kpis={kpis} />
            </div>

            {renderContent()}

            <ProductionDrawer
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrderId(null)}
                allMaterials={allMaterials as Material[]}
                onUpdateTaskStatus={updateTaskStatus}
                onCreateQualityCheck={createQualityCheck}
            />

            <ProductionDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSave={createProductionOrder}
                products={allProducts}
                isSaving={isSaving}
            />
        </div>
    );
};

export default ProductionPage;