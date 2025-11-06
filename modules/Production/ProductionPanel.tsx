'use client';
import React from 'react';
// FIX: Corrected import path for useProduction hook.
import { useProduction } from './useProduction';
import { Loader2 } from 'lucide-react';
import ProductionDrawer from './ProductionDrawer';
import ProductionTable from '../../components/production/ProductionTable';
import ProductionDialog from '../../components/production/ProductionDialog';
import ProductionKpiRow from '../../components/production/ProductionKpiRow';
import ProductionKanban from './ProductionKanban';
import ProductionTimeline from './ProductionTimeline';

export default function ProductionPanel() {
  const { 
    filteredOrders,
    isLoading, 
    updateProductionOrderStatus, 
    updateTaskStatus,
    createQualityCheck,
    selectedOrder, 
    setSelectedOrderId,
    kpis,
    filters,
    setFilters,
    viewMode,
    setViewMode,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    createProductionOrder,
    allProducts,
    allMaterials,
    isSaving,
  } = useProduction();

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }
    
    switch (viewMode) {
        case 'table':
            return <ProductionTable orders={filteredOrders} onOrderSelect={setSelectedOrderId} />;
        case 'list':
            return <ProductionTimeline orders={filteredOrders} />;
        case 'kanban':
        default:
            return <ProductionKanban orders={filteredOrders} onStatusChange={updateProductionOrderStatus} onCardClick={setSelectedOrderId} />;
    }
  };


  return (
    <div className="space-y-6">
      {/* <ProductionFilterBar 
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewOrderClick={() => setIsCreateDialogOpen(true)}
        onAdvancedFilterClick={() => {}}
      /> */}

      <ProductionKpiRow kpis={kpis} />
      
      {renderContent()}
    
      <ProductionDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        allMaterials={allMaterials}
        // FIX: Pass down the required handler functions to the drawer.
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
}