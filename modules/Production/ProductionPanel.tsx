'use client';
import React, { useMemo } from 'react';
import ProductionKanban from './ProductionKanban';
import ProductionFilters from '../../components/production/ProductionFilterBar';
import { useProduction } from './useProduction';
import { Button } from '../../components/ui/Button';
import { Loader2 } from 'lucide-react';
import ProductionDrawer from '../../components/production/ProductionDrawer';
import ProductionTable from '../../components/production/ProductionTable';
import ProductionDialog from '../../components/production/ProductionDialog';
import ProductionKpiRow from '../../components/production/ProductionKpiRow';

export default function ProductionPanel() {
  const { 
    filteredOrders,
    reload, 
    // FIX: Changed 'loading' to 'isLoading' to match the property returned by the useProduction hook.
    isLoading, 
    updateProductionOrderStatus, 
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
    isSaving,
  } = useProduction();

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }
    
    switch (viewMode) {
        case 'table':
            return <ProductionTable orders={filteredOrders} onOrderSelect={setSelectedOrderId} />;
        case 'kanban':
        default:
            return <ProductionKanban orders={filteredOrders} onStatusChange={updateProductionOrderStatus} onCardClick={setSelectedOrderId} />;
    }
  };


  return (
    <div className="space-y-6">
      <ProductionFilters 
        // filters={filters}
        // onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewOrderClick={() => setIsCreateDialogOpen(true)}
      />

      <ProductionKpiRow kpis={kpis} />
      
      {renderContent()}
    
      <ProductionDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        onUpdateTaskStatus={() => {}} // Placeholder
        onCreateQualityCheck={() => {}} // Placeholder
        allMaterials={[]} // Placeholder
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
