import React from 'react';
import { useProduction } from './useProduction';
import { Loader2 } from 'lucide-react';
import ProductionDrawer from './ProductionDrawer';
import ProductionKpiRow from '../../components/production/ProductionKpiRow';
import ProductionKanban from './ProductionKanban';
import ProductionTable from '../../components/production/ProductionTable';
import ProductionTimeline from './ProductionTimeline';
import ProductionFilterBar from '../../components/production/ProductionFilterBar';
import ProductionDialog from '../../components/production/ProductionDialog';
import AdvancedFilterPanel from '../../components/production/AdvancedFilterPanel';
import { useApp } from '../../contexts/AppContext';

export default function ProductionPanel() {
  const { user } = useApp();
  const { 
    filteredOrders,
    isLoading, 
    updateProductionOrderStatus, 
    updateTaskStatus,
    createQualityCheck,
    createProductionOrder,
    selectedOrder, 
    setSelectedOrderId,
    kpis,
    allMaterials,
    allProducts,
    isSaving,
    viewMode,
    setViewMode,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    filters,
    setFilters,
    isAdvancedFilterOpen,
    setIsAdvancedFilterOpen,
    clearFilters,
  } = useProduction();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  
  const renderContent = () => {
    switch(viewMode) {
      case 'kanban':
        return (
          <ProductionKanban 
            orders={filteredOrders} 
            onStatusChange={updateProductionOrderStatus} 
            onCardClick={setSelectedOrderId} 
          />
        );
      case 'table':
        return <ProductionTable orders={filteredOrders} onOrderSelect={setSelectedOrderId} />;
      case 'list':
        return <ProductionTimeline orders={filteredOrders} />;
      default:
        return null;
    }
  }
  
  return (
    <div className="space-y-6">
      <ProductionFilterBar
        onNewOrderClick={() => setIsCreateDialogOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFiltersChange={setFilters}
        onAdvancedFilterClick={() => setIsAdvancedFilterOpen(true)}
      />

      <ProductionKpiRow kpis={kpis} />
      
      <div>
        {renderContent()}
      </div>
    
      <ProductionDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        allMaterials={allMaterials}
        onUpdateTaskStatus={updateTaskStatus}
        onCreateQualityCheck={createQualityCheck}
        user={user}
      />

      <ProductionDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={(data) => createProductionOrder(data).then(() => setIsCreateDialogOpen(false))}
        products={allProducts}
        isSaving={isSaving}
      />

      <AdvancedFilterPanel
        isOpen={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        products={allProducts}
      />
    </div>
  );
}
